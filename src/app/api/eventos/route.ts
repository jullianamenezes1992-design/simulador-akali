import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getLeadPorToken, rateLimit } from "@/lib/server/leads";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  token: z.uuid(),
  developmentId: z.uuid(),
});

/** Registra a visualização de um empreendimento por um cliente que já fez a simulação. */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`ev:${ip}`, 60)) return NextResponse.json({ ok: false }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const lead = await getLeadPorToken(parsed.data.token);
  if (!lead) return NextResponse.json({ ok: false }, { status: 404 });

  const db = createAdminClient();
  const desde = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { count } = await db
    .from("lead_events")
    .select("id", { count: "exact", head: true })
    .eq("lead_id", lead.id)
    .eq("development_id", parsed.data.developmentId)
    .eq("tipo", "visualizou_empreendimento")
    .gte("created_at", desde);

  if (!count) {
    await db.from("lead_events").insert({
      lead_id: lead.id,
      development_id: parsed.data.developmentId,
      tipo: "visualizou_empreendimento",
    });
  }
  return NextResponse.json({ ok: true });
}
