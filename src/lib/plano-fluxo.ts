/**
 * Fluxo de pagamento da Plano&Plano (uso interno).
 * Os limites vêm do simulador do portal de corretores: cada parcela tem um máximo que é uma parte
 * da renda, e essa parte depende da faixa de score do cliente.
 */

export interface ParcelaPlano {
  /** Sinal Ato, Entrada, Mensal A, Mensal B, Mensal, Anual, Mensal Pós, Anual Pós... */
  tipo: string;
  qtd: number;
  /** data da 1ª parcela (dd/mm/aaaa) na data da coleta */
  inicio: string | null;
  /** limite da parcela como parte da renda, por faixa de score [0–499, 500–600, 601–799, 800–1000] */
  max: number[] | null;
  /** valor mínimo em R$ (ex.: sinal) */
  min: number | null;
}

export interface FluxoPlano {
  tabela: string;
  tabela_nome: string | null;
  vigencia_fim: string | null;
  parcelas: ParcelaPlano[];
  coletado_em: string;
}

export const FAIXAS_SCORE = ["0 a 499", "500 a 600", "601 a 799", "800 a 1000"];

export function faixaScore(score: number) {
  if (score < 500) return 0;
  if (score <= 600) return 1;
  if (score <= 799) return 2;
  return 3;
}

/** tabelas de venda na ordem em que aparecem para escolher */
export const TABELAS_PLANO = [
  "Associativa",
  "Associativa IR Futuro",
  "Associativa - Renda Empresário",
  "Direta",
  "Alienação 60x",
];

/** Agrupa os nomes de tabela da Plano ("48x", "24x IR Futuro HIS1", "Direta com renda"...) nas opções do CRM. */
export function categoriaTabela(nome: string) {
  const n = nome.replace(/\s+/g, " ").trim();
  if (/ir futuro/i.test(n)) return "Associativa IR Futuro";
  if (/renda empres/i.test(n)) return "Associativa - Renda Empresário";
  if (/alien|^60x/i.test(n)) return "Alienação 60x";
  if (/direta/i.test(n)) return "Direta";
  if (/vista/i.test(n)) return "À Vista";
  if (/^(associativa|\d+x)\b/i.test(n)) return "Associativa";
  return "Financiada";
}

/** variante "comum" primeiro (sem HIS, NR, investidor ou "sem renda") */
const peso = (nome: string) =>
  (/his|\bnr\b|investidor|sem renda/i.test(nome) ? 10 : 0) + nome.length / 100;

/** Escolhe a tabela do cliente; se o projeto não tiver, usa a Associativa. */
export function fluxoDaTabela(
  fluxos: FluxoPlano[] | null | undefined,
  tabela: string | null | undefined,
) {
  if (!fluxos?.length) return null;
  const da = (cat: string) =>
    fluxos
      .filter((f) => categoriaTabela(f.tabela) === cat && f.parcelas.some((p) => p.max))
      .sort((a, b) => peso(a.tabela) - peso(b.tabela))[0];
  return da(tabela || "Associativa") ?? da("Associativa") ?? null;
}

export interface LinhaFluxo {
  tipo: string;
  qtd: number;
  inicio: string | null;
  /** valor máximo de cada parcela para esse cliente */
  parcelaMax: number;
  min: number | null;
  total: number;
}

/** Parcelas que entram na conta da entrada com a construtora (não conta financiamento nem sinal). */
const conta = (p: ParcelaPlano) =>
  p.max != null && !/financiamento|repasse|sinal/i.test(p.tipo);

/** Fluxo máximo deste cliente nesta tabela: o máximo de cada parcela e o total que dá para pagar à construtora. */
export function calcularFluxoPlano(
  fluxo: FluxoPlano,
  renda: number,
  score: number,
) {
  const f = faixaScore(score);
  const linhas: LinhaFluxo[] = [];
  for (const p of fluxo.parcelas) {
    if (/financiamento|repasse/i.test(p.tipo)) continue;
    const pct = p.max?.[f] ?? 0;
    const parcelaMax = Math.floor(pct * renda + 1e-6);
    if (!conta(p)) {
      if (/sinal/i.test(p.tipo) && p.min)
        linhas.push({ tipo: p.tipo, qtd: p.qtd, inicio: p.inicio, parcelaMax: 0, min: p.min, total: 0 });
      continue;
    }
    if (parcelaMax <= 0 || p.qtd <= 0) continue;
    linhas.push({ tipo: p.tipo, qtd: p.qtd, inicio: p.inicio, parcelaMax, min: p.min, total: parcelaMax * p.qtd });
  }
  // junta parcelas iguais seguidas (ex.: 2 entradas de 1x com o mesmo limite)
  const juntas: LinhaFluxo[] = [];
  for (const l of linhas) {
    const ant = juntas[juntas.length - 1];
    if (ant && ant.tipo === l.tipo && ant.parcelaMax === l.parcelaMax && l.parcelaMax > 0) {
      ant.qtd += l.qtd;
      ant.total += l.total;
    } else juntas.push({ ...l });
  }
  const total = juntas.reduce((s, l) => s + l.total, 0);
  const sinalMin = linhas.find((l) => /sinal/i.test(l.tipo))?.min ?? 0;
  const meses = juntas
    .filter((l) => /mensal/i.test(l.tipo))
    .reduce((s, l) => s + l.qtd, 0);
  return { faixa: f, linhas: juntas, total, sinalMin, meses, tabela: fluxo.tabela };
}

export type FluxoCalculado = ReturnType<typeof calcularFluxoPlano>;

/** Texto curto do fluxo para mensagem ("Entrada 2x de até R$ 800 • Mensal A 14x de até R$ 350..."). */
export function linhasFluxoTexto(
  fc: FluxoCalculado,
  fmt: (n: number) => string,
  usado?: number,
) {
  // se o cliente precisa de menos que o máximo, reduz tudo na mesma proporção
  const fator = usado != null && fc.total > 0 ? Math.min(1, usado / fc.total) : 1;
  return fc.linhas
    .filter((l) => l.parcelaMax > 0)
    .map(
      (l) =>
        `${l.tipo}: ${l.qtd}x de ${fator < 1 ? "" : "até "}${fmt(Math.ceil(l.parcelaMax * fator))}`,
    );
}
