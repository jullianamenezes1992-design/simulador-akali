import { regiaoLabel } from "../constants";
import { formatBRL } from "../format";
import type { DevelopmentForMatch, MatchPreferences, MatchResult, SimulationResult } from "./types";

/**
 * Pesos do motor de compatibilidade (somam 100).
 * Ajuste aqui para mudar a priorização.
 */
export const PESOS = {
  renda: 25, // faixa do programa atendida pelo empreendimento
  capacidade: 20, // preço cabe na capacidade estimada
  entrada: 10, // entrada informada cobre a diferença
  regiao: 15,
  dormitorios: 10,
  vaga: 5,
  disponibilidade: 10,
  obra: 5,
} as const;

export function avaliarCompatibilidade(
  dev: DevelopmentForMatch,
  sim: SimulationResult,
  prefs: MatchPreferences
): MatchResult {
  const motivos: string[] = [];
  const atencao: string[] = [];
  let score = 0;

  const preco = dev.preco_min;
  const faixaId = sim.faixa?.id ?? null;

  // 1. Renda / faixa
  const rendaOk = faixaId != null && dev.faixas.includes(faixaId);
  if (rendaOk) {
    score += PESOS.renda;
    motivos.push(`Atende a ${sim.faixa!.nome}, compatível com a renda informada`);
  } else if (faixaId != null) {
    atencao.push(`Empreendimento voltado a outras faixas do programa (${dev.faixas.map((f) => `F${f}`).join(", ") || "não informado"})`);
  }

  // 2. Valor x capacidade (preço "sob consulta" não pode ser confirmado)
  const semPreco = preco == null;
  const tetoOk = semPreco || sim.tetoImovel == null || preco <= sim.tetoImovel;
  const cabeSem = !semPreco && preco <= sim.capacidadeSemSubsidio;
  const cabeCom = !semPreco && preco <= sim.capacidadeComSubsidio;
  if (semPreco) {
    atencao.push("Preço sob consulta: o corretor confirma se cabe no seu orçamento");
  } else if (cabeSem) {
    score += PESOS.capacidade;
    motivos.push(`Valor a partir de ${formatBRL(preco)} dentro da capacidade estimada`);
  } else if (cabeCom) {
    score += PESOS.capacidade * 0.6;
    motivos.push(`Pode caber no orçamento considerando o subsídio, se aprovado`);
  } else {
    atencao.push(`Valor a partir de ${formatBRL(preco)} acima da capacidade estimada (${formatBRL(sim.capacidadeComSubsidio)})`);
  }
  if (!tetoOk) atencao.push(`Valor acima do teto da faixa (${formatBRL(sim.tetoImovel)})`);

  // 3. Entrada: diferença entre o preço e (financiamento + FGTS [+ subsídio])
  const financ = sim.financiamentoMax;
  const entradaSem = semPreco ? 0 : Math.max(0, preco - financ - sim.fgtsConsiderado);
  const entradaCom = Math.max(0, entradaSem - sim.subsidioPotencial);
  const entradaEstimada = entradaSem;
  if (semPreco) {
    // sem como estimar
  } else if (sim.entrada >= entradaSem) {
    score += PESOS.entrada;
    if (entradaSem > 0) motivos.push("Sua entrada disponível cobre a diferença estimada");
  } else if (sim.entrada >= entradaCom) {
    score += PESOS.entrada * 0.5;
  } else if (cabeCom) {
    atencao.push(`Pode ser necessária entrada maior (estimativa: ${formatBRL(entradaCom)})`);
  }

  // 4. Região
  if (prefs.regioes.length === 0) {
    score += PESOS.regiao * 0.5;
  } else if (prefs.regioes.includes(dev.regiao)) {
    score += PESOS.regiao;
    motivos.push(`Na região que você procura (${regiaoLabel(dev.regiao)})`);
  }

  // 5. Dormitórios
  const maxDorm = Math.max(0, ...dev.dormitorios);
  if (prefs.dormitoriosMin == null || dev.dormitorios.length === 0 || maxDorm >= prefs.dormitoriosMin) {
    score += PESOS.dormitorios;
    if (prefs.dormitoriosMin != null && dev.dormitorios.length) motivos.push(`Opções com ${dev.dormitorios.join(" ou ")} dormitório(s)`);
  } else {
    atencao.push(`Até ${maxDorm} dormitório(s)`);
  }

  // 6. Vaga
  if (!prefs.precisaVaga || dev.vagas) {
    score += PESOS.vaga;
    if (prefs.precisaVaga) motivos.push("Possui vaga de garagem");
  } else {
    atencao.push("Sem vaga de garagem");
  }

  // 7. Disponibilidade
  const disponivel = dev.disponivel && (dev.unidades_disponiveis == null || dev.unidades_disponiveis > 0);
  if (disponivel) score += PESOS.disponibilidade;
  else atencao.push("Sem unidades disponíveis no momento");

  // 8. Estágio da obra
  const obraOk =
    prefs.preferenciaObra === "indiferente" ||
    (prefs.preferenciaObra === "pronto" && dev.status_obra === "pronto") ||
    (prefs.preferenciaObra === "planta" && dev.status_obra !== "pronto");
  if (obraOk) score += PESOS.obra;

  const compativel = sim.enquadrado && rendaOk && cabeCom && tetoOk && disponivel;

  return {
    developmentId: dev.id,
    compativel,
    score: Math.round(score),
    motivos,
    atencao,
    entradaEstimada: Math.round(entradaEstimada),
  };
}

/** Ordena: compatíveis primeiro (por score), depois os demais (por score). */
export function ranquear(devs: DevelopmentForMatch[], sim: SimulationResult, prefs: MatchPreferences) {
  const avaliados = devs.map((d) => ({ dev: d, match: avaliarCompatibilidade(d, sim, prefs) }));
  avaliados.sort((a, b) => {
    if (a.match.compativel !== b.match.compativel) return a.match.compativel ? -1 : 1;
    if (b.match.score !== a.match.score) return b.match.score - a.match.score;
    return (a.dev.preco_min ?? Infinity) - (b.dev.preco_min ?? Infinity);
  });
  return {
    compativeis: avaliados.filter((a) => a.match.compativel),
    demais: avaliados.filter((a) => !a.match.compativel),
  };
}
