import { NextResponse } from "next/server";
import {
  normalizarTelefone,
  prioridade,
  situacaoInicial,
  type ItemBaseFria,
} from "@/lib/base-fria";
import { assertAdmin } from "@/lib/server/auth";

/**
 * Importa contatos para a Base fria, em lotes de até 1000 (a planilha é lida no navegador).
 * Telefone repetido não é duplicado: quem já está na base fica como está.
 */
export async function POST(req: Request) {
  const origem = req.headers.get("origin");
  if (
    !req.headers.get("content-type")?.includes("application/json") ||
    (origem && new URL(origem).host !== new URL(req.url).host)
  ) {
    return NextResponse.json({ erro: "Requisição inválida" }, { status: 400 });
  }
  let ctx;
  try {
    ctx = await assertAdmin(true);
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : "Acesso negado" },
      { status: 401 },
    );
  }
  const body = (await req.json().catch(() => null)) as {
    lote?: string;
    itens?: ItemBaseFria[];
    fim?: boolean;
  } | null;
  const lote = String(body?.lote ?? "").slice(0, 200) || null;
  const s = (v: unknown, max: number) =>
    v == null || v === "" ? null : String(v).slice(0, max);
  const d = (v: unknown) =>
    typeof v === "string" &&
    /^\d{4}-\d{2}-\d{2}/.test(v) &&
    !isNaN(Date.parse(v))
      ? v
      : null;

  const vistos = new Set<string>();
  const linhas = [];
  for (const raw of Array.isArray(body?.itens)
    ? body!.itens.slice(0, 1000)
    : []) {
    const telefone = normalizarTelefone(raw?.telefone);
    if (!telefone || vistos.has(telefone)) continue;
    vistos.add(telefone);
    const item: ItemBaseFria = {
      telefone,
      nome: s(raw.nome, 120) || "Sem nome",
      email: s(raw.email, 200),
      bairro: s(raw.bairro, 120),
      zona: s(raw.zona, 60),
      renda_texto: s(raw.renda_texto, 120),
      prazo_compra: s(raw.prazo_compra, 80),
      origem: s(raw.origem, 80),
      campanhas: s(raw.campanhas, 600),
      status_original: s(raw.status_original, 80),
      observacoes: s(raw.observacoes, 600),
      ultima_entrada: d(raw.ultima_entrada),
      primeira_entrada: d(raw.primeira_entrada),
      qtd_cadastros: Math.max(1, Math.min(99, Number(raw.qtd_cadastros) || 1)),
    };
    linhas.push({
      ...item,
      prioridade: prioridade(item),
      situacao: situacaoInicial(item),
      lote,
    });
  }

  let novos = 0;
  if (linhas.length) {
    const { data, error } = await ctx.supabase
      .from("base_fria")
      .upsert(linhas, { onConflict: "telefone", ignoreDuplicates: true })
      .select("id");
    if (error)
      return NextResponse.json({ erro: error.message }, { status: 500 });
    novos = data?.length ?? 0;
  }
  let noCrm = 0;
  if (body?.fim) {
    const { data } = await ctx.supabase.rpc("base_fria_marcar_no_crm");
    noCrm = Number(data) || 0;
  }
  return NextResponse.json({ recebidos: linhas.length, novos, no_crm: noCrm });
}
