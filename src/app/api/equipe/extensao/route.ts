import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  confirmarEquipe,
  lerIntegracao,
  pendentesEquipe,
  receberLeadEquipe,
  type LeadEquipe,
} from "@/lib/server/equipe";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Extensão do Chrome "Akali · CRM da equipe" (roda na aba do Credimob com o login da corretora).
 * Autenticação: "Authorization: Bearer <chave da integração>" (Configurações → CRM da equipe).
 * - GET  → { itens }: atualizações (etapa/observação) esperando para ir ao CRM da equipe
 * - POST { leads?, confirmados?, erros? } → grava os leads e confirma o que foi aplicado lá
 */
const igual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

async function autorizar(req: NextRequest) {
  const db = createAdminClient();
  const cfg = await lerIntegracao(db);
  const chave = (req.headers.get("authorization") ?? "")
    .replace(/^Bearer\s+/i, "")
    .trim();
  if (!cfg?.chave || !chave || !igual(chave, cfg.chave)) return { db, erro: "chave inválida" };
  if (!cfg.ativo) return { db, erro: "integração desligada em Configurações" };
  return { db, erro: null };
}

export async function GET(req: NextRequest) {
  const { db, erro } = await autorizar(req);
  if (erro) return NextResponse.json({ ok: false, erro }, { status: 401 });
  return NextResponse.json({ ok: true, itens: await pendentesEquipe(db) });
}

export async function POST(req: NextRequest) {
  const { db, erro } = await autorizar(req);
  if (erro) return NextResponse.json({ ok: false, erro }, { status: 401 });
  const corpo = (await req.json().catch(() => null)) as {
    leads?: LeadEquipe[];
    confirmados?: number[];
    erros?: Record<string, string>;
  } | null;
  if (!corpo) return NextResponse.json({ ok: false, erro: "JSON inválido" }, { status: 400 });

  const leads = (Array.isArray(corpo.leads) ? corpo.leads : []).slice(0, 300);
  let criados = 0,
    atualizados = 0;
  const novos: string[] = [];
  const erros: { id: string; erro: string }[] = [];
  for (const l of leads) {
    const r = await receberLeadEquipe(db, l ?? ({} as LeadEquipe));
    if ("erro" in r && r.erro) erros.push({ id: String(l?.id ?? ""), erro: r.erro });
    else if ("novo" in r && r.novo) {
      criados++;
      novos.push(String(l.nome ?? "").slice(0, 60));
    } else atualizados++;
  }
  if (leads.length)
    await db
      .from("integracao_equipe")
      .update({ ultimo_recebido: new Date().toISOString() })
      .eq("id", 1);
  const ok = (Array.isArray(corpo.confirmados) ? corpo.confirmados : [])
    .map(Number)
    .filter(Boolean);
  const errosAplicar =
    corpo.erros && typeof corpo.erros === "object" ? corpo.erros : {};
  if (ok.length || Object.keys(errosAplicar).length)
    await confirmarEquipe(db, ok, errosAplicar);
  return NextResponse.json({ ok: true, criados, atualizados, novos, erros });
}
