"use client";

import { useEffect } from "react";
import { RESULT_KEY } from "@/lib/constants";

/** Guarda o token desta simulação no navegador para vincular visualizações e cliques ao cadastro. */
export default function ResultadoTracker({ token, codigo }: { token: string; codigo: string }) {
  useEffect(() => {
    try {
      localStorage.setItem(RESULT_KEY, JSON.stringify({ token, codigo }));
    } catch {}
  }, [token, codigo]);
  return null;
}
