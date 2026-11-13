import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { diaSP } from "@/lib/agenda";
import { MAX_TENTATIVAS, type DevBF } from "@/lib/base-fria";

export type ContatoBF = {
  id: string;
  nome: string;
  telefone: string;
  bairro: string | null;
  zona: string | null;
  renda_texto: string | null;
  prazo_compra: string | null;
  status_original: string | null;
  observacoes: string | null;
  ultima_entrada: string | null;
  situacao: string;
  tentativas: number;
  chamado_em: string | null;
  lead_id: string | null;
};

export const CAMPOS_BF =
  "id, nome, telefone, bairro, zona, renda_texto, prazo_compra, status_original, observacoes, ultima_entrada, situacao, tentativas, chamado_em, lead_id";

/** Fila de hoje da base fria: quem ainda falta chamar para bater a meta do dia. */
export async function filaBaseFria(
  db: SupabaseClient,
  meta: number,
  hoje = diaSP(),
) {
  const inicio = new Date(`${hoje}T00:00:00-03:00`).toISOString();
  const { count: chamadosHoje } = await db
    .from("base_fria")
    .select("id", { count: "exact", head: true })
    .gte("chamado_em", inicio);
  const feitos = chamadosHoje ?? 0;
  const falta = Math.max(0, meta - feitos);
  let fila: ContatoBF[] = [];
  if (falta > 0) {
    const { data: novos } = await db
      .from("base_fria")
      .select(CAMPOS_BF)
      .eq("situacao", "fila")
      .order("prioridade", { ascending: false })
      .order("ultima_entrada", { ascending: false, nullsFirst: false })
      .limit(falta);
    fila = (novos ?? []) as ContatoBF[];
    if (fila.length < falta) {
      // nova tentativa com quem não respondeu há 90+ dias
      const { data: retry } = await db
        .from("base_fria")
        .select(CAMPOS_BF)
        .eq("situacao", "chamado")
        .lt("tentativas", MAX_TENTATIVAS)
        .lte("proxima_em", new Date().toISOString())
        .order("prioridade", { ascending: false })
        .limit(falta - fila.length);
      fila = fila.concat((retry ?? []) as ContatoBF[]);
    }
  }
  return { meta, feitos, falta, fila };
}

/** Projetos ativos para sugerir nas mensagens da base fria + função que monta o projeto/link de cada contato. */
export async function sugestaoProjetoBF(db: SupabaseClient) {
  const { siteUrl } = await import("@/lib/server/notificacoes");
  const { projetoParaContato } = await import("@/lib/base-fria");
  const { data } = await db
    .from("developments")
    .select("id, slug, nome, bairro, regiao, preco_min, oferta_destaque")
    .eq("ativo", true)
    .neq("disponivel", false)
    .not("preco_min", "is", null);
  const devs = (data ?? []) as DevBF[];
  const base = siteUrl();
  return (c: { bairro?: string | null; zona?: string | null }) => {
    const dev = projetoParaContato(c, devs);
    return dev
      ? {
          dev,
          link: `${base}/empreendimentos/${dev.slug}?utm_source=whatsapp&utm_medium=base_fria`,
        }
      : null;
  };
}
