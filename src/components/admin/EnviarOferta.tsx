"use client";

import { useState, useTransition } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { registrarOfertaEnviada } from "@/app/admin/actions";

/** Botão "Enviar oferta": abre o WhatsApp do aprovado com a mensagem pronta e registra no histórico. */
export default function EnviarOferta({
  aprovadoId,
  telefone,
  texto,
  devNome,
  devId,
  jaEnviada,
  compacto,
  rotulo = "Enviar oferta",
}: {
  aprovadoId: string;
  telefone: string;
  texto: string;
  devNome: string;
  devId?: string;
  /** data da última vez que este projeto foi oferecido a este cliente */
  jaEnviada?: string | null;
  compacto?: boolean;
  rotulo?: string;
}) {
  const [, start] = useTransition();
  const [enviada, setEnviada] = useState(false);
  const [copiada, setCopiada] = useState(false);
  const tel = `55${telefone.replace(/\D/g, "")}`;
  return (
    <span className="inline-flex flex-wrap gap-2">
      <a
        href={`https://wa.me/${tel}?text=${encodeURIComponent(texto)}`}
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          setEnviada(true);
          start(() => registrarOfertaEnviada(aprovadoId, devNome, devId ?? null).catch(() => undefined));
        }}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold ${jaEnviada && !enviada ? "border border-[#25D366] text-[#128C4B]" : "bg-[#25D366] text-white"}`}
      >
        {enviada ? <Check size={15} /> : <MessageCircle size={15} />} {enviada ? "Mensagem aberta" : jaEnviada ? "Enviar de novo" : rotulo}
      </a>
      {!compacto && (
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(texto);
              setCopiada(true);
              setTimeout(() => setCopiada(false), 2000);
            } catch {
              /* sem permissão */
            }
          }}
          className="btn-secondary !py-1.5 text-sm"
        >
          {copiada ? <Check size={15} /> : <Copy size={15} />} {copiada ? "Copiada!" : "Copiar"}
        </button>
      )}
    </span>
  );
}
