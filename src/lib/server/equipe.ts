import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { LEAD_STATUS, leadStatusInfo } from "@/lib/constants";
import { notificarLead } from "@/lib/server/notificacoes";

/**
 * Integração com o CRM da equipe (criado pelo gerente).
 * - Entrada: o CRM da equipe manda os leads da campanha para POST /api/equipe/leads (cabeçalho Authorization: Bearer <chave>).
 * - Saída: mudanças de etapa e observações dos leads da equipe vão para a url_retorno do CRM da equipe (mesma chave).
 */

type DB = ReturnType<typeof createAdminClient>;

export interface LeadEquipe {
  id: string;
  nome: string;
  telefone: string;
  email?: string | null;
  renda?: number | string | null;
  campanha?: string | null;
  origem?: string | null;
  regiao?: string | null;
  observacao?: string | null;
  criado_em?: string | null;
  /** etapa inicial no CRM da corretora (só para lead novo) */
  status?: string | null;
  produto?: string | null;
}

export async function lerIntegracao(db: DB = createAdminClient()) {
  const { data } = await db.from("integracao_equipe").select("*").eq("id", 1).maybeSingle();
  return data as {
    ativo: boolean;
    chave: string | null;
    url_retorno: string | null;
    ultimo_recebido: string | null;
    ultimo_envio: string | null;
    ultimo_erro: string | null;
  } | null;
}

export function telefoneBR(v: unknown) {
  let d = String(v ?? "").replace(/\D/g, "");
  if (d.length >= 12 && d.startsWith("55")) d = d.slice(2);
  d = d.replace(/^0+/, "");
  return /^[1-9]{2}9?\d{8}$/.test(d) ? d : null;
}

const num = (v: unknown) => {
  if (v == null || v === "") return null;
  if (typeof v === "number") return v;
  const n = Number(String(v).replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** Cria ou atualiza um lead vindo do CRM da equipe. */
export async function receberLeadEquipe(db: DB, l: LeadEquipe) {
  const equipeId = String(l.id ?? "").trim().slice(0, 100);
  const nome = String(l.nome ?? "").trim().slice(0, 120);
  const telefone = telefoneBR(l.telefone);
  if (!equipeId) return { erro: "sem id" as const };
  if (!nome) return { erro: "sem nome" as const };
  if (!telefone) return { erro: "telefone inválido" as const };
  const email = l.email && /\S+@\S+\.\S+/.test(String(l.email)) ? String(l.email).trim().toLowerCase().slice(0, 160) : null;
  const renda = num(l.renda);
  const info = [
    `📥 Veio do CRM da equipe${l.campanha ? ` · campanha: ${l.campanha}` : ""}${l.origem ? ` · ${l.origem}` : ""}.`,
    l.produto ? `Interesse: ${l.produto}.` : null,
    l.regiao ? `Região: ${l.regiao}.` : null,
    renda ? `Renda informada: R$ ${renda.toLocaleString("pt-BR")}.` : null,
    l.observacao ? `Obs. da equipe: ${String(l.observacao).slice(0, 2000)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  // já veio antes: só atualiza dados que estavam vazios
  const { data: ja } = await db.from("leads").select("id, email, renda_total").eq("equipe_id", equipeId).maybeSingle();
  if (ja) {
    const upd: Record<string, unknown> = {};
    if (!ja.email && email) upd.email = email;
    if (!ja.renda_total && renda) upd.renda_total = renda;
    if (Object.keys(upd).length) await db.from("leads").update(upd).eq("id", ja.id);
    if (l.observacao) {
      const trecho = String(l.observacao).slice(0, 200);
      const { count } = await db.from("lead_notes").select("id", { count: "exact", head: true }).eq("lead_id", ja.id).ilike("texto", `%${trecho.replace(/[%_]/g, "")}%`);
      if (!count) await db.from("lead_notes").insert({ lead_id: ja.id, texto: info });
    }
    return { id: ja.id as string, novo: false };
  }

  // mesmo telefone já no CRM: liga ao CRM da equipe em vez de duplicar
  const { data: mesmo } = await db
    .from("leads")
    .select("id, equipe_id")
    .eq("telefone", telefone)
    .is("excluido_em", null)
    .limit(1)
    .maybeSingle();
  if (mesmo && !mesmo.equipe_id) {
    await db.from("leads").update({ equipe_id: equipeId }).eq("id", mesmo.id);
    await db.from("lead_notes").insert({ lead_id: mesmo.id, texto: `${info}\n(Já estava no seu CRM; agora está ligado ao CRM da equipe.)` });
    return { id: mesmo.id as string, novo: false };
  }

  const { data: lead, error } = await db
    .from("leads")
    .insert({
      nome,
      telefone,
      email,
      renda_total: renda,
      origem: "Equipe",
      utm_source: "crm_equipe",
      utm_campaign: l.campanha ? String(l.campanha).slice(0, 120) : "Campanha da equipe",
      status: l.status && LEAD_STATUS.some((x) => x.value === l.status) ? l.status : "novo",
      cadastro_manual: true,
      equipe_id: equipeId,
      consentimento_em: l.criado_em && !isNaN(Date.parse(l.criado_em)) ? new Date(l.criado_em).toISOString() : new Date().toISOString(),
      consentimento_versao: "crm-equipe",
    })
    .select("id, codigo")
    .single();
  if (error || !lead) return { erro: (error?.message ?? "não foi possível criar") as string };
  await db.from("lead_notes").insert({ lead_id: lead.id, texto: info });
  await db.from("lead_events").insert({ lead_id: lead.id, tipo: "lead_equipe", dados: { equipe_id: equipeId, campanha: l.campanha ?? null } });
  if (!l.status || l.status === "novo") await notificarLead("concluida", {
    id: lead.id,
    codigo: lead.codigo,
    nome,
    telefone,
    email,
    renda_total: renda,
    origem: "Equipe",
    utm_campaign: l.campanha ?? null,
  });
  return { id: lead.id as string, novo: true };
}

/** Envia ao CRM da equipe as atualizações pendentes (etapa e observações). Nunca lança erro. */
export async function enviarAtualizacoesEquipe(db: DB = createAdminClient(), limite = 30) {
  try {
    const cfg = await lerIntegracao(db);
    if (!cfg?.ativo || !cfg.url_retorno || !cfg.chave) return { enviados: 0 };
    const { data: fila } = await db
      .from("equipe_saida")
      .select("id, lead_id, evento, dados, criado_em, tentativas, lead:leads(equipe_id, nome, status)")
      .is("enviado_em", null)
      .lt("tentativas", 20)
      .order("criado_em")
      .limit(limite);
    let enviados = 0;
    let ultimoErro: string | null = null;
    for (const f of fila ?? []) {
      const lead = f.lead as unknown as { equipe_id: string | null; nome: string; status: string } | null;
      if (!lead?.equipe_id) {
        await db.from("equipe_saida").update({ enviado_em: new Date().toISOString(), erro: "lead sem id da equipe" }).eq("id", f.id);
        continue;
      }
      const d = (f.dados ?? {}) as { de?: string; para?: string; texto?: string };
      const corpo = {
        evento: f.evento,
        id: lead.equipe_id,
        nome: lead.nome,
        status: f.evento === "status" ? d.para : lead.status,
        status_nome: leadStatusInfo(f.evento === "status" ? (d.para ?? "") : lead.status).label,
        status_anterior: f.evento === "status" ? (d.de ?? null) : null,
        observacao: f.evento === "observacao" ? (d.texto ?? "") : null,
        quando: f.criado_em,
        corretora: "Corretora Akali",
      };
      try {
        const r = await fetch(cfg.url_retorno, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.chave}` },
          body: JSON.stringify(corpo),
          signal: AbortSignal.timeout(10000),
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        await db.from("equipe_saida").update({ enviado_em: new Date().toISOString(), erro: null }).eq("id", f.id);
        enviados++;
      } catch (e) {
        ultimoErro = e instanceof Error ? e.message : String(e);
        await db.from("equipe_saida").update({ tentativas: (f.tentativas ?? 0) + 1, erro: ultimoErro }).eq("id", f.id);
      }
    }
    if (enviados || ultimoErro)
      await db
        .from("integracao_equipe")
        .update({ ...(enviados ? { ultimo_envio: new Date().toISOString() } : {}), ultimo_erro: ultimoErro })
        .eq("id", 1);
    return { enviados, erro: ultimoErro };
  } catch (e) {
    console.error("Integração equipe: falha ao enviar", e);
    return { enviados: 0 };
  }
}


/** Atualizações esperando para ir ao CRM da equipe (modo "pelo Chrome": o navegador busca e aplica). */
export async function pendentesEquipe(db: DB) {
  const { data } = await db
    .from("equipe_saida")
    .select("id, evento, dados, criado_em, lead:leads(equipe_id, nome, status)")
    .is("enviado_em", null)
    .lt("tentativas", 20)
    .order("criado_em")
    .limit(200);
  return (data ?? [])
    .map((f) => {
      const lead = f.lead as unknown as { equipe_id: string | null; nome: string; status: string } | null;
      const d = (f.dados ?? {}) as { de?: string; para?: string; texto?: string };
      return {
        fila_id: f.id as number,
        id: lead?.equipe_id ?? null,
        nome: lead?.nome ?? "",
        evento: f.evento as string,
        para: f.evento === "status" ? (d.para ?? null) : null,
        para_nome: f.evento === "status" ? leadStatusInfo(d.para ?? "").label : null,
        texto: f.evento === "observacao" ? (d.texto ?? "") : null,
        quando: f.criado_em as string,
      };
    })
    .filter((x) => x.id);
}

export async function confirmarEquipe(db: DB, ok: number[], erros: Record<string, string>) {
  const agora = new Date().toISOString();
  if (ok.length) await db.from("equipe_saida").update({ enviado_em: agora, erro: null }).in("id", ok);
  for (const [id, erro] of Object.entries(erros)) {
    const { data } = await db.from("equipe_saida").select("tentativas").eq("id", Number(id)).maybeSingle();
    await db.from("equipe_saida").update({ tentativas: (data?.tentativas ?? 0) + 1, erro: String(erro).slice(0, 300) }).eq("id", Number(id));
  }
  await db
    .from("integracao_equipe")
    .update({ ...(ok.length ? { ultimo_envio: agora } : {}), ultimo_erro: Object.values(erros)[0] ?? null })
    .eq("id", 1);
}
