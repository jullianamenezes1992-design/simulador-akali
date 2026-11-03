"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { excluirEmpreendimento } from "@/app/admin/actions";

export default function DeleteDevelopment({ id, nome }: { id: string; nome: string }) {
  const [pending, start] = useTransition();
  return (
    <section className="card border-red-200 p-4">
      <h2 className="font-bold text-red-700">Excluir empreendimento</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Remove o cadastro e as mídias. Leads que escolheram este imóvel mantêm o histórico. Para apenas ocultar do site, use
        &ldquo;Ativo&rdquo;.
      </p>
      <button
        type="button"
        className="btn-danger mt-3"
        disabled={pending}
        onClick={() => {
          if (prompt(`Digite EXCLUIR para apagar "${nome}" definitivamente.`) === "EXCLUIR") start(() => excluirEmpreendimento(id));
        }}
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Excluir
      </button>
    </section>
  );
}
