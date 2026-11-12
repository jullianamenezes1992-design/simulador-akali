"use client";

import { useState, useTransition } from "react";
import { Hourglass, Loader2, X } from "lucide-react";
import { marcarAguardandoDocs } from "@/app/admin/actions";

/** Botão da etiqueta "Aguardando documentos". */
export default function AguardandoDocs({ leadId, desde }: { leadId: string; desde: string | null }) {
  const [ligado, setLigado] = useState(!!desde);
  const [pending, start] = useTransition();
  const alternar = () =>
    start(async () => {
      const novo = !ligado;
      setLigado(novo);
      try {
        await marcarAguardandoDocs(leadId, novo);
      } catch {
        setLigado(!novo);
      }
    });
  return ligado ? (
    <button
      type="button"
      onClick={alternar}
      disabled={pending}
      title="Toque para tirar a etiqueta (documentos recebidos)"
      className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-ink"
    >
      {pending ? <Loader2 size={12} className="animate-spin" /> : <Hourglass size={12} />} Aguardando documentos <X size={12} />
    </button>
  ) : (
    <button
      type="button"
      onClick={alternar}
      disabled={pending}
      className="inline-flex items-center gap-1 rounded-full border border-dashed border-amber-500 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50"
    >
      {pending ? <Loader2 size={12} className="animate-spin" /> : <Hourglass size={12} />} Marcar “aguardando documentos”
    </button>
  );
}
