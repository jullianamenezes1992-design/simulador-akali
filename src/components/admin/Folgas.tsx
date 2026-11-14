"use client";

import { useState, useTransition } from "react";
import { CalendarOff, Loader2, Plus, X } from "lucide-react";
import { marcarFolga } from "@/app/admin/actions";

export type DiaEspecial = { dia: string; tipo: "folga" | "evento" | "meeting" };
export const TIPOS_DIA = {
  folga: { emoji: "🌴", label: "Folga" },
  evento: { emoji: "🎪", label: "Evento" },
  meeting: { emoji: "💼", label: "Meeting" },
} as const;

const fmt = (d: string) =>
  new Date(`${d}T12:00:00-03:00`).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

/** Folgas, eventos e meetings: marcar uma data e desmarcar. */
export function Folgas({
  proximas,
  hoje,
}: {
  proximas: DiaEspecial[];
  hoje: string;
}) {
  const [data, setData] = useState("");
  const [tipo, setTipo] = useState<DiaEspecial["tipo"]>("folga");
  const [erro, setErro] = useState("");
  const [pending, start] = useTransition();
  const run = (dia: string, t: DiaEspecial["tipo"] | null) =>
    start(async () => {
      setErro("");
      try {
        await marcarFolga(dia, t);
        if (t) setData("");
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro.");
      }
    });
  return (
    <div className="text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold">
          <CalendarOff size={15} /> Folgas, eventos e meetings:
        </span>
        {proximas.length ? (
          proximas.map((d) => (
            <span
              key={d.dia}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${d.tipo === "folga" ? "bg-emerald-50 text-emerald-900" : "bg-sky-50 text-sky-900"}`}
            >
              {TIPOS_DIA[d.tipo].emoji} {TIPOS_DIA[d.tipo].label} · {fmt(d.dia)}
              <button
                type="button"
                aria-label={`Desmarcar ${fmt(d.dia)}`}
                disabled={pending}
                onClick={() => run(d.dia, null)}
                className="opacity-70 hover:opacity-100"
              >
                <X size={13} />
              </button>
            </span>
          ))
        ) : (
          <span className="text-ink-soft">nenhum dia marcado</span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as DiaEspecial["tipo"])}
          className="input !w-auto !py-1.5"
          aria-label="Tipo do dia"
        >
          {Object.entries(TIPOS_DIA).map(([k, v]) => (
            <option key={k} value={k}>
              {v.emoji} {v.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          min={hoje}
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="input !w-auto !py-1.5"
          aria-label="Data"
        />
        <button
          type="button"
          disabled={!data || pending}
          onClick={() => run(data, tipo)}
          className="btn-secondary !py-1.5 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Plus size={14} />
          )}{" "}
          Marcar
        </button>
        {erro && (
          <span className="text-xs font-semibold text-red-700">{erro}</span>
        )}
      </div>
      <p className="mt-2 text-xs text-ink-soft">
        Folga: sem tarefas. Evento e meeting (dia externo): só o essencial
        (agenda, novos cadastros e leads quentes).
      </p>
    </div>
  );
}

/** Desmarcar o dia especial de hoje (voltar ao dia normal). */
export function DesfazerFolgaHoje({
  hoje,
  rotulo = "Não é folga, mostrar minhas tarefas",
}: {
  hoje: string;
  rotulo?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => marcarFolga(hoje, null))}
      className="btn-secondary"
    >
      {pending && <Loader2 size={14} className="animate-spin" />} {rotulo}
    </button>
  );
}
