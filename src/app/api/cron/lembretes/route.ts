import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { diaSP, horaAtualSP, horaSP, tipoTarefaLabel } from "@/lib/agenda";
import { maskPhone } from "@/lib/format";
import { enviarPush, temAparelhosPush } from "@/lib/server/push";
import { salvarBackup } from "@/lib/server/backup";
import { sincronizarTabelao } from "@/lib/server/tabelao";
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
  const resultado: { lembretes: number; resumo: boolean; backup: boolean; tabelao?: string; oportunidades?: number; vencimentos?: number } = { lembretes: 0, resumo: false, backup: false };

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
      .select("id, tipo, quando, descricao, lembrar_min, lead:lead_id!inner(id, nome, codigo, telefone, excluido_em)")
      .is("lead.excluido_em", null)
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
    const { data: diaEsp } = await db.from("rotina_dia").select("item").eq("dia", hoje).in("item", ["folga", "evento", "meeting"]).maybeSingle();
    if (marcado && diaEsp?.item !== "folga") {
      // resumo da rotina "Meu dia": o que precisa ser feito hoje, bloco a bloco
      const { montarMeuDia } = await import("@/lib/server/meu-dia");
      const { blocos } = await montarMeuDia(db, hoje);
      const { ESSENCIAIS_EXTERNO } = await import("@/lib/server/meu-dia");
      const pendentes = blocos.filter((b) => !b.feito && (!diaEsp || ESSENCIAIS_EXTERNO.includes(b.item)));
      const linhas = pendentes.map((b) => `• ${b.hora} ${b.titulo}${!b.manual && b.total ? `: ${b.total}` : ""}`);
      const url = siteUrl() ? `${siteUrl()}/admin/dia` : "";
      const texto = [`☀️ *Bom dia! O seu dia hoje*`, linhas.join("\n") || "Nada pendente por enquanto.", url ? `\nAbrir Meu dia: ${url}` : null].filter(Boolean).join("\n");
      const html = `<div style="font-family:Arial,sans-serif;color:#263746;max-width:520px">
<h2 style="color:#005CA9;margin:0 0 8px">O seu dia hoje</h2>
<ul style="padding-left:18px;margin:6px 0">${pendentes.map((b) => `<li style="margin:4px 0"><b>${esc(b.hora)}</b> ${esc(b.titulo)}${!b.manual && b.total ? `: ${b.total}` : ""}</li>`).join("")}</ul>
${url ? `<p><a href="${url}" style="color:#005CA9;font-weight:bold">Abrir Meu dia no painel</a></p>` : ""}
</div>`;
      const agenda = blocos.find((b) => b.item === "agenda")?.total ?? 0;
      const novos = blocos.find((b) => b.item === "novos")?.total ?? 0;
      await enviar(`O seu dia: ${pendentes.length} bloco(s) para fazer`, texto, html, {
        title: "☀️ O seu dia hoje",
        body: `${agenda} compromisso(s) · ${novos} cadastro(s) novo(s) · ${pendentes.length} bloco(s) na rotina`,
        url: "/admin/dia",
        tag: `resumo-${hoje}`,
      });
      resultado.resumo = true;
    }
  }

  // Lixeira: apaga de vez o que está lá há mais de 30 dias
  await db.from("leads").delete().not("excluido_em", "is", null).lt("excluido_em", new Date(agora - 30 * 86400000).toISOString());

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

  // 4) Preços e estoque da Plano&Plano pelo tabelão (uma vez por dia, a partir das 6h)
  if (cfg.tabelao_auto !== false && cfg.ultimo_tabelao_em !== hojeB && horaAtualSP() >= 6) {
    const { data: marcado } = await db
      .from("notification_settings")
      .update({ ultimo_tabelao_em: hojeB })
      .eq("id", 1)
      .or(`ultimo_tabelao_em.is.null,ultimo_tabelao_em.neq.${hojeB}`)
      .select("id")
      .maybeSingle();
    if (marcado) {
      const t = await sincronizarTabelao("automatico");
      resultado.tabelao = t.ok ? `${t.atualizados} atualizado(s)` : `erro: ${t.erro}`;
      if (t.ok && (t.mudancas.some((m) => m.campo === "a partir de" || m.campo === "à venda") || t.novos.length)) {
        const precos = t.mudancas.filter((m) => m.campo === "a partir de").length;
        const vendas = t.mudancas.filter((m) => m.campo === "à venda").length;
        await enviarPush({
          title: "🏷️ Tabelão atualizado",
          body: [precos && `${precos} preço(s) mudaram`, vendas && `${vendas} mudança(s) de estoque`, t.novos.length && `${t.novos.length} empreendimento(s) novo(s) no tabelão`].filter(Boolean).join(" · "),
          url: "/admin/empreendimentos/tabelao",
          tag: `tabelao-${hojeB}`,
        }).catch(() => null);
      }
      if (!t.ok)
        await enviarPush({ title: "⚠️ Tabelão não atualizou hoje", body: "Abra Imóveis → Tabelão para ver o motivo ou tentar de novo.", url: "/admin/empreendimentos/tabelao", tag: `tabelao-${hojeB}` }).catch(() => null);
    }
  }

  // 5) Oportunidades para aprovados (preço baixou / promoção) — avisa uma vez cada
  {
    const { data: ops } = await db
      .from("oportunidades")
      .select("id, tipo, preco_antes, preco_depois, aprovados, dev:development_id(nome)")
      .is("notificado_em", null)
      .order("created_at", { ascending: true })
      .limit(20);
    const lista = (ops ?? []) as unknown as { id: number; tipo: string; preco_antes: number; preco_depois: number; aprovados: { nome: string }[]; dev: { nome: string } | null }[];
    if (lista.length) {
      const ids = lista.map((o) => o.id);
      const { data: marcados } = await db.from("oportunidades").update({ notificado_em: new Date().toISOString() }).in("id", ids).is("notificado_em", null).select("id");
      const ok = new Set((marcados ?? []).map((m) => m.id));
      const aEnviar = lista.filter((o) => ok.has(o.id));
      if (aEnviar.length) {
        const fmt = (n: number) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
        const linhas = aEnviar.map(
          (o) =>
            `• ${o.dev?.nome ?? "Empreendimento"}: ${o.tipo === "preco_baixou" ? `baixou de ${fmt(o.preco_antes)} para ${fmt(o.preco_depois)}` : `em promoção (${fmt(o.preco_depois)})`} → ${o.aprovados
              .slice(0, 6)
              .map((a) => a.nome)
              .join(", ")}${o.aprovados.length > 6 ? ` e mais ${o.aprovados.length - 6}` : ""}`
        );
        const total = new Set(aEnviar.flatMap((o) => o.aprovados.map((a) => a.nome))).size;
        const url = siteUrl() ? `${siteUrl()}/admin/aprovados` : "";
        const texto = [`💰 *Oportunidade para aprovados*`, ...linhas, url ? `\nVer no painel: ${url}` : null].filter(Boolean).join("\n");
        const html = `<div style="font-family:Arial,sans-serif;color:#263746;max-width:560px"><h2 style="color:#005CA9;margin:0 0 8px">Oportunidade para clientes aprovados</h2><ul>${linhas
          .map((l) => `<li style="margin:4px 0">${esc(l.slice(2))}</li>`)
          .join("")}</ul>${url ? `<p><a href="${url}" style="color:#005CA9;font-weight:bold">Abrir clientes aprovados</a></p>` : ""}</div>`;
        await enviar(`Oportunidade: ${total} aprovado(s) passaram a caber em ${aEnviar.length} projeto(s)`, texto, html, {
          title: "💰 Oportunidade para aprovados",
          body: `${total} aprovado(s) passaram a caber: ${aEnviar.map((o) => o.dev?.nome).filter(Boolean).slice(0, 3).join(", ")}`,
          url: "/admin/aprovados",
          tag: `oportunidade-${ids[0]}`,
        });
        resultado.oportunidades = aEnviar.length;
      }
    }
  }

  // 6) Aprovações vencendo (aviso com 7 dias e na véspera) e vencidas viram "vencido"
  {
    await db.from("aprovados").update({ status: "vencido" }).in("status", ["ativo", "negociando"]).lt("vencimento", hojeB);
    const limite = somarDias(hojeB, 7);
    const { data: venc } = await db
      .from("aprovados")
      .select("id, nome, vencimento, aviso_vencimento_em, poder_compra")
      .in("status", ["ativo", "negociando"])
      .gte("vencimento", hojeB)
      .lte("vencimento", limite)
      .limit(50);
    const avisar = (venc ?? []).filter((a) => {
      const vespera = somarDias(a.vencimento as string, -1);
      if (!a.aviso_vencimento_em) return true; // primeiro aviso (até 7 dias antes)
      return hojeB >= vespera && (a.aviso_vencimento_em as string) < vespera; // segundo aviso, na véspera
    });
    if (avisar.length && horaAtualSP() >= 8) {
      const { data: marcados } = await db.from("aprovados").update({ aviso_vencimento_em: hojeB }).in("id", avisar.map((a) => a.id)).select("id");
      if (marcados?.length) {
        const nomes = avisar.map((a) => `• ${a.nome} – vence ${String(a.vencimento).split("-").reverse().join("/")}`);
        const url = siteUrl() ? `${siteUrl()}/admin/aprovados?status=vencendo` : "";
        await enviar(
          `Aprovação vencendo: ${avisar.length} cliente(s)`,
          [`⏳ *Aprovações perto de vencer*`, ...nomes, url ? `\nVer: ${url}` : null].filter(Boolean).join("\n"),
          `<div style="font-family:Arial,sans-serif;color:#263746"><h2 style="color:#b91c1c">Aprovações perto de vencer</h2><ul>${nomes.map((n) => `<li>${esc(n.slice(2))}</li>`).join("")}</ul>${url ? `<p><a href="${url}">Abrir no painel</a></p>` : ""}</div>`,
          { title: "⏳ Aprovação perto de vencer", body: avisar.map((a) => a.nome).slice(0, 4).join(", "), url: "/admin/aprovados?status=vencendo", tag: `vencimento-${hojeB}` }
        );
        resultado.vencimentos = avisar.length;
      }
    }
  }

  return NextResponse.json(resultado);
}
