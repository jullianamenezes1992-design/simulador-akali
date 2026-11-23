import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/server/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { confirmarEquipe, receberLeadEquipe, type LeadEquipe } from "@/lib/server/equipe";

export const dynamic = "force-dynamic";

/**
 * Sincronização pelo navegador da corretora (o CRM da equipe é lido com o login dela):
 * { leads: LeadEquipe[], confirmados: number[], erros: { [fila_id]: "motivo" } }
 */
export async function POST(req: Request) {
  const origem = req.headers.get("origin");
  if (origem && new URL(origem).host !== new URL(req.url).host)
    return NextResponse.json({ erro: "Requisição inválida" }, { status: 400 });
  try {
    await assertAdmin(true);
  } catch {
    return NextResponse.json({ erro: "Acesso negado" }, { status: 401 });
  }
  const corpo = (await req.json().catch(() => null)) as {
    leads?: LeadEquipe[];
    confirmados?: number[];
    erros?: Record<string, string>;
  } | null;
  if (!corpo) return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  const db = createAdminClient();
  const leads = (corpo.leads ?? []).slice(0, 1000);
  let criados = 0, atualizados = 0;
  const erros: { id: string; erro: string }[] = [];
  for (const l of leads) {
    const r = await receberLeadEquipe(db, l);
    if ("erro" in r && r.erro) erros.push({ id: String(l.id), erro: r.erro });
    else if ("novo" in r && r.novo) criados++;
    else atualizados++;
  }
  if (leads.length) await db.from("integracao_equipe").update({ ultimo_recebido: new Date().toISOString() }).eq("id", 1);
  await confirmarEquipe(db, (corpo.confirmados ?? []).map(Number).filter(Boolean), corpo.erros ?? {});
  return NextResponse.json({ ok: true, criados, atualizados, erros });
}
