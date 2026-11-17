"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Check,
  Loader2,
  MessageCircle,
  Undo2,
  UserPlus,
  XCircle,
} from "lucide-react";
import {
  baseCuryParaAprovados,
  baseCuryParaLeads,
  chamarBaseCury,
  marcarBaseCury,
} from "@/app/admin/actions";

/** Botões de um cliente da Base Cury: Chamar → (Trazer para Aprovados | Descartar). */
export function AcoesBaseCury({
  id,
  telefone,
  texto,
  situacao: inicial,
  aprovadoId,
  leadId,
  aprovado,
}: {
  id: string;
  telefone: string | null;
  texto: string;
  situacao: string;
  aprovadoId: string | null;
  leadId: string | null;
  /** tem aprovação bancária válida: vai para Aprovados; senão, para Leads */
  aprovado: boolean;
}) {
  const [situacao, setSituacao] = useState(inicial);
  const [erro, setErro] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  if (situacao === "aprovado")
    return (
      <a
        href={
          aprovadoId ? `/admin/aprovados/${aprovadoId}` : "/admin/aprovados"
        }
        className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800"
      >
        <BadgeCheck size={13} /> Nos Aprovados
      </a>
    );

  if (situacao === "lead")
    return (
      <a
        href={leadId ? `/admin/leads/${leadId}` : "/admin/leads"}
        className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-800"
      >
        <UserPlus size={13} /> Nos Leads
      </a>
    );

  if (situacao === "descartado")
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-bold text-zinc-700">
          Descartado
        </span>
        <button
          type="button"
          onClick={() =>
            start(async () => {
              setSituacao("nova");
              await marcarBaseCury(id, "desfazer").catch(() => undefined);
              router.refresh();
            })
          }
          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-soft hover:underline"
        >
          <Undo2 size={13} /> desfazer
        </button>
      </div>
    );

  const trazer = () =>
    start(async () => {
      setErro("");
      if (aprovado) {
        const r = await baseCuryParaAprovados(id);
        if (r.erro) setErro(r.erro);
        else if (r.aprovadoId) {
          setSituacao("aprovado");
          router.push(`/admin/aprovados/${r.aprovadoId}`);
        }
      } else {
        const r = await baseCuryParaLeads(id);
        if (r.erro) setErro(r.erro);
        else if (r.leadId) {
          setSituacao("lead");
          router.push(`/admin/leads/${r.leadId}`);
        }
      }
    });

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {telefone ? (
        <a
          href={`https://wa.me/55${telefone}?text=${encodeURIComponent(texto)}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            setSituacao("chamado");
            start(async () => {
              await chamarBaseCury(id).catch(() => undefined);
              router.refresh();
            });
          }}
          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold ${situacao === "chamado" ? "bg-emerald-100 text-emerald-800" : "bg-[#25D366] text-white"}`}
        >
          {situacao === "chamado" ? (
            <Check size={13} />
          ) : (
            <MessageCircle size={13} />
          )}{" "}
          {situacao === "chamado" ? "Chamado" : "Chamar"}
        </a>
      ) : (
        <span className="text-xs font-semibold text-amber-700">
          sem celular
        </span>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={trazer}
        className="inline-flex items-center gap-1 rounded-lg bg-caixa px-2.5 py-1.5 text-xs font-bold text-white disabled:opacity-60"
      >
        {pending ? (
          <Loader2 size={13} className="animate-spin" />
        ) : aprovado ? (
          <BadgeCheck size={13} />
        ) : (
          <UserPlus size={13} />
        )}{" "}
        {aprovado ? "Trazer para Aprovados" : "Trazer para Leads"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setSituacao("descartado");
            await marcarBaseCury(id, "descartar").catch(() => undefined);
            router.refresh();
          })
        }
        className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-bold text-ink"
      >
        <XCircle size={13} /> Descartar
      </button>
      {erro && (
        <span className="text-xs font-semibold text-red-700">{erro}</span>
      )}
    </div>
  );
}
