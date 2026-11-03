export const REGIOES = [
  { value: "zona_norte", label: "Zona Norte" },
  { value: "zona_sul", label: "Zona Sul" },
  { value: "zona_leste", label: "Zona Leste" },
  { value: "zona_oeste", label: "Zona Oeste" },
  { value: "centro", label: "Centro" },
  { value: "grande_sp", label: "Grande São Paulo" },
  { value: "interior", label: "Interior" },
] as const;

export type Regiao = (typeof REGIOES)[number]["value"];

export const regiaoLabel = (v: string | null | undefined) =>
  REGIOES.find((r) => r.value === v)?.label ?? v ?? "";

export const STATUS_OBRA = [
  { value: "lancamento", label: "Lançamento" },
  { value: "em_obras", label: "Em obras" },
  { value: "pronto", label: "Pronto para morar" },
] as const;

export const statusObraLabel = (v: string | null | undefined) =>
  STATUS_OBRA.find((s) => s.value === v)?.label ?? v ?? "";

export const LEAD_STATUS = [
  { value: "novo", label: "Novo", cor: "bg-sky-100 text-sky-800" },
  { value: "em_atendimento", label: "Em atendimento", cor: "bg-indigo-100 text-indigo-800" },
  { value: "documentacao", label: "Documentação", cor: "bg-violet-100 text-violet-800" },
  { value: "analise_credito", label: "Análise de crédito", cor: "bg-amber-100 text-amber-800" },
  { value: "aprovado", label: "Crédito aprovado", cor: "bg-emerald-100 text-emerald-800" },
  { value: "visita", label: "Visita agendada", cor: "bg-teal-100 text-teal-800" },
  { value: "proposta", label: "Proposta", cor: "bg-orange-100 text-orange-800" },
  { value: "vendido", label: "Vendido", cor: "bg-green-200 text-green-900" },
  { value: "perdido", label: "Perdido", cor: "bg-slate-200 text-slate-700" },
] as const;

export type LeadStatus = (typeof LEAD_STATUS)[number]["value"];

export const leadStatusInfo = (v: string) =>
  LEAD_STATUS.find((s) => s.value === v) ?? { value: v, label: v, cor: "bg-slate-100 text-slate-700" };

export const TIPOS_RENDA = [
  { value: "clt", label: "Carteira assinada (CLT)" },
  { value: "servidor", label: "Servidor público" },
  { value: "autonomo", label: "Autônomo / profissional liberal" },
  { value: "empresario", label: "Empresário / MEI" },
  { value: "aposentado", label: "Aposentado / pensionista" },
  { value: "informal", label: "Renda informal" },
] as const;

export const ESTADOS_CIVIS = [
  { value: "solteiro", label: "Solteiro(a)" },
  { value: "casado", label: "Casado(a)" },
  { value: "uniao_estavel", label: "União estável" },
  { value: "divorciado", label: "Divorciado(a)" },
  { value: "viuvo", label: "Viúvo(a)" },
] as const;

export const RELACOES_COMPOSICAO = [
  { value: "conjuge", label: "Cônjuge / companheiro(a)" },
  { value: "familiar", label: "Familiar" },
  { value: "outro", label: "Outra pessoa" },
] as const;

export const PRAZOS_COMPRA = [
  { value: "imediato", label: "O quanto antes" },
  { value: "3_meses", label: "Em até 3 meses" },
  { value: "6_meses", label: "Em até 6 meses" },
  { value: "12_meses", label: "Em até 12 meses" },
  { value: "pesquisando", label: "Só pesquisando" },
] as const;

export const PREFERENCIAS_OBRA = [
  { value: "indiferente", label: "Tanto faz" },
  { value: "pronto", label: "Pronto para morar" },
  { value: "planta", label: "Na planta / em obras" },
] as const;

export const labelOf = (list: readonly { value: string; label: string }[], v?: string | null) =>
  list.find((i) => i.value === v)?.label ?? v ?? "—";

/** Versão do texto de consentimento/política exibido ao cliente. Atualize ao mudar a política. */
export const CONSENT_VERSION = "2026-11";

/** Chave do navegador que guarda o token da última simulação (somente o token, sem dados pessoais). */
export const RESULT_KEY = "akali_resultado";
