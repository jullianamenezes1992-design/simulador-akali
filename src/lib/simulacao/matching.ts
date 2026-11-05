import { dividirEntrada, entradaParcelavel } from "./engine";
import { regiaoLabel } from "../constants";
import { formatBRL } from "../format";
import type { DevelopmentForMatch, MatchPreferences, MatchResult, SimulationResult } from "./types";

/**
 * Pesos do motor de compatibilidade (somam 100).
 * Ajuste aqui para mudar a priorização.
 */
export const PESOS = {
  renda: 25, // faixa do programa atendida pelo empreendimento
  capacidade: 30, // preço cabe na capacidade estimada (financiamento + FGTS [+ subsídio])
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

  // Entrada parcelada com a construtora durante a obra (até X% do preço, conforme a renda)
  let entradaParcelada: MatchResult["entradaParcelada"] = null;
  let cabeParcelando = false;
  if (!semPreco && !cabeCom) {
    const { valorMax, meses, mesesPos } = entradaParcelavel(preco, dev, sim);
    const falta = preco - sim.capacidadeComSubsidio;
    const faltaSemSub = preco - sim.capacidadeSemSubsidio;
    if (valorMax > 0 && falta <= valorMax) {
      cabeParcelando = true;
      // valor exibido: o necessário sem contar subsídio, se couber; senão o necessário com subsídio
      const valor = faltaSemSub <= valorMax ? faltaSemSub : falta;
      const ep = sim.entradaParcelada!;
      const div = dividirEntrada(valor, meses, mesesPos, ep.parcelaMensalMax, ep.parcelaPosMax ?? ep.parcelaMensalMax);
      entradaParcelada = { valor: Math.round(valor), ...div };
    }
  }

  if (semPreco) {
    atencao.push("Preço sob consulta: o corretor confirma se cabe no seu orçamento");
  } else if (cabeSem) {
    score += PESOS.capacidade;
    motivos.push(`Valor a partir de ${formatBRL(preco)} dentro da capacidade estimada`);
  } else if (cabeCom) {
    score += PESOS.capacidade * 0.6;
    motivos.push(`Pode caber no orçamento considerando o subsídio, se aprovado`);
  } else if (cabeParcelando && entradaParcelada) {
    score += PESOS.capacidade * 0.5;
    motivos.push(
      `Pode caber com entrada de cerca de ${formatBRL(entradaParcelada.valor)} parcelada: ${[
        entradaParcelada.meses > 0 && entradaParcelada.parcela > 0 ? `≈ ${entradaParcelada.meses}x de ${formatBRL(entradaParcelada.parcela)} na obra` : null,
        entradaParcelada.mesesPos ? `${entradaParcelada.mesesPos}x de ${formatBRL(entradaParcelada.parcelaPos ?? 0)} após as chaves` : null,
      ]
        .filter(Boolean)
        .join(" + ")}, sujeito à aprovação da construtora`
    );
  } else {
    atencao.push(`Valor a partir de ${formatBRL(preco)} acima da capacidade estimada (${formatBRL(sim.capacidadeComSubsidio)})`);
  }
  if (!tetoOk) atencao.push(`Valor acima do teto da faixa (${formatBRL(sim.tetoImovel)})`);

  // 3. Entrada: a simulação não pergunta a entrada (foco MCMV); estimamos a diferença
  //    entre o preço e financiamento + FGTS, só para o corretor.
  const entradaEstimada = semPreco ? 0 : Math.max(0, preco - sim.financiamentoMax - sim.fgtsConsiderado);

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

  const compativel = sim.enquadrado && rendaOk && (cabeCom || cabeParcelando) && tetoOk && disponivel;

  return {
    developmentId: dev.id,
    compativel,
    score: Math.round(score),
    motivos,
    atencao,
    entradaEstimada: Math.round(entradaEstimada),
    entradaParcelada,
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
