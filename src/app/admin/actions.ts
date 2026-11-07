"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { LEAD_STATUS, REGIOES, STATUS_OBRA, TIPOS_TAREFA } from "@/lib/constants";
import { isoDeDataHoraSP, tipoTarefaLabel } from "@/lib/agenda";
import { decryptCPF } from "@/lib/crypto";
import { parseMoney, slugify } from "@/lib/format";
import { assertAdmin } from "@/lib/server/auth";
import { validarParametros } from "@/lib/simulacao/engine";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface ActionState {
  ok?: boolean;
  erro?: string;
  campos?: Record<string, string>;
  mensagem?: string;
}

const valores = <T extends readonly { value: string }[]>(l: T) => l.map((i) => i.value) as [string, ...string[]];

const msg = (e: unknown) => (e instanceof Error ? e.message : "Erro inesperado.");

// ---------------------------------------------------------------------------
// Sessão
// ---------------------------------------------------------------------------

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Empreendimentos
// ---------------------------------------------------------------------------

const numOuNull = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim().replace(",", ".");
  return s === "" ? null : Number(s);
};
const moneyOuNull = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s === "" ? null : parseMoney(s);
};
const textoOuNull = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
};

const devSchema = z
  .object({
    nome: z.string().trim().min(3, "Informe o nome").max(140),
    construtora: z.string().max(120).nullable(),
    descricao: z.string().max(5000).nullable(),
    endereco: z.string().max(200).nullable(),
    bairro: z.string().max(100).nullable(),
    cidade: z.string().trim().min(2, "Informe a cidade").max(100),
    uf: z.string().trim().length(2, "UF com 2 letras"),
    regiao: z.enum(valores(REGIOES), { error: "Selecione a região" }),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
    preco_min: z.number().positive("Preço inválido").nullable(),
    preco_max: z.number().positive().nullable(),
    faixas: z.array(z.number().int().min(1).max(4)),
    renda_minima: z.number().min(0).nullable(),
    dormitorios: z.array(z.number().int().min(0).max(6)).min(1, "Selecione ao menos uma tipologia"),
    area_min: z.number().positive().nullable(),
    area_max: z.number().positive().nullable(),
    vagas: z.boolean(),
    status_obra: z.enum(valores(STATUS_OBRA)),
    previsao_entrega: z.string().max(60).nullable(),
    unidades_disponiveis: z.number().int().min(0).nullable(),
    disponivel: z.boolean(),
    condicoes_comerciais: z.string().max(3000).nullable(),
    diferenciais: z.array(z.string().max(80)).max(40),
    oferta_destaque: z.boolean(),
    oferta_texto: z.string().max(120).nullable(),
    video_url: z.union([z.url("URL de vídeo inválida"), z.null()]),
    capa_url: z.string().max(1000).nullable(),
    ativo: z.boolean(),
  })
  .refine((d) => d.preco_max == null || d.preco_min == null || d.preco_max >= d.preco_min, { path: ["preco_max"], message: "Deve ser maior que o preço inicial" })
  .refine((d) => d.area_max == null || d.area_min == null || d.area_max >= d.area_min, { path: ["area_max"], message: "Deve ser maior que a área mínima" });

function lerEmpreendimento(fd: FormData) {
  return {
    nome: String(fd.get("nome") ?? ""),
    construtora: textoOuNull(fd.get("construtora")),
    descricao: textoOuNull(fd.get("descricao")),
    endereco: textoOuNull(fd.get("endereco")),
    bairro: textoOuNull(fd.get("bairro")),
    cidade: String(fd.get("cidade") ?? "São Paulo"),
    uf: String(fd.get("uf") ?? "SP").toUpperCase(),
    regiao: String(fd.get("regiao") ?? ""),
    latitude: numOuNull(fd.get("latitude")),
    longitude: numOuNull(fd.get("longitude")),
    preco_min: moneyOuNull(fd.get("preco_min")),
    preco_max: moneyOuNull(fd.get("preco_max")),
    faixas: fd.getAll("faixas").map(Number).sort(),
    renda_minima: moneyOuNull(fd.get("renda_minima")),
    dormitorios: fd.getAll("dormitorios").map(Number).sort(),
    area_min: numOuNull(fd.get("area_min")),
    area_max: numOuNull(fd.get("area_max")),
    vagas: fd.get("vagas") === "on",
    status_obra: String(fd.get("status_obra") ?? "lancamento"),
    previsao_entrega: textoOuNull(fd.get("previsao_entrega")),
    unidades_disponiveis: numOuNull(fd.get("unidades_disponiveis")),
    disponivel: fd.get("disponivel") === "on",
    condicoes_comerciais: textoOuNull(fd.get("condicoes_comerciais")),
    diferenciais: String(fd.get("diferenciais") ?? "")
      .split(/\n|;/)
      .map((s) => s.trim())
      .filter(Boolean),
    oferta_destaque: fd.get("oferta_destaque") === "on",
    oferta_texto: textoOuNull(fd.get("oferta_texto")),
    video_url: textoOuNull(fd.get("video_url")),
    capa_url: textoOuNull(fd.get("capa_url")),
    ativo: fd.get("ativo") === "on",
  };
}

export async function salvarEmpreendimento(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const { supabase } = await assertAdmin();
    const id = textoOuNull(fd.get("id"));
    const parsed = devSchema.safeParse(lerEmpreendimento(fd));
    if (!parsed.success) {
      const campos: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (campos[i.path.join(".")] ??= i.message));
      return { erro: "Revise os campos destacados.", campos };
    }
    const dados = parsed.data;

    if (id) {
      const { error } = await supabase.from("developments").update(dados).eq("id", id);
      if (error) return { erro: error.message };
      revalidatePath("/", "layout");
      return { ok: true, mensagem: "Empreendimento salvo." };
    }

    // slug único
    const base = slugify(dados.nome) || "empreendimento";
    let slug = base;
    for (let n = 2; n < 50; n++) {
      const { count } = await supabase.from("developments").select("id", { count: "exact", head: true }).eq("slug", slug);
      if (!count) break;
      slug = `${base}-${n}`;
    }
    const { data, error } = await supabase.from("developments").insert({ ...dados, slug }).select("id").single();
    if (error) return { erro: error.message };
    revalidatePath("/", "layout");
    redirect(`/admin/empreendimentos/${data.id}?criado=1`);
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e && String((e as { digest: string }).digest).startsWith("NEXT_REDIRECT")) throw e;
    return { erro: msg(e) };
  }
}

export async function alternarAtivo(id: string, ativo: boolean) {
  const { supabase } = await assertAdmin();
  const { error } = await supabase.from("developments").update({ ativo }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function excluirEmpreendimento(id: string) {
  const { supabase } = await assertAdmin(true);
  const { data: midias } = await supabase.from("development_media").select("storage_path").eq("development_id", id);
  const paths = (midias ?? []).map((m) => m.storage_path).filter(Boolean) as string[];
  if (paths.length) await supabase.storage.from("empreendimentos").remove(paths);
  const { error } = await supabase.from("developments").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  redirect("/admin/empreendimentos?excluido=1");
}

export async function adicionarMidia(input: {
  developmentId: string;
  tipo: "foto" | "planta" | "video";
  url: string;
  storagePath?: string | null;
  legenda?: string | null;
}) {
  const { supabase } = await assertAdmin();
  const v = z
    .object({
      developmentId: z.uuid(),
      tipo: z.enum(["foto", "planta", "video"]),
      url: z.string().min(1).max(1000),
      storagePath: z.string().max(500).nullable().optional(),
      legenda: z.string().max(200).nullable().optional(),
    })
    .parse(input);
  const { count } = await supabase
    .from("development_media")
    .select("id", { count: "exact", head: true })
    .eq("development_id", v.developmentId)
    .eq("tipo", v.tipo);
  const { error } = await supabase.from("development_media").insert({
    development_id: v.developmentId,
    tipo: v.tipo,
    url: v.url,
    storage_path: v.storagePath ?? null,
    legenda: v.legenda ?? null,
    ordem: count ?? 0,
  });
  if (error) throw new Error(error.message);
  // primeira foto vira capa, se não houver capa
  if (v.tipo === "foto") {
    await supabase.from("developments").update({ capa_url: v.url }).eq("id", v.developmentId).is("capa_url", null);
  }
  revalidatePath(`/admin/empreendimentos/${v.developmentId}`);
  revalidatePath("/", "layout");
}

export async function removerMidia(id: string) {
  const { supabase } = await assertAdmin();
  const { data: m } = await supabase.from("development_media").select("development_id, storage_path, url").eq("id", id).maybeSingle();
  if (!m) return;
  if (m.storage_path) await supabase.storage.from("empreendimentos").remove([m.storage_path]);
  await supabase.from("development_media").delete().eq("id", id);
  await supabase.from("developments").update({ capa_url: null }).eq("id", m.development_id).eq("capa_url", m.url);
  revalidatePath(`/admin/empreendimentos/${m.development_id}`);
  revalidatePath("/", "layout");
}

export async function definirCapa(developmentId: string, url: string) {
  const { supabase } = await assertAdmin();
  await supabase.from("developments").update({ capa_url: url }).eq("id", developmentId);
  revalidatePath(`/admin/empreendimentos/${developmentId}`);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export async function atualizarStatusLead(leadId: string, status: string) {
  const { supabase } = await assertAdmin();
  if (!LEAD_STATUS.some((s) => s.value === status)) throw new Error("Status inválido");
  const { data: atual } = await supabase.from("leads").select("status").eq("id", leadId).single();
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);
  if (error) throw new Error(error.message);
  await supabase.from("lead_events").insert({
    lead_id: leadId,
    tipo: "status_alterado",
    dados: { de: atual?.status ?? null, para: status },
  });
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
}

export async function atribuirResponsavel(leadId: string, responsavelId: string | null) {
  const { supabase } = await assertAdmin();
  const { error } = await supabase.from("leads").update({ responsavel_id: responsavelId || null }).eq("id", leadId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function adicionarNota(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const { supabase, userId } = await assertAdmin();
    const leadId = String(fd.get("lead_id") ?? "");
    const texto = String(fd.get("texto") ?? "").trim();
    if (!texto) return { erro: "Escreva a observação." };
    if (texto.length > 4000) return { erro: "Observação muito longa." };
    const { error } = await supabase.from("lead_notes").insert({ lead_id: leadId, autor_id: userId, texto });
    if (error) return { erro: error.message };
    revalidatePath(`/admin/leads/${leadId}`);
    return { ok: true };
  } catch (e) {
    return { erro: msg(e) };
  }
}

/** Revela o CPF completo — ação registrada no histórico de auditoria. */
export async function revelarCPF(leadId: string): Promise<{ cpf?: string; erro?: string }> {
  try {
    const { supabase } = await assertAdmin();
    // Confirma, com as permissões do usuário, que o lead existe e é visível para ele
    const { data: lead } = await supabase.from("leads").select("id").eq("id", leadId).maybeSingle();
    if (!lead) return { erro: "Lead não encontrado." };
    const db = createAdminClient();
    const { data } = await db.from("lead_sensitive").select("cpf_enc").eq("lead_id", leadId).maybeSingle();
    if (!data) return { erro: "CPF não disponível." };
    await supabase.rpc("registrar_auditoria", { p_tabela: "leads", p_registro: leadId, p_acao: "visualizou_cpf", p_dados: null });
    const cpf = decryptCPF(data.cpf_enc);
    return { cpf: cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") };
  } catch (e) {
    return { erro: msg(e) };
  }
}

/** Move o lead para a lixeira (fica 30 dias e pode ser restaurado). Só para o papel "admin". */
export async function excluirLead(leadId: string) {
  const { supabase } = await assertAdmin(true);
  if (!/^[0-9a-f-]{36}$/i.test(leadId)) throw new Error("Lead inválido.");
  const { error } = await supabase.rpc("lixeira_mover", { p_id: leadId });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  redirect("/admin/leads?lixeira=1");
}

export async function restaurarLead(leadId: string) {
  const { supabase } = await assertAdmin(true);
  if (!/^[0-9a-f-]{36}$/i.test(leadId)) throw new Error("Lead inválido.");
  const { error } = await supabase.rpc("lixeira_restaurar", { p_id: leadId });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/leads");
  revalidatePath("/admin/leads/lixeira");
  revalidatePath("/admin");
}

/** Apaga de vez um lead que já está na lixeira (não tem volta). */
export async function excluirLeadDefinitivo(leadId: string) {
  const { supabase } = await assertAdmin(true);
  if (!/^[0-9a-f-]{36}$/i.test(leadId)) throw new Error("Lead inválido.");
  const { error } = await supabase.rpc("lixeira_excluir", { p_id: leadId });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/leads/lixeira");
}

/** LGPD: remove dados pessoais mantendo apenas números agregados para estatística. */
export async function anonimizarLead(leadId: string) {
  const { supabase } = await assertAdmin(true);
  const db = createAdminClient();
  await db.from("lead_sensitive").delete().eq("lead_id", leadId);
  const { error } = await supabase
    .from("leads")
    .update({
      nome: "Titular anonimizado",
      email: null,
      telefone: "00000000000",
      data_nascimento: null,
      cpf_final: null,
      profissao: null,
      gclid: null,
      fbclid: null,
      referrer: null,
      landing_page: null,
      anonimizado_em: new Date().toISOString(),
      access_token: crypto.randomUUID(),
    })
    .eq("id", leadId);
  if (error) throw new Error(error.message);
  await supabase.from("lead_notes").delete().eq("lead_id", leadId);
  await supabase.rpc("registrar_auditoria", { p_tabela: "leads", p_registro: leadId, p_acao: "anonimizou", p_dados: null });
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
}

// ---------------------------------------------------------------------------
// Parâmetros de simulação
// ---------------------------------------------------------------------------

export async function salvarParametros(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const { supabase, userId } = await assertAdmin(true);
    let json: unknown;
    try {
      json = JSON.parse(String(fd.get("params") ?? ""));
    } catch {
      return { erro: "Parâmetros em formato inválido." };
    }
    const v = validarParametros(json);
    if (!v.ok) return { erro: v.erros.join(" ") };
    const descricao = textoOuNull(fd.get("descricao"));
    const ativar = fd.get("ativar") === "on";

    const { data: ult } = await supabase.from("simulation_params").select("versao").order("versao", { ascending: false }).limit(1).maybeSingle();
    const versao = (ult?.versao ?? 0) + 1;
    const { data: novo, error } = await supabase
      .from("simulation_params")
      .insert({ versao, ativo: false, descricao, params: v.params, created_by: userId })
      .select("id")
      .single();
    if (error) return { erro: error.message };
    if (ativar) {
      const { error: e2 } = await supabase.rpc("ativar_parametros", { p_id: novo.id });
      if (e2) return { erro: e2.message };
    }
    revalidatePath("/", "layout");
    return { ok: true, mensagem: `Versão ${versao} salva${ativar ? " e ativada" : ""}.` };
  } catch (e) {
    return { erro: msg(e) };
  }
}

export async function ativarVersaoParametros(id: string) {
  const { supabase } = await assertAdmin(true);
  const { error } = await supabase.rpc("ativar_parametros", { p_id: id });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Configurações do site
// ---------------------------------------------------------------------------

const idTracking = z.string().regex(/^[A-Za-z0-9-]*$/, "Use apenas letras, números e hífen").max(40);

export async function salvarConfiguracoes(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const { supabase, userId } = await assertAdmin(true);
    const tel = String(fd.get("whatsapp_numero") ?? "").replace(/\D/g, "");
    const schema = z.object({
      empresa_nome: z.string().trim().min(2).max(80),
      creci: z.string().max(80).nullable(),
      whatsapp_numero: z.string().regex(/^55\d{10,11}$/, "Use DDI 55 + DDD + número (ex.: 5511999999999)"),
      email_contato: z.union([z.email("E-mail inválido"), z.null()]),
      encarregado_dados: z.string().max(200).nullable(),
      ga4_id: idTracking.nullable(),
      google_ads_id: idTracking.nullable(),
      google_ads_label_simulacao: z.string().max(80).nullable(),
      google_ads_label_whatsapp: z.string().max(80).nullable(),
      meta_pixel_id: z.string().regex(/^\d*$/, "Somente números").max(30).nullable(),
      landing_conteudo: z.object({
        hero_titulo: z.string().max(140),
        hero_subtitulo: z.string().max(300),
        programa_texto: z.string().max(1500),
        aviso_rodape: z.string().max(400),
        beneficios: z.array(z.object({ titulo: z.string().max(60), texto: z.string().max(240) })).max(8),
      }),
    });

    let beneficios: { titulo: string; texto: string }[] = [];
    try {
      beneficios = JSON.parse(String(fd.get("beneficios") ?? "[]"));
    } catch {}

    const parsed = schema.safeParse({
      empresa_nome: String(fd.get("empresa_nome") ?? ""),
      creci: textoOuNull(fd.get("creci")),
      whatsapp_numero: tel,
      email_contato: textoOuNull(fd.get("email_contato")),
      encarregado_dados: textoOuNull(fd.get("encarregado_dados")),
      ga4_id: textoOuNull(fd.get("ga4_id")),
      google_ads_id: textoOuNull(fd.get("google_ads_id")),
      google_ads_label_simulacao: textoOuNull(fd.get("google_ads_label_simulacao")),
      google_ads_label_whatsapp: textoOuNull(fd.get("google_ads_label_whatsapp")),
      meta_pixel_id: textoOuNull(fd.get("meta_pixel_id")),
      landing_conteudo: {
        hero_titulo: String(fd.get("hero_titulo") ?? ""),
        hero_subtitulo: String(fd.get("hero_subtitulo") ?? ""),
        programa_texto: String(fd.get("programa_texto") ?? ""),
        aviso_rodape: String(fd.get("aviso_rodape") ?? ""),
        beneficios: beneficios.filter((b) => b.titulo?.trim()),
      },
    });
    if (!parsed.success) {
      const campos: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (campos[i.path.join(".")] ??= i.message));
      return { erro: "Revise os campos destacados.", campos };
    }
    const { error } = await supabase.from("site_settings").update({ ...parsed.data, updated_by: userId }).eq("id", 1);
    if (error) return { erro: error.message };
    revalidatePath("/", "layout");
    return { ok: true, mensagem: "Configurações salvas." };
  } catch (e) {
    return { erro: msg(e) };
  }
}

// ---------------------------------------------------------------------------
// Avisos de novos cadastros (e-mail e WhatsApp)
// ---------------------------------------------------------------------------

export async function salvarNotificacoes(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const { supabase } = await assertAdmin(true);
    const tel = String(fd.get("whatsapp_numero") ?? "").replace(/\D/g, "");
    const email = textoOuNull(fd.get("email_destino"));
    const campos: Record<string, string> = {};
    if (email && !z.email().safeParse(email).success) campos.email_destino = "E-mail inválido";
    if (tel && !/^55\d{10,11}$/.test(tel)) campos.whatsapp_numero = "Use DDI 55 + DDD + número (ex.: 5511999999999)";
    if (Object.keys(campos).length) return { erro: "Revise os campos destacados.", campos };

    const dados: Record<string, unknown> = {
      email_ativo: fd.get("email_ativo") === "on",
      email_destino: email,
      whatsapp_ativo: fd.get("whatsapp_ativo") === "on",
      whatsapp_numero: tel || null,
      notificar_incompletas: fd.get("notificar_incompletas") === "on",
      lembretes_ativos: fd.get("lembretes_ativos") === "on",
      resumo_diario: fd.get("resumo_diario") === "on",
      resumo_hora: Math.min(23, Math.max(0, Number(fd.get("resumo_hora") ?? 8) || 8)),
      updated_at: new Date().toISOString(),
    };
    // Chaves: campo vazio mantém a que já está salva
    const resend = textoOuNull(fd.get("resend_api_key"));
    const callmebot = textoOuNull(fd.get("callmebot_api_key"));
    if (resend) dados.resend_api_key = resend.slice(0, 200);
    if (callmebot) dados.callmebot_api_key = callmebot.replace(/\s/g, "").slice(0, 100);

    const { error } = await supabase.from("notification_settings").upsert({ id: 1, ...dados });
    if (error) throw new Error(error.message);
    await supabase.rpc("registrar_auditoria", { p_tabela: "notification_settings", p_registro: "1", p_acao: "alterou_avisos", p_dados: null });
    revalidatePath("/admin/configuracoes");
    return { ok: true, mensagem: "Avisos salvos." };
  } catch (e) {
    return { erro: msg(e) };
  }
}

export async function testarNotificacoes(): Promise<{ email?: string; whatsapp?: string }> {
  await assertAdmin(true);
  const { lerConfigNotificacoes, enviarEmail, enviarWhatsApp } = await import("@/lib/server/notificacoes");
  const cfg = await lerConfigNotificacoes();
  if (!cfg) return { email: "Salve as configurações primeiro.", whatsapp: "Salve as configurações primeiro." };
  const lead = { id: "", codigo: "AKL-TESTE", nome: "Cliente de Teste", telefone: "11900000000", email: "teste@exemplo.com", renda_total: 4000, faixa: "Faixa 2", origem: "Teste" };
  const [e, w] = await Promise.all([
    cfg.email_ativo ? enviarEmail(cfg, "teste", lead).catch((x) => msg(x)) : Promise.resolve("desativado"),
    cfg.whatsapp_ativo ? enviarWhatsApp(cfg, "teste", lead).catch((x) => msg(x)) : Promise.resolve("desativado"),
  ]);
  return { email: e ?? "ok", whatsapp: w ?? "ok" };
}

// ---------------------------------------------------------------------------
// Agenda (compromissos e lembretes por cliente)
// ---------------------------------------------------------------------------

const UUID_RE = /^[0-9a-f-]{36}$/i;
const STATUS_ANTES_DA_VISITA = ["novo", "em_atendimento", "sem_resposta", "documentacao", "analise_credito", "aprovado"];

function revalidarAgenda(leadId?: string) {
  revalidatePath("/admin/agenda");
  revalidatePath("/admin");
  if (leadId) revalidatePath(`/admin/leads/${leadId}`);
}

export async function criarTarefa(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const { supabase } = await assertAdmin();
    const leadId = String(fd.get("lead_id") ?? "");
    if (!UUID_RE.test(leadId)) throw new Error("Cliente inválido.");
    const tipo = String(fd.get("tipo") ?? "");
    const campos: Record<string, string> = {};
    if (!TIPOS_TAREFA.some((t) => t.value === tipo)) campos.tipo = "Escolha o tipo";
    const quando = isoDeDataHoraSP(String(fd.get("data") ?? ""), String(fd.get("hora") ?? ""));
    if (!quando) campos.data = "Informe data e hora";
    if (Object.keys(campos).length) return { erro: "Revise os campos destacados.", campos };
    const lembrarTxt = String(fd.get("lembrar_min") ?? "");
    const lembrar = lembrarTxt === "" ? null : Math.max(0, Math.min(10080, Number(lembrarTxt) || 0));
    const descricao = textoOuNull(fd.get("descricao"))?.slice(0, 1000) ?? null;

    const { error } = await supabase.from("lead_tasks").insert({ lead_id: leadId, tipo, quando, descricao, lembrar_min: lembrar });
    if (error) throw new Error(error.message);
    await supabase.from("lead_events").insert({ lead_id: leadId, tipo: "compromisso_agendado", dados: { tipo, quando } });

    // Visita agendada: avança a etapa do cliente, se ele ainda estiver antes dela
    if (tipo === "visita" && fd.get("mudar_etapa") === "on") {
      await supabase.from("leads").update({ status: "visita" }).eq("id", leadId).in("status", STATUS_ANTES_DA_VISITA);
    }
    revalidarAgenda(leadId);
    return { ok: true, mensagem: `${tipoTarefaLabel(tipo)} agendado(a).` };
  } catch (e) {
    return { erro: msg(e) };
  }
}

export async function atualizarTarefa(id: string, status: "pendente" | "feito" | "cancelado") {
  const { supabase } = await assertAdmin();
  if (!UUID_RE.test(id) || !["pendente", "feito", "cancelado"].includes(status)) throw new Error("Pedido inválido.");
  const { data, error } = await supabase
    .from("lead_tasks")
    .update({ status, concluido_em: status === "pendente" ? null : new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("lead_id, tipo")
    .single();
  if (error) throw new Error(error.message);
  if (status === "feito") await supabase.from("lead_events").insert({ lead_id: data.lead_id, tipo: "compromisso_concluido", dados: { tipo: data.tipo } });
  revalidarAgenda(data.lead_id);
}

export async function remarcarTarefa(id: string, dataDia: string, hora: string) {
  const { supabase } = await assertAdmin();
  const quando = isoDeDataHoraSP(dataDia, hora);
  if (!UUID_RE.test(id) || !quando) throw new Error("Data ou hora inválida.");
  const { data, error } = await supabase
    .from("lead_tasks")
    .update({ quando, status: "pendente", lembrete_enviado_em: null, concluido_em: null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("lead_id")
    .single();
  if (error) throw new Error(error.message);
  revalidarAgenda(data.lead_id);
}

// ---------------------------------------------------------------------------
// App instalável: notificações no celular (Web Push)
// ---------------------------------------------------------------------------

export async function salvarInscricaoPush(sub: { endpoint: string; p256dh: string; auth: string; aparelho?: string }) {
  const { supabase } = await assertAdmin();
  if (!/^https:\/\//.test(sub.endpoint) || sub.endpoint.length > 1000 || !sub.p256dh || !sub.auth) throw new Error("Inscrição inválida.");
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert({ endpoint: sub.endpoint, p256dh: sub.p256dh.slice(0, 200), auth: sub.auth.slice(0, 100), aparelho: sub.aparelho?.slice(0, 120) ?? null }, { onConflict: "endpoint" });
  if (error) throw new Error(error.message);
}

export async function removerInscricaoPush(endpoint: string) {
  const { supabase } = await assertAdmin();
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
}

export async function testarPush(): Promise<number> {
  const { userId } = await assertAdmin();
  const { enviarPush } = await import("@/lib/server/push");
  return enviarPush({ title: "🎉 Notificações ativadas", body: "Você vai receber aqui os novos clientes e os lembretes da agenda.", url: "/admin/agenda", tag: "teste" }, userId);
}

// ---------------------------------------------------------------------------
// Cópias de segurança (backup)
// ---------------------------------------------------------------------------

export async function fazerBackupAgora(): Promise<{ nome: string; clientes: number }> {
  await assertAdmin(true);
  const { salvarBackup } = await import("@/lib/server/backup");
  const b = await salvarBackup();
  revalidatePath("/admin/mais");
  return { nome: b.nome, clientes: b.clientes };
}

export async function linkDownloadBackup(nome: string): Promise<string> {
  await assertAdmin(true);
  const { linkBackup } = await import("@/lib/server/backup");
  return linkBackup(nome);
}

export async function atualizarOrigem(leadId: string, origem: string) {
  const { supabase } = await assertAdmin();
  if (!UUID_RE.test(leadId)) throw new Error("Cliente inválido.");
  const valor = origem.trim().slice(0, 60);
  if (!valor) throw new Error("Informe a origem.");
  const { error } = await supabase.from("leads").update({ origem: valor }).eq("id", leadId);
  if (error) throw new Error(error.message);
  await supabase.from("lead_events").insert({ lead_id: leadId, tipo: "origem_alterada", dados: { origem: valor } });
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
}

export async function salvarPerfilCorretora(dados: { nome: string | null; fotoUrl?: string | null }) {
  const { supabase } = await assertAdmin(true);
  const nome = dados.nome?.trim().slice(0, 80) || null;
  const upd: Record<string, unknown> = { corretora_nome: nome };
  if (dados.fotoUrl !== undefined) {
    if (dados.fotoUrl && !/^https:\/\/[a-z0-9.-]+\.supabase\.co\/storage\/v1\/object\/public\/empreendimentos\/perfil\//.test(dados.fotoUrl))
      throw new Error("Foto inválida.");
    upd.corretora_foto_url = dados.fotoUrl;
  }
  const { error } = await supabase.from("site_settings").update(upd).eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Tabelão Plano&Plano (atualização automática de preços e estoque)
// ---------------------------------------------------------------------------

export async function atualizarTabelaoAgora() {
  await assertAdmin(true);
  const { sincronizarTabelao } = await import("@/lib/server/tabelao");
  const r = await sincronizarTabelao("manual");
  revalidatePath("/admin/empreendimentos");
  revalidatePath("/admin/empreendimentos/tabelao");
  revalidatePath("/", "layout");
  return { ok: r.ok, atualizados: r.atualizados, erro: r.erro ?? null };
}

export async function salvarTabelaoAuto(ativo: boolean) {
  await assertAdmin(true);
  const db = createAdminClient();
  const { error } = await db.from("notification_settings").update({ tabelao_auto: !!ativo }).eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/empreendimentos/tabelao");
}

// ---------------------------------------------------------------------------
// Mensagens prontas por etapa
// ---------------------------------------------------------------------------

export async function registrarMensagemEnviada(leadId: string, status: string, ordem: number, titulo: string) {
  const { supabase } = await assertAdmin();
  if (!UUID_RE.test(leadId) || ![1, 2, 3].includes(ordem)) throw new Error("Dados inválidos");
  await supabase.from("lead_events").insert({
    lead_id: leadId,
    tipo: "mensagem_enviada",
    dados: { status, ordem, titulo: String(titulo).slice(0, 80) },
  });
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function salvarMensagensEtapa(status: string, itens: { ordem: number; titulo: string; texto: string }[]) {
  const { supabase } = await assertAdmin(true);
  if (!LEAD_STATUS.some((s) => s.value === status)) throw new Error("Etapa inválida");
  const linhas = itens
    .filter((i) => [1, 2, 3].includes(i.ordem))
    .map((i) => ({ status, ordem: i.ordem, titulo: i.titulo.trim().slice(0, 80) || `Mensagem ${i.ordem}`, texto: i.texto.trim().slice(0, 2000), updated_at: new Date().toISOString() }));
  if (linhas.some((l) => !l.texto)) throw new Error("Nenhuma mensagem pode ficar vazia.");
  const { error } = await supabase.from("mensagens_prontas").upsert(linhas);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/mensagens");
}

export async function restaurarMensagensEtapa(status: string) {
  const { supabase } = await assertAdmin(true);
  const { error } = await supabase.from("mensagens_prontas").delete().eq("status", status);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/mensagens");
}
