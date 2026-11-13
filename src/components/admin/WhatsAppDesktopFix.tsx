"use client";

import { useEffect } from "react";

/** Tira emojis do texto (o WhatsApp do computador no Windows troca emoji vindo de link por "�"). */
export function semEmoji(texto: string): string {
  return texto
    .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}]/gu, "")
    .replace(/[︎️‍⃣]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+$/g, "")
    .trim();
}

/**
 * No computador com Windows, ao clicar num link do WhatsApp, remove os emojis da mensagem
 * antes de abrir. No celular nada muda (lá os emojis funcionam).
 */
export default function WhatsAppDesktopFix() {
  useEffect(() => {
    const windowsDesktop = /Windows/i.test(navigator.userAgent) && !/Mobile|Android/i.test(navigator.userAgent);
    if (!windowsDesktop) return;
    const ajustar = (ev: Event) => {
      const a = (ev.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || !/^https:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//.test(a.href)) return;
      try {
        const url = new URL(a.href);
        const texto = url.searchParams.get("text");
        if (!texto) return;
        url.searchParams.set("text", semEmoji(texto));
        a.href = url.toString();
      } catch {
        /* link inválido: deixa como está */
      }
    };
    // antes do clique (inclui botão do meio e "abrir em nova aba")
    document.addEventListener("pointerdown", ajustar, true);
    document.addEventListener("click", ajustar, true);
    document.addEventListener("keydown", ajustar, true);
    return () => {
      document.removeEventListener("pointerdown", ajustar, true);
      document.removeEventListener("click", ajustar, true);
      document.removeEventListener("keydown", ajustar, true);
    };
  }, []);
  return null;
}
