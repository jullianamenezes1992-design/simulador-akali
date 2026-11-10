// Tipos compartilhados pelo motor de simulação, compatibilidade e telas.

export interface FaixaParam {
  id: number;
  nome: string;
  renda_min: number;
  renda_max: number;
  /** juros nominais anuais em % (ex.: 7.66) */
  juros_min: number;
  juros_max: number;
  teto_imovel: number;
  /** teto de subsídio da faixa em R$ (0 = sem subsídio) */
  subsidio_max: number;
}

export interface SimulationParams {
  programa?: string;
  localidade?: string;
  data_referencia?: string;
  comprometimento_renda_max: number; // 0.30
  prazo_max_meses: number; // 420
  idade_min_anos: number; // 18
  /** idade máxima na quitação, em meses (null = não aplicar) */
  idade_max_quitacao_meses: number | null;
  sistema_amortizacao: "SAC" | "PRICE";
  /** qual taxa da faixa usar na estimativa */
  taxa_referencia: "min" | "max";
  /** percentual máximo do imóvel que pode ser financiado (0–1). null = não aplicar */
  cota_financiamento_max: number | null;
  /** FGTS só é considerado com 3 anos de trabalho sob regime do FGTS */
  fgts_exige_3_anos: boolean;
  /**
   * Entrada parcelada com a construtora durante a obra.
   * pct_max: parte máxima do preço que pode ser parcelada (0–1, ex.: 0.25). null/ausente = não considerar.
   * comprometimento: parte da renda que o cliente pode pagar por mês nessas parcelas (0–1).
   * meses_lancamento / meses_obras: nº padrão de parcelas quando o empreendimento não tem previsão de entrega.
   */
  entrada_parcelada?: {
    pct_max: number | null;
    comprometimento: number;
    meses_lancamento: number;
    meses_obras: number;
    /** parcelas após a entrega das chaves (0/ausente = não considerar), ex.: 48 */
    meses_pos_chaves?: number;
    /** parcela máxima pós-chaves (parte da renda). Ausente = mesmo valor de "comprometimento". */
    comprometimento_pos?: number;
  } | null;
  faixas: FaixaParam[];
  fontes?: { descricao: string; url: string }[];
  observacoes?: string;
}

export interface SimulationInput {
  rendaPrincipal: number;
  rendaComposicao: number;
  /** idade em meses do proponente mais velho */
  idadeMeses: number;
  fgtsSaldo: number;
  fgtsTresAnos: boolean;
  entrada: number;
  possuiImovel: boolean;
  financiamentoAtivo: boolean;
  jaBeneficiado: boolean;
  restricaoCredito: "nao" | "sim" | "nao_sei";
}

export interface SimulationResult {
  rendaTotal: number;
  faixa: Pick<FaixaParam, "id" | "nome" | "teto_imovel" | "juros_min" | "juros_max" | "subsidio_max"> | null;
  /** enquadramento por renda no programa */
  enquadrado: boolean;
  /** impedimentos (ex.: já possui imóvel) — indicam que o programa provavelmente não se aplica */
  impedimentos: string[];
  /** pontos de atenção (não impedem a estimativa) */
  alertas: string[];
  taxaAnual: number | null;
  prazoMeses: number;
  sistema: "SAC" | "PRICE";
  parcelaMax: number;
  financiamentoMax: number;
  fgtsConsiderado: number;
  entrada: number;
  /** subsídio potencial (teto da faixa) — NÃO é valor garantido */
  subsidioPotencial: number;
  /** valor estimado de imóvel sem contar subsídio */
  capacidadeSemSubsidio: number;
  /** valor estimado de imóvel considerando o subsídio potencial máximo */
  capacidadeComSubsidio: number;
  tetoImovel: number | null;
  /** regras de entrada parcelada na obra usadas nesta simulação (ausente em simulações antigas) */
  entradaParcelada?: {
    pctMax: number;
    parcelaMensalMax: number;
    mesesLancamento: number;
    mesesObras: number;
    mesesPosChaves?: number;
    parcelaPosMax?: number;
  } | null;
  paramsVersao?: number;
  calculadoEm: string;
}

export interface DevelopmentForMatch {
  id: string;
  slug: string;
  nome: string;
  regiao: string;
  /** null = preço sob consulta */
  preco_min: number | null;
  preco_max: number | null;
  faixas: number[];
  dormitorios: number[];
  vagas: boolean;
  disponivel: boolean;
  unidades_disponiveis: number | null;
  status_obra: string;
  previsao_entrega?: string | null;
  /** parcelas da entrada após as chaves neste projeto (0 = não tem; ausente = usa o parâmetro geral) */
  meses_pos_chaves?: number | null;
}

export interface MatchPreferences {
  regioes: string[];
  dormitoriosMin: number | null;
  precisaVaga: boolean;
  preferenciaObra: "indiferente" | "pronto" | "planta";
}

export interface MatchResult {
  developmentId: string;
  compativel: boolean;
  score: number;
  motivos: string[];
  atencao: string[];
  entradaEstimada: number;
  /** quando o imóvel só cabe com entrada parcelada na obra: valor e parcelas estimadas */
  entradaParcelada?: { valor: number; meses: number; parcela: number; mesesPos?: number; parcelaPos?: number } | null;
}
