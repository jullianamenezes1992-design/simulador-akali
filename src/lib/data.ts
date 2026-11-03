import "server-only";
import { cache } from "react";
import { createClient } from "./supabase/server";
import { supabaseConfigurado } from "./supabase/env";
import { validarParametros } from "./simulacao/engine";
import type { SimulationParams } from "./simulacao/types";

export interface Beneficio {
  titulo: string;
  texto: string;
}

export interface LandingConteudo {
  hero_titulo?: string;
  hero_subtitulo?: string;
  programa_texto?: string;
  beneficios?: Beneficio[];
  aviso_rodape?: string;
}

export interface SiteSettings {
  empresa_nome: string;
  creci: string | null;
  whatsapp_numero: string | null;
  email_contato: string | null;
  encarregado_dados: string | null;
  ga4_id: string | null;
  google_ads_id: string | null;
  google_ads_label_simulacao: string | null;
  google_ads_label_whatsapp: string | null;
  meta_pixel_id: string | null;
  landing_conteudo: LandingConteudo;
  politica_versao: string;
  updated_at?: string;
}

export interface Media {
  id: string;
  development_id: string;
  tipo: "foto" | "planta" | "video";
  url: string;
  storage_path: string | null;
  legenda: string | null;
  ordem: number;
}

export interface Development {
  id: string;
  slug: string;
  nome: string;
  construtora: string | null;
  descricao: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string;
  uf: string;
  regiao: string;
  latitude: number | null;
  longitude: number | null;
  preco_min: number;
  preco_max: number | null;
  faixas: number[];
  renda_minima: number | null;
  dormitorios: number[];
  area_min: number | null;
  area_max: number | null;
  vagas: boolean;
  status_obra: string;
  previsao_entrega: string | null;
  unidades_disponiveis: number | null;
  disponivel: boolean;
  condicoes_comerciais: string | null;
  diferenciais: string[];
  oferta_destaque: boolean;
  oferta_texto: string | null;
  video_url: string | null;
  capa_url: string | null;
  ativo: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  development_media?: Media[];
}

export const DEFAULT_SETTINGS: SiteSettings = {
  empresa_nome: "Akali Imóveis",
  creci: null,
  whatsapp_numero: null,
  email_contato: null,
  encarregado_dados: null,
  ga4_id: null,
  google_ads_id: null,
  google_ads_label_simulacao: null,
  google_ads_label_whatsapp: null,
  meta_pixel_id: null,
  landing_conteudo: {},
  politica_versao: "2026-11",
};

/** Numéricos do Postgres chegam como string pelo PostgREST quando são numeric: normaliza. */
export function normalizeDev<T extends Partial<Development>>(d: T): T {
  const n = (v: unknown) => (v == null ? null : Number(v));
  return {
    ...d,
    preco_min: Number(d.preco_min),
    preco_max: n(d.preco_max),
    renda_minima: n(d.renda_minima),
    area_min: n(d.area_min),
    area_max: n(d.area_max),
    latitude: n(d.latitude),
    longitude: n(d.longitude),
    development_media: d.development_media?.slice().sort((a, b) => a.ordem - b.ordem),
  };
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (!supabaseConfigurado()) return DEFAULT_SETTINGS;
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return { ...DEFAULT_SETTINGS, ...(data ?? {}), landing_conteudo: { ...(data?.landing_conteudo ?? {}) } };
});

export const getActiveParams = cache(async (): Promise<{ versao: number; params: SimulationParams } | null> => {
  if (!supabaseConfigurado()) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("simulation_params").select("versao, params").eq("ativo", true).maybeSingle();
  if (!data) return null;
  const v = validarParametros(data.params);
  if (!v.ok) {
    console.error("Parâmetros de simulação inválidos:", v.erros);
    return null;
  }
  return { versao: data.versao, params: v.params };
});

export interface CatalogFilters {
  regiao?: string;
  precoMax?: number;
  dormitorios?: number;
  status?: string;
  busca?: string;
}

export async function listPublicDevelopments(f: CatalogFilters = {}): Promise<Development[]> {
  if (!supabaseConfigurado()) return [];
  const supabase = await createClient();
  let q = supabase
    .from("developments")
    .select("*, development_media(*)")
    .eq("ativo", true)
    .order("oferta_destaque", { ascending: false })
    .order("preco_min", { ascending: true });
  if (f.regiao) q = q.eq("regiao", f.regiao);
  if (f.precoMax) q = q.lte("preco_min", f.precoMax);
  if (f.dormitorios) q = q.contains("dormitorios", [f.dormitorios]);
  if (f.status) q = q.eq("status_obra", f.status);
  if (f.busca) {
    const s = f.busca.replace(/[%,()]/g, " ").trim();
    if (s) q = q.or(`nome.ilike.%${s}%,bairro.ilike.%${s}%,construtora.ilike.%${s}%`);
  }
  const { data, error } = await q;
  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []).map(normalizeDev) as Development[];
}

export async function getPublicDevelopment(slug: string): Promise<Development | null> {
  if (!supabaseConfigurado()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("developments")
    .select("*, development_media(*)")
    .eq("slug", slug)
    .eq("ativo", true)
    .maybeSingle();
  return data ? (normalizeDev(data) as Development) : null;
}
