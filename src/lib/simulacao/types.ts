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
  paramsVersao?: number;
  calculadoEm: string;
}

export interface DevelopmentForMatch {
  id: string;
  slug: string;
  nome: string;
  regiao: string;
  preco_min: number;
  preco_max: number | null;
  faixas: number[];
  dormitorios: number[];
  vagas: boolean;
  disponivel: boolean;
  unidades_disponiveis: number | null;
  status_obra: string;
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
}
