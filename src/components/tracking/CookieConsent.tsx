"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getConsent, setConsent } from "@/lib/tracking";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- consentimento salvo só existe no navegador
    setVisible(getConsent() === null);
    const reopen = () => setVisible(true);
    window.addEventListener("akali-open-consent", reopen);
    return () => window.removeEventListener("akali-open-consent", reopen);
  }, []);

  if (!visible) return null;

  const choose = (v: "granted" | "denied") => {
    setConsent(v);
    setVisible(false);
  };

  return (
    <div role="dialog" aria-label="Preferências de cookies" className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-white p-4 shadow-2xl sm:flex sm:items-center sm:gap-4">
        <p className="text-sm text-ink">
          Usamos cookies de medição (Google e Meta) para entender o desempenho das nossas campanhas. Eles só são ativados com
          a sua permissão. Saiba mais na{" "}
          <Link href="/privacidade" className="font-semibold text-caixa underline">
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
          <button onClick={() => choose("denied")} className="btn-secondary flex-1 sm:flex-none">
            Recusar
          </button>
          <button onClick={() => choose("granted")} className="btn-primary flex-1 sm:flex-none">
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
