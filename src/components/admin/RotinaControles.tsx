"use client";

import { useState, useTransition } from "react";
import { Check, Circle, Loader2, MessageCircle, PartyPopper } from "lucide-react";
import { marcarRotina, rebaterCliente } from "@/app/admin/actions";

/** Botão "Feito" de um bloco da rotina (com anotação opcional). */
export function MarcarBloco({ item, feito, auto, pedirNota, nota }: { item: string; feito: boolean; auto?: boolean; pedirNota?: string; nota?: string | null }) {
  const [on, setOn] = useState(feito);
  const [texto, setTexto] = useState(nota ?? "");
  const [pending, start] = useTransition();
  const salvar = (v: boolean) =>
    start(async () => {
      setOn(v);
      try {
        await marcarRotina(item, v, texto);
      } catch {
        setOn(!v);
      }
    });
  if (auto && feito)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
        <Check size={14} /> Feito
      </span>
    );
  return (
    <div className="flex flex-wrap items-center gap-2">
      {pedirNota && !on && <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={pedirNota} maxLength={500} className="input !py-1.5 w-56 text-sm" />}
      <button
        type="button"
        disabled={pending}
        onClick={() => salvar(!on)}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${on ? "bg-emerald-100 text-emerald-800" : "border border-line bg-white text-ink hover:border-caixa"}`}
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : on ? <Check size={14} /> : <Circle size={14} />} {on ? "Feito" : "Marcar como feito"}
      </button>
    </div>
  );
}

/** Cliente do "rebater carteira": abre o WhatsApp com a mensagem e marca como chamado. */
export function ChamarCarteira({ leadId, telefone, texto }: { leadId: string; telefone: string; texto: string }) {
  const [feito, setFeito] = useState(false);
  const [, start] = useTransition();
  return (
    <a
      href={`https://wa.me/55${telefone.replace(/\D/g, "")}?text=${encodeURIComponent(texto)}`}
      target="_blank"
      rel="noreferrer"
      onClick={() => {
        setFeito(true);
        start(() => rebaterCliente(leadId).catch(() => undefined));
      }}
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${feito ? "bg-emerald-100 text-emerald-800" : "bg-[#25D366] text-white"}`}
    >
      {feito ? <Check size={13} /> : <MessageCircle size={13} />} {feito ? "Chamado" : "Chamar"}
    </a>
  );
}

/** Finalizar o dia (só libera quando todos os blocos estão feitos). */
export function FinalizarDia({ pronto, finalizado, faltam }: { pronto: boolean; finalizado: boolean; faltam: string[] }) {
  const [ok, setOk] = useState(finalizado);
  const [pending, start] = useTransition();
  if (ok)
    return (
      <div className="card flex items-center gap-3 border-emerald-300 bg-emerald-50 p-4 text-emerald-900">
        <PartyPopper size={28} />
        <div>
          <p className="text-lg font-extrabold">Dia finalizado! 🎉</p>
          <p className="text-sm">Tudo o que estava programado foi feito. Bom descanso!</p>
        </div>
      </div>
    );
  return (
    <div className="card p-4">
      <button
        type="button"
        disabled={!pronto || pending}
        onClick={() =>
          start(async () => {
            await marcarRotina("dia_finalizado", true);
            setOk(true);
          })
        }
        className="btn-primary w-full justify-center py-3 text-base disabled:opacity-50"
      >
        {pending ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} Finalizar meu dia
      </button>
      {!pronto && <p className="mt-2 text-center text-sm text-ink-soft">Falta: {faltam.join(", ")}</p>}
    </div>
  );
}
