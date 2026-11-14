"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, MessageCircleReply } from "lucide-react";
import { marcarRespostaAprovado } from "@/app/admin/actions";

/** "Respondeu": o cliente aprovado respondeu às ofertas (zera a contagem sem resposta). */
export default function RespondeuOferta({ aprovadoId, semResposta }: { aprovadoId: string; semResposta: number }) {
  const [feito, setFeito] = useState(false);
  const [pending, start] = useTransition();
  const n = feito ? 0 : semResposta;
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className={n >= 3 ? "font-semibold text-amber-800" : "text-ink-soft"}>
        {n === 0 ? "Nenhuma oferta sem resposta." : `${n} oferta(s) seguida(s) sem resposta${n >= 3 ? " · próxima em 15 dias" : ""}.`}
      </span>
      <button
        type="button"
        disabled={pending || feito || semResposta === 0}
        onClick={() =>
          start(async () => {
            await marcarRespostaAprovado(aprovadoId);
            setFeito(true);
          })
        }
        className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-bold text-ink disabled:opacity-50"
      >
        {pending ? <Loader2 size={13} className="animate-spin" /> : feito ? <Check size={13} /> : <MessageCircleReply size={13} />} {feito ? "Respondeu" : "Cliente respondeu"}
      </button>
    </div>
  );
}
