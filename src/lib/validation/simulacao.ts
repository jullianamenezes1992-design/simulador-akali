import { z } from "zod";
import { ESTADOS_CIVIS, PRAZOS_COMPRA, PREFERENCIAS_OBRA, REGIOES, RELACOES_COMPOSICAO, TIPOS_RENDA } from "../constants";

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((i) => i.value) as [T[number]["value"], ...T[number]["value"][]];

const dinheiro = z.number({ error: "Informe um valor" }).min(0, "Valor inválido").max(100_000_000, "Valor muito alto");
const texto = (max: number) => z.string().trim().max(max);

/** Etapa 1 de 3 — Contato (já salva o cadastro para a corretora retomar o atendimento) */
export const etapaContato = z.object({
  nome: z.string().trim().min(2, "Informe o seu nome").max(120),
  telefone: z.string().regex(/^\d{10,11}$/, "Telefone com DDD inválido"),
  consentimento: z.literal(true, { error: "É necessário aceitar a Política de Privacidade para continuar" }),
});

const dataNascimento = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato dd/mm/aaaa")
  .refine((d) => {
    const dt = new Date(`${d}T12:00:00Z`);
    const anos = (Date.now() - dt.getTime()) / (365.25 * 24 * 3600 * 1000);
    return !Number.isNaN(dt.getTime()) && anos >= 16 && anos <= 100;
  }, "Data de nascimento inválida");

/** Composição de renda (regras condicionais, também usadas no servidor) */
const familiaBase = z.object({
  compor_renda: z.boolean({ error: "Selecione uma opção" }),
  relacao_composicao: z.enum(values(RELACOES_COMPOSICAO)).nullable(),
  renda_composicao: dinheiro,
  idade_composicao: z.number().int().min(16).max(100).nullable(),
});
export const etapaFamilia = familiaBase.superRefine((v, ctx) => {
    if (v.compor_renda) {
      if (!v.relacao_composicao) ctx.addIssue({ code: "custom", path: ["relacao_composicao"], message: "Selecione quem vai compor a renda" });
      if (!(v.renda_composicao > 0)) ctx.addIssue({ code: "custom", path: ["renda_composicao"], message: "Informe a renda de quem vai compor" });
      if (v.idade_composicao == null) ctx.addIssue({ code: "custom", path: ["idade_composicao"], message: "Informe a idade" });
    }
  });

/** Etapa 2 de 3 — Renda (tipo de renda, idade, composição e FGTS) */
const rendaBase = z.object({
  tipo_renda: z.enum(values(TIPOS_RENDA), { error: "Selecione como você recebe a sua renda" }),
  renda_principal: dinheiro.min(1, "Informe a renda bruta mensal"),
  data_nascimento: dataNascimento,
  ...familiaBase.shape,
  tem_fgts: z.boolean({ error: "Selecione uma opção" }),
  fgts_saldo: dinheiro,
  fgts_tres_anos: z.boolean({ error: "Selecione uma opção" }),
});
export const etapaRenda = rendaBase.superRefine((v, ctx) => {
  const f = etapaFamilia.safeParse(v);
  if (!f.success) f.error.issues.forEach((i) => ctx.addIssue({ code: "custom", path: i.path, message: i.message }));
});

/** Etapa 3 de 3 — O imóvel que procura */
export const etapaImovel = z.object({
  regioes: z.array(z.enum(values(REGIOES))).max(6),
  dormitorios_min: z.number().int().min(1).max(4).nullable(),
  precisa_vaga: z.boolean({ error: "Selecione uma opção" }),
  prazo_compra: z.enum(values(PRAZOS_COMPRA), { error: "Selecione quando pretende comprar" }),
});

/** Perguntas que saíram do formulário (a corretora completa no atendimento). Aceitas se vierem. */
const opcionais = z.object({
  email: z.union([z.literal(""), z.email("E-mail inválido").max(160)]).optional().default(""),
  estado_civil: z.enum(values(ESTADOS_CIVIS)).nullable().optional(),
  profissao: texto(80).optional().default(""),
  dependentes: z.number().int().min(0).max(20).optional().default(0),
  restricao_credito: z.enum(["nao", "sim", "nao_sei"]).optional().default("nao_sei"),
  preferencia_obra: z.enum(values(PREFERENCIAS_OBRA)).optional().default("indiferente"),
  aceita_marketing: z.boolean().optional().default(false),
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
  ...etapaContato.shape,
  ...rendaBase.shape,
  ...etapaImovel.shape,
  ...opcionais.shape,
  rastreamento: rastreamentoSchema.optional(),
  /** honeypot anti-robô: deve vir vazio */
  website: z.string().max(0).optional(),
});

export type SimulacaoPayload = z.infer<typeof simulacaoSchema>;

export const ETAPAS = [
  { id: 1, titulo: "Para onde enviamos o seu resultado?", curto: "Contato", schema: etapaContato, campos: Object.keys(etapaContato.shape) },
  { id: 2, titulo: "Sobre a sua renda", curto: "Renda", schema: etapaRenda, campos: Object.keys(rendaBase.shape) },
  { id: 3, titulo: "O imóvel que você procura", curto: "Imóvel", schema: etapaImovel, campos: Object.keys(etapaImovel.shape) },
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
