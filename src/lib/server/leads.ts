import "server-only";
import { createAdminClient } from "../supabase/admin";
import { normalizeDev, type Development } from "../data";
import { ranquear } from "../simulacao/matching";
import type { DevelopmentForMatch, MatchPreferences, SimulationResult } from "../simulacao/types";

/** Origem amigável do lead a partir dos parâmetros de campanha. */
export function inferirOrigem(r: { utm_source?: string; utm_medium?: string; gclid?: string; fbclid?: string; referrer?: string } = {}) {
  if (r.gclid) return "Google Ads";
  if (r.fbclid) return "Meta Ads";
  if (r.utm_source) return [r.utm_source, r.utm_medium].filter(Boolean).join(" / ");
  if (r.referrer) {
    try {
      const host = new URL(r.referrer).hostname.replace(/^www\./, "");
      if (/google\./.test(host)) return "Google (orgânico)";
      if (/(facebook|instagram)\./.test(host)) return "Redes sociais";
      return host;
    } catch {
      return "Referência";
    }
  }
  return "Direto";
}

export interface LeadPublico {
  id: string;
  codigo: string;
  nome: string;
  simulacao: SimulationResult | null;
  regioes: string[];
  dormitorios_min: number | null;
  precisa_vaga: boolean;
  preferencia_obra: string;
  escolhido_id: string | null;
  created_at: string;
}

/** Busca o lead pelo token de acesso do cliente (sem dados sensíveis). */
export async function getLeadPorToken(token: string): Promise<LeadPublico | null> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const db = createAdminClient();
  const { data } = await db
    .from("leads")
    .select("id, codigo, nome, simulacao, regioes, dormitorios_min, precisa_vaga, preferencia_obra, escolhido_id, created_at, anonimizado_em")
    .eq("access_token", token)
    .is("excluido_em", null)
    .maybeSingle();
  if (!data || data.anonimizado_em) return null;
  return data as LeadPublico;
}

export async function listarAtivosParaMatch(): Promise<Development[]> {
  const db = createAdminClient();
  const { data } = await db.from("developments").select("*, development_media(*)").eq("ativo", true);
  return (data ?? []).map(normalizeDev) as Development[];
}

export function prefsDoLead(l: Pick<LeadPublico, "regioes" | "dormitorios_min" | "precisa_vaga" | "preferencia_obra">): MatchPreferences {
  return {
    regioes: l.regioes ?? [],
    dormitoriosMin: l.dormitorios_min,
    precisaVaga: l.precisa_vaga,
    preferenciaObra: (["pronto", "planta"].includes(l.preferencia_obra) ? l.preferencia_obra : "indiferente") as MatchPreferences["preferenciaObra"],
  };
}

export function ranquearDevs(devs: Development[], sim: SimulationResult, prefs: MatchPreferences) {
  const r = ranquear(devs as unknown as DevelopmentForMatch[], sim, prefs);
  const map = new Map(devs.map((d) => [d.id, d]));
  return {
    compativeis: r.compativeis.map((x) => ({ dev: map.get(x.dev.id)!, match: x.match })),
    demais: r.demais.map((x) => ({ dev: map.get(x.dev.id)!, match: x.match })),
  };
}

/** Limite simples de requisições por IP (por instância do servidor). */
const hits = new Map<string, number[]>();
export function rateLimit(key: string, max = 8, janelaMs = 10 * 60 * 1000) {
  const agora = Date.now();
  const lista = (hits.get(key) ?? []).filter((t) => agora - t < janelaMs);
  if (lista.length >= max) return false;
  lista.push(agora);
  hits.set(key, lista);
  if (hits.size > 5000) hits.clear();
  return true;
}
