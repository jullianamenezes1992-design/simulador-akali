import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { firstName } from "@/lib/format";
import { getLeadPorToken, rateLimit } from "@/lib/server/leads";
import { createAdminClient } from "@/lib/supabase/admin";
import { montarLinkWhatsApp } from "@/lib/whatsapp";

const schema = z.object({
  token: z.uuid().optional().nullable(),
  developmentId: z.uuid().optional().nullable(),
  pagina: z.string().max(200).optional(),
});

/**
 * Registra a escolha/clique ANTES de encaminhar ao WhatsApp e devolve o link.
 * A mensagem leva apenas nome, código da simulação, empreendimento e o pedido de atendimento.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`wa:${ip}`, 30)) return NextResponse.json({ erro: "Muitas tentativas." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  const { token, developmentId, pagina } = parsed.data;

  const db = createAdminClient();
  const [{ data: settings }, { data: dev }] = await Promise.all([
    db.from("site_settings").select("whatsapp_numero").eq("id", 1).maybeSingle(),
    developmentId
      ? db.from("developments").select("id, nome").eq("id", developmentId).eq("ativo", true).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const lead = token ? await getLeadPorToken(token) : null;

  if (lead) {
    if (dev) {
      await db.from("leads").update({ escolhido_id: dev.id, escolhido_em: new Date().toISOString() }).eq("id", lead.id);
      await db.from("lead_events").insert({ lead_id: lead.id, development_id: dev.id, tipo: "escolheu_empreendimento" });
    }
    await db.from("lead_events").insert({
      lead_id: lead.id,
      development_id: dev?.id ?? null,
      tipo: "clique_whatsapp",
      dados: { pagina: pagina ?? null },
    });
  } else {
    // Visitante sem simulação: registra o clique de forma anônima
    await db.from("lead_events").insert({
      lead_id: null,
      development_id: dev?.id ?? null,
      tipo: "clique_whatsapp",
      dados: { pagina: pagina ?? null, anonimo: true },
    });
  }

  const url = montarLinkWhatsApp(settings?.whatsapp_numero, {
    nome: lead ? lead.nome : null,
    codigo: lead?.codigo ?? null,
    empreendimento: dev?.nome ?? null,
  });
  if (!url) return NextResponse.json({ erro: "WhatsApp da corretora não configurado." }, { status: 503 });

  return NextResponse.json({ url, nome: lead ? firstName(lead.nome) : null });
}
