import type { FaixaParam, SimulationInput, SimulationParams, SimulationResult } from "./types";

const round = (v: number) => Math.max(0, Math.round(v));

/** Encontra a faixa pela renda bruta familiar. */
export function encontrarFaixa(renda: number, params: SimulationParams): FaixaParam | null {
  const faixas = [...params.faixas].sort((a, b) => a.renda_max - b.renda_max);
  return faixas.find((f) => renda >= f.renda_min && renda <= f.renda_max) ?? null;
}

/**
 * Valor máximo financiável dado o valor máximo da parcela.
 * SAC: 1ª parcela = P/n + P·i  →  P = parcela / (1/n + i)
 * PRICE: P = parcela · (1 − (1+i)^−n) / i
 * i = taxa nominal anual / 12 (taxas do programa são divulgadas como nominais).
 */
export function financiamentoMaximo(parcela: number, taxaAnualPct: number, prazoMeses: number, sistema: "SAC" | "PRICE") {
  if (parcela <= 0 || prazoMeses <= 0) return 0;
  const i = taxaAnualPct / 100 / 12;
  if (sistema === "PRICE") {
    if (i === 0) return parcela * prazoMeses;
    return (parcela * (1 - Math.pow(1 + i, -prazoMeses))) / i;
  }
  return parcela / (1 / prazoMeses + i);
}

/** Primeira parcela para um valor financiado (usada em exibições). */
export function primeiraParcela(valor: number, taxaAnualPct: number, prazoMeses: number, sistema: "SAC" | "PRICE") {
  if (valor <= 0 || prazoMeses <= 0) return 0;
  const i = taxaAnualPct / 100 / 12;
  if (sistema === "PRICE") {
    if (i === 0) return valor / prazoMeses;
    return (valor * i) / (1 - Math.pow(1 + i, -prazoMeses));
  }
  return valor / prazoMeses + valor * i;
}

/**
 * Valor máximo de imóvel dado financiamento máximo (P), recursos próprios (R)
 * e cota máxima de financiamento (c). Se c for aplicada, o financiamento não pode
 * passar de c·V: V = min(P + R, R / (1 − c)).
 */
export function valorMaximoImovel(fin: number, recursos: number, cota: number | null) {
  if (cota == null || cota >= 1) return fin + recursos;
  if (cota <= 0) return recursos;
  return Math.min(fin + recursos, recursos / (1 - cota));
}

export function simular(input: SimulationInput, params: SimulationParams, paramsVersao?: number): SimulationResult {
  const rendaTotal = Math.max(0, input.rendaPrincipal) + Math.max(0, input.rendaComposicao);
  const faixa = encontrarFaixa(rendaTotal, params);
  const impedimentos: string[] = [];
  const alertas: string[] = [];

  const rendaMaxPrograma = Math.max(...params.faixas.map((f) => f.renda_max));
  if (!faixa) {
    if (rendaTotal > rendaMaxPrograma) {
      impedimentos.push(
        `A renda familiar informada está acima do limite do programa (${rendaMaxPrograma.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}). Outras linhas de financiamento podem ser avaliadas pelo corretor.`
      );
    } else {
      impedimentos.push("Não foi possível enquadrar a renda informada em uma faixa do programa.");
    }
  }
  if (input.possuiImovel) {
    impedimentos.push("O programa é destinado a quem não possui imóvel residencial. Confirme com o corretor a sua situação.");
  }
  if (input.financiamentoAtivo) {
    impedimentos.push("Há indicação de financiamento habitacional ativo, o que normalmente impede uma nova contratação pelo programa.");
  }
  if (input.jaBeneficiado) {
    alertas.push("Quem já recebeu benefício habitacional do governo pode não ter direito a novo subsídio.");
  }
  if (input.restricaoCredito === "sim") {
    alertas.push("Restrições cadastrais (nome negativado) costumam impedir a aprovação até serem regularizadas.");
  } else if (input.restricaoCredito === "nao_sei") {
    alertas.push("Vale consultar o seu CPF antes da análise: restrições cadastrais podem impedir a aprovação.");
  }

  // Prazo limitado pela idade
  const idadeMinMeses = params.idade_min_anos * 12;
  let prazoMeses = params.prazo_max_meses;
  if (input.idadeMeses < idadeMinMeses) {
    impedimentos.push(`É necessário ter ao menos ${params.idade_min_anos} anos para contratar o financiamento.`);
    prazoMeses = 0;
  } else if (params.idade_max_quitacao_meses != null) {
    const limite = params.idade_max_quitacao_meses - input.idadeMeses;
    if (limite < prazoMeses) {
      prazoMeses = Math.max(0, limite);
      alertas.push(
        prazoMeses > 0
          ? `Pela idade do proponente mais velho, o prazo estimado fica limitado a ${prazoMeses} meses.`
          : "Pela idade informada, o prazo de financiamento pode não ser viável. Converse com o corretor."
      );
    }
  }

  // FGTS
  let fgtsConsiderado = Math.max(0, input.fgtsSaldo);
  if (fgtsConsiderado > 0 && params.fgts_exige_3_anos && !input.fgtsTresAnos) {
    fgtsConsiderado = 0;
    alertas.push("O FGTS só pode ser usado com pelo menos 3 anos de trabalho sob o regime do FGTS (somando todos os períodos). Por isso ele não entrou na estimativa.");
  }

  const entrada = Math.max(0, input.entrada);
  const parcelaMax = rendaTotal * params.comprometimento_renda_max;
  const taxaAnual = faixa ? (params.taxa_referencia === "min" ? faixa.juros_min : faixa.juros_max) : null;

  const financiamentoBruto =
    faixa && taxaAnual != null ? financiamentoMaximo(parcelaMax, taxaAnual, prazoMeses, params.sistema_amortizacao) : 0;

  const recursosProprios = fgtsConsiderado + entrada;
  const subsidioPotencial = faixa && faixa.subsidio_max > 0 && !input.jaBeneficiado ? faixa.subsidio_max : 0;
  const teto = faixa?.teto_imovel ?? null;

  const capSem = valorMaximoImovel(financiamentoBruto, recursosProprios, params.cota_financiamento_max);
  const capCom = valorMaximoImovel(financiamentoBruto, recursosProprios + subsidioPotencial, params.cota_financiamento_max);

  const capacidadeSemSubsidio = teto != null ? Math.min(capSem, teto) : capSem;
  const capacidadeComSubsidio = teto != null ? Math.min(capCom, teto) : capCom;

  // Financiamento efetivamente necessário no cenário sem subsídio
  const financiamentoMax = Math.min(financiamentoBruto, Math.max(0, capacidadeSemSubsidio - recursosProprios));

  if (faixa && teto != null && capSem > teto) {
    alertas.push(`Pelo programa, o imóvel na ${faixa.nome} pode custar até ${teto.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })} na localidade configurada.`);
  }

  const ep = params.entrada_parcelada;
  const entradaParcelada =
    ep && ep.pct_max != null && ep.pct_max > 0 && faixa
      ? {
          pctMax: ep.pct_max,
          parcelaMensalMax: round(rendaTotal * ep.comprometimento),
          mesesLancamento: ep.meses_lancamento,
          mesesObras: ep.meses_obras,
        }
      : null;

  return {
    rendaTotal: round(rendaTotal * 100) / 100,
    faixa: faixa
      ? {
          id: faixa.id,
          nome: faixa.nome,
          teto_imovel: faixa.teto_imovel,
          juros_min: faixa.juros_min,
          juros_max: faixa.juros_max,
          subsidio_max: faixa.subsidio_max,
        }
      : null,
    enquadrado: !!faixa,
    impedimentos,
    alertas,
    taxaAnual,
    prazoMeses,
    sistema: params.sistema_amortizacao,
    parcelaMax: round(parcelaMax),
    financiamentoMax: round(financiamentoMax),
    fgtsConsiderado: round(fgtsConsiderado),
    entrada: round(entrada),
    subsidioPotencial: round(subsidioPotencial),
    capacidadeSemSubsidio: round(capacidadeSemSubsidio),
    capacidadeComSubsidio: round(capacidadeComSubsidio),
    tetoImovel: teto,
    entradaParcelada,
    paramsVersao,
    calculadoEm: new Date().toISOString(),
  };
}

/** Validação defensiva dos parâmetros vindos do banco/painel. */
export function validarParametros(p: unknown): { ok: true; params: SimulationParams } | { ok: false; erros: string[] } {
  const erros: string[] = [];
  const x = p as Partial<SimulationParams>;
  const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);
  if (!x || typeof x !== "object") return { ok: false, erros: ["Parâmetros ausentes."] };
  if (!num(x.comprometimento_renda_max) || x.comprometimento_renda_max! <= 0 || x.comprometimento_renda_max! > 1)
    erros.push("Comprometimento de renda deve estar entre 0 e 1 (ex.: 0.30).");
  if (!num(x.prazo_max_meses) || x.prazo_max_meses! <= 0 || x.prazo_max_meses! > 600) erros.push("Prazo máximo inválido.");
  if (!num(x.idade_min_anos)) erros.push("Idade mínima inválida.");
  if (x.idade_max_quitacao_meses != null && !num(x.idade_max_quitacao_meses)) erros.push("Idade máxima na quitação inválida.");
  if (x.sistema_amortizacao !== "SAC" && x.sistema_amortizacao !== "PRICE") erros.push("Sistema de amortização deve ser SAC ou PRICE.");
  if (x.taxa_referencia !== "min" && x.taxa_referencia !== "max") erros.push("Taxa de referência deve ser 'min' ou 'max'.");
  if (x.cota_financiamento_max != null && (!num(x.cota_financiamento_max) || x.cota_financiamento_max <= 0 || x.cota_financiamento_max > 1))
    erros.push("Cota máxima de financiamento deve estar entre 0 e 1, ou vazia.");
  const ep = x.entrada_parcelada;
  if (ep != null) {
    if (ep.pct_max != null && (!num(ep.pct_max) || ep.pct_max < 0 || ep.pct_max > 1))
      erros.push("Entrada parcelada: percentual máximo deve estar entre 0 e 100%.");
    if (!num(ep.comprometimento) || ep.comprometimento <= 0 || ep.comprometimento > 1)
      erros.push("Entrada parcelada: comprometimento da renda deve estar entre 0 e 100%.");
    if (!num(ep.meses_lancamento) || ep.meses_lancamento < 0 || ep.meses_lancamento > 72)
      erros.push("Entrada parcelada: meses (lançamento) inválido.");
    if (!num(ep.meses_obras) || ep.meses_obras < 0 || ep.meses_obras > 72)
      erros.push("Entrada parcelada: meses (em obras) inválido.");
  }
  if (!Array.isArray(x.faixas) || x.faixas.length === 0) erros.push("Cadastre ao menos uma faixa.");
  else {
    const ids = new Set<number>();
    x.faixas.forEach((f, idx) => {
      const n = `Faixa ${idx + 1}`;
      if (!num(f.id) || ids.has(f.id)) erros.push(`${n}: id inválido ou repetido.`);
      ids.add(f.id);
      if (!f.nome) erros.push(`${n}: informe o nome.`);
      if (!num(f.renda_min) || !num(f.renda_max) || f.renda_min > f.renda_max) erros.push(`${n}: faixa de renda inválida.`);
      if (!num(f.juros_min) || !num(f.juros_max) || f.juros_min < 0 || f.juros_min > f.juros_max || f.juros_max > 30)
        erros.push(`${n}: juros inválidos.`);
      if (!num(f.teto_imovel) || f.teto_imovel <= 0) erros.push(`${n}: teto do imóvel inválido.`);
      if (!num(f.subsidio_max) || f.subsidio_max < 0) erros.push(`${n}: subsídio inválido.`);
    });
    const ord = [...x.faixas].sort((a, b) => a.renda_min - b.renda_min);
    for (let i = 1; i < ord.length; i++) {
      if (ord[i].renda_min <= ord[i - 1].renda_max) erros.push(`As faixas "${ord[i - 1].nome}" e "${ord[i].nome}" se sobrepõem.`);
    }
  }
  if (erros.length) return { ok: false, erros };
  return { ok: true, params: x as SimulationParams };
}

const MESES: Record<string, number> = { jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6, jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12 };

/** Meses até a entrega a partir de textos como "12/2027", "dez/2027", "Dezembro de 2027" ou "2027". null se não reconhecer. */
export function mesesAteEntrega(previsao: string | null | undefined, hoje = new Date()): number | null {
  if (!previsao) return null;
  const t = previsao.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const ano = t.match(/(20\d{2})/)?.[1];
  if (!ano) return null;
  let mes = 12;
  const num = t.match(/\b(\d{1,2})\s*[/.-]\s*20\d{2}/);
  if (num) mes = Math.min(12, Math.max(1, Number(num[1])));
  else {
    const nome = Object.keys(MESES).find((m) => t.includes(m));
    if (nome) mes = MESES[nome];
  }
  const diff = (Number(ano) - hoje.getFullYear()) * 12 + (mes - (hoje.getMonth() + 1));
  return Math.max(0, diff);
}

/**
 * Quanto do preço pode ser pago como entrada parcelada durante a obra:
 * o menor entre (% máximo do preço) e (parcela mensal possível × nº de meses até a entrega).
 * Imóvel pronto = 0.
 */
export function entradaParcelavel(
  preco: number,
  dev: { status_obra: string; previsao_entrega?: string | null },
  sim: Pick<SimulationResult, "entradaParcelada">,
  hoje = new Date()
): { valorMax: number; meses: number } {
  const ep = sim.entradaParcelada;
  if (!ep || dev.status_obra === "pronto") return { valorMax: 0, meses: 0 };
  const padrao = dev.status_obra === "lancamento" ? ep.mesesLancamento : ep.mesesObras;
  const meses = mesesAteEntrega(dev.previsao_entrega, hoje) ?? padrao;
  if (meses <= 0) return { valorMax: 0, meses: 0 };
  return { valorMax: Math.min(preco * ep.pctMax, ep.parcelaMensalMax * meses), meses };
}
