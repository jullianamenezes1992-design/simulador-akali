"use client";

import { useActionState, useState } from "react";
import { Check, Loader2, Pencil } from "lucide-react";
import { atualizarDadosLead, type ActionState } from "@/app/admin/actions";
import { ESTADOS_CIVIS, RELACOES_COMPOSICAO, VINCULOS } from "@/lib/constants";

type Dados = {
  nome: string;
  email: string | null;
  idade: number | null;
  temNascimento: boolean;
  estado_civil: string | null;
  profissao: string | null;
  tipo_renda: string | null;
  renda_principal: number;
  compor_renda: boolean;
  relacao_composicao: string | null;
  renda_composicao: number;
  fgts_saldo: number;
};

const br = (n: number) => (n ? n.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : "");

/** Editar dados do cliente (ex.: quem respondeu da Base fria): renda, idade, FGTS… e refaz a simulação. */
export default function DadosClienteEditor({ leadId, dados, abrir = false }: { leadId: string; dados: Dados; abrir?: boolean }) {
  const [aberto, setAberto] = useState(abrir);
  const [compor, setCompor] = useState(dados.compor_renda);
  const [state, action, pending] = useActionState<ActionState, FormData>(atualizarDadosLead.bind(null, leadId), {});

  if (!aberto)
    return (
      <button type="button" onClick={() => setAberto(true)} className="inline-flex items-center gap-1 text-sm font-semibold text-caixa hover:underline">
        <Pencil size={14} /> Editar dados do cliente
      </button>
    );

  return (
    <form action={action} className="space-y-3 rounded-xl border border-line p-3 text-sm">
      <p className="font-bold">Editar dados do cliente</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="label">Nome</span>
          <input name="nome" defaultValue={dados.nome} required maxLength={120} className="input" />
        </label>
        <label className="block">
          <span className="label">E-mail</span>
          <input name="email" type="email" defaultValue={dados.email ?? ""} maxLength={200} className="input" />
        </label>
        <label className="block">
          <span className="label">Idade {dados.temNascimento && <span className="font-normal text-ink-soft">(calculada pelo nascimento)</span>}</span>
          <input name="idade" type="number" min={16} max={100} defaultValue={dados.idade ?? ""} disabled={dados.temNascimento} className="input" />
        </label>
        <label className="block">
          <span className="label">Estado civil</span>
          <select name="estado_civil" defaultValue={dados.estado_civil ?? ""} className="input">
            <option value="">—</option>
            {ESTADOS_CIVIS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Profissão</span>
          <input name="profissao" defaultValue={dados.profissao ?? ""} maxLength={120} className="input" />
        </label>
        <label className="block">
          <span className="label">Tipo de renda</span>
          <select name="vinculo" defaultValue={dados.tipo_renda ?? ""} className="input">
            <option value="">—</option>
            {VINCULOS.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Renda do cliente (R$/mês)</span>
          <input name="renda" inputMode="decimal" defaultValue={br(dados.renda_principal)} placeholder="Ex.: 3.500" className="input" />
        </label>
        <label className="block">
          <span className="label">Saldo de FGTS (R$)</span>
          <input name="fgts" inputMode="decimal" defaultValue={br(dados.fgts_saldo)} placeholder="0 se não tiver" className="input" />
        </label>
      </div>

      <fieldset className="space-y-2">
        <legend className="label">Vai compor renda com alguém?</legend>
        <div className="flex gap-4">
          <label className="inline-flex items-center gap-1.5">
            <input type="radio" name="compor_renda" value="sim" checked={compor} onChange={() => setCompor(true)} /> Sim
          </label>
          <label className="inline-flex items-center gap-1.5">
            <input type="radio" name="compor_renda" value="nao" checked={!compor} onChange={() => setCompor(false)} /> Não
          </label>
        </div>
        {compor && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="label">Com quem</span>
              <select name="relacao_composicao" defaultValue={dados.relacao_composicao ?? ""} className="input">
                <option value="">—</option>
                {RELACOES_COMPOSICAO.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Renda dessa pessoa (R$/mês)</span>
              <input name="renda_composicao" inputMode="decimal" defaultValue={br(dados.renda_composicao)} className="input" />
            </label>
          </div>
        )}
      </fieldset>

      <p className="text-xs text-ink-soft">Com renda e idade preenchidas, o CRM refaz a simulação e a lista de imóveis compatíveis.</p>
      {state.erro && <p className="field-error">{state.erro}</p>}
      {state.ok && (
        <p className="flex items-center gap-1 text-sm font-semibold text-emerald-700">
          <Check size={15} /> {state.mensagem}
        </p>
      )}
      <div className="flex gap-2">
        <button className="btn-primary" disabled={pending}>
          {pending && <Loader2 size={14} className="animate-spin" />} Salvar dados
        </button>
        <button type="button" onClick={() => setAberto(false)} className="btn-secondary">
          Fechar
        </button>
      </div>
    </form>
  );
}
