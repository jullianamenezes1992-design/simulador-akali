"use client";

import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import { RESULT_KEY } from "@/lib/constants";

interface Props {
  developmentId?: string | null;
  developmentNome?: string | null;
  /** token do resultado; se ausente, tenta recuperar a última simulação deste navegador */
  token?: string | null;
  label?: string;
  className?: string;
  pagina?: string;
}

export function tokenSalvo(): string | null {
  try {
    const raw = localStorage.getItem(RESULT_KEY);
    return raw ? (JSON.parse(raw).token as string) : null;
  } catch {
    return null;
  }
}

export default function WhatsAppButton({ developmentId, developmentNome, token, label = "Falar no WhatsApp", className, pagina }: Props) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const click = async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token ?? tokenSalvo(), developmentId: developmentId ?? null, pagina }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.erro ?? "Não foi possível abrir o WhatsApp.");
      trackEvent("whatsapp_click", { empreendimento: developmentNome ?? undefined, pagina });
      window.location.href = json.url;
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao abrir o WhatsApp.");
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button type="button" onClick={click} disabled={loading} className="btn-whatsapp w-full">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />}
        {label}
      </button>
      {erro && <p className="field-error text-center">{erro}</p>}
    </div>
  );
}
