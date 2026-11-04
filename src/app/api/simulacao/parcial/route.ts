import { after, NextResponse, type NextRequest } from "next/server";
import { CONSENT_VERSION } from "@/lib/constants";
import { inferirOrigem, rateLimit } from "@/lib/server/leads";
import { notificarLead } from "@/lib/server/notificacoes";
import { createAdminClient } from "@/lib/supabase/admin";
import { ETAPAS, etapaDadosPessoais, rastreamentoSchema } from "@/lib/validation/simulacao";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Salva a simulação parcialmente assim que o cliente conclui a 1ª etapa (nome e WhatsApp),
 * para a corretora poder retomar o contato se ele não terminar.
 * Corpo: { token?, etapa (nº de etapas concluídas), dados, rastreamento?, website }
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`parc:${ip}`, 40)) return NextResponse.json({ erro: "Muitas tentativas." }, { status: 429 });

  let body: { token?: unknown; etapa?: unknown; dados?: unknown; rastreamento?: unknown; website?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }
  if (body.website) return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });

  const etapa = Math.min(Math.max(1, Number(body.etapa) || 1), ETAPAS.length - 1);
  const pessoais = etapaDadosPessoais.safeParse(body.dados);
  if (!pessoais.success) return NextResponse.json({ erro: "Dados pessoais inválidos." }, { status: 422 });

  // Junta apenas as etapas seguintes que já estejam válidas
  const d: Record<string, unknown> = { ...pessoais.data };
  for (let i = 1; i < etapa; i++) {
    const r = ETAPAS[i].schema.safeParse(body.dados);
    if (r.success) Object.assign(d, r.data);
  }
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
  const compor = d.compor_renda === true;

  const campos: Record<string, unknown> = {
    nome: d.nome,
    email: (d.email as string) || null,
    telefone: d.telefone,
    data_nascimento: d.data_nascimento,
    estado_civil: d.estado_civil,
    profissao: d.profissao,
    tipo_renda: d.tipo_renda,
    renda_principal: num(d.renda_principal),
    dependentes: num(d.dependentes),
    compor_renda: typeof d.compor_renda === "boolean" ? d.compor_renda : undefined,
    relacao_composicao: compor ? d.relacao_composicao : undefined,
    renda_composicao: compor ? num(d.renda_composicao) : undefined,
    idade_composicao: compor ? num(d.idade_composicao) : undefined,
    fgts_saldo: num(d.fgts_saldo),
    fgts_tres_anos: typeof d.fgts_tres_anos === "boolean" ? d.fgts_tres_anos : undefined,
    restricao_credito: d.restricao_credito,
    regioes: d.regioes,
    dormitorios_min: d.dormitorios_min,
    precisa_vaga: typeof d.precisa_vaga === "boolean" ? d.precisa_vaga : undefined,
    preferencia_obra: d.preferencia_obra,
    etapa_parou: etapa + 1,
  };
  if (campos.renda_principal != null) {
    campos.renda_total = Number(campos.renda_principal) + (compor ? Number(campos.renda_composicao ?? 0) : 0);
  }
  Object.keys(campos).forEach((k) => campos[k] === undefined && delete campos[k]);

  const db = createAdminClient();
  const token = typeof body.token === "string" && UUID.test(body.token) ? body.token : null;

  if (token) {
    const { data } = await db
      .from("leads")
      .update(campos)
      .eq("access_token", token)
      .eq("simulacao_completa", false)
      .is("anonimizado_em", null)
      .select("access_token")
      .maybeSingle();
    if (data) return NextResponse.json({ token: data.access_token });
  }

  const rast = rastreamentoSchema.safeParse(body.rastreamento ?? {});
  const r = rast.success ? rast.data : {};
  const { data: lead, error } = await db
    .from("leads")
    .insert({
      ...campos,
      simulacao_completa: false,
      origem: inferirOrigem(r),
      utm_source: r.utm_source,
      utm_medium: r.utm_medium,
      utm_campaign: r.utm_campaign,
      utm_term: r.utm_term,
      utm_content: r.utm_content,
      gclid: r.gclid,
      fbclid: r.fbclid,
      landing_page: r.landing_page,
      referrer: r.referrer,
      consentimento_em: new Date().toISOString(),
      consentimento_versao: `${CONSENT_VERSION}-contato`,
    })
    .select("id, codigo, access_token, nome, telefone, email, origem, utm_campaign, etapa_parou")
    .single();
  if (error || !lead) {
    console.error("Erro ao gravar simulação parcial", error);
    return NextResponse.json({ erro: "Não foi possível salvar." }, { status: 500 });
  }
  await db.from("lead_events").insert({ lead_id: lead.id, tipo: "simulacao_iniciada", dados: {} });
  after(() => notificarLead("iniciada", lead));
  return NextResponse.json({ token: lead.access_token });
}
