"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, X } from "lucide-react";
import { criarContatoRedes } from "@/app/admin/actions";
import { LEAD_STATUS, REDES, REGIOES, RELACOES_COMPOSICAO, VINCULOS } from "@/lib/constants";

const hojeSP = () => new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });

export default function NovoContatoRedes() {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, pending] = useActionState(criarContatoRedes, {});
  const [compor, setCompor] = useState(false);
  const [fgts, setFgts] = useState("");
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) form.current?.reset();
  }, [estado]);

  if (!aberto)
    return (
      <button type="button" className="btn-primary" onClick={() => setAberto(true)}>
        <Plus size={16} /> Novo contato das redes
      </button>
    );

  return (
    <section className="card w-full p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Novo contato das redes</h2>
        <button type="button" onClick={() => setAberto(false)} className="rounded-lg p-1 text-ink-soft hover:bg-mist" aria-label="Fechar">
          <X size={20} />
        </button>
      </div>

      {estado.ok && (
        <p className="mb-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {estado.mensagem}{" "}
          {estado.leadId && (
            <Link href={`/admin/leads/${estado.leadId}`} className="font-bold underline">
              Abrir ficha
            </Link>
          )}
        </p>
      )}
      {estado.erro && (
        <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-900">
          {estado.erro}{" "}
          {estado.leadId && (
            <Link href={`/admin/leads/${estado.leadId}`} className="font-bold underline">
              Abrir ficha existente
            </Link>
          )}
        </p>
      )}

      <form
        ref={form}
        action={acao}
        onReset={() => {
          setCompor(false);
          setFgts("");
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-caixa sm:col-span-2">Contato</p>
        <label className="sm:col-span-2">
          <span className="label">Nome *</span>
          <input name="nome" required className="input" autoComplete="off" />
        </label>
        <label>
          <span className="label">WhatsApp *</span>
          <input name="telefone" required inputMode="tel" placeholder="11 91234-5678" className="input" autoComplete="off" />
        </label>
        <label>
          <span className="label">Data do contato</span>
          <input name="data_contato" type="date" defaultValue={hojeSP()} className="input" />
        </label>

        <p className="text-xs font-bold uppercase tracking-wider text-caixa sm:col-span-2">Perfil</p>
        <label>
          <span className="label">Renda bruta mensal (R$)</span>
          <input name="renda" inputMode="decimal" placeholder="3.500" className="input" />
        </label>
        <label>
          <span className="label">Idade</span>
          <input name="idade" inputMode="numeric" placeholder="32" className="input" />
        </label>
        <label>
          <span className="label">Compõe renda com alguém?</span>
          <select name="compor_renda" className="input" onChange={(e) => setCompor(e.target.value === "sim")}>
            <option value="nao">Não, sozinho(a)</option>
            <option value="sim">Sim</option>
          </select>
        </label>
        {compor ? (
          <div className="grid grid-cols-2 gap-2">
            <label>
              <span className="label">Com quem</span>
              <select name="relacao_composicao" className="input">
                {RELACOES_COMPOSICAO.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">Renda dela(e)</span>
              <input name="renda_composicao" inputMode="decimal" placeholder="2.000" className="input" />
            </label>
          </div>
        ) : (
          <span className="hidden sm:block" />
        )}
        <label>
          <span className="label">Tem FGTS?</span>
          <select name="fgts" className="input" value={fgts} onChange={(e) => setFgts(e.target.value)}>
            <option value="">—</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
            <option value="nao_sei">Não sabe</option>
          </select>
        </label>
        <label>
          <span className="label">Valor do FGTS (R$)</span>
          <input name="fgts_valor" inputMode="decimal" placeholder="opcional" className="input" disabled={fgts !== "sim"} />
        </label>
        <label>
          <span className="label">Vínculo</span>
          <select name="vinculo" className="input">
            <option value="">—</option>
            {VINCULOS.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Profissão</span>
          <input name="profissao" placeholder="Ex.: motorista de aplicativo" className="input" />
        </label>

        <p className="text-xs font-bold uppercase tracking-wider text-caixa sm:col-span-2">Interesse</p>
        <fieldset className="sm:col-span-2">
          <legend className="label">Região de interesse</legend>
          <div className="flex flex-wrap gap-2">
            {REGIOES.map((r) => (
              <label key={r.value} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm has-[:checked]:border-caixa has-[:checked]:bg-caixa/10">
                <input type="checkbox" name="regioes" value={r.value} className="accent-caixa" /> {r.label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="sm:col-span-2">
          <span className="label">Bairro / detalhe da região</span>
          <input name="regiao_detalhe" placeholder="Artur Alvim, perto do metrô…" className="input" />
        </label>
        <label>
          <span className="label">Veio de qual rede? *</span>
          <select name="origem" className="input" defaultValue="Instagram">
            {REDES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Vídeo ou post</span>
          <input name="conteudo" placeholder="Tour 34 m² Jaçanã" className="input" />
        </label>
        <label>
          <span className="label">Etapa</span>
          <select name="status" className="input" defaultValue="novo">
            {LEAD_STATUS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
        <span className="hidden sm:block" />
        <label>
          <span className="label">Próximo passo</span>
          <input name="proximo_passo" placeholder="Enviar simulação" className="input" />
        </label>
        <label>
          <span className="label">Me lembrar no dia (opcional)</span>
          <input name="proximo_dia" type="date" className="input" />
        </label>
        <label className="sm:col-span-2">
          <span className="label">Observações</span>
          <textarea name="obs" rows={3} placeholder="O que procura, dúvidas, restrições…" className="input" />
        </label>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Salvar contato
          </button>
          <p className="text-xs text-ink-soft">Com renda e idade preenchidas, o sistema já calcula a estimativa e os imóveis compatíveis.</p>
        </div>
      </form>
    </section>
  );
}
