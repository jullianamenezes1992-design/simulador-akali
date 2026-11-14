import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  avaliarDev,
  regraEntrada,
  STATUS_EM_ABERTO,
  type Aprovado,
  type DevCompat,
  type Tipologia,
} from "@/lib/aprovados";
import type { SimulationParams } from "@/lib/simulacao/types";
import { CAMPOS_DEV } from "@/lib/server/aprovados";

type Dev = DevCompat & {
  ativo?: boolean | null;
  disponivel?: boolean | null;
};

const CAMPOS = `${CAMPOS_DEV}, ativo, disponivel`;

/** Foto dos empreendimentos (antes de uma atualização), por id. */
export async function fotoDevs(
  db: SupabaseClient,
  slugs: string[],
): Promise<Map<string, Dev>> {
  const { data } = await db
    .from("developments")
    .select(CAMPOS)
    .in("slug", slugs);
  return new Map(((data ?? []) as Dev[]).map((d) => [d.id, d]));
}

const chave = (t: Tipologia) =>
  `${t.dorms}|${Math.round(Number(t.area || 0))}|${t.enquadramento ?? ""}`;

const disponivel = (d: Dev | undefined) =>
  !!d &&
  d.ativo !== false &&
  d.disponivel !== false &&
  d.unidades_disponiveis !== 0 &&
  Number(d.preco_min) > 0;

/** Descrição curta do tipo de unidade ("1 dorm. · 27 m² · HIS2 (1 disponível)"). */
function descreve(t: Tipologia) {
  const q =
    t.qtd != null ? ` (${t.qtd} disponíve${t.qtd === 1 ? "l" : "is"})` : "";
  return `${t.rotulo}${q}`;
}

/**
 * Compara os empreendimentos antes e depois da atualização e registra as oportunidades:
 * aprovado que NÃO cabia e passou a caber porque a unidade dele (dormitórios que ele quer e
 * categoria HIS/HMP/R2V da renda dele) ficou mais barata ou apareceu uma unidade nova.
 * Não repete o mesmo cliente no mesmo projeto e preço dentro de 30 dias.
 */
export async function registrarOportunidades(
  db: SupabaseClient,
  antes: Map<string, Dev>,
) {
  if (!antes.size) return 0;
  const ids = [...antes.keys()];
  const [
    { data: depoisData },
    { data: aps },
    { data: par },
    { data: recentes },
  ] = await Promise.all([
    db.from("developments").select(CAMPOS).in("id", ids),
    db.from("aprovados").select("*").in("status", STATUS_EM_ABERTO).limit(3000),
    db
      .from("simulation_params")
      .select("params")
      .eq("ativo", true)
      .maybeSingle(),
    db
      .from("oportunidades")
      .select("development_id, preco_depois, aprovados")
      .gte("created_at", new Date(Date.now() - 30 * 864e5).toISOString()),
  ]);
  const regra = regraEntrada((par?.params ?? null) as SimulationParams | null);
  const hoje = new Date().toISOString().slice(0, 10);
  const aprovados = ((aps ?? []) as Aprovado[]).filter(
    (a) => !a.vencimento || a.vencimento >= hoje,
  );
  // quem já foi avisado neste projeto (com esse preço) nos últimos 30 dias
  const jaAvisado = new Set<string>();
  for (const o of (recentes ?? []) as {
    development_id: string;
    preco_depois: number | null;
    aprovados: { id: string }[];
  }[])
    for (const a of o.aprovados ?? [])
      jaAvisado.add(
        `${o.development_id}|${a.id}|${Math.round(Number(o.preco_depois))}`,
      );

  let criadas = 0;
  for (const depois of (depoisData ?? []) as Dev[]) {
    const velho = antes.get(depois.id);
    if (!velho || !disponivel(depois)) continue;
    const lista: {
      a: Aprovado;
      de: number;
      para: number;
    }[] = [];
    for (const a of aprovados) {
      const novo = avaliarDev(a, depois, regra);
      if (!novo.cabe) continue;
      const old = disponivel(velho) ? avaliarDev(a, velho, regra) : null;
      if (old?.cabe) continue;
      // só conta se a unidade dele ficou mais barata (ou não existia antes)
      if (old && old.preco > 0 && novo.preco >= old.preco) continue;
      const para = Math.round(novo.preco);
      if (jaAvisado.has(`${depois.id}|${a.id}|${para}`)) continue;
      lista.push({ a, de: old?.preco ?? 0, para: novo.preco });
    }
    if (!lista.length) continue;

    // o preço que aparece no aviso: a unidade mais barata entre os clientes da lista
    const ref = lista.reduce((m, x) => (x.para < m.para ? x : m));
    const tipoNovo = (depois.tipologias ?? []).find(
      (t) => Math.abs(t.preco - ref.para) < 1,
    );
    const mesmaAntes = tipoNovo
      ? (velho.tipologias ?? []).find((t) => chave(t) === chave(tipoNovo))
      : null;
    const novaUnidade = !!tipoNovo && !mesmaAntes;
    const { error } = await db.from("oportunidades").insert({
      development_id: depois.id,
      tipo: novaUnidade ? "nova_unidade" : "preco_baixou",
      preco_antes: novaUnidade
        ? ref.de || null
        : (mesmaAntes?.preco ?? (ref.de || velho.preco_min)),
      preco_depois: ref.para,
      descricao: tipoNovo ? descreve(tipoNovo) : null,
      aprovados: lista
        .sort((x, y) => Number(y.a.poder_compra) - Number(x.a.poder_compra))
        .map(({ a }) => ({
          id: a.id,
          nome: a.nome,
          poder_compra: a.poder_compra,
        })),
    });
    if (!error) criadas++;
  }
  return criadas;
}

/**
 * Revisa os avisos dos últimos 30 dias com as regras novas: tira quem não cabe
 * (dormitórios, categoria HIS/HMP pela renda) e marca como "nova unidade" quando
 * o "a partir de" caiu só porque apareceu uma unidade menor.
 */
export async function revisarOportunidades(db: SupabaseClient) {
  const [{ data: ops }, { data: aps }, { data: par }] = await Promise.all([
    db
      .from("oportunidades")
      .select("id, tipo, preco_antes, preco_depois, aprovados, development_id")
      .gte("created_at", new Date(Date.now() - 30 * 864e5).toISOString()),
    db.from("aprovados").select("*").limit(3000),
    db
      .from("simulation_params")
      .select("params")
      .eq("ativo", true)
      .maybeSingle(),
  ]);
  const regra = regraEntrada((par?.params ?? null) as SimulationParams | null);
  const porId = new Map(((aps ?? []) as Aprovado[]).map((a) => [a.id, a]));
  const devIds = [...new Set((ops ?? []).map((o) => o.development_id))];
  const { data: devs } = await db
    .from("developments")
    .select(CAMPOS)
    .in(
      "id",
      devIds.length ? devIds : ["00000000-0000-0000-0000-000000000000"],
    );
  const devPor = new Map(((devs ?? []) as Dev[]).map((d) => [d.id, d]));
  let alteradas = 0;
  let removidas = 0;
  for (const o of ops ?? []) {
    if (o.tipo === "promocao") continue;
    const d = devPor.get(o.development_id);
    if (!d) continue;
    const lista = ((o.aprovados ?? []) as { id: string }[]).filter((x) => {
      const a = porId.get(x.id);
      return a ? avaliarDev(a, d, regra).cabe : false;
    });
    const tipos = d.tipologias ?? [];
    const barata = tipos.find(
      (t) => Math.abs(t.preco - Number(o.preco_depois)) < 1,
    );
    const outros = tipos.filter((t) => t !== barata);
    const menor =
      !!barata &&
      outros.length > 0 &&
      Number(barata.dorms ?? 0) <
        Math.min(...outros.map((t) => Number(t.dorms ?? 0)));
    if (!lista.length) {
      await db.from("oportunidades").delete().eq("id", o.id);
      removidas++;
      continue;
    }
    const upd: Record<string, unknown> = {};
    if (lista.length !== (o.aprovados ?? []).length)
      upd.aprovados = (o.aprovados as { id: string }[]).filter((x) =>
        lista.some((l) => l.id === x.id),
      );
    if (menor && barata) {
      upd.tipo = "nova_unidade";
      upd.descricao = descreve(barata);
    }
    if (Object.keys(upd).length) {
      await db.from("oportunidades").update(upd).eq("id", o.id);
      alteradas++;
    }
  }
  return { alteradas, removidas };
}
