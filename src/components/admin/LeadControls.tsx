"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Eye, Loader2, ShieldOff } from "lucide-react";
import { LEAD_STATUS } from "@/lib/constants";
import { adicionarNota, anonimizarLead, atribuirResponsavel, atualizarStatusLead, revelarCPF, type ActionState } from "@/app/admin/actions";

export function StatusSelect({ leadId, status }: { leadId: string; status: string }) {
  const [pending, start] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  return (
    <div>
      <label className="label" htmlFor="status">Etapa comercial</label>
      <div className="flex items-center gap-2">
        <select
          id="status"
          defaultValue={status}
          disabled={pending}
          onChange={(e) => {
            const v = e.target.value;
            setErro(null);
            start(async () => {
              try {
                await atualizarStatusLead(leadId, v);
              } catch (err) {
                setErro(err instanceof Error ? err.message : "Erro ao salvar");
              }
            });
          }}
          className="input"
        >
          {LEAD_STATUS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {pending && <Loader2 size={16} className="animate-spin text-caixa" />}
      </div>
      {erro && <p className="field-error">{erro}</p>}
    </div>
  );
}

export function ResponsavelSelect({ leadId, atual, equipe }: { leadId: string; atual: string | null; equipe: { user_id: string; nome: string }[] }) {
  const [pending, start] = useTransition();
  return (
    <div>
      <label className="label" htmlFor="resp">Responsável</label>
      <select
        id="resp"
        defaultValue={atual ?? ""}
        disabled={pending}
        onChange={(e) => start(() => atribuirResponsavel(leadId, e.target.value || null))}
        className="input"
      >
        <option value="">Sem responsável</option>
        {equipe.map((p) => (
          <option key={p.user_id} value={p.user_id}>{p.nome}</option>
        ))}
      </select>
    </div>
  );
}

export function RevealCPF({ leadId, final }: { leadId: string; final: string | null }) {
  const [cpf, setCpf] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (!final) return <span>—</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="font-mono">{cpf ?? `***.***.***-${final}`}</span>
      {!cpf && (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await revelarCPF(leadId);
              if (r.cpf) setCpf(r.cpf);
              else setErro(r.erro ?? "Erro");
            })
          }
          className="inline-flex items-center gap-1 text-xs font-semibold text-caixa hover:underline"
          title="A visualização fica registrada no histórico"
        >
          {pending ? <Loader2 size={12} className="animate-spin" /> : <Eye size={12} />} Ver CPF
        </button>
      )}
      {erro && <span className="text-xs text-red-600">{erro}</span>}
    </span>
  );
}

export function NoteForm({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(adicionarNota, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-2">
      <input type="hidden" name="lead_id" value={leadId} />
      <textarea name="texto" rows={3} required maxLength={4000} placeholder="Registrar contato, retorno, documentos pendentes…" className="input" />
      {state.erro && <p className="field-error">{state.erro}</p>}
      <button className="btn-primary" disabled={pending}>
        {pending && <Loader2 size={14} className="animate-spin" />} Adicionar observação
      </button>
    </form>
  );
}

export function AnonymizeButton({ leadId }: { leadId: string }) {
  const [pending, start] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        className="btn-danger"
        disabled={pending}
        onClick={() => {
          if (!confirm("Anonimizar este cadastro? Nome, contatos, CPF e observações serão apagados de forma definitiva (LGPD).")) return;
          start(async () => {
            try {
              await anonimizarLead(leadId);
            } catch (e) {
              setErro(e instanceof Error ? e.message : "Erro");
            }
          });
        }}
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <ShieldOff size={14} />} Anonimizar dados (LGPD)
      </button>
      {erro && <p className="field-error">{erro}</p>}
    </div>
  );
}
