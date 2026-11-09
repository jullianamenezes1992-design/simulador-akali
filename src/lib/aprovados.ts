/**
 * Clientes aprovados: tipos, rótulos e regras de compatibilidade com os empreendimentos.
 * Poder de compra = financiamento aprovado + subsídio + FGTS + entrada (calculado também no banco).
 */
import { formatBRL } from "./format";
import { regiaoLabel } from "./constants";

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

/** Empreendimentos que cabem, com quem combina melhor (região/dormitórios) primeiro. */
export function compativeis(a: Aprovado, devs: DevCompat[], tolerancia = 0) {
  return devs
    .filter((d) => cabe(Number(a.poder_compra), Number(d.preco_min), tolerancia))
    .map((d) => {
      const regiaoOk = !a.regioes?.length || (d.regiao ? a.regioes.includes(d.regiao) : false);
      const dormOk = !a.dormitorios_min || (d.dormitorios ?? []).some((n) => n >= a.dormitorios_min!);
      const folga = Number(a.poder_compra) - Number(d.preco_min);
      return { dev: d, regiaoOk, dormOk, folga, acimaDoPoder: folga < 0 };
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
