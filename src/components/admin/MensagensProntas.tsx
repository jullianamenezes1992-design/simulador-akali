"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Copy, MessageCircle, Pencil } from "lucide-react";
import { registrarMensagemEnviada } from "@/app/admin/actions";

export interface MensagemPreenchida {
  ordem: number;
  titulo: string;
  texto: string;
  enviadaEm: string | null;
}

export default function MensagensProntas({
  leadId,
  status,
  etapa,
  telefone,
  mensagens,
  podeEditar,
}: {
  leadId: string;
  status: string;
  etapa: string;
  telefone: string;
  mensagens: MensagemPreenchida[];
  podeEditar: boolean;
}) {
  const [, start] = useTransition();
  const [copiada, setCopiada] = useState<number | null>(null);
  const [enviadas, setEnviadas] = useState<Record<number, boolean>>({});
  const tel = `55${telefone.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "")}`;

  if (!mensagens.length) return <p className="text-sm text-ink-soft">Não há mensagens prontas para esta etapa.</p>;

  const marcar = (m: MensagemPreenchida) => {
    setEnviadas((e) => ({ ...e, [m.ordem]: true }));
    start(() => registrarMensagemEnviada(leadId, status, m.ordem, m.titulo).catch(() => undefined));
  };

  const copiar = async (m: MensagemPreenchida) => {
    try {
      await navigator.clipboard.writeText(m.texto);
      setCopiada(m.ordem);
      setTimeout(() => setCopiada(null), 2000);
    } catch {
      /* navegador sem permissão de copiar */
    }
  };

  // próxima sugerida = primeira ainda não enviada
  const proxima = mensagens.find((m) => !m.enviadaEm && !enviadas[m.ordem])?.ordem;

  return (
    <div className="space-y-3">
      <p className="text-xs text-ink-soft">
        Etapa <strong className="text-ink">{etapa}</strong>: envie na ordem, com 1 ou 2 dias entre uma e outra. Revise os trechos entre colchetes antes de enviar.
      </p>
      {mensagens.map((m) => {
        const enviada = m.enviadaEm || enviadas[m.ordem];
        return (
          <div key={m.ordem} className={`rounded-xl border p-3 ${m.ordem === proxima ? "border-caixa bg-caixa/5" : "border-line"}`}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-sm font-bold">
                {m.ordem}. {m.titulo}
                {m.ordem === proxima && <span className="ml-2 rounded-full bg-caixa px-2 py-0.5 text-[10px] font-bold text-white">PRÓXIMA</span>}
              </p>
              {enviada && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <Check size={14} /> {m.enviadaEm ? `enviada ${m.enviadaEm}` : "enviada"}
                </span>
              )}
            </div>
            <details>
              <summary className="cursor-pointer text-xs font-semibold text-ink-soft">Ver texto</summary>
              <p className="mt-2 whitespace-pre-wrap rounded-lg bg-mist p-2 text-sm">{m.texto}</p>
            </details>
            <div className="mt-2 flex flex-wrap gap-2">
              <a
                href={`https://wa.me/${tel}?text=${encodeURIComponent(m.texto)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => marcar(m)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-bold text-white"
              >
                <MessageCircle size={16} /> Enviar no WhatsApp
              </a>
              <button type="button" onClick={() => copiar(m)} className="btn-secondary !py-2 text-sm">
                {copiada === m.ordem ? <Check size={16} /> : <Copy size={16} />} {copiada === m.ordem ? "Copiada!" : "Copiar"}
              </button>
            </div>
          </div>
        );
      })}
      {podeEditar && (
        <Link href={`/admin/mensagens#${status}`} className="inline-flex items-center gap-1 text-xs font-semibold text-caixa">
          <Pencil size={12} /> Editar os textos desta etapa
        </Link>
      )}
    </div>
  );
}
