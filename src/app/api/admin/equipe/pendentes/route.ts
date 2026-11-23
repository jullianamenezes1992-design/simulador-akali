import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/server/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { pendentesEquipe } from "@/lib/server/equipe";

export const dynamic = "force-dynamic";

/** Atualizações (etapa e observações) dos leads da equipe que ainda não foram levadas ao CRM da equipe. */
export async function GET() {
  try {
    await assertAdmin(true);
  } catch {
    return NextResponse.json({ erro: "Acesso negado" }, { status: 401 });
  }
  return NextResponse.json({ itens: await pendentesEquipe(createAdminClient()) });
}
