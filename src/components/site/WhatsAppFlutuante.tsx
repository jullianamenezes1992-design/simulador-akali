"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import { tokenSalvo } from "./WhatsAppButton";

/**
 * Botão flutuante de WhatsApp em todas as páginas do site.
 * Usa a mesma rota do botão normal: registra o clique antes de abrir o WhatsApp e,
 * se o visitante já fez a simulação neste navegador, a mensagem leva o código dela.
 */
export default function WhatsAppFlutuante() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  // No formulário o botão atrapalharia o "Continuar" no celular
  if (pathname?.startsWith("/simulacao")) return null;

  const abrir = async () => {
    setLoading(true);
    const pagina = `flutuante:${pathname ?? "/"}`;
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenSalvo(), developmentId: null, pagina }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error();
      trackEvent("whatsapp_click", { pagina });
      window.location.href = json.url;
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={abrir}
      disabled={loading}
      aria-label="Falar com um corretor no WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-[#25D366] pl-4 pr-4 text-white shadow-lg shadow-black/20 transition hover:bg-[#1ebe5b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:bottom-6 sm:right-6"
    >
      <span aria-hidden className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-30 motion-reduce:hidden" />
      {loading ? <Loader2 size={26} className="animate-spin" /> : <MessageCircle size={26} strokeWidth={2.2} />}
      <span className="hidden text-sm font-bold sm:inline">Fale com um corretor</span>
    </button>
  );
}
