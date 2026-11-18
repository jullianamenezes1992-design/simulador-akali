"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

/**
 * Barra fina no topo que aparece na hora do clique em um link interno e some quando a
 * página nova chega. Dá retorno imediato ao toque, em vez de parecer que o app travou.
 */
function Barra() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [ativa, setAtiva] = useState(false);
  const [pct, setPct] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const inicio = useRef<string>("");

  // página nova chegou: completa e some
  useEffect(() => {
    if (!ativa) return;
    if (timer.current) clearInterval(timer.current);
    const t1 = setTimeout(() => setPct(100), 0);
    const t = setTimeout(() => {
      setAtiva(false);
      setPct(0);
    }, 250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  useEffect(() => {
    const comecar = () => {
      inicio.current = location.pathname + location.search;
      setAtiva(true);
      setPct(12);
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(
        () => setPct((p) => (p < 85 ? p + (90 - p) * 0.12 : p)),
        200,
      );
      // segurança: se nada mudar em 12 s, esconde
      setTimeout(() => {
        if (location.pathname + location.search === inicio.current) {
          if (timer.current) clearInterval(timer.current);
          setAtiva(false);
          setPct(0);
        }
      }, 12000);
    };
    const clique = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        /^(mailto|tel|https?:\/\/wa\.me|whatsapp):/i.test(href)
      )
        return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search)
        return;
      if (url.pathname.startsWith("/api/")) return;
      comecar();
    };
    const envio = (e: SubmitEvent) => {
      const f = e.target as HTMLFormElement;
      // formulários GET (filtros e buscas) trocam a página
      if (
        (f.method || "get").toLowerCase() === "get" &&
        !f.action.includes("/api/")
      )
        comecar();
    };
    document.addEventListener("click", clique, true);
    document.addEventListener("submit", envio, true);
    return () => {
      document.removeEventListener("click", clique, true);
      document.removeEventListener("submit", envio, true);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px]"
      style={{ opacity: ativa ? 1 : 0, transition: "opacity 200ms" }}
    >
      <div
        className="h-full bg-sol shadow-[0_0_8px_rgba(245,166,35,0.8)]"
        style={{ width: `${pct}%`, transition: "width 200ms ease-out" }}
      />
    </div>
  );
}

export default function BarraNavegacao() {
  return (
    <Suspense fallback={null}>
      <Barra />
    </Suspense>
  );
}
