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
    meses_pos_chaves: z.number().int("Parcelas pós-chaves: número inteiro").min(0).max(120, "Máximo de 120 parcelas pós-chaves"),
    avaliacao_min: z.number().positive("Avaliação inválida").nullable(),
    ato_minimo: z.number().min(0, "Ato inválido").nullable(),
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
    meses_pos_chaves: numOuNull(fd.get("meses_pos_chaves")) ?? 0,
    avaliacao_min: moneyOuNull(fd.get("avaliacao_min")),
    ato_minimo: moneyOuNull(fd.get("ato_minimo")),
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
    const redes_sociais: Record<string, string> = {};
    for (const k of ["instagram", "tiktok", "facebook", "youtube"]) {
      const v = String(fd.get(`rede_${k}`) ?? "").trim().slice(0, 120);
      if (v) redes_sociais[k] = v;
    }
    const { error } = await supabase.from("site_settings").update({ ...parsed.data, redes_sociais, updated_by: userId }).eq("id", 1);
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
const STATUS_ANTES_DA_VISITA = ["novo", "em_atendimento", "sem_resposta", "simulacao", "documentacao", "analise_credito", "aprovado"];

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

// ---------------------------------------------------------------------------
// Contatos das redes sociais (cadastro manual)
// ---------------------------------------------------------------------------

/** "3.200", "3200", "3.200,50", "R$ 3.200" → 3200 / 3200.5 */
function numeroBR(v: FormDataEntryValue | null): number {
  const s = String(v ?? "").replace(/[^\d,.]/g, "");
  if (!s) return 0;
  const n = s.includes(",") ? Number(s.replace(/\./g, "").replace(",", ".")) : Number(s.replace(/\.(?=\d{3}(\D|$))/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.min(n, 10_000_000) : 0;
}

export async function criarContatoRedes(_prev: ActionState, fd: FormData): Promise<ActionState & { leadId?: string }> {
  try {
    const { userId } = await assertAdmin();
    const { REDES, REGIOES: RG, VINCULOS, RELACOES_COMPOSICAO } = await import("@/lib/constants");
    const nome = String(fd.get("nome") ?? "").trim().replace(/\s+/g, " ");
    if (nome.length < 2) return { erro: "Preencha o nome do cliente." };
    let tel = String(fd.get("telefone") ?? "").replace(/\D/g, "");
    if (tel.length >= 12 && tel.startsWith("55")) tel = tel.slice(2);
    if (!/^\d{10,11}$/.test(tel)) return { erro: "Telefone com DDD inválido (ex.: 11 91234-5678)." };

    const db = createAdminClient();
    const { data: existe } = await db.from("leads").select("id, nome").eq("telefone", tel).is("excluido_em", null).limit(1).maybeSingle();
    if (existe) return { erro: `Este telefone já está cadastrado como ${existe.nome}.`, leadId: existe.id };

    const origem = String(fd.get("origem") ?? "");
    const status = String(fd.get("status") ?? "novo");
    const vinculo = String(fd.get("vinculo") ?? "");
    const relacao = String(fd.get("relacao_composicao") ?? "");
    const comporRenda = fd.get("compor_renda") === "sim";
    const renda = numeroBR(fd.get("renda"));
    const rendaComp = comporRenda ? numeroBR(fd.get("renda_composicao")) : 0;
    const fgts = String(fd.get("fgts") ?? "");
    const fgtsValor = fgts === "sim" ? numeroBR(fd.get("fgts_valor")) : 0;
    const idade = Number(fd.get("idade")) || null;
    if (idade != null && (idade < 16 || idade > 100)) return { erro: "Idade inválida." };
    const regioes = fd.getAll("regioes").map(String).filter((r) => RG.some((x) => x.value === r));
    const dataContato = /^\d{4}-\d{2}-\d{2}$/.test(String(fd.get("data_contato"))) ? String(fd.get("data_contato")) : null;
    const texto = (k: string, max = 500) => String(fd.get(k) ?? "").trim().slice(0, max) || null;

    // Estimativa automática, quando há renda e idade (mesmo cálculo do site)
    let simulacao = null as unknown;
    let paramsVersao: number | null = null;
    let recomendados: string[] = [];
    const rendaTotal = renda + rendaComp;
    if (renda > 0 && idade) {
      const { getActiveParams } = await import("@/lib/data");
      const { simular } = await import("@/lib/simulacao/engine");
      const { listarAtivosParaMatch, ranquearDevs } = await import("@/lib/server/leads");
      const ativo = await getActiveParams();
      if (ativo) {
        const r = simular(
          {
            rendaPrincipal: renda,
            rendaComposicao: rendaComp,
            idadeMeses: idade * 12,
            fgtsSaldo: fgtsValor,
            fgtsTresAnos: fgtsValor > 0,
            entrada: 0,
            possuiImovel: false,
            financiamentoAtivo: false,
            jaBeneficiado: false,
            restricaoCredito: "nao_sei",
          },
          ativo.params,
          ativo.versao
        );
        simulacao = r;
        paramsVersao = ativo.versao;
        const ranking = ranquearDevs(await listarAtivosParaMatch(), r, { regioes, dormitoriosMin: null, precisaVaga: false, preferenciaObra: "indiferente" });
        recomendados = ranking.compativeis.slice(0, 12).map((x) => x.dev.id);
      }
    }

    const { data: lead, error } = await db
      .from("leads")
      .insert({
        nome,
        telefone: tel,
        profissao: texto("profissao", 120),
        tipo_renda: VINCULOS.some((v) => v.value === vinculo) ? vinculo : null,
        renda_principal: renda,
        compor_renda: comporRenda,
        relacao_composicao: comporRenda && RELACOES_COMPOSICAO.some((r) => r.value === relacao) ? relacao : null,
        renda_composicao: rendaComp,
        renda_total: rendaTotal,
        fgts_saldo: fgtsValor,
        fgts_tres_anos: fgtsValor > 0,
        regioes,
        regiao_detalhe: texto("regiao_detalhe", 200),
        idade_informada: idade,
        origem: (REDES as readonly string[]).includes(origem) ? origem : "Outro",
        conteudo_rede: texto("conteudo", 200),
        proximo_passo: texto("proximo_passo", 300),
        data_contato: dataContato,
        status: LEAD_STATUS.some((s) => s.value === status) ? status : "novo",
        responsavel_id: userId,
        cadastro_manual: true,
        simulacao_completa: !!simulacao,
        simulacao,
        params_versao: paramsVersao,
        recomendados,
        consentimento_em: new Date().toISOString(),
        consentimento_versao: "contato-redes-manual",
      })
      .select("id")
      .single();
    if (error || !lead) return { erro: error?.message ?? "Não foi possível salvar." };

    await db.from("lead_events").insert({ lead_id: lead.id, tipo: "cadastro_manual", dados: { origem, conteudo: texto("conteudo", 200) } });
    const obs = texto("obs", 4000);
    if (obs) await db.from("lead_notes").insert({ lead_id: lead.id, autor_id: userId, texto: obs });
    const dia = String(fd.get("proximo_dia") ?? "");
    const quando = /^\d{4}-\d{2}-\d{2}$/.test(dia) ? isoDeDataHoraSP(dia, "10:00") : null;
    if (quando) {
      await db.from("lead_tasks").insert({ lead_id: lead.id, tipo: "whatsapp", quando, descricao: texto("proximo_passo", 300) ?? "Retomar contato", lembrar_min: 0 });
    }
    revalidatePath("/admin/redes");
    revalidatePath("/admin/leads");
    revalidatePath("/admin/agenda");
    return { ok: true, mensagem: `${nome} cadastrado(a)!`, leadId: lead.id };
  } catch (e) {
    return { erro: msg(e) };
  }
}

// ---------------------------------------------------------------------------
// Clientes aprovados
// ---------------------------------------------------------------------------

function dataISO(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) return `${m[3].length === 2 ? `20${m[3]}` : m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return null;
}

async function faixaDaRenda(renda: number): Promise<number | null> {
  if (!(renda > 0)) return null;
  const { getActiveParams } = await import("@/lib/data");
  const { encontrarFaixa } = await import("@/lib/simulacao/engine");
  const ativo = await getActiveParams();
  return ativo ? (encontrarFaixa(renda, ativo.params)?.id ?? null) : null;
}

type DadosAprovado = Record<string, unknown>;

async function montarAprovado(fd: FormData): Promise<{ erro: string } | { dados: DadosAprovado }> {
  const { STATUS_APROVADO, CLASSIFICACOES } = await import("@/lib/aprovados");
  const { REGIOES: RG, TIPOS_RENDA } = await import("@/lib/constants");
  const nome = String(fd.get("nome") ?? "").trim().replace(/\s+/g, " ");
  if (nome.length < 2) return { erro: "Preencha o nome do cliente." };
  let tel = String(fd.get("telefone") ?? "").replace(/\D/g, "");
  if (tel.length >= 12 && tel.startsWith("55")) tel = tel.slice(2);
  if (!/^\d{10,11}$/.test(tel)) return { erro: "Telefone com DDD inválido." };
  const renda = numeroBR(fd.get("renda_familiar"));
  const status = String(fd.get("status") ?? "ativo");
  const classif = String(fd.get("classificacao") ?? "morno");
  const tipo = String(fd.get("tipo_renda") ?? "");
  const prazo = Number(String(fd.get("prazo_meses") ?? "").replace(/\D/g, "")) || null;
  const dorm = Number(fd.get("dormitorios_min")) || null;
  const lead = String(fd.get("lead_id") ?? "");
  return {
    dados: {
      nome,
      telefone: tel,
      lead_id: UUID_RE.test(lead) ? lead : null,
      data_analise: dataISO(fd.get("data_analise")),
      vencimento: dataISO(fd.get("vencimento")),
      tipo_renda: TIPOS_RENDA.some((t) => t.value === tipo) ? tipo : null,
      renda_familiar: renda,
      faixa: await faixaDaRenda(renda),
      financiamento: numeroBR(fd.get("financiamento")),
      subsidio: numeroBR(fd.get("subsidio")),
      fgts: numeroBR(fd.get("fgts")),
      entrada: numeroBR(fd.get("entrada")),
      prazo_meses: prazo && prazo >= 12 && prazo <= 480 ? prazo : null,
      parcela_max: numeroBR(fd.get("parcela_max")) || null,
      classificacao: CLASSIFICACOES.some((c) => c.value === classif) ? classif : "morno",
      regioes: fd.getAll("regioes").map(String).filter((r) => RG.some((x) => x.value === r)),
      dormitorios_min: dorm && dorm >= 1 && dorm <= 4 ? dorm : null,
      status: STATUS_APROVADO.some((s) => s.value === status) ? status : "ativo",
      observacoes: String(fd.get("observacoes") ?? "").trim().slice(0, 4000) || null,
      oportunidade_sf: codigoSF(fd.get("oportunidade_sf"), 40),
      ar_numero: codigoSF(fd.get("ar_numero"), 30)?.toUpperCase() ?? null,
      ab_numero: codigoSF(fd.get("ab_numero"), 30)?.toUpperCase() ?? null,
    },
  };
}

/** Números do Salesforce (oportunidade, AR, AB): só letras, números e hífen (o ID da oportunidade diferencia maiúsculas). */
function codigoSF(v: FormDataEntryValue | null, max: number) {
  const t = String(v ?? "").trim().replace(/[^A-Za-z0-9-]/g, "").slice(0, max);
  return t || null;
}

export async function salvarAprovado(_prev: ActionState, fd: FormData): Promise<ActionState & { id?: string }> {
  try {
    const { supabase, userId } = await assertAdmin();
    const r = await montarAprovado(fd);
    if ("erro" in r) return { erro: r.erro };
    // Sem vínculo escolhido: liga sozinho ao cliente do CRM com o mesmo telefone
    if (!r.dados.lead_id) {
      const { data: lead } = await supabase.from("leads").select("id").eq("telefone", r.dados.telefone as string).limit(1).maybeSingle();
      if (lead) r.dados.lead_id = lead.id;
    }
    const id = String(fd.get("id") ?? "");
    if (UUID_RE.test(id)) {
      // se mudou o vencimento, libera um novo aviso
      const { error } = await supabase.from("aprovados").update({ ...r.dados, aviso_vencimento_em: null }).eq("id", id);
      if (error) return { erro: error.message };
      revalidatePath(`/admin/aprovados/${id}`);
      revalidatePath("/admin/aprovados");
      return { ok: true, mensagem: "Alterações salvas.", id };
    }
    const { data, error } = await supabase.from("aprovados").insert({ ...r.dados, created_by: userId }).select("id").single();
    if (error || !data) return { erro: error?.message ?? "Não foi possível salvar." };
    if (r.dados.lead_id) {
      await supabase.from("lead_events").insert({ lead_id: r.dados.lead_id, tipo: "aprovado_registrado", dados: { aprovado_id: data.id } });
    }
    revalidatePath("/admin/aprovados");
    return { ok: true, mensagem: "Aprovado cadastrado!", id: data.id };
  } catch (e) {
    return { erro: msg(e) };
  }
}

export async function excluirAprovado(id: string) {
  const { supabase } = await assertAdmin(true);
  if (!UUID_RE.test(id)) throw new Error("Cadastro inválido");
  const { error } = await supabase.from("aprovados").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/aprovados");
}

export async function registrarOfertaEnviada(aprovadoId: string, devNome: string, devId?: string | null) {
  const { supabase } = await assertAdmin();
  if (!UUID_RE.test(aprovadoId)) return;
  const nome = String(devNome).trim().slice(0, 160) || "Projeto";
  const { data } = await supabase.from("aprovados").select("lead_id").eq("id", aprovadoId).maybeSingle();
  const agora = new Date().toISOString();
  await supabase.from("ofertas_enviadas").insert({ aprovado_id: aprovadoId, development_id: devId && UUID_RE.test(devId) ? devId : null, dev_nome: nome, enviado_em: agora });
  await supabase.from("aprovados").update({ ultima_oferta_em: agora }).eq("id", aprovadoId);
  if (data?.lead_id) await supabase.from("lead_events").insert({ lead_id: data.lead_id, tipo: "oferta_enviada", dados: { empreendimento: nome } });
  revalidatePath(`/admin/aprovados/${aprovadoId}`);
  revalidatePath("/admin/aprovados");
}

export async function marcarOportunidadesVistas() {
  const { supabase } = await assertAdmin();
  await supabase.from("oportunidades").update({ visto_em: new Date().toISOString() }).is("visto_em", null);
  revalidatePath("/admin/aprovados");
}

/** Importa a planilha de aprovados (.xlsx ou .csv). Cabeçalhos flexíveis (nome, telefone, vencimento, financiamento…). */
export async function importarAprovados(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const { supabase, userId } = await assertAdmin();
    const arq = fd.get("arquivo");
    if (!(arq instanceof File) || arq.size === 0) return { erro: "Escolha a planilha (.xlsx ou .csv)." };
    if (arq.size > 5 * 1024 * 1024) return { erro: "Planilha muito grande (máximo 5 MB)." };
    const buf = Buffer.from(await arq.arrayBuffer());
    let linhas: string[][] = [];
    if (/\.csv$/i.test(arq.name) || arq.type.includes("csv")) {
      const txt = buf.toString("utf8").replace(/^﻿/, "");
      const sep = (txt.split("\n")[0].match(/;/g)?.length ?? 0) > (txt.split("\n")[0].match(/,/g)?.length ?? 0) ? ";" : ",";
      linhas = txt.split(/\r?\n/).filter((l) => l.trim()).map((l) => l.split(sep).map((c) => c.replace(/^"|"$/g, "").trim()));
    } else {
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buf as unknown as ArrayBuffer);
      const ws = wb.worksheets[0];
      ws?.eachRow((row) => {
        const vals = (row.values as unknown[]).slice(1).map((v) => {
          if (v instanceof Date) return v.toISOString().slice(0, 10);
          if (v && typeof v === "object" && "result" in (v as object)) return String((v as { result: unknown }).result ?? "");
          if (v && typeof v === "object" && "text" in (v as object)) return String((v as { text: unknown }).text ?? "");
          return v == null ? "" : String(v);
        });
        linhas.push(vals);
      });
    }
    if (linhas.length < 2) return { erro: "A planilha está vazia." };

    const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const MAPA: [string, RegExp][] = [
      ["nome", /^(nome|cliente|nome do cliente)/],
      ["telefone", /(telefone|whats|celular|fone)/],
      ["data_analise", /(data da analise|data analise|analise|data aprovacao|aprovado em)/],
      ["vencimento", /(vencimento|validade|vence)/],
      ["tipo_renda", /(tipo de renda|tipo renda|vinculo)/],
      ["renda_familiar", /(renda)/],
      ["financiamento", /(financiamento|financiado|valor aprovado|credito)/],
      ["subsidio", /(subsidio)/],
      ["fgts", /(fgts)/],
      ["entrada", /(entrada|recursos proprios)/],
      ["prazo_meses", /(prazo)/],
      ["parcela_max", /(parcela)/],
      ["classificacao", /(classificacao|temperatura)/],
      ["regioes", /(regiao)/],
      ["dormitorios_min", /(dorm)/],
      ["status", /(status|situacao)/],
      ["observacoes", /(obs)/],
    ];
    const cab = linhas[0].map(norm);
    const col: Record<string, number> = {};
    cab.forEach((c, i) => {
      const achou = MAPA.find(([k, re]) => col[k] === undefined && re.test(c));
      if (achou) col[achou[0]] = i;
    });
    if (col.nome === undefined || col.telefone === undefined) return { erro: "A planilha precisa ter as colunas Nome e Telefone na primeira linha." };

    const { REGIOES: RG, TIPOS_RENDA } = await import("@/lib/constants");
    const achaRegiao = (s: string) => RG.find((r) => norm(r.label) === norm(s) || r.value === norm(s).replace(/ /g, "_"))?.value;
    const achaTipo = (s: string) => {
      const n = norm(s);
      if (/clt|carteira|registr/.test(n)) return "clt";
      if (/servidor|public/.test(n)) return "servidor";
      if (/aposent|pension/.test(n)) return "aposentado";
      if (/mei|empres/.test(n)) return "empresario";
      if (/autonom/.test(n)) return "autonomo";
      if (/informal/.test(n)) return "informal";
      return TIPOS_RENDA.find((t) => norm(t.label) === n)?.value ?? "";
    };

    let ok = 0;
    const erros: string[] = [];
    const { data: existentes } = await supabase.from("aprovados").select("telefone");
    const jaTem = new Set((existentes ?? []).map((e) => e.telefone));
    for (let i = 1; i < linhas.length; i++) {
      const l = linhas[i];
      const v = (k: string) => (col[k] !== undefined ? (l[col[k]] ?? "").trim() : "");
      if (!v("nome") && !v("telefone")) continue;
      const f = new FormData();
      for (const k of ["nome", "telefone", "data_analise", "vencimento", "renda_familiar", "financiamento", "subsidio", "fgts", "entrada", "prazo_meses", "parcela_max", "dormitorios_min", "observacoes"]) {
        let val = v(k);
        // números vindos do Excel como "250000.5" → formato BR
        if (/^(renda_familiar|financiamento|subsidio|fgts|entrada|parcela_max)$/.test(k) && /^\d+\.\d{1,2}$/.test(val)) val = val.replace(".", ",");
        f.set(k, val);
      }
      f.set("tipo_renda", achaTipo(v("tipo_renda")));
      const cl = norm(v("classificacao"));
      f.set("classificacao", /quent/.test(cl) ? "quente" : /fri/.test(cl) ? "frio" : "morno");
      const st = norm(v("status"));
      f.set("status", /vend/.test(st) ? "vendido" : /negoc/.test(st) ? "negociando" : /venc/.test(st) ? "vencido" : /desist/.test(st) ? "desistiu" : "ativo");
      v("regioes")
        .split(/[,;/]/)
        .map((s) => achaRegiao(s.trim()))
        .filter(Boolean)
        .forEach((r) => f.append("regioes", r!));
      const r = await montarAprovado(f);
      if ("erro" in r) {
        erros.push(`Linha ${i + 1}: ${r.erro}`);
        continue;
      }
      if (jaTem.has(r.dados.telefone as string)) {
        erros.push(`Linha ${i + 1}: ${r.dados.nome} já estava cadastrado (mesmo telefone)`);
        continue;
      }
      // vincula ao lead com o mesmo telefone, se existir
      const { data: lead } = await supabase.from("leads").select("id").eq("telefone", r.dados.telefone as string).limit(1).maybeSingle();
      const { error } = await supabase.from("aprovados").insert({ ...r.dados, lead_id: lead?.id ?? null, created_by: userId });
      if (error) erros.push(`Linha ${i + 1}: ${error.message}`);
      else {
        ok++;
        jaTem.add(r.dados.telefone as string);
      }
    }
    revalidatePath("/admin/aprovados");
    return {
      ok: ok > 0,
      mensagem: `${ok} aprovado(s) importado(s).${erros.length ? ` ${erros.length} linha(s) não importada(s): ${erros.slice(0, 8).join(" · ")}${erros.length > 8 ? "…" : ""}` : ""}`,
      ...(ok === 0 ? { erro: erros.slice(0, 8).join(" · ") || "Nenhuma linha importada." } : {}),
    };
  } catch (e) {
    return { erro: msg(e) };
  }
}

/** Números do Salesforce (oportunidade, AR, AB) e CPF do cliente, editados na ficha. */
export async function salvarDadosSF(leadId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const { supabase } = await assertAdmin();
    if (!UUID_RE.test(leadId)) return { erro: "Cadastro inválido." };
    const { gravarCPF, limparCodigoSF } = await import("@/lib/server/salesforce");
    const nums = {
      oportunidade_sf: limparCodigoSF(fd.get("oportunidade_sf"), 40),
      ar_numero: limparCodigoSF(fd.get("ar_numero"), 30, true),
      ab_numero: limparCodigoSF(fd.get("ab_numero"), 30, true),
    };
    const { error } = await supabase.from("leads").update(nums).eq("id", leadId);
    if (error) return { erro: error.message };
    await supabase.from("aprovados").update(nums).eq("lead_id", leadId);
    const cpf = String(fd.get("cpf") ?? "").trim();
    if (cpf) {
      const g = await gravarCPF(leadId, cpf);
      if ("erro" in g) return { erro: g.erro };
    }
    revalidatePath(`/admin/leads/${leadId}`);
    return { ok: true, mensagem: cpf ? "Dados e CPF salvos." : "Dados salvos." };
  } catch (e) {
    return { erro: msg(e) };
  }
}

/** Região de interesse, bairro e dormitórios do cliente (corrigidos pela corretora); refaz os imóveis recomendados. */
export async function atualizarInteresse(leadId: string, dados: { regioes: string[]; bairro: string; dormitorios: number | null }) {
  const { supabase } = await assertAdmin();
  if (!UUID_RE.test(leadId)) throw new Error("Cliente inválido.");
  const { REGIOES: RG } = await import("@/lib/constants");
  const regioes = [...new Set((dados.regioes ?? []).filter((r) => RG.some((x) => x.value === r)))];
  const dorm = dados.dormitorios && dados.dormitorios >= 1 && dados.dormitorios <= 4 ? dados.dormitorios : null;
  const upd: Record<string, unknown> = { regioes, regiao_detalhe: String(dados.bairro ?? "").trim().slice(0, 200) || null, dormitorios_min: dorm };

  // com a simulação feita, refaz a lista de imóveis compatíveis com as novas preferências
  const { data: l } = await supabase.from("leads").select("simulacao, precisa_vaga, preferencia_obra").eq("id", leadId).maybeSingle();
  if (l?.simulacao) {
    const { listarAtivosParaMatch, ranquearDevs, prefsDoLead } = await import("@/lib/server/leads");
    const prefs = prefsDoLead({ regioes, dormitorios_min: dorm, precisa_vaga: !!l.precisa_vaga, preferencia_obra: l.preferencia_obra ?? "indiferente" });
    const ranking = ranquearDevs(await listarAtivosParaMatch(), l.simulacao as import("@/lib/simulacao/types").SimulationResult, prefs);
    upd.recomendados = ranking.compativeis.slice(0, 12).map((x) => x.dev.id);
  }
  const { error } = await supabase.from("leads").update(upd).eq("id", leadId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  return { recomendados: (upd.recomendados as string[] | undefined)?.length ?? null };
}

/** Resultado da análise (pasta/crédito) do cliente: status da AR, motivo da reprovação, reanálise e o que falta. */
export async function salvarAnalise(leadId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const { supabase } = await assertAdmin();
    if (!UUID_RE.test(leadId)) return { erro: "Cadastro inválido." };
    const txt = (k: string, max: number) => String(fd.get(k) ?? "").trim().slice(0, max) || null;
    const upd = {
      ar_status: txt("ar_status", 60),
      parecer_reprovacao: txt("parecer_reprovacao", 200),
      motivo_reprovacao: txt("motivo_reprovacao", 2000),
      reprovado_em: dataISO(fd.get("reprovado_em")),
      reanalise_em: dataISO(fd.get("reanalise_em")),
      pendencias: txt("pendencias", 1000),
    };
    const { error } = await supabase.from("leads").update(upd).eq("id", leadId);
    if (error) return { erro: error.message };
    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/admin/montagem");
    revalidatePath("/admin/reprovados");
    return { ok: true, mensagem: "Análise salva." };
  } catch (e) {
    return { erro: msg(e) };
  }
}

/** Liga/desliga a etiqueta "Aguardando documentos" (cliente prometeu os documentos e ainda não enviou). */
export async function marcarAguardandoDocs(leadId: string, ligar: boolean) {
  const { supabase } = await assertAdmin();
  if (!UUID_RE.test(leadId)) throw new Error("Cliente inválido.");
  const { error } = await supabase.from("leads").update({ aguardando_docs_em: ligar ? new Date().toISOString() : null }).eq("id", leadId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/montagem");
  revalidatePath(`/admin/leads/${leadId}`);
}

/**
 * Etapa "Simulação": simula um projeto escolhido para o cliente (com a renda/FGTS que ele informou)
 * e devolve o resumo e a mensagem de WhatsApp. Também marca o projeto como o escolhido do cliente.
 */
export async function simularProjetoLead(leadId: string, devId: string) {
  const { supabase } = await assertAdmin();
  if (!UUID_RE.test(leadId) || !UUID_RE.test(devId)) return { erro: "Escolha um projeto." };
  const [{ data: l }, { data: d }] = await Promise.all([
    supabase
      .from("leads")
      .select("nome, simulacao, renda_principal, renda_composicao, renda_total, data_nascimento, idade_informada, fgts_saldo, fgts_tres_anos, entrada_disponivel, dormitorios_min, possui_imovel, financiamento_ativo, ja_beneficiado, restricao_credito")
      .eq("id", leadId)
      .maybeSingle(),
    supabase.from("developments").select("id, slug, nome, bairro, regiao, preco_min, dormitorios, oferta_destaque, oferta_texto, unidades_disponiveis, status_obra, previsao_entrega, meses_pos_chaves, construtora, avaliacao_min, ato_minimo, precos_por_dorm").eq("id", devId).maybeSingle(),
  ]);
  if (!l || !d) return { erro: "Cliente ou projeto não encontrado." };
  if (!d.preco_min) return { erro: "Esse projeto está sem preço cadastrado." };

  const { getActiveParams, getSettings } = await import("@/lib/data");
  const { simular } = await import("@/lib/simulacao/engine");
  const { preSimulacao, textoPreSimulacao, regraEntrada } = await import("@/lib/aprovados");
  const { siteUrl } = await import("@/lib/server/notificacoes");
  const ativo = await getActiveParams();
  if (!ativo) return { erro: "Parâmetros da simulação não configurados." };

  // usa a simulação que o cliente fez; se não tiver, calcula com a renda e a idade da ficha
  type Sim = import("@/lib/simulacao/types").SimulationResult;
  let sim = l.simulacao as Sim | null;
  if (!sim) {
    const renda = Number(l.renda_principal || l.renda_total || 0);
    const idadeAnos = l.data_nascimento
      ? Math.floor((Date.now() - new Date(`${l.data_nascimento}T12:00:00Z`).getTime()) / (365.25 * 864e5))
      : Number(l.idade_informada || 0);
    if (!(renda > 0) || !(idadeAnos >= 18)) return { erro: "Para simular, preencha a renda e a idade (ou data de nascimento) do cliente." };
    sim = simular(
      {
        rendaPrincipal: renda,
        rendaComposicao: Number(l.renda_composicao || 0),
        idadeMeses: idadeAnos * 12,
        fgtsSaldo: Number(l.fgts_saldo || 0),
        fgtsTresAnos: !!l.fgts_tres_anos,
        entrada: Number(l.entrada_disponivel || 0),
        possuiImovel: !!l.possui_imovel,
        financiamentoAtivo: !!l.financiamento_ativo,
        jaBeneficiado: !!l.ja_beneficiado,
        restricaoCredito: (l.restricao_credito ?? "nao_sei") as "nao" | "sim" | "nao_sei",
      },
      ativo.params,
      ativo.versao
    );
  }

  // o cliente "como se fosse aprovado" com os valores estimados (subsídio fica de fora da conta: não é garantido)
  const regra = regraEntrada(ativo.params);
  const comoAprovado = {
    financiamento: sim.financiamentoMax,
    subsidio: 0,
    fgts: sim.fgtsConsiderado,
    entrada: sim.entrada,
    poder_compra: sim.financiamentoMax + sim.fgtsConsiderado + sim.entrada,
    renda_familiar: sim.rendaTotal,
    parcela_max: sim.parcelaMax,
    dormitorios_min: l.dormitorios_min ?? null,
  } as unknown as import("@/lib/aprovados").Aprovado;
  const ps = preSimulacao(comoAprovado, d as import("@/lib/aprovados").DevCompat, regra);
  if (!ps) return { erro: "Não foi possível simular esse projeto." };

  const nome = (String(l.nome).trim().split(/\s+/)[0] || "").replace(/^./, (c) => c.toUpperCase());
  const s = await getSettings();
  const link = `${siteUrl()}/empreendimentos/${d.slug}?utm_source=whatsapp&utm_medium=corretora&utm_content=simulacao`;
  const texto = [
    `Oi, ${nome}! Tudo bem? 😊`,
    "",
    `Fiz a sua simulação no *${d.nome}*${d.bairro ? ` (${d.bairro})` : ""}:`,
    "",
    textoPreSimulacao(ps, { estimado: true, subsidioPossivel: sim.subsidioPotencial }),
    "",
    `Veja fotos e plantas: ${link}`,
    "",
    `Quer que eu separe a melhor unidade e já faça a sua análise de crédito na Caixa (sem custo)? 💙`,
    "",
    `*${s.corretora_nome || s.empresa_nome}*`,
  ].join("\n");

  await supabase.from("leads").update({ escolhido_id: d.id }).eq("id", leadId);
  revalidatePath(`/admin/leads/${leadId}`);
  return {
    ok: true as const,
    texto,
    resumo: {
      projeto: d.nome,
      preco: ps.preco,
      dorms: ps.dorms,
      financiamento: ps.financiamento,
      fgts: ps.fgts,
      ato: ps.ato,
      entradaTotal: ps.entradaTotal,
      aParcelar: ps.aParcelar,
      mesesObra: ps.mesesObra,
      parcelaObra: ps.parcelaObra,
      mesesPos: ps.mesesPos,
      parcelaPos: ps.parcelaPos,
      parcelaFinanciamento: ps.parcelaFinanciamento,
      subsidioPossivel: sim.subsidioPotencial,
      excede: ps.excede,
      semAvaliacao: ps.semAvaliacao,
      faixa: sim.faixa?.nome ?? null,
    },
  };
}

// ---------------------------------------------------------------------------
// Meu dia (rotina diária)
// ---------------------------------------------------------------------------

const ITENS_ROTINA = ["agenda", "novos", "quentes", "sem_resposta", "pasta", "conteudo", "aprovados", "carteira", "base_fria_manha", "base_fria_tarde", "redes", "fechamento", "dia_finalizado"];

/** Marca/desmarca um bloco da rotina de hoje (com uma anotação opcional, ex.: o vídeo gravado). */
export async function marcarRotina(item: string, feito: boolean, nota?: string | null) {
  const { supabase } = await assertAdmin();
  if (!ITENS_ROTINA.includes(item)) throw new Error("Item inválido.");
  const { diaSP } = await import("@/lib/agenda");
  const dia = diaSP();
  if (feito) {
    const { error } = await supabase.from("rotina_dia").upsert({ dia, item, feito_em: new Date().toISOString(), nota: nota?.trim().slice(0, 500) || null }, { onConflict: "dia,item" });
    if (error) throw new Error(error.message);
  } else {
    await supabase.from("rotina_dia").delete().eq("dia", dia).eq("item", item);
  }
  revalidatePath("/admin/dia");
}

/** Rebater carteira: registra que o cliente antigo foi chamado hoje (sem mudar a etapa). */
export async function rebaterCliente(leadId: string) {
  const { supabase } = await assertAdmin();
  if (!UUID_RE.test(leadId)) throw new Error("Cliente inválido.");
  await supabase.from("leads").update({ rebatido_em: new Date().toISOString() }).eq("id", leadId);
  await supabase.from("lead_events").insert({ lead_id: leadId, tipo: "carteira_rebatida", dados: {} });
  revalidatePath("/admin/dia");
}

// ---------------------------------------------------------------------------
// Base fria (carteira antiga da planilha, chamada pelo número da carteira)
// ---------------------------------------------------------------------------

/** Abriu o WhatsApp para o contato: marca como chamado e agenda nova tentativa (se não responder). */
export async function chamarBaseFria(id: string) {
  const { supabase } = await assertAdmin();
  if (!UUID_RE.test(id)) throw new Error("Contato inválido.");
  const { DIAS_PARA_NOVA_TENTATIVA } = await import("@/lib/base-fria");
  const { data: c } = await supabase.from("base_fria").select("tentativas, situacao").eq("id", id).maybeSingle();
  if (!c || !["fila", "chamado"].includes(c.situacao)) return;
  const agora = new Date();
  await supabase
    .from("base_fria")
    .update({
      situacao: "chamado",
      chamado_em: agora.toISOString(),
      tentativas: (c.tentativas ?? 0) + 1,
      proxima_em: new Date(agora.getTime() + DIAS_PARA_NOVA_TENTATIVA * 864e5).toISOString(),
    })
    .eq("id", id);
  revalidatePath("/admin/base-fria");
  revalidatePath("/admin/dia");
}

/** Resultado do contato: número errado, não quer mais, ou desfazer (volta para chamado/fila). */
export async function marcarBaseFria(id: string, resultado: "numero_errado" | "nao_quer" | "desfazer") {
  const { supabase } = await assertAdmin();
  if (!UUID_RE.test(id)) throw new Error("Contato inválido.");
  if (resultado === "desfazer") {
    const { data: c } = await supabase.from("base_fria").select("chamado_em").eq("id", id).maybeSingle();
    await supabase.from("base_fria").update({ situacao: c?.chamado_em ? "chamado" : "fila", resolvido_em: null }).eq("id", id);
  } else if (resultado === "numero_errado" || resultado === "nao_quer") {
    await supabase.from("base_fria").update({ situacao: resultado, resolvido_em: new Date().toISOString(), proxima_em: null }).eq("id", id);
  } else throw new Error("Resultado inválido.");
  revalidatePath("/admin/base-fria");
}

/** O contato respondeu com interesse: vira lead (origem "Base fria") e sai da base fria. */
export async function reativarBaseFria(id: string): Promise<{ leadId?: string; erro?: string }> {
  try {
    const { supabase, userId } = await assertAdmin();
    if (!UUID_RE.test(id)) return { erro: "Contato inválido." };
    const { regioesDaZona } = await import("@/lib/base-fria");
    const { data: c } = await supabase.from("base_fria").select("*").eq("id", id).maybeSingle();
    if (!c) return { erro: "Contato não encontrado." };
    if (c.lead_id) return { leadId: c.lead_id };

    const db = createAdminClient();
    const { data: existe } = await db.from("leads").select("id").eq("telefone", c.telefone).is("excluido_em", null).limit(1).maybeSingle();
    let leadId = existe?.id as string | undefined;
    if (!leadId) {
      const { data: lead, error } = await db
        .from("leads")
        .insert({
          nome: c.nome,
          telefone: c.telefone,
          email: c.email,
          regioes: regioesDaZona(c.zona),
          regiao_detalhe: c.bairro,
          prazo_compra: c.prazo_compra,
          origem: "Base fria",
          utm_source: "base_fria",
          utm_campaign: "Base reativada (nº carteira)",
          status: "em_atendimento",
          responsavel_id: userId,
          cadastro_manual: true,
          consentimento_em: new Date().toISOString(),
          consentimento_versao: "base-fria-reativado",
        })
        .select("id")
        .single();
      if (error || !lead) return { erro: error?.message ?? "Não foi possível criar o lead." };
      leadId = lead.id as string;
      const info = [
        "📞 Veio da Base fria (respondeu no número da carteira).",
        c.renda_texto && `Renda informada na época: ${c.renda_texto}`,
        c.prazo_compra && `Prazo de compra: ${c.prazo_compra}`,
        c.bairro && `Bairro de interesse: ${c.bairro}`,
        c.ultima_entrada && `Último cadastro: ${new Date(c.ultima_entrada).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
        c.campanhas && `Campanha(s): ${c.campanhas}`,
        c.observacoes && `Obs. da planilha: ${c.observacoes}`,
      ]
        .filter(Boolean)
        .join("\n");
      await db.from("lead_notes").insert({ lead_id: leadId, autor_id: userId, texto: info });
    }
    await db.from("lead_events").insert({ lead_id: leadId, tipo: "base_fria_reativado", dados: { base_fria_id: id } });
    await supabase.from("base_fria").update({ situacao: "virou_lead", lead_id: leadId, resolvido_em: new Date().toISOString(), proxima_em: null }).eq("id", id);
    revalidatePath("/admin/base-fria");
    revalidatePath("/admin/leads");
    return { leadId };
  } catch (e) {
    return { erro: msg(e) };
  }
}

/** Quantos contatos da base fria chamar por dia. */
export async function salvarMetaBaseFria(n: number) {
  const { supabase } = await assertAdmin(true);
  const v = Math.round(Number(n));
  if (!Number.isFinite(v) || v < 0 || v > 300) throw new Error("Use um número de 0 a 300.");
  const { error } = await supabase.from("site_settings").update({ base_fria_dia: v }).eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/base-fria");
  revalidatePath("/admin/dia");
}
