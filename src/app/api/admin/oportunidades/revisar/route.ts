import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/server/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revisarOportunidades } from "@/lib/server/oportunidades";

/** Revisa os avisos de oportunidade dos últimos 30 dias com as regras atuais. */
export async function POST() {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ erro: "Acesso negado" }, { status: 401 });
  }
  const r = await revisarOportunidades(createAdminClient());
  return NextResponse.json(r);
}
