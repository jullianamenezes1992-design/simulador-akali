"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { captureUtms, getConsent } from "@/lib/tracking";

interface Props {
  ga4Id: string | null;
  adsId: string | null;
  adsLabelSimulacao: string | null;
  adsLabelWhatsapp: string | null;
  metaPixelId: string | null;
}

const safeId = (v: string | null) => (v && /^[A-Za-z0-9-]+$/.test(v) ? v : null);

/** Carrega GA4, Google Ads e Meta Pixel somente após o consentimento de cookies (LGPD). */
export default function TrackingScripts(props: Props) {
  const [granted, setGranted] = useState(false);
  const ga4 = safeId(props.ga4Id);
  const ads = safeId(props.adsId);
  const pixel = safeId(props.metaPixelId);

  useEffect(() => {
    captureUtms();
    window.__akaliTracking = {
      ga4Id: ga4,
      adsId: ads,
      adsLabelSimulacao: props.adsLabelSimulacao,
      adsLabelWhatsapp: props.adsLabelWhatsapp,
      metaPixelId: pixel,
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura do consentimento salvo só existe no navegador
    setGranted(getConsent() === "granted");
    const onChange = (e: Event) => setGranted((e as CustomEvent).detail === "granted");
    window.addEventListener("akali-consent", onChange);
    return () => window.removeEventListener("akali-consent", onChange);
  }, [ga4, ads, pixel, props.adsLabelSimulacao, props.adsLabelWhatsapp]);

  if (!granted) return null;
  const gtagId = ga4 ?? ads;

  return (
    <>
      {gtagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('js',new Date());
gtag('consent','default',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});
${ga4 ? `gtag('config','${ga4}');` : ""}
${ads ? `gtag('config','${ads}');` : ""}`}
          </Script>
        </>
      )}
      {pixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
