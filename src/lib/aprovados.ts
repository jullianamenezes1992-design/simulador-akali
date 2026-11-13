/**
 * Clientes aprovados: tipos, rótulos e regras de compatibilidade com os empreendimentos.
 * Recursos (coluna poder_compra) = financiamento aprovado + subsídio + FGTS + entrada à vista (calculado também no banco).
 * O que faltar para o preço pode virar entrada parcelada com a construtora, limitada a 20% do preço
 * e a uma parcela de até 30% da renda (nos meses até a entrega das chaves, mais as parcelas pós-chaves do projeto, se houver).
 */
import { formatBRL } from "./format";
import { regiaoLabel } from "./constants";
import { mesesAteEntrega } from "./simulacao/engine";
import type { SimulationParams } from "./simulacao/types";

export const STATUS_APROVADO = [
  { value: "ativo", label: "Aprovado (ativo)", cor: "bg-emerald-100 text-emerald-800" },
  { value: "negociando", label: "Negociando", cor: "bg-indigo-100 text-indigo-800" },
  { value: "vendido", label: "Vendido", cor: "bg-caixa text-white" },
  { value: "vencido", label: "Aprovação vencida", cor: "bg-zinc-200 text-zinc-700" },
  { value: "desistiu", label: "Desistiu", cor: "bg-red-100 text-red-800" },
] as const;

export const CLASSIFICACOES = [
  { value: "quente", label: "🔥 Quente", cor: "bg-red-100 text-red-800" },
  { value: "morno", label: "🌤️ Morno", cor: "bg-amber-100 text-amber-900" },
  { value: "frio", label: "❄️ Frio", cor: "bg-sky-100 text-sky-800" },
] as const;

export const statusAprovadoInfo = (v: string) => STATUS_APROVADO.find((s) => s.value === v) ?? STATUS_APROVADO[0];
export const classificacaoInfo = (v: string) => CLASSIFICACOES.find((s) => s.value === v) ?? CLASSIFICACOES[1];

/** Aprovados que ainda podem comprar */
export const STATUS_EM_ABERTO = ["ativo", "negociando"];

export interface Aprovado {
  id: string;
  lead_id: string | null;
  nome: string;
  telefone: string;
  data_analise: string | null;
  vencimento: string | null;
  tipo_renda: string | null;
  renda_familiar: number;
  faixa: number | null;
  financiamento: number;
  subsidio: number;
  fgts: number;
  entrada: number;
  poder_compra: number;
  prazo_meses: number | null;
  parcela_max: number | null;
  classificacao: string;
  regioes: string[];
  dormitorios_min: number | null;
  status: string;
  observacoes: string | null;
  oportunidade_sf: string | null;
  ar_numero: string | null;
  ab_numero: string | null;
  ultima_oferta_em: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfertaEnviada {
  aprovado_id: string;
  development_id: string | null;
  dev_nome: string;
  enviado_em: string;
}

/** Última oferta de cada projeto para um aprovado (chave: id do empreendimento ou nome). */
export function ofertasPorProjeto(ofertas: OfertaEnviada[]) {
  const m = new Map<string, string>();
  for (const o of ofertas) {
    for (const k of [o.development_id, o.dev_nome].filter(Boolean) as string[]) {
      if (!m.has(k) || m.get(k)! < o.enviado_em) m.set(k, o.enviado_em);
    }
  }
  return m;
}

/** Data da última oferta deste projeto para o aprovado, se houver. */
export const ofertaDoProjeto = (m: Map<string, string>, d: { id: string; nome: string }) => m.get(d.id) ?? m.get(d.nome) ?? null;

export interface DevCompat {
  id: string;
  slug: string;
  nome: string;
  bairro: string | null;
  regiao: string | null;
  preco_min: number | null;
  dormitorios: number[];
  oferta_destaque: boolean;
  oferta_texto: string | null;
  unidades_disponiveis: number | null;
  status_obra: string | null;
  previsao_entrega?: string | null;
  meses_pos_chaves?: number | null;
  construtora?: string | null;
  /** valor de avaliação da unidade mais barata (o financiamento vai até 80% dele) */
  avaliacao_min?: number | null;
  /** ato mínimo na assinatura (vazio = padrão da construtora) */
  ato_minimo?: number | null;
  /** unidade mais barata por nº de dormitórios ({"1": 209184, "2": 245000}) — vem do tabelão */
  precos_por_dorm?: Record<string, number> | null;
}

/**
 * Preço usado para o aprovado: a unidade mais barata com os dormitórios que ele quer (se o tabelão informar);
 * senão, o "a partir de" do empreendimento.
 */
export function precoParaAprovado(a: Pick<Aprovado, "dormitorios_min">, d: Pick<DevCompat, "preco_min" | "precos_por_dorm">) {
  const base = Number(d.preco_min || 0);
  const tabela = d.precos_por_dorm ?? null;
  if (!a.dormitorios_min || !tabela || !Object.keys(tabela).length) return { preco: base, dorms: null as number | null };
  const op = Object.entries(tabela)
    .map(([k, v]) => ({ dorms: Number(k), preco: Number(v) }))
    .filter((x) => x.dorms >= a.dormitorios_min! && x.preco > 0)
    .sort((x, y) => x.preco - y.preco)[0];
  return op ? op : { preco: 0, dorms: null };
}

/** Avaliação estimada para a unidade escolhida (proporcional à avaliação da mais barata). */
function avaliacaoPara(d: Pick<DevCompat, "avaliacao_min" | "preco_min">, preco: number) {
  const aval = Number(d.avaliacao_min || 0);
  const base = Number(d.preco_min || 0);
  return aval > 0 && base > 0 ? (aval * preco) / base : aval;
}

/** Parte da avaliação da unidade que a Caixa financia. */
export const COTA_AVALIACAO = 0.8;

/** Ato mínimo na assinatura: o do cadastro do projeto ou o padrão da construtora (Plano&Plano R$ 500, Cury R$ 800). */
export function atoMinimo(d: Pick<DevCompat, "construtora" | "ato_minimo">) {
  if (d.ato_minimo != null && Number(d.ato_minimo) >= 0) return Number(d.ato_minimo);
  const c = (d.construtora ?? "").toLowerCase();
  if (c.includes("cury")) return 800;
  if (c.includes("plano")) return 500;
  return 0;
}

/** Financiamento que dá para usar neste projeto: o aprovado, limitado a 80% da avaliação (se a avaliação estiver cadastrada). */
export function financiamentoNoProjeto(a: Pick<Aprovado, "financiamento">, d: Pick<DevCompat, "avaliacao_min" | "preco_min">, preco?: number) {
  const fin = Number(a.financiamento || 0);
  const aval = preco ? avaliacaoPara(d, preco) : Number(d.avaliacao_min || 0);
  return aval > 0 ? Math.min(fin, aval * COTA_AVALIACAO) : fin;
}

/** Regra da entrada parcelada com a construtora usada para os aprovados. */
export interface RegraEntrada {
  /** parte máxima do preço que a construtora parcela (0.20 = 20%) */
  pct: number;
  /** parcela máxima da entrada como parte da renda (0.30 = 30%) */
  comprometimento: number;
  mesesLancamento: number;
  mesesObras: number;
  comprometimentoPos: number;
}

export const ENTRADA_PCT = 0.2;
export const PARCELA_PCT_RENDA = 0.3;

/** Até 20% do preço e parcela de até 30% da renda; prazos padrão de obra vêm dos parâmetros da simulação. */
export function regraEntrada(params?: SimulationParams | null): RegraEntrada {
  const ep = params?.entrada_parcelada;
  return {
    pct: ENTRADA_PCT,
    comprometimento: PARCELA_PCT_RENDA,
    mesesLancamento: ep?.meses_lancamento ?? 36,
    mesesObras: ep?.meses_obras ?? 24,
    comprometimentoPos: ep?.comprometimento_pos ?? PARCELA_PCT_RENDA,
  };
}

/** Quanto da entrada este cliente consegue parcelar neste empreendimento, e em quantos meses. */
export function entradaParcelavelAprovado(
  a: Pick<Aprovado, "renda_familiar">,
  d: Pick<DevCompat, "status_obra" | "previsao_entrega" | "meses_pos_chaves">,
  preco: number,
  regra: RegraEntrada,
  hoje = new Date()
) {
  const renda = Number(a.renda_familiar || 0);
  const obra = d.status_obra === "pronto" ? 0 : (mesesAteEntrega(d.previsao_entrega, hoje) ?? (d.status_obra === "lancamento" ? regra.mesesLancamento : regra.mesesObras));
  const parcelaObra = renda * regra.comprometimento;
  const parcelaPos = renda * regra.comprometimentoPos;
  const mesesPos = Math.max(0, Number(d.meses_pos_chaves ?? 0));
  const capacidade = parcelaObra * obra + parcelaPos * mesesPos;
  return { valorMax: Math.max(0, Math.min(preco * regra.pct, capacidade)), mesesObra: obra, mesesPos, parcelaObra, parcelaPos };
}

/** Avalia um empreendimento para o aprovado: recursos + entrada parcelada (até 20% do preço e parcela até 30% da renda). */
export function avaliarDev(a: Pick<Aprovado, "poder_compra" | "renda_familiar" | "financiamento" | "dormitorios_min">, d: DevCompat, regra: RegraEntrada, tolerancia = 0, hoje = new Date()) {
  // unidade mais barata com os dormitórios que o cliente quer (quando o tabelão informa)
  const { preco, dorms } = precoParaAprovado(a, d);
  // o financiamento usado no projeto vai até 80% da avaliação da unidade
  const recursos = Number(a.poder_compra || 0) - Number(a.financiamento || 0) + financiamentoNoProjeto(a, d, preco);
  const ep = entradaParcelavelAprovado(a, d, preco, regra, hoje);
  const falta = Math.max(0, preco - recursos);
  const limite = recursos + ep.valorMax;
  const meses = ep.mesesObra + (falta > ep.parcelaObra * ep.mesesObra ? ep.mesesPos : 0);
  return {
    preco,
    dorms,
    limite,
    folga: limite - preco,
    cabe: preco > 0 && limite >= preco * (1 - tolerancia),
    /** entrada a parcelar com a construtora (0 se os recursos já cobrem) */
    entradaParcelar: Math.min(falta, ep.valorMax),
    parcelaEntrada: falta > 0 && meses > 0 ? Math.min(falta, ep.valorMax) / meses : 0,
    meses,
  };
}

/** "Compra até" estimado (empreendimento em obras, prazo padrão, sem pós-chaves), para listas e resumos. */
export function compraAte(a: Pick<Aprovado, "poder_compra" | "renda_familiar">, regra: RegraEntrada) {
  const recursos = Number(a.poder_compra || 0);
  const renda = Number(a.renda_familiar || 0);
  const cap = renda * regra.comprometimento * regra.mesesObras;
  return Math.round(Math.min(recursos / (1 - regra.pct), recursos + cap));
}

export const poderDeCompra = (a: Pick<Aprovado, "financiamento" | "subsidio" | "fgts" | "entrada">) =>
  Number(a.financiamento || 0) + Number(a.subsidio || 0) + Number(a.fgts || 0) + Number(a.entrada || 0);

/** Dias até o vencimento (negativo = vencido). */
export function diasParaVencer(vencimento: string | null, hoje = new Date()) {
  if (!vencimento) return null;
  const d = new Date(`${vencimento}T23:59:59-03:00`).getTime();
  return Math.ceil((d - hoje.getTime()) / 864e5);
}

/** O imóvel cabe no poder de compra? `tolerancia` (0–0.2) aceita imóveis até X% acima do poder. */
export function cabe(poder: number, preco: number | null, tolerancia = 0) {
  if (!preco || preco <= 0) return false;
  return poder >= preco * (1 - tolerancia);
}

/** Empreendimentos que cabem (recursos + entrada parcelada), com quem combina melhor (região/dormitórios) primeiro. */
export function compativeis(a: Aprovado, devs: DevCompat[], tolerancia = 0, regra: RegraEntrada = regraEntrada()) {
  return devs
    .map((d) => ({ d, av: avaliarDev(a, d, regra, tolerancia) }))
    .filter((x) => x.av.cabe)
    .map(({ d, av }) => {
      const regiaoOk = !a.regioes?.length || (d.regiao ? a.regioes.includes(d.regiao) : false);
      const dormOk = !a.dormitorios_min || (d.dormitorios ?? []).some((n) => n >= a.dormitorios_min!);
      return { dev: d, regiaoOk, dormOk, folga: av.folga, acimaDoPoder: av.folga < 0, av };
    })
    .sort((x, y) => Number(y.regiaoOk && y.dormOk) - Number(x.regiaoOk && x.dormOk) || Number(y.dev.oferta_destaque) - Number(x.dev.oferta_destaque) || x.av.preco - y.av.preco);
}

/**
 * Pré-simulação de um projeto para o aprovado: quanto financia, FGTS/subsídio, ato e entrada parcelada,
 * e a parcela estimada do financiamento (proporcional à da aprovação).
 */
export function preSimulacao(a: Aprovado, d: DevCompat, regra: RegraEntrada, hoje = new Date()) {
  const { preco, dorms } = precoParaAprovado(a, d);
  if (!preco) return null;
  const sub = Number(a.subsidio || 0);
  const fgts = Number(a.fgts || 0);
  const vista = Number(a.entrada || 0);
  const ato = atoMinimo(d);
  // financia o necessário (deixando ao menos o ato), até o aprovado e até 80% da avaliação
  const finMax = financiamentoNoProjeto(a, d, preco);
  const financiamento = Math.max(0, Math.min(finMax, preco - sub - fgts - Math.max(ato, vista)));
  const entradaTotal = Math.max(0, preco - financiamento - sub - fgts);
  const atoValor = Math.min(entradaTotal, Math.max(ato, vista));
  const aParcelar = Math.max(0, entradaTotal - atoValor);
  const ep = entradaParcelavelAprovado(a, d, preco, regra, hoje);
  const naObra = ep.mesesObra > 0 ? Math.min(aParcelar, ep.parcelaObra * ep.mesesObra) : 0;
  const resto = aParcelar - naObra;
  const mesesObra = naObra > 0 ? ep.mesesObra : 0;
  const mesesPos = resto > 0 && ep.parcelaPos > 0 ? Math.min(ep.mesesPos, Math.ceil(resto / ep.parcelaPos)) : 0;
  const finAprov = Number(a.financiamento || 0);
  const parcelaFin = a.parcela_max && finAprov > 0 ? (Number(a.parcela_max) * financiamento) / finAprov : null;
  return {
    preco,
    dorms,
    financiamento: Math.round(financiamento),
    subsidio: sub,
    fgts,
    ato: Math.round(atoValor),
    entradaTotal: Math.round(entradaTotal),
    aParcelar: Math.round(aParcelar),
    mesesObra,
    parcelaObra: mesesObra ? Math.round(naObra / mesesObra) : 0,
    mesesPos,
    parcelaPos: mesesPos ? Math.round(resto / mesesPos) : 0,
    parcelaFinanciamento: parcelaFin ? Math.round(parcelaFin) : null,
    /** a entrada não cabe nas regras (mais de 20% do imóvel ou parcela acima de 30% da renda) */
    excede: aParcelar > ep.valorMax + 1,
    semAvaliacao: !(Number(d.avaliacao_min) > 0),
  };
}

/** Bloco de texto da pré-simulação para o WhatsApp. */
export function textoPreSimulacao(p: NonNullable<ReturnType<typeof preSimulacao>>, opc: { estimado?: boolean; subsidioPossivel?: number } = {}) {
  const L: string[] = [
    opc.estimado ? "📋 *Sua simulação*" : "📋 *Sua pré-simulação*",
    `• Valor do imóvel${p.dorms ? ` (${p.dorms} ${p.dorms === 1 ? "dormitório" : "dormitórios"})` : ""}: ${formatBRL(p.preco)}`,
  ];
  if (p.financiamento > 0) L.push(`• Financiamento Caixa (${opc.estimado ? "estimado" : "já aprovado"}): ${formatBRL(p.financiamento)}`);
  if (p.subsidio > 0) L.push(`• Subsídio: ${formatBRL(p.subsidio)}`);
  if (p.fgts > 0) L.push(`• FGTS: ${formatBRL(p.fgts)}`);
  if (p.aParcelar <= 0) {
    const quem = p.fgts > 0 || p.subsidio > 0 ? "o financiamento e o " + (p.fgts > 0 ? "FGTS" : "subsídio") + " cobrem" : "o financiamento cobre";
    L.push(p.ato > 0 ? `• Só o ato de *${formatBRL(p.ato)}* na assinatura: ${quem} o resto` : `• Sem entrada: ${quem} o valor`);
  } else {
    const partes = [p.ato > 0 ? `ato de ${formatBRL(p.ato)}` : null, p.mesesObra ? `*${p.mesesObra}x de ${formatBRL(p.parcelaObra)}* até as chaves` : null, p.mesesPos ? `*${p.mesesPos}x de ${formatBRL(p.parcelaPos)}* depois das chaves` : null].filter(Boolean);
    L.push(`• Entrada com a construtora: ${formatBRL(p.entradaTotal)} (${partes.join(" + ")})`);
  }
  if (p.parcelaFinanciamento) L.push(`• Parcela do financiamento depois das chaves: cerca de *${formatBRL(p.parcelaFinanciamento)}/mês*`);
  if (opc.subsidioPossivel && opc.subsidioPossivel > 0)
    L.push(`• Pelo Minha Casa Minha Vida você pode ter *subsídio de até ${formatBRL(opc.subsidioPossivel)}*, que diminui a entrada (depende da análise da Caixa)`);
  L.push(
    "",
    opc.estimado
      ? "_Simulação estimada com a renda informada e a tabela de hoje. Os valores finais dependem da análise e aprovação da Caixa._"
      : "_Valores estimados com base na sua aprovação e na tabela de hoje; a unidade e as condições finais são confirmadas na proposta._"
  );
  return L.join("\n");
}

/** Mensagem de WhatsApp oferecendo um empreendimento a um aprovado. */
export function mensagemOferta(a: Pick<Aprovado, "nome">, d: DevCompat, link: string, assinatura: string, preSim?: ReturnType<typeof preSimulacao>) {
  const nome = (a.nome.trim().split(/\s+/)[0] || "").replace(/^./, (c) => c.toUpperCase());
  const local = [d.bairro, regiaoLabel(d.regiao)].filter(Boolean).join(", ");
  const preco = d.preco_min ? formatBRL(Number(d.preco_min)) : null;
  return [
    `Oi, ${nome}! Tudo bem? 😊`,
    "",
    `Como o seu crédito já está *aprovado*, separei uma oportunidade que cabe no seu poder de compra:`,
    "",
    `🏡 *${d.nome}*${local ? ` – ${local}` : ""}`,
    preco && !preSim ? `💰 A partir de *${preco}*` : null,
    d.oferta_destaque && d.oferta_texto ? `🔥 ${d.oferta_texto}` : null,
    d.unidades_disponiveis != null && d.unidades_disponiveis > 0 && d.unidades_disponiveis < 50 ? `⚠️ Últimas unidades disponíveis` : null,
    "",
    preSim ? textoPreSimulacao(preSim) : null,
    preSim ? "" : null,
    `Veja fotos e plantas: ${link}`,
    "",
    `Quer que eu separe a melhor unidade para você? A sua aprovação tem prazo, então vale garantir logo! 💙`,
    "",
    `*${assinatura}*`,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

/** Nome usado no histórico de ofertas para a mensagem de reanálise. */
export const REANALISE = "Mensagem de reanálise";

/**
 * Quando nenhum projeto cabe (financiamento aprovado baixo): mensagem convidando para uma nova análise,
 * com as mudanças do Minha Casa Minha Vida, atualização de renda, composição de renda e FGTS.
 */
export function mensagemReanalise(a: Pick<Aprovado, "nome">, assinatura: string) {
  const nome = (a.nome.trim().split(/\s+/)[0] || "").replace(/^./, (c) => c.toUpperCase());
  return [
    `Oi, ${nome}! Tudo bem? 😊`,
    "",
    `Aqui é da ${assinatura}. Estava revisando a sua análise de crédito e vi que o financiamento aprovado na época ficou abaixo do necessário para fechar o seu apartamento.`,
    "",
    `O *Minha Casa Minha Vida* passou por mudanças e saíram condições novas, então pode ser que hoje dê para conseguir uma *aprovação melhor*. Ajuda também se:`,
    `✅ a sua renda aumentou`,
    `✅ dá para somar a renda de alguém da família`,
    `✅ você tem saldo de FGTS`,
    "",
    `Quer que eu faça uma *nova simulação* para você? É rapidinho e sem compromisso 🏡`,
  ].join("\n");
}
