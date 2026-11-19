import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DevCompat } from "@/lib/aprovados";

export const CAMPOS_DEV = "id, slug, nome, bairro, regiao, preco_min, dormitorios, oferta_destaque, oferta_texto, unidades_disponiveis, status_obra, previsao_entrega, meses_pos_chaves, construtora, avaliacao_min, ato_minimo, precos_por_dorm, avaliacoes, tipologias, no_site, fluxos_plano:plano_fluxos(tabela, tabela_nome, vigencia_fim, parcelas, coletado_em)";

/** Empreendimentos ativos e à venda, para comparar com o poder de compra dos aprovados. */
export async function devsAtivos(supabase: SupabaseClient): Promise<DevCompat[]> {
  const { data } = await supabase
    .from("developments")
    .select(CAMPOS_DEV)
    .eq("ativo", true)
    .neq("disponivel", false)
    .not("preco_min", "is", null)
    .order("preco_min", { ascending: true })
    .limit(1000);
  return ((data ?? []) as unknown as DevCompat[]).filter((d) => d.unidades_disponiveis !== 0);
}
