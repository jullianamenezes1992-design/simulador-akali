import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { getSettings } from "@/lib/data";
import { supabaseConfigurado } from "@/lib/supabase/env";
import TrackingScripts from "@/components/tracking/TrackingScripts";
import CookieConsent from "@/components/tracking/CookieConsent";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <>
      {!supabaseConfigurado() && (
        <div className="bg-sol px-4 py-2 text-center text-sm font-semibold text-ink">
          Supabase não configurado — defina as variáveis de ambiente (veja o README).
        </div>
      )}
      <Header empresa={s.empresa_nome} />
      <main>{children}</main>
      <Footer s={s} />
      {/* Rastreamento e aviso de cookies apenas na área pública (não no painel) */}
      <CookieConsent />
      <TrackingScripts
        ga4Id={s.ga4_id}
        adsId={s.google_ads_id}
        adsLabelSimulacao={s.google_ads_label_simulacao}
        adsLabelWhatsapp={s.google_ads_label_whatsapp}
        metaPixelId={s.meta_pixel_id}
      />
    </>
  );
}
