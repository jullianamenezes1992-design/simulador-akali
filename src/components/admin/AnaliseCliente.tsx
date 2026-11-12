"use client";

import { useActionState, useState } from "react";
import { Loader2, Pencil, Save } from "lucide-react";
import { salvarAnalise } from "@/app/admin/actions";

type Dados = {
  ar_status: string | null;
  parecer_reprovacao: string | null;
  motivo_reprovacao: string | null;
  reprovado_em: string | null;
  reanalise_em: string | null;
  pendencias: string | null;
};

const br = (d: string | null) => (d ? d.split("-").reverse().join("/") : "—");

/** Quadro "Análise" da ficha: o que falta na pasta, resultado da AR e, se reprovado, motivo e data para tentar de novo. */
export default function AnaliseCliente({ leadId, dados }: { leadId: string; dados: Dados }) {
  const [editando, setEditando] = useState(false);
  const [estado, acao, pending] = useActionState(async (prev: Awaited<ReturnType<typeof salvarAnalise>>, fd: FormData) => {
    const r = await salvarAnalise(leadId, prev, fd);
    if (r.ok) setEditando(false);
    return r;
  }, {});

  if (!editando)
    return (
      <div className="space-y-1.5 text-sm">
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 [overflow-wrap:anywhere]">
          <span className="text-ink-soft">O que falta</span>
          <span>{dados.pendencias ?? "—"}</span>
          <span className="text-ink-soft">Status da AR</span>
          <span>{dados.ar_status ?? "—"}</span>
          {(dados.parecer_reprovacao || dados.motivo_reprovacao) && (
            <>
              <span className="text-ink-soft">Reprovação</span>
              <span>
                {dados.parecer_reprovacao ? <b>{dados.parecer_reprovacao}</b> : null}
                {dados.reprovado_em ? ` · ${br(dados.reprovado_em)}` : ""}
                {dados.motivo_reprovacao ? <span className="mt-1 block whitespace-pre-line rounded-lg bg-mist p-2">{dados.motivo_reprovacao}</span> : null}
              </span>
            </>
          )}
          <span className="text-ink-soft">Nova análise</span>
          <span>{br(dados.reanalise_em)}</span>
        </div>
        {estado.ok && <p className="text-xs font-semibold text-emerald-700">{estado.mensagem}</p>}
        <button type="button" onClick={() => setEditando(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-caixa hover:underline">
          <Pencil size={12} /> Editar análise
        </button>
      </div>
    );

  return (
    <form action={acao} className="grid gap-3 text-sm sm:grid-cols-2">
      <label className="sm:col-span-2">
        <span className="label">O que falta na pasta</span>
        <input name="pendencias" defaultValue={dados.pendencias ?? ""} maxLength={1000} placeholder="Ex.: holerite de outubro, comprovante de residência" className="input" />
      </label>
      <label>
        <span className="label">Status da AR</span>
        <input name="ar_status" defaultValue={dados.ar_status ?? ""} maxLength={60} placeholder="Aprovado, Pendente, Reprovado…" className="input" />
      </label>
      <label>
        <span className="label">Motivo resumido (reprovação)</span>
        <input name="parecer_reprovacao" defaultValue={dados.parecer_reprovacao ?? ""} maxLength={200} placeholder="Ex.: Serasa, renda insuficiente" className="input" />
      </label>
      <label className="sm:col-span-2">
        <span className="label">Detalhes do parecer</span>
        <textarea name="motivo_reprovacao" rows={3} defaultValue={dados.motivo_reprovacao ?? ""} maxLength={2000} className="input" />
      </label>
      <label>
        <span className="label">Reprovado em</span>
        <input name="reprovado_em" type="date" defaultValue={dados.reprovado_em ?? ""} className="input" />
      </label>
      <label>
        <span className="label">Tentar nova análise em</span>
        <input name="reanalise_em" type="date" defaultValue={dados.reanalise_em ?? ""} className="input" />
      </label>
      {estado.erro && <p className="text-xs font-semibold text-red-600 sm:col-span-2">{estado.erro}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button className="btn-primary" disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar
        </button>
        <button type="button" className="btn-secondary" onClick={() => setEditando(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
