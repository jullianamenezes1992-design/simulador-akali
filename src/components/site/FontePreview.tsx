"use client";

import { useEffect, useState } from "react";

/**
 * Prévia de fontes do título: abra o site com ?fonte=poppins (ou montserrat, nunito, jakarta, dmserif, outfit).
 * Só muda a aparência para quem abriu esse link; não altera o site para os clientes.
 */
const FONTES: Record<string, { nome: string; familia: string; css: string; peso: string }> = {
  poppins: { nome: "A · Poppins", familia: "'Poppins'", css: "Poppins:wght@600;700;800", peso: "800" },
  montserrat: { nome: "B · Montserrat", familia: "'Montserrat'", css: "Montserrat:wght@600;700;800", peso: "800" },
  nunito: { nome: "C · Nunito", familia: "'Nunito'", css: "Nunito:wght@700;800;900", peso: "900" },
  jakarta: { nome: "D · Plus Jakarta Sans", familia: "'Plus Jakarta Sans'", css: "Plus+Jakarta+Sans:wght@600;700;800", peso: "800" },
  dmserif: { nome: "E · DM Serif Display", familia: "'DM Serif Display'", css: "DM+Serif+Display", peso: "400" },
  outfit: { nome: "F · Outfit", familia: "'Outfit'", css: "Outfit:wght@600;700", peso: "700" },
};

export default function FontePreview() {
  const [atual, setAtual] = useState<string | null>(null);

  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get("fonte");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- parâmetro da URL só existe no navegador
    if (f && FONTES[f]) setAtual(f);
  }, []);

  useEffect(() => {
    if (!atual) return;
    const f = FONTES[atual];
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${f.css}&display=swap`;
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.textContent = `h1,h2,h3,.font-display{font-family:${f.familia},sans-serif!important;font-weight:${f.peso}!important}`;
    document.head.appendChild(style);
    return () => {
      link.remove();
      style.remove();
    };
  }, [atual]);

  if (!atual) return null;

  const trocar = (k: string) => {
    setAtual(k);
    const u = new URL(window.location.href);
    u.searchParams.set("fonte", k);
    window.history.replaceState(null, "", u.toString());
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 bg-ink/95 px-3 py-2 text-white shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold">Prévia de fonte:</span>
        {Object.entries(FONTES).map(([k, f]) => (
          <button
            key={k}
            type="button"
            onClick={() => trocar(k)}
            className={`rounded-full px-3 py-1 ${k === atual ? "bg-sol font-semibold text-ink" : "bg-white/10 hover:bg-white/20"}`}
          >
            {f.nome}
          </button>
        ))}
        <span className="ml-auto text-xs text-white/70">Só você vê esta barra.</span>
      </div>
    </div>
  );
}
