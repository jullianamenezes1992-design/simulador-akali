"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Check, ClipboardCopy, Eye, Loader2, RotateCcw, ShieldOff, Trash2 } from "lucide-react";
import { LEAD_STATUS, REGIOES } from "@/lib/constants";
import { adicionarNota, anonimizarLead, atualizarOrigem, excluirLead, excluirLeadDefinitivo, restaurarLead, atribuirResponsavel, atualizarStatusLead, revelarCPF, atualizarInteresse, type ActionState } from "@/app/admin/actions";

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

export function DeleteLeadButton({ leadId, nome }: { leadId: string; nome: string }) {
  const [pending, start] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        className="btn-danger"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Mover "${nome}" para a lixeira? Ele sai da lista, mas pode ser restaurado em até 30 dias em Leads → Lixeira.`)) return;
          start(async () => {
            try {
              await excluirLead(leadId);
            } catch (e) {
              // redirect() do Next também passa por aqui; só mostra erros reais
              if (e instanceof Error && !e.message.includes("NEXT_REDIRECT")) setErro(e.message);
            }
          });
        }}
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Mover para a lixeira
      </button>
      {erro && <p className="field-error">{erro}</p>}
    </div>
  );
}

export function CopiarAtendimentoButton({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      className="btn-secondary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
        } catch {
          // navegadores antigos: seleciona o texto num campo temporário
          const t = document.createElement("textarea");
          t.value = texto;
          document.body.appendChild(t);
          t.select();
          document.execCommand("copy");
          t.remove();
        }
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      }}
    >
      {copiado ? <Check size={16} /> : <ClipboardCopy size={16} />} {copiado ? "Copiado!" : "Copiar para atendimento"}
    </button>
  );
}

const ORIGENS = ["TikTok", "Instagram", "Facebook", "WhatsApp", "Google Ads", "Google (orgânico)", "Meta Ads", "Indicação", "Plantão / stand", "Base fria", "Direto"];

export function OrigemEditor({ leadId, atual }: { leadId: string; atual: string | null }) {
  const lista = atual && !ORIGENS.includes(atual) ? [atual, ...ORIGENS] : ORIGENS;
  const [valor, setValor] = useState(atual ?? "Direto");
  const [outra, setOutra] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const final = valor === "__outra" ? outra : valor;
  const mudou = final.trim() !== "" && final !== (atual ?? "");
  return (
    <div className="mb-3">
      <label className="label" htmlFor="origem_lead">Origem do cliente</label>
      <div className="flex flex-wrap gap-2">
        <select id="origem_lead" value={valor} onChange={(e) => { setValor(e.target.value); setMsg(null); }} className="input w-auto min-w-44">
          {lista.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
          <option value="__outra">Outra…</option>
        </select>
        {valor === "__outra" && (
          <input value={outra} onChange={(e) => setOutra(e.target.value)} maxLength={60} placeholder="Ex.: Feirão, panfleto" className="input w-auto min-w-44" aria-label="Outra origem" />
        )}
        {mudou && (
          <button
            type="button"
            className="btn-primary"
            disabled={pending}
            onClick={() =>
              start(async () => {
                try {
                  await atualizarOrigem(leadId, final);
                  setMsg("Origem salva.");
                } catch (e) {
                  setMsg(e instanceof Error ? e.message : "Erro ao salvar.");
                }
              })
            }
          >
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Salvar
          </button>
        )}
      </div>
      {msg && <p className="mt-1 text-xs text-ink-soft">{msg}</p>}
    </div>
  );
}

export function LixeiraItem({ id, nome, detalhe }: { id: string; nome: string; detalhe: string }) {
  const [pending, start] = useTransition();
  const [feito, setFeito] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  if (feito) return <li className="px-4 py-3 text-sm text-ink-soft">{feito}</li>;
  const run = (fn: () => Promise<void>, msg: string) =>
    start(async () => {
      try {
        await fn();
        setFeito(msg);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro.");
      }
    });
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="font-semibold">{nome}</p>
        <p className="text-xs text-ink-soft">{detalhe}</p>
        {erro && <p className="field-error">{erro}</p>}
      </div>
      <div className="flex gap-2">
        <button type="button" className="btn-primary" disabled={pending} onClick={() => run(() => restaurarLead(id), `${nome} foi restaurado(a) e voltou para a lista de Leads.`)}>
          {pending ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Restaurar
        </button>
        <button
          type="button"
          className="btn-secondary text-red-700"
          disabled={pending}
          onClick={() => {
            if (!confirm(`Apagar "${nome}" de vez? Isso não tem volta.`)) return;
            run(() => excluirLeadDefinitivo(id), `${nome} foi apagado(a) de vez.`);
          }}
        >
          <Trash2 size={14} /> Apagar de vez
        </button>
      </div>
    </li>
  );
}

export function InteresseEditor({
  leadId,
  regioes,
  bairro,
  dormitorios,
}: {
  leadId: string;
  regioes: string[];
  bairro: string | null;
  dormitorios: number | null;
}) {
  const [aberto, setAberto] = useState(false);
  const [sel, setSel] = useState<string[]>(regioes);
  const [bai, setBai] = useState(bairro ?? "");
  const [dorm, setDorm] = useState(dormitorios ? String(dormitorios) : "");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  if (!aberto)
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setAberto(true)} className="text-xs font-semibold text-caixa hover:underline">
          Corrigir região, bairro ou dormitórios
        </button>
        {msg && <span className="text-xs text-emerald-700">{msg}</span>}
      </div>
    );
  return (
    <div className="mt-3 rounded-xl border border-line p-3">
      <p className="label">Região de interesse</p>
      <div className="flex flex-wrap gap-2">
        {REGIOES.map((r) => (
          <label key={r.value} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm has-[:checked]:border-caixa has-[:checked]:bg-caixa/10">
            <input
              type="checkbox"
              className="accent-caixa"
              checked={sel.includes(r.value)}
              onChange={(e) => setSel((s) => (e.target.checked ? [...s, r.value] : s.filter((x) => x !== r.value)))}
            />
            {r.label}
          </label>
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
        <label>
          <span className="label">Bairro / detalhe</span>
          <input value={bai} onChange={(e) => setBai(e.target.value)} maxLength={200} placeholder="Ex.: Pirituba" className="input" />
        </label>
        <label>
          <span className="label">Dormitórios</span>
          <select value={dorm} onChange={(e) => setDorm(e.target.value)} className="input">
            <option value="">Indiferente</option>
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>{n}+</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="btn-primary"
          disabled={pending}
          onClick={() =>
            start(async () => {
              try {
                const r = await atualizarInteresse(leadId, { regioes: sel, bairro: bai, dormitorios: dorm ? Number(dorm) : null });
                setMsg(r.recomendados != null ? `Salvo! ${r.recomendados} imóvel(is) recomendado(s) com a nova região.` : "Salvo!");
                setAberto(false);
              } catch (e) {
                setMsg(e instanceof Error ? e.message : "Erro ao salvar.");
              }
            })
          }
        >
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Salvar
        </button>
        <button type="button" className="btn-secondary" onClick={() => setAberto(false)}>
          Cancelar
        </button>
      </div>
      {msg && <p className="mt-1 text-xs text-red-600">{msg}</p>}
    </div>
  );
}
