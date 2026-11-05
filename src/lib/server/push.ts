import "server-only";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Notificações no celular (Web Push) para o app instalável do painel.
 * As chaves VAPID são geradas pelo próprio servidor na primeira vez e ficam na tabela
 * notification_settings (só o servidor e o papel "admin" leem).
 */

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export async function obterChavesVapid(): Promise<{ publicKey: string; privateKey: string } | null> {
  const db = createAdminClient();
  const { data } = await db.from("notification_settings").select("vapid_public, vapid_private").eq("id", 1).maybeSingle();
  if (data?.vapid_public && data?.vapid_private) return { publicKey: data.vapid_public, privateKey: data.vapid_private };
  const novas = webpush.generateVAPIDKeys();
  // só grava se ainda não existir (evita duas gerações ao mesmo tempo)
  await db
    .from("notification_settings")
    .update({ vapid_public: novas.publicKey, vapid_private: novas.privateKey })
    .eq("id", 1)
    .is("vapid_public", null);
  const { data: depois } = await db.from("notification_settings").select("vapid_public, vapid_private").eq("id", 1).maybeSingle();
  return depois?.vapid_public && depois?.vapid_private ? { publicKey: depois.vapid_public, privateKey: depois.vapid_private } : null;
}

export async function temAparelhosPush(): Promise<boolean> {
  const db = createAdminClient();
  const { count } = await db.from("push_subscriptions").select("id", { count: "exact", head: true });
  return (count ?? 0) > 0;
}

/** Envia para todos os aparelhos inscritos (ou só os de um usuário). Nunca lança erro. Retorna quantos receberam. */
export async function enviarPush(p: PushPayload, userId?: string): Promise<number> {
  try {
    const db = createAdminClient();
    let q = db.from("push_subscriptions").select("id, endpoint, p256dh, auth");
    if (userId) q = q.eq("user_id", userId);
    const { data: subs } = await q;
    if (!subs?.length) return 0;
    const chaves = await obterChavesVapid();
    if (!chaves) return 0;
    const site = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://simulador-akali.vercel.app");
    const opcoes = { vapidDetails: { subject: site, publicKey: chaves.publicKey, privateKey: chaves.privateKey }, TTL: 6 * 3600, urgency: "high" as const };
    const corpo = JSON.stringify({ ...p, body: p.body.slice(0, 300) });
    let ok = 0;
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, corpo, opcoes);
          ok++;
          await db.from("push_subscriptions").update({ last_ok_at: new Date().toISOString() }).eq("id", s.id);
        } catch (e) {
          const status = (e as { statusCode?: number }).statusCode;
          // aparelho desinstalou o app ou cancelou a permissão
          if (status === 404 || status === 410) await db.from("push_subscriptions").delete().eq("id", s.id);
          else console.error("Push falhou", status, (e as Error).message);
        }
      })
    );
    return ok;
  } catch (e) {
    console.error("Erro no push", e);
    return 0;
  }
}
