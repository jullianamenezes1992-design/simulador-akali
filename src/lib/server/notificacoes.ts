import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatBRL, maskPhone } from "@/lib/format";
import { enviarPush } from "./push";

/**
 * Avisos para a corretora quando entra um cadastro no site.
 * - E-mail: Resend (https://resend.com). Sem domínio próprio verificado, o Resend só entrega
 *   para o e-mail dono da conta — que é exatamente o caso aqui.
 * - WhatsApp: CallMeBot (serviço gratuito e não oficial; manda para o próprio número de quem ativou).
 * Falhas nunca impedem o cadastro do cliente: tudo é capturado e só registrado no log.
 */

export interface NotificacaoConfig {
  backup_semanal?: boolean;
  tabelao_auto?: boolean;
  ultimo_tabelao_em?: string | null;
  ultimo_backup_em?: string | null;
  lembretes_ativos?: boolean;
  resumo_diario?: boolean;
  resumo_hora?: number;
  ultimo_resumo_em?: string | null;
  cron_token?: string;
  email_ativo: boolean;
  email_destino: string | null;
  resend_api_key: string | null;
  whatsapp_ativo: boolean;
  whatsapp_numero: string | null;
  callmebot_api_key: string | null;
  notificar_incompletas: boolean;
}

export interface LeadAviso {
  id: string;
  codigo: string;
  nome: string;
  telefone: string;
  email?: string | null;
  renda_total?: number | null;
  faixa?: string | null;
  origem?: string | null;
  utm_campaign?: string | null;
  etapa_parou?: number | null;
}

type Tipo = "iniciada" | "concluida" | "teste";

const TIMEOUT = 8000;

export function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "";
}

export async function lerConfigNotificacoes(): Promise<NotificacaoConfig | null> {
  const db = createAdminClient();
  const { data } = await db.from("notification_settings").select("*").eq("id", 1).maybeSingle();
  return (data as NotificacaoConfig | null) ?? null;
}

function titulo(tipo: Tipo) {
  if (tipo === "iniciada") return "Novo cadastro (simulação em andamento)";
  if (tipo === "concluida") return "Simulação concluída";
  return "Teste de aviso";
}

function textoWhatsApp(tipo: Tipo, l: LeadAviso) {
  // Sem renda ou dados financeiros: a mensagem passa por um serviço de terceiros.
  const link = siteUrl() && l.id ? `${siteUrl()}/admin/leads/${l.id}` : null;
  return [
    `🏡 *Akali – ${titulo(tipo)}*`,
    `Nome: ${l.nome}`,
    `WhatsApp: ${maskPhone(l.telefone)}`,
    `Código: ${l.codigo}`,
    tipo === "iniciada" ? "Ainda não terminou a simulação." : null,
    link ? `Ficha: ${link}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function htmlEmail(tipo: Tipo, l: LeadAviso) {
  const link = siteUrl() && l.id ? `${siteUrl()}/admin/leads/${l.id}` : null;
  const wa = `https://wa.me/55${l.telefone.replace(/\D/g, "")}`;
  const linhas: [string, string][] = [
    ["Nome", l.nome],
    ["WhatsApp", maskPhone(l.telefone)],
    ["E-mail", l.email || "—"],
    ["Código", l.codigo],
  ];
  if (tipo !== "iniciada") {
    linhas.push(["Renda familiar", l.renda_total ? formatBRL(Number(l.renda_total)) : "—"]);
    linhas.push(["Faixa", l.faixa ?? "—"]);
  } else {
    linhas.push(["Situação", `Parou na etapa ${l.etapa_parou ?? 2} de 3`]);
  }
  linhas.push(["Origem", [l.origem, l.utm_campaign].filter(Boolean).join(" • ") || "Direto"]);
  return `<!doctype html><html><body style="margin:0;background:#f4f6f9;font-family:Arial,sans-serif;color:#263746">
<div style="max-width:520px;margin:0 auto;padding:24px">
<div style="background:#005CA9;color:#fff;border-radius:12px 12px 0 0;padding:18px 22px;font-size:18px;font-weight:bold">${esc(titulo(tipo))}</div>
<div style="background:#fff;border-radius:0 0 12px 12px;padding:22px">
<table style="width:100%;border-collapse:collapse;font-size:15px">
${linhas.map(([k, v]) => `<tr><td style="padding:6px 0;color:#5b6b78;width:40%">${esc(k)}</td><td style="padding:6px 0;font-weight:bold">${esc(String(v))}</td></tr>`).join("")}
</table>
<p style="margin:22px 0 0">
<a href="${wa}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:bold;margin-right:8px">Chamar no WhatsApp</a>
${link ? `<a href="${link}" style="display:inline-block;background:#005CA9;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:bold">Abrir ficha no painel</a>` : ""}
</p>
</div>
<p style="font-size:12px;color:#5b6b78;text-align:center">Aviso automático do Simulador Akali.</p>
</div></body></html>`;
}

async function comTimeout(url: string, init: RequestInit) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function enviarEmail(cfg: NotificacaoConfig, tipo: Tipo, l: LeadAviso): Promise<string | null> {
  return enviarEmailLivre(cfg, `${titulo(tipo)}: ${l.nome}`, htmlEmail(tipo, l));
}

export async function enviarEmailLivre(
  cfg: NotificacaoConfig,
  assunto: string,
  html: string,
  anexos?: { filename: string; content: string }[]
): Promise<string | null> {
  if (!cfg.resend_api_key || !cfg.email_destino) return "E-mail ou chave do Resend não preenchidos.";
  const res = await comTimeout("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.resend_api_key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Simulador Akali <onboarding@resend.dev>", to: [cfg.email_destino], subject: assunto, html, ...(anexos?.length ? { attachments: anexos } : {}) }),
  });
  if (res.ok) return null;
  const body = await res.text().catch(() => "");
  return `Resend respondeu ${res.status}: ${body.slice(0, 200)}`;
}

export async function enviarWhatsApp(cfg: NotificacaoConfig, tipo: Tipo, l: LeadAviso): Promise<string | null> {
  return enviarWhatsAppLivre(cfg, textoWhatsApp(tipo, l));
}

export async function enviarWhatsAppLivre(cfg: NotificacaoConfig, texto: string): Promise<string | null> {
  const tel = (cfg.whatsapp_numero ?? "").replace(/\D/g, "");
  if (!cfg.callmebot_api_key || tel.length < 12) return "Número ou chave do CallMeBot não preenchidos.";
  const url = `https://api.callmebot.com/whatsapp.php?phone=${tel}&apikey=${encodeURIComponent(cfg.callmebot_api_key)}&text=${encodeURIComponent(texto)}`;
  const res = await comTimeout(url, { method: "GET" });
  const body = await res.text().catch(() => "");
  if (res.ok && !/error|invalid|not/i.test(body.slice(0, 300))) return null;
  return `CallMeBot respondeu ${res.status}: ${body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 200)}`;
}

/** Dispara os avisos configurados. Nunca lança erro. */
export async function notificarLead(tipo: Exclude<Tipo, "teste">, l: LeadAviso) {
  try {
    const cfg = await lerConfigNotificacoes();
    if (!cfg) return;
    if (tipo === "iniciada" && !cfg.notificar_incompletas) return;
    const tarefas: Promise<string | null>[] = [];
    if (cfg.email_ativo) tarefas.push(enviarEmail(cfg, tipo, l));
    if (cfg.whatsapp_ativo) tarefas.push(enviarWhatsApp(cfg, tipo, l));
    // Notificação no celular (app instalável)
    tarefas.push(
      enviarPush({
        title: tipo === "iniciada" ? "Novo cadastro no site" : "Simulação concluída",
        body: `${l.nome} · ${maskPhone(l.telefone)}${tipo === "iniciada" ? " · ainda não terminou" : l.faixa ? ` · ${l.faixa}` : ""}`,
        url: l.id ? `/admin/leads/${l.id}` : "/admin/leads",
        tag: `lead-${l.id}`,
      }).then(() => null)
    );
    const res = await Promise.allSettled(tarefas);
    res.forEach((r) => {
      if (r.status === "rejected") console.error("Aviso de lead falhou", r.reason);
      else if (r.value) console.error("Aviso de lead:", r.value);
    });
  } catch (e) {
    console.error("Erro nos avisos de lead", e);
  }
}
