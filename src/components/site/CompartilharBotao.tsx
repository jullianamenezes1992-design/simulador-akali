"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, Mail, MessageCircle, Share2 } from "lucide-react";
import { trackEvent } from "@/lib/tracking";

/**
 * Botão "Compartilhar" da página do empreendimento.
 * No celular abre o menu do aparelho; no computador mostra WhatsApp, copiar link e e-mail.
 */
export default function CompartilharBotao({ slug, nome, resumo, className = "" }: { slug: string; nome: string; resumo: string; className?: string }) {
  const [aberto, setAberto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => !caixa.current?.contains(e.target as Node) && setAberto(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  const url = () => `${window.location.origin}/empreendimentos/${slug}?utm_source=compartilhar&utm_medium=site`;
  const texto = `🏡 ${nome}${resumo ? ` – ${resumo}` : ""}\nVeja fotos, plantas e faça sua simulação:`;
  const marcar = (canal: string) => trackEvent("share", { canal, empreendimento: nome });

  const clicar = async () => {
    // celular/tablet: menu nativo de compartilhar
    const toque = window.matchMedia?.("(pointer: coarse)").matches;
    if (toque && navigator.share) {
      try {
        await navigator.share({ title: nome, text: texto, url: url() });
        marcar("menu_celular");
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    setAberto((v) => !v);
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopiado(true);
      marcar("copiar_link");
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      window.prompt("Copie o link:", url());
    }
  };

  const item = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-mist";
  return (
    <div ref={caixa} className={`relative inline-block ${className}`}>
      <button type="button" onClick={clicar} className="btn-secondary px-4" aria-haspopup="menu" aria-expanded={aberto}>
        <Share2 size={16} /> Compartilhar
      </button>
      {aberto && (
        <div role="menu" className="absolute left-0 z-40 mt-2 w-60 rounded-xl border border-line bg-white p-1.5 shadow-xl">
          <a
            role="menuitem"
            href={`https://wa.me/?text=${encodeURIComponent(`${texto}\n${url()}`)}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              marcar("whatsapp");
              setAberto(false);
            }}
            className={item}
          >
            <MessageCircle size={17} className="text-[#25D366]" /> Enviar pelo WhatsApp
          </a>
          <button type="button" role="menuitem" onClick={copiar} className={item}>
            {copiado ? <Check size={17} className="text-emerald-600" /> : <Link2 size={17} className="text-caixa" />} {copiado ? "Link copiado!" : "Copiar link"}
          </button>
          <a
            role="menuitem"
            href={`mailto:?subject=${encodeURIComponent(nome)}&body=${encodeURIComponent(`${texto}\n${url()}`)}`}
            onClick={() => {
              marcar("email");
              setAberto(false);
            }}
            className={item}
          >
            <Mail size={17} className="text-caixa" /> Enviar por e-mail
          </a>
        </div>
      )}
    </div>
  );
}
