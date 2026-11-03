"use client";

import { useOptimistic, useTransition } from "react";
import { alternarAtivo } from "@/app/admin/actions";

export default function ToggleAtivo({ id, ativo }: { id: string; ativo: boolean }) {
  const [pending, start] = useTransition();
  const [otimista, set] = useOptimistic(ativo);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={otimista}
      disabled={pending}
      onClick={() =>
        start(async () => {
          set(!otimista);
          await alternarAtivo(id, !otimista);
        })
      }
      className="flex items-center gap-2 text-xs font-semibold"
      title={otimista ? "Ativo no site — clique para desativar" : "Inativo — clique para ativar"}
    >
      <span className={`relative h-6 w-11 rounded-full transition ${otimista ? "bg-emerald-500" : "bg-slate-300"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${otimista ? "left-[22px]" : "left-0.5"}`} />
      </span>
      {otimista ? "Ativo" : "Inativo"}
    </button>
  );
}
