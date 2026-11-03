"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Gallery({ fotos, nome }: { fotos: { url: string; legenda: string | null }[]; nome: string }) {
  const [i, setI] = useState(0);
  if (fotos.length === 0) return <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-mist text-ink-soft">Fotos em breve</div>;
  const atual = fotos[i];
  const go = (d: number) => setI((x) => (x + d + fotos.length) % fotos.length);
  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl bg-mist">
        <img src={atual.url} alt={atual.legenda ?? `Foto de ${nome}`} className="aspect-[16/10] w-full object-cover" />
        {fotos.length > 1 && (
          <>
            <button type="button" aria-label="Foto anterior" onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow">
              <ChevronLeft size={18} />
            </button>
            <button type="button" aria-label="Próxima foto" onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow">
              <ChevronRight size={18} />
            </button>
            <span className="chip absolute bottom-3 right-3 bg-ink/80 text-white">
              {i + 1}/{fotos.length}
            </span>
          </>
        )}
      </div>
      {atual.legenda && <p className="mt-2 text-xs text-ink-soft">{atual.legenda}</p>}
      {fotos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {fotos.map((f, idx) => (
            <button
              key={f.url + idx}
              type="button"
              onClick={() => setI(idx)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${idx === i ? "border-caixa" : "border-transparent"}`}
            >
              <img src={f.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
