import { NextResponse, type NextRequest } from "next/server";
import { CONSENT_VERSION } from "@/lib/constants";
import { encryptCPF, hashCPF } from "@/lib/crypto";
import { getActiveParams } from "@/lib/data";
import { idadeEmMeses } from "@/lib/format";
import { inferirOrigem, listarAtivosParaMatch, rateLimit, ranquearDevs } from "@/lib/server/leads";
import { simular } from "@/lib/simulacao/engine";
import { createAdminClient } from "@/lib/supabase/admin";
import { errosPorCampo, etapaFamilia, simulacaoSchema } from "@/lib/validation/simulacao";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`sim:${ip}`)) {
    return NextResponse.json({ erro: "Muitas tentativas. Aguarde alguns minutos e tente novamente." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  // Validação no servidor (as mesmas regras do formulário + regras condicionais)
  const parsed = simulacaoSchema.safeParse(body);
  if (!parsed.success) {
    const campos = errosPorCampo(parsed.error);
    if (campos.website) return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
    return NextResponse.json({ erro: "Revise os campos destacados.", campos }, { status: 422 });
  }
  const familia = etapaFamilia.safeParse(parsed.data);
  if (!familia.success) {
    return NextResponse.json({ erro: "Revise os campos destacados.", campos: errosPorCampo(familia.error) }, { status: 422 });
  }
  const d = parsed.data;

  const ativo = await getActiveParams();
  if (!ativo) {
    return NextResponse.json({ erro: "A simulação está temporariamente indisponível. Tente mais tarde." }, { status: 503 });
  }

  // Idade do proponente mais velho define o prazo
  const idadeTitular = idadeEmMeses(d.data_nascimento);
  const idadeComp = d.compor_renda && d.idade_composicao ? d.idade_composicao * 12 : 0;
  const resultado = simular(
    {
      rendaPrincipal: d.renda_principal,
      rendaComposicao: d.compor_renda ? d.renda_composicao : 0,
      idadeMeses: Math.max(idadeTitular, idadeComp),
      fgtsSaldo: d.fgts_saldo,
      fgtsTresAnos: d.fgts_tres_anos,
      entrada: d.entrada_disponivel,
      possuiImovel: d.possui_imovel,
      financiamentoAtivo: d.financiamento_ativo,
      jaBeneficiado: d.ja_beneficiado,
      restricaoCredito: d.restricao_credito,
    },
    ativo.params,
    ativo.versao
  );

  const devs = await listarAtivosParaMatch();
  const ranking = ranquearDevs(devs, resultado, {
    regioes: d.regioes,
    dormitoriosMin: d.dormitorios_min,
    precisaVaga: d.precisa_vaga,
    preferenciaObra: d.preferencia_obra as "indiferente" | "pronto" | "planta",
  });
  const recomendados = ranking.compativeis.slice(0, 12).map((x) => x.dev.id);

  const r = d.rastreamento ?? {};
  const db = createAdminClient();
  const { data: lead, error } = await db
    .from("leads")
    .insert({
      nome: d.nome,
      email: d.email || null,
      telefone: d.telefone,
      data_nascimento: d.data_nascimento,
      estado_civil: d.estado_civil,
      cpf_final: d.cpf.slice(-2),
      profissao: d.profissao,
      tipo_renda: d.tipo_renda,
      renda_principal: d.renda_principal,
      dependentes: d.dependentes,
      compor_renda: d.compor_renda,
      relacao_composicao: d.compor_renda ? d.relacao_composicao : null,
      renda_composicao: d.compor_renda ? d.renda_composicao : 0,
      idade_composicao: d.compor_renda ? d.idade_composicao : null,
      renda_total: resultado.rendaTotal,
      fgts_saldo: d.fgts_saldo,
      fgts_tres_anos: d.fgts_tres_anos,
      possui_imovel: d.possui_imovel,
      financiamento_ativo: d.financiamento_ativo,
      ja_beneficiado: d.ja_beneficiado,
      restricao_credito: d.restricao_credito,
      regioes: d.regioes,
      dormitorios_min: d.dormitorios_min,
      precisa_vaga: d.precisa_vaga,
      preferencia_obra: d.preferencia_obra,
      entrada_disponivel: d.entrada_disponivel,
      prazo_compra: d.prazo_compra,
      simulacao: resultado,
      params_versao: ativo.versao,
      recomendados,
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
      consentimento_versao: CONSENT_VERSION,
      aceita_marketing: d.aceita_marketing,
    })
    .select("id, codigo, access_token")
    .single();

  if (error || !lead) {
    console.error("Erro ao gravar lead", error);
    return NextResponse.json({ erro: "Não foi possível salvar a simulação. Tente novamente." }, { status: 500 });
  }

  const { error: errSens } = await db.from("lead_sensitive").insert({
    lead_id: lead.id,
    cpf_enc: encryptCPF(d.cpf),
    cpf_hash: hashCPF(d.cpf),
  });
  if (errSens) console.error("Erro ao gravar dado sensível", errSens);

  await db.from("lead_events").insert({
    lead_id: lead.id,
    tipo: "simulacao_concluida",
    dados: { faixa: resultado.faixa?.id ?? null, compativeis: recomendados.length, params_versao: ativo.versao },
  });

  return NextResponse.json({ token: lead.access_token, codigo: lead.codigo, faixa: resultado.faixa?.id ?? null });
}
