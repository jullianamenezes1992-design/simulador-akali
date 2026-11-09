"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { excluirAprovado } from "@/app/admin/actions";

export default function ExcluirAprovado({ id }: { id: string }) {
  const [confirmar, setConfirmar] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!confirmar)
    return (
      <button type="button" onClick={() => setConfirmar(true)} className="inline-flex items-center gap-1 text-sm font-semibold text-red-700">
        <Trash2 size={14} /> Excluir este cadastro de aprovado
      </button>
    );
  return (
    <p className="flex flex-wrap items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-900">
      Excluir de vez? O cliente do CRM (se houver) não é apagado.
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await excluirAprovado(id);
            router.push("/admin/aprovados");
          })
        }
        className="rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white"
      >
        Excluir
      </button>
      <button type="button" onClick={() => setConfirmar(false)} className="btn-secondary !py-1.5">
        Cancelar
      </button>
    </p>
  );
}
