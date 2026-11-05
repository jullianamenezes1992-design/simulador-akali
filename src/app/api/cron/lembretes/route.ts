import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { diaSP, horaAtualSP, horaSP, tipoTarefaLabel } from "@/lib/agenda";
import { maskPhone } from "@/lib/format";
import { enviarPush, temAparelhosPush } from "@/lib/server/push";
import { salvarBackup } from "@/lib/server/backup";
import { somarDias } from "@/lib/agenda";
import { enviarEmailLivre, enviarWhatsAppLivre, esc, lerConfigNotificacoes, siteUrl } from "@/lib/server/notificacoes";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Chamada a cada 5 minutos pelo agendador do banco (pg_cron + pg_net, ver migração 20261104000002).
 * 1) Lembrete antes de cada compromisso (conforme "Me avisar").
 * 2) Resumo do dia, uma vez por dia a partir da hora escolhida.
 * Autenticação: cabeçalho x-cron-token igual a notification_settings.cron_token.
 */

type Linha = {
  id: string;
  tipo: string;
  quando: string;
  descricao: string | null;
  lembrar_min: number | null;
  lead: { id: string; nome: string; codigo: string; telefone: string } | null;
};

const igual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export async function POST(req: NextRequest) {
  const cfg = await lerConfigNotificacoes();
  const token = req.headers.get("x-cron-token") ?? "";
  if (!cfg?.cron_token || !token || !igual(token, cfg.cron_token)) {
    return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  }
  const temCanal = cfg.email_ativo || cfg.whatsapp_ativo || (await temAparelhosPush());
  const db = createAdminClient();
  const agora = Date.now();
  const resultado = { lembretes: 0, resumo: false, backup: false };

  const enviar = async (assunto: string, texto: string, html: string, push?: { title: string; body: string; url: string; tag?: string }) => {
    const r = await Promise.allSettled([
      push ? enviarPush(push).then(() => null) : Promise.resolve(null),
      cfg.whatsapp_ativo ? enviarWhatsAppLivre(cfg, texto) : Promise.resolve(null),
      cfg.email_ativo ? enviarEmailLivre(cfg, assunto, html) : Promise.resolve(null),
    ]);
    r.forEach((x) => {
      if (x.status === "rejected") console.error("Lembrete falhou", x.reason);
      else if (x.value) console.error("Lembrete:", x.value);
    });
  };
  const linkLead = (id: string) => (siteUrl() ? `${siteUrl()}/admin/leads/${id}` : "");

  // 1) Lembretes antes do compromisso
  if (temCanal && cfg.lembretes_ativos !== false) {
    const { data } = await db
      .from("lead_tasks")
      .select("id, tipo, quando, descricao, lembrar_min, lead:lead_id(id, nome, codigo, telefone)")
      .eq("status", "pendente")
      .is("lembrete_enviado_em", null)
      .not("lembrar_min", "is", null)
      .gte("quando", new Date(agora - 60 * 60 * 1000).toISOString()) // não avisa compromissos muito antigos
      .lte("quando", new Date(agora + 7 * 86400000).toISOString())
      .limit(50);
    const vencidos = ((data ?? []) as unknown as Linha[]).filter((t) => new Date(t.quando).getTime() - (t.lembrar_min ?? 0) * 60000 <= agora);
    for (const t of vencidos) {
      // marca antes de enviar, para nunca mandar o mesmo lembrete duas vezes
      const { data: marcado } = await db
        .from("lead_tasks")
        .update({ lembrete_enviado_em: new Date().toISOString() })
        .eq("id", t.id)
        .is("lembrete_enviado_em", null)
        .select("id")
        .maybeSingle();
      if (!marcado) continue;
      const quando = `${diaSP(t.quando) === diaSP() ? "hoje" : new Date(t.quando).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })} às ${horaSP(t.quando)}`;
      const nome = t.lead?.nome ?? "cliente";
      const texto = [
        `⏰ *Lembrete Akali*`,
        `${tipoTarefaLabel(t.tipo)} com ${nome} — ${quando}`,
        t.lead ? `WhatsApp: ${maskPhone(t.lead.telefone)}` : null,
        t.descricao ? `Obs.: ${t.descricao}` : null,
        t.lead && linkLead(t.lead.id) ? `Ficha: ${linkLead(t.lead.id)}` : null,
      ]
        .filter(Boolean)
        .join("\n");
      const html = `<div style="font-family:Arial,sans-serif;color:#263746;max-width:520px">
<h2 style="color:#005CA9;margin:0 0 8px">⏰ ${esc(tipoTarefaLabel(t.tipo))} com ${esc(nome)}</h2>
<p style="margin:0 0 6px"><strong>Quando:</strong> ${esc(quando)}</p>
${t.lead ? `<p style="margin:0 0 6px"><strong>WhatsApp:</strong> ${esc(maskPhone(t.lead.telefone))}</p>` : ""}
${t.descricao ? `<p style="margin:0 0 6px"><strong>Obs.:</strong> ${esc(t.descricao)}</p>` : ""}
${t.lead && linkLead(t.lead.id) ? `<p><a href="${linkLead(t.lead.id)}" style="color:#005CA9;font-weight:bold">Abrir ficha no painel</a></p>` : ""}
</div>`;
      await enviar(`Lembrete: ${tipoTarefaLabel(t.tipo)} com ${nome} ${quando}`, texto, html, {
        title: `⏰ ${tipoTarefaLabel(t.tipo)} ${quando}`,
        body: `${nome}${t.descricao ? ` · ${t.descricao}` : ""}`,
        url: t.lead ? `/admin/leads/${t.lead.id}` : "/admin/agenda",
        tag: `tarefa-${t.id}`,
      });
      resultado.lembretes++;
    }
  }

  // 2) Resumo do dia
  const hoje = diaSP();
  if (temCanal && cfg.resumo_diario !== false && horaAtualSP() >= (cfg.resumo_hora ?? 8) && cfg.ultimo_resumo_em !== hoje) {
    const { data: marcado } = await db
      .from("notification_settings")
      .update({ ultimo_resumo_em: hoje })
      .eq("id", 1)
      .or(`ultimo_resumo_em.is.null,ultimo_resumo_em.neq.${hoje}`)
      .select("id")
      .maybeSingle();
    if (marcado) {
      const fim = new Date(`${hoje}T23:59:59-03:00`).toISOString();
      const { data } = await db
        .from("lead_tasks")
        .select("id, tipo, quando, descricao, lembrar_min, lead:lead_id(id, nome, codigo, telefone)")
        .eq("status", "pendente")
        .lte("quando", fim)
        .order("quando", { ascending: true })
        .limit(40);
      const ts = (data ?? []) as unknown as Linha[];
      if (ts.length) {
        const inicioHoje = new Date(`${hoje}T00:00:00-03:00`).getTime();
        const atrasados = ts.filter((t) => new Date(t.quando).getTime() < inicioHoje);
        const deHoje = ts.filter((t) => new Date(t.quando).getTime() >= inicioHoje);
        const linha = (t: Linha) => `• ${horaSP(t.quando)} ${tipoTarefaLabel(t.tipo)} – ${t.lead?.nome ?? ""}`;
        const linhaAtrasada = (t: Linha) => `• ${new Date(t.quando).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })} ${tipoTarefaLabel(t.tipo)} – ${t.lead?.nome ?? ""}`;
        const agenda = siteUrl() ? `${siteUrl()}/admin/agenda` : "";
        const texto = [
          `☀️ *Bom dia! Sua agenda de hoje*`,
          deHoje.length ? deHoje.map(linha).join("\n") : "Nenhum compromisso marcado para hoje.",
          atrasados.length ? `\n⚠️ *Atrasados (${atrasados.length})*\n${atrasados.map(linhaAtrasada).join("\n")}` : null,
          agenda ? `\nAgenda: ${agenda}` : null,
        ]
          .filter(Boolean)
          .join("\n");
        const lista = (arr: Linha[], f: (t: Linha) => string) => `<ul style="padding-left:18px;margin:6px 0">${arr.map((t) => `<li style="margin:4px 0">${esc(f(t).slice(2))}</li>`).join("")}</ul>`;
        const html = `<div style="font-family:Arial,sans-serif;color:#263746;max-width:520px">
<h2 style="color:#005CA9;margin:0 0 8px">Sua agenda de hoje</h2>
${deHoje.length ? lista(deHoje, linha) : "<p>Nenhum compromisso marcado para hoje.</p>"}
${atrasados.length ? `<h3 style="color:#b91c1c;margin:14px 0 4px">Atrasados (${atrasados.length})</h3>${lista(atrasados, linhaAtrasada)}` : ""}
${agenda ? `<p><a href="${agenda}" style="color:#005CA9;font-weight:bold">Abrir agenda no painel</a></p>` : ""}
</div>`;
        await enviar(`Agenda de hoje: ${deHoje.length} compromisso(s)${atrasados.length ? `, ${atrasados.length} atrasado(s)` : ""}`, texto, html, {
          title: "☀️ Sua agenda de hoje",
          body: `${deHoje.length} compromisso(s) hoje${atrasados.length ? ` · ${atrasados.length} atrasado(s)` : ""}`,
          url: "/admin/agenda",
          tag: `resumo-${hoje}`,
        });
        resultado.resumo = true;
      }
    }
  }

  // 3) Backup semanal (a partir das 7h, a cada 7 dias; o primeiro sai logo)
  const hojeB = diaSP();
  const venceu = !cfg.ultimo_backup_em || somarDias(cfg.ultimo_backup_em, 7) <= hojeB;
  if (cfg.backup_semanal !== false && venceu && horaAtualSP() >= 7) {
    const { data: marcado } = await db
      .from("notification_settings")
      .update({ ultimo_backup_em: hojeB })
      .eq("id", 1)
      .or(`ultimo_backup_em.is.null,ultimo_backup_em.lte.${somarDias(hojeB, -7)}`)
      .select("id")
      .maybeSingle();
    if (marcado) {
      try {
        const b = await salvarBackup();
        const html = `<div style="font-family:Arial,sans-serif;color:#263746;max-width:520px">
<h2 style="color:#005CA9;margin:0 0 8px">Backup semanal do Simulador Akali</h2>
<p>Em anexo está a planilha com <strong>${b.clientes} cliente(s)</strong>, a agenda, as observações e os empreendimentos.</p>
<p>Guarde este e-mail: ele é a sua cópia de segurança. As últimas 12 cópias também ficam no painel, em <strong>Mais → Cópias de segurança</strong>.</p>
</div>`;
        await Promise.allSettled([
          cfg.email_ativo
            ? enviarEmailLivre(cfg, `Backup semanal Akali – ${hojeB.split("-").reverse().join("/")}`, html, [
                { filename: b.nome, content: b.buffer.toString("base64") },
              ])
            : Promise.resolve(null),
          enviarPush({ title: "💾 Backup semanal pronto", body: `${b.clientes} cliente(s) salvos. Toque para baixar.`, url: "/admin/mais#backups", tag: `backup-${hojeB}` }),
        ]);
        resultado.backup = true;
      } catch (e) {
        console.error("Backup falhou", e);
        // libera para tentar de novo na próxima rodada
        await db.from("notification_settings").update({ ultimo_backup_em: cfg.ultimo_backup_em ?? null }).eq("id", 1);
      }
    }
  }

  return NextResponse.json(resultado);
}
