import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getActiveParams } from "@/lib/data";

/** Dados de apoio do formulário de aprovado: faixas do MCMV (para a faixa automática) e clientes do CRM (para vincular). */
export async function apoioFormAprovado(supabase: SupabaseClient) {
  const [ativo, { data: leads }] = await Promise.all([
    getActiveParams(),
    supabase.from("leads").select("id, nome, telefone").is("anonimizado_em", null).order("nome").limit(3000),
  ]);
  const faixas = (ativo?.params.faixas ?? []).map((f) => ({ id: f.id, nome: f.nome, renda_min: f.renda_min, renda_max: f.renda_max }));
  return { faixas, leads: (leads ?? []) as { id: string; nome: string; telefone: string }[] };
}
