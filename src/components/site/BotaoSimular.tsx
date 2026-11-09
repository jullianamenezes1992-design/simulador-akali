"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/tracking";

/** Botão principal da página inicial: leva direto para a simulação (sem pedir renda antes). */
export default function BotaoSimular({ origem, className = "", children }: { origem: string; className?: string; children?: React.ReactNode }) {
  return (
    <Link href="/simulacao" onClick={() => trackEvent("simulation_cta", { origem })} className={className}>
      {children ?? "Fazer minha simulação grátis"} <ArrowRight size={20} aria-hidden />
    </Link>
  );
}
