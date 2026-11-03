"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/tracking";
import { tokenSalvo } from "./WhatsAppButton";

/** Registra a visualização do empreendimento (analytics + histórico do lead, se houver simulação). */
export default function ViewTracker({ developmentId, nome, preco }: { developmentId: string; nome: string; preco: number | null }) {
  useEffect(() => {
    trackEvent("view_development", { content_name: nome, value: preco ?? undefined, currency: "BRL" });
    const token = tokenSalvo();
    if (token) {
      fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, developmentId }),
        keepalive: true,
      }).catch(() => {});
    }
  }, [developmentId, nome, preco]);
  return null;
}
