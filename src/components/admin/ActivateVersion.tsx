"use client";

import { useTransition } from "react";
import { ativarVersaoParametros } from "@/app/admin/actions";

export default function ActivateVersion({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => confirm("Ativar esta versão para todas as novas simulações?") && start(() => ativarVersaoParametros(id))}
      className="text-xs font-semibold text-caixa hover:underline"
    >
      {pending ? "Ativando…" : "Ativar"}
    </button>
  );
}
