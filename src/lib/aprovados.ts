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
  created_at: string;
}

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
export function avaliarDev(a: Pick<Aprovado, "poder_compra" | "renda_familiar">, d: DevCompat, regra: RegraEntrada, tolerancia = 0, hoje = new Date()) {
  const preco = Number(d.preco_min || 0);
  const recursos = Number(a.poder_compra || 0);
  const ep = entradaParcelavelAprovado(a, d, preco, regra, hoje);
  const falta = Math.max(0, preco - recursos);
  const limite = recursos + ep.valorMax;
  const meses = ep.mesesObra + (falta > ep.parcelaObra * ep.mesesObra ? ep.mesesPos : 0);
  return {
    preco,
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
    .sort((x, y) => Number(y.regiaoOk && y.dormOk) - Number(x.regiaoOk && x.dormOk) || Number(y.dev.oferta_destaque) - Number(x.dev.oferta_destaque) || Number(x.dev.preco_min) - Number(y.dev.preco_min));
}

/** Mensagem de WhatsApp oferecendo um empreendimento a um aprovado. */
export function mensagemOferta(a: Pick<Aprovado, "nome">, d: DevCompat, link: string, assinatura: string) {
  const nome = (a.nome.trim().split(/\s+/)[0] || "").replace(/^./, (c) => c.toUpperCase());
  const local = [d.bairro, regiaoLabel(d.regiao)].filter(Boolean).join(", ");
  const preco = d.preco_min ? formatBRL(Number(d.preco_min)) : null;
  return [
    `Oi, ${nome}! Tudo bem? 😊`,
    "",
    `Como o seu crédito já está *aprovado*, separei uma oportunidade que cabe no seu poder de compra:`,
    "",
    `🏡 *${d.nome}*${local ? ` – ${local}` : ""}`,
    preco ? `💰 A partir de *${preco}*` : null,
    d.oferta_destaque && d.oferta_texto ? `🔥 ${d.oferta_texto}` : null,
    d.unidades_disponiveis != null && d.unidades_disponiveis > 0 && d.unidades_disponiveis < 50 ? `⚠️ Últimas unidades disponíveis` : null,
    "",
    `Veja fotos e plantas: ${link}`,
    "",
    `Quer que eu separe a melhor unidade para você? A sua aprovação tem prazo, então vale garantir logo! 💙`,
    "",
    `*${assinatura}*`,
  ]
    .filter((l) => l !== null)
    .join("\n");
}
