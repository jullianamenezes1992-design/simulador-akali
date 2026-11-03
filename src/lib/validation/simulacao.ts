import { z } from "zod";
import { ESTADOS_CIVIS, PRAZOS_COMPRA, PREFERENCIAS_OBRA, REGIOES, RELACOES_COMPOSICAO, TIPOS_RENDA } from "../constants";

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((i) => i.value) as [T[number]["value"], ...T[number]["value"][]];

const dinheiro = z.number({ error: "Informe um valor" }).min(0, "Valor inválido").max(100_000_000, "Valor muito alto");
const texto = (max: number) => z.string().trim().max(max);

/** Etapa 1 — Dados pessoais */
export const etapaDadosPessoais = z.object({
  nome: z.string().trim().min(5, "Informe nome e sobrenome").max(120).regex(/\S+\s+\S+/, "Informe nome e sobrenome"),
  data_nascimento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
    .refine((d) => {
      const dt = new Date(`${d}T12:00:00Z`);
      const anos = (Date.now() - dt.getTime()) / (365.25 * 24 * 3600 * 1000);
      return !Number.isNaN(dt.getTime()) && anos >= 16 && anos <= 100;
    }, "Data de nascimento inválida"),
  email: z.union([z.literal(""), z.email("E-mail inválido").max(160)]),
  telefone: z.string().regex(/^\d{10,11}$/, "Telefone com DDD inválido"),
  estado_civil: z.enum(values(ESTADOS_CIVIS), { error: "Selecione o estado civil" }),
});

/** Etapa 2 — Renda e profissão */
export const etapaRenda = z.object({
  profissao: texto(80).min(2, "Informe a profissão"),
  tipo_renda: z.enum(values(TIPOS_RENDA), { error: "Selecione o tipo de renda" }),
  renda_principal: dinheiro.min(1, "Informe a renda bruta mensal"),
});

/** Etapa 3 — Composição familiar */
export const etapaFamilia = z
  .object({
    dependentes: z.number({ error: "Informe o número de dependentes" }).int().min(0, "Valor inválido").max(20, "Valor inválido"),
    compor_renda: z.boolean({ error: "Selecione uma opção" }),
    relacao_composicao: z.enum(values(RELACOES_COMPOSICAO)).nullable(),
    renda_composicao: dinheiro,
    idade_composicao: z.number().int().min(16).max(100).nullable(),
  })
  .superRefine((v, ctx) => {
    if (v.compor_renda) {
      if (!v.relacao_composicao) ctx.addIssue({ code: "custom", path: ["relacao_composicao"], message: "Selecione quem vai compor a renda" });
      if (!(v.renda_composicao > 0)) ctx.addIssue({ code: "custom", path: ["renda_composicao"], message: "Informe a renda de quem vai compor" });
      if (v.idade_composicao == null) ctx.addIssue({ code: "custom", path: ["idade_composicao"], message: "Informe a idade" });
    }
  });

/** Etapa 4 — FGTS e histórico financeiro */
export const etapaFgts = z.object({
  fgts_saldo: dinheiro,
  fgts_tres_anos: z.boolean({ error: "Selecione uma opção" }),
  possui_imovel: z.boolean({ error: "Selecione uma opção" }),
  financiamento_ativo: z.boolean({ error: "Selecione uma opção" }),
  ja_beneficiado: z.boolean({ error: "Selecione uma opção" }),
  restricao_credito: z.enum(["nao", "sim", "nao_sei"], { error: "Selecione uma opção" }),
});

/** Etapa 5 — Preferências do imóvel */
export const etapaPreferencias = z.object({
  regioes: z.array(z.enum(values(REGIOES))).max(6),
  dormitorios_min: z.number().int().min(1).max(4).nullable(),
  precisa_vaga: z.boolean({ error: "Selecione uma opção" }),
  preferencia_obra: z.enum(values(PREFERENCIAS_OBRA)),
});

/** Etapa 6 — Entrada, prazo e consentimento */
export const etapaEntrada = z.object({
  prazo_compra: z.enum(values(PRAZOS_COMPRA), { error: "Selecione o prazo" }),
  consentimento: z.literal(true, { error: "É necessário aceitar a Política de Privacidade para continuar" }),
  aceita_marketing: z.boolean({ error: "Selecione uma opção" }),
});

export const rastreamentoSchema = z
  .object({
    utm_source: texto(120).optional(),
    utm_medium: texto(120).optional(),
    utm_campaign: texto(160).optional(),
    utm_term: texto(160).optional(),
    utm_content: texto(160).optional(),
    gclid: texto(200).optional(),
    fbclid: texto(300).optional(),
    landing_page: texto(500).optional(),
    referrer: texto(500).optional(),
  })
  .partial();

export const simulacaoSchema = z.object({
  ...etapaDadosPessoais.shape,
  ...etapaRenda.shape,
  ...etapaFamilia.shape,
  ...etapaFgts.shape,
  ...etapaPreferencias.shape,
  ...etapaEntrada.shape,
  rastreamento: rastreamentoSchema.optional(),
  /** honeypot anti-robô: deve vir vazio */
  website: z.string().max(0).optional(),
});

export type SimulacaoPayload = z.infer<typeof simulacaoSchema>;

export const ETAPAS = [
  { id: 1, titulo: "Dados pessoais", schema: etapaDadosPessoais },
  { id: 2, titulo: "Renda e profissão", schema: etapaRenda },
  { id: 3, titulo: "Composição familiar", schema: etapaFamilia },
  { id: 4, titulo: "FGTS e histórico", schema: etapaFgts },
  { id: 5, titulo: "Preferências do imóvel", schema: etapaPreferencias },
  { id: 6, titulo: "Prazo e confirmação", schema: etapaEntrada },
] as const;

/** Converte erros do zod em { campo: mensagem } (primeira mensagem de cada campo). */
export function errosPorCampo(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const k = issue.path.join(".") || "_";
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}
