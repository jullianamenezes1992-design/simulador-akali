"use client";

/** Camada única de rastreamento: GA4 + Google Ads + Meta Pixel. Só dispara após consentimento. */

type Params = Record<string, string | number | boolean | undefined | null>;

interface TrackingConfig {
  ga4Id?: string | null;
  adsId?: string | null;
  adsLabelSimulacao?: string | null;
  adsLabelWhatsapp?: string | null;
  metaPixelId?: string | null;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    __akaliTracking?: TrackingConfig;
  }
}

export const CONSENT_KEY = "akali_consent";
export const UTM_KEY = "akali_utm";

export function getConsent(): "granted" | "denied" | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(v: "granted" | "denied") {
  try {
    localStorage.setItem(CONSENT_KEY, v);
  } catch {}
  window.dispatchEvent(new CustomEvent("akali-consent", { detail: v }));
}

const META_EVENTS: Record<string, string> = {
  simulation_start: "InitiateCheckout",
  simulation_complete: "Lead",
  view_development: "ViewContent",
  whatsapp_click: "Contact",
};

export type TrackEvent = "simulation_start" | "simulation_step" | "simulation_complete" | "view_development" | "whatsapp_click";

export function trackEvent(name: TrackEvent, params: Params = {}) {
  if (typeof window === "undefined" || getConsent() !== "granted") return;
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v != null));
  const cfg = window.__akaliTracking ?? {};
  try {
    window.gtag?.("event", name, clean);
    if (cfg.adsId) {
      if (name === "simulation_complete" && cfg.adsLabelSimulacao)
        window.gtag?.("event", "conversion", { send_to: `${cfg.adsId}/${cfg.adsLabelSimulacao}` });
      if (name === "whatsapp_click" && cfg.adsLabelWhatsapp)
        window.gtag?.("event", "conversion", { send_to: `${cfg.adsId}/${cfg.adsLabelWhatsapp}` });
    }
    const meta = META_EVENTS[name];
    if (meta) window.fbq?.("track", meta, clean);
    else window.fbq?.("trackCustom", name, clean);
  } catch (e) {
    console.warn("tracking", e);
  }
}

export interface UtmData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  landing_page?: string;
  referrer?: string;
}

/** Atribuição "primeiro toque" com renovação quando chega nova campanha. */
export function captureUtms() {
  try {
    const url = new URL(window.location.href);
    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"] as const;
    const found: UtmData = {};
    keys.forEach((k) => {
      const v = url.searchParams.get(k);
      if (v) found[k] = v.slice(0, 200);
    });
    const existing = getUtms();
    if (Object.keys(found).length > 0 || !existing) {
      const data: UtmData = {
        ...(Object.keys(found).length ? found : existing ?? {}),
        landing_page: (url.pathname + url.search).slice(0, 500),
        referrer: document.referrer && !document.referrer.startsWith(url.origin) ? document.referrer.slice(0, 500) : existing?.referrer,
      };
      localStorage.setItem(UTM_KEY, JSON.stringify(data));
    }
  } catch {}
}

export function getUtms(): UtmData | null {
  try {
    const v = localStorage.getItem(UTM_KEY);
    return v ? (JSON.parse(v) as UtmData) : null;
  } catch {
    return null;
  }
}
