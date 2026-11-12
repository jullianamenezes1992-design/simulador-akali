import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ClienteAba = {
  id: string;
  codigo: string;
  nome: string;
  telefone: string;
  origem: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  data_contato: string | null;
  oportunidade_sf: string | null;
  ar_numero: string | null;
  ar_status: string | null;
  parecer_reprovacao: string | null;
  motivo_reprovacao: string | null;
  reprovado_em: string | null;
  reanalise_em: string | null;
  pendencias: string | null;
  aguardando_docs_em: string | null;
  proximo_passo: string | null;
  escolhido: { nome: string; slug: string } | null;
};

const CAMPOS =
  "id, codigo, nome, telefone, origem, status, created_at, updated_at, data_contato, oportunidade_sf, ar_numero, ar_status, parecer_reprovacao, motivo_reprovacao, reprovado_em, reanalise_em, pendencias, aguardando_docs_em, proximo_passo, escolhido:escolhido_id(nome, slug)";

/** Clientes de uma etapa (fora dos que já estão em Aprovados), com busca opcional. */
export async function clientesDaEtapa(supabase: SupabaseClient, status: string, q: string) {
  let query = supabase.from("leads").select(CAMPOS).eq("status", status).eq("em_aprovados", false).is("excluido_em", null).limit(1000);
  const busca = q.replace(/[%,()]/g, " ").trim().slice(0, 60);
  if (busca) {
    const dig = busca.replace(/\D/g, "");
    query = query.or(
      [`nome.ilike.%${busca}%`, `codigo.ilike.%${busca}%`, `ar_numero.ilike.%${busca}%`, dig.length >= 4 ? `telefone.ilike.%${dig}%` : null].filter(Boolean).join(",")
    );
  }
  const { data } = await query;
  return (data ?? []) as unknown as ClienteAba[];
}

/** Dias desde uma data (ISO ou AAAA-MM-DD). */
export function diasDesde(iso: string | null) {
  if (!iso) return null;
  const t = new Date(iso.length === 10 ? `${iso}T12:00:00-03:00` : iso).getTime();
  return Math.max(0, Math.floor((Date.now() - t) / 864e5));
}
