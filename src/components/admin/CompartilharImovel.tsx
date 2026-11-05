"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { formatPreco } from "@/lib/format";

/** Compartilha a página pública do empreendimento (no celular abre o menu do WhatsApp, etc.; no computador copia o link). */
export default function CompartilharImovel({ slug, nome, preco }: { slug: string; nome: string; preco: number | null }) {
  const [copiado, setCopiado] = useState(false);
  const compartilhar = async () => {
    const url = `${window.location.origin}/empreendimentos/${slug}?utm_source=whatsapp&utm_medium=corretora`;
    const texto = `🏡 ${nome}${preco ? ` – a partir de ${formatPreco(preco)}` : ""}\nVeja fotos, plantas e faça sua simulação:`;
    try {
      if (navigator.share) {
        await navigator.share({ title: nome, text: texto, url });
        return;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return; // a pessoa fechou o menu
    }
    try {
      await navigator.clipboard.writeText(`${texto}\n${url}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      window.prompt("Copie o link:", url);
    }
  };
  return (
    <button type="button" onClick={compartilhar} className="btn-primary px-3" aria-label={`Compartilhar ${nome}`}>
      {copiado ? <Check size={16} /> : <Share2 size={16} />} {copiado ? "Copiado!" : "Compartilhar"}
    </button>
  );
}
