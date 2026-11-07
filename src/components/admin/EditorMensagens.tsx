"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { restaurarMensagensEtapa, salvarMensagensEtapa } from "@/app/admin/actions";

type Item = { ordem: number; titulo: string; texto: string };

export default function EditorMensagens({ status, etapa, itens, personalizada }: { status: string; etapa: string; itens: Item[]; personalizada: boolean }) {
  const [lista, setLista] = useState(itens);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (window.location.hash === `#${status}` && ref.current) {
      ref.current.open = true;
      ref.current.scrollIntoView({ block: "start" });
    }
  }, [status]);
  const mudar = (i: number, campo: "titulo" | "texto", v: string) => setLista((l) => l.map((x, j) => (j === i ? { ...x, [campo]: v } : x)));

  return (
    <details ref={ref} id={status} className="card scroll-mt-20 p-4">
      <summary className="cursor-pointer font-bold">
        {etapa} {personalizada && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">editada</span>}
      </summary>
      <div className="mt-3 space-y-4">
        {lista.map((m, i) => (
          <div key={m.ordem} className="space-y-1">
            <label className="label">Mensagem {m.ordem}</label>
            <input className="input" value={m.titulo} maxLength={80} onChange={(e) => mudar(i, "titulo", e.target.value)} />
            <textarea className="input min-h-40 font-mono text-sm" value={m.texto} maxLength={2000} onChange={(e) => mudar(i, "texto", e.target.value)} />
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setMsg(null);
                try {
                  await salvarMensagensEtapa(status, lista);
                  setMsg("Salvo!");
                } catch (e) {
                  setMsg(e instanceof Error ? e.message : "Erro ao salvar.");
                }
              })
            }
          >
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar
          </button>
          {personalizada && (
            <button
              type="button"
              className="btn-secondary"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await restaurarMensagensEtapa(status);
                  window.location.reload();
                })
              }
            >
              <RotateCcw size={16} /> Voltar ao texto padrão
            </button>
          )}
        </div>
        {msg && <p className="text-sm font-medium">{msg}</p>}
      </div>
    </details>
  );
}
