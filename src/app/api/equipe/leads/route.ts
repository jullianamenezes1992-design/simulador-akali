import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { lerIntegracao, receberLeadEquipe, type LeadEquipe } from "@/lib/server/equipe";

export const dynamic = "force-dynamic";

/**
 * Recebe leads do CRM da equipe.
 * POST com cabeçalho "Authorization: Bearer <chave>" e corpo JSON: um lead ou uma lista de leads
 * { id, nome, telefone, email?, renda?, campanha?, origem?, regiao?, observacao?, criado_em? }
 */
const igual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export async function POST(req: NextRequest) {
  const db = createAdminClient();
  const cfg = await lerIntegracao(db);
  const chave = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!cfg?.ativo || !cfg.chave || !chave || !igual(chave, cfg.chave))
    return NextResponse.json({ ok: false, erro: "não autorizado" }, { status: 401 });

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "JSON inválido" }, { status: 400 });
  }
  const lista = (Array.isArray(corpo) ? corpo : [corpo]) as LeadEquipe[];
  if (!lista.length || lista.length > 200)
    return NextResponse.json({ ok: false, erro: "envie de 1 a 200 leads por vez" }, { status: 400 });

  const resultados = [];
  for (const l of lista) {
    const r = await receberLeadEquipe(db, l ?? ({} as LeadEquipe));
    resultados.push({ id: l?.id ?? null, ...r });
  }
  await db.from("integracao_equipe").update({ ultimo_recebido: new Date().toISOString() }).eq("id", 1);
  return NextResponse.json({
    ok: true,
    criados: resultados.filter((r) => "novo" in r && r.novo).length,
    atualizados: resultados.filter((r) => "novo" in r && !r.novo).length,
    erros: resultados.filter((r) => "erro" in r).length,
    resultados,
  });
}
