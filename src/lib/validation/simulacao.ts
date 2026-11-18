import { z } from "zod";
import { ESTADOS_CIVIS, PRAZOS_COMPRA, PREFERENCIAS_OBRA, REGIOES, RELACOES_COMPOSICAO, TIPOS_RENDA } from "../constants";

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((i) => i.value) as [T[number]["value"], ...T[number]["value"][]];

const dinheiro = z.number({ error: "Informe um valor" }).min(0, "Valor inválido").max(100_000_000, "Valor muito alto");
const texto = (max: number) => z.string().trim().max(max);

/** DDDs que existem no Brasil (Anatel). */
const DDDS = new Set(
  "11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99".split(" "),
);

/** Número de mentira: dígitos todos iguais, sequência, padrão repetido ou muito poucos dígitos diferentes. */
export function numeroFalso(d: string) {
  const n = d.slice(3); // 8 dígitos depois do DDD e do 9
  if (/^(\d)\1+$/.test(n)) return true; // 99999999
  if ("0123456789012345".includes(n) || "9876543210987654".includes(n)) return true; // 12345678
  if (/^(\d{2})\1{3}$/.test(n) || /^(\d{4})\1$/.test(n)) return true; // 12121212, 12341234
  if (new Set(n).size <= 2) return true; // 99990000, 11112222
  if (/(\d)\1{5,}/.test(n)) return true; // 6 ou mais iguais seguidos
  return false;
}

/**
 * Celular com DDD: 11 dígitos, DDD existente, começando com 9 e sem cara de número inventado.
 * Antes aceitava 10 dígitos e vinham cadastros sem o 9 (ex.: (11) 9672-6252), e o WhatsApp não chegava.
 */
export const celular = z.string().superRefine((v, ctx) => {
  const d = v.replace(/\D/g, "");
  const msg = (message: string) => ctx.addIssue({ code: "custom", message });
  if (d.length < 2 || !/^[1-9]{2}/.test(d)) return msg("Informe o DDD, por exemplo (11)");
  if (!DDDS.has(d.slice(0, 2))) return msg("Esse DDD não existe. Confira o número, por exemplo (11)");
  if (d.length === 10 && /^[6-9]$/.test(d[2])) return msg("Parece que falta o 9 no início do número. Ex.: (11) 9XXXX-XXXX");
  if (d.length !== 11) return msg("Informe o celular completo com DDD: (11) 9XXXX-XXXX");
  if (d[2] !== "9") return msg("Informe um número de celular (começa com 9 depois do DDD)");
  if (numeroFalso(d)) return msg("Esse número parece inválido. Informe o seu WhatsApp de verdade: é por ele que você recebe o resultado.");
});

/** Nome de verdade: ao menos 2 letras seguidas de vogal/consoante, sem "asdf", "jhh", "teste". */
export function nomeInvalido(nome: string) {
  const n = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  const letras = n.replace(/[^a-z]/g, "");
  if (letras.length < 3) return true;
  if (!/[aeiouy]/.test(letras)) return true; // jhh, fcd
  if (/(.)\1{2,}/.test(letras)) return true; // aaaa, kkk
  if (/^(teste?|test|asd|asdf|qwe|qwer|abc|xxx|nome|fulano|ninguem|sei la)/.test(n)) return true;
  // muitas consoantes seguidas = digitação aleatória (ex.: "fcaa" passa, "sdfgh" não)
  if (/[bcdfghjklmnpqrstvwxz]{5,}/.test(letras)) return true;
  return false;
}

/** Etapa 1 de 3 — Contato (já salva o cadastro para a corretora retomar o atendimento) */
export const etapaContato = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe o seu nome")
    .max(120)
    .refine((n) => !nomeInvalido(n), "Informe o seu nome completo de verdade"),
  telefone: celular,
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
