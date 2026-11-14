"use client";

import { useState, useTransition } from "react";
import { CalendarOff, Loader2, Palmtree, X } from "lucide-react";
import { marcarFolga } from "@/app/admin/actions";

const fmt = (d: string) => new Date(`${d}T12:00:00-03:00`).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });

/** Próximas folgas: marcar uma data e desmarcar. */
export function Folgas({ proximas, hoje }: { proximas: string[]; hoje: string }) {
  const [data, setData] = useState("");
  const [erro, setErro] = useState("");
  const [pending, start] = useTransition();
  const run = (dia: string, on: boolean) =>
    start(async () => {
      setErro("");
      try {
        await marcarFolga(dia, on);
        if (on) setData("");
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro.");
      }
    });
  return (
    <div className="text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold">
          <CalendarOff size={15} /> Minhas folgas:
        </span>
        {proximas.length ? (
          proximas.map((d) => (
            <span key={d} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-900">
              🌴 {fmt(d)}
              <button type="button" aria-label={`Desmarcar folga ${fmt(d)}`} disabled={pending} onClick={() => run(d, false)} className="text-emerald-900/70 hover:text-emerald-950">
                <X size={13} />
              </button>
            </span>
          ))
        ) : (
          <span className="text-ink-soft">nenhuma marcada</span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input type="date" min={hoje} value={data} onChange={(e) => setData(e.target.value)} className="input !w-auto !py-1.5" aria-label="Data da folga" />
        <button type="button" disabled={!data || pending} onClick={() => run(data, true)} className="btn-secondary !py-1.5 disabled:opacity-50">
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Palmtree size={14} />} Marcar folga
        </button>
        {erro && <span className="text-xs font-semibold text-red-700">{erro}</span>}
      </div>
    </div>
  );
}

/** Na tela do dia de folga: voltar a trabalhar (desmarca a folga de hoje). */
export function DesfazerFolgaHoje({ hoje }: { hoje: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} onClick={() => start(() => marcarFolga(hoje, false))} className="btn-secondary">
      {pending && <Loader2 size={14} className="animate-spin" />} Não é folga, mostrar minhas tarefas
    </button>
  );
}
