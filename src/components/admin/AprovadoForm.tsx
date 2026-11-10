"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { salvarAprovado } from "@/app/admin/actions";
import { CLASSIFICACOES, STATUS_APROVADO, type Aprovado } from "@/lib/aprovados";
import { REGIOES, TIPOS_RENDA } from "@/lib/constants";
import { formatBRL, maskMoney, maskPhone, parseMoney } from "@/lib/format";

type Faixa = { id: number; nome: string; renda_min: number; renda_max: number };
type LeadOpc = { id: string; nome: string; telefone: string };

const dinheiro = (v: number | null | undefined) => (v ? maskMoney(String(Math.round(Number(v) * 100))) : "");

export default function AprovadoForm({
  aprovado,
  inicial,
  faixas,
  leads,
}: {
  aprovado?: Aprovado | null;
  inicial?: Partial<Aprovado> | null;
  faixas: Faixa[];
  leads: LeadOpc[];
}) {
  const a = aprovado ?? inicial ?? {};
  const router = useRouter();
  const [estado, acao, pending] = useActionState(async (prev: Awaited<ReturnType<typeof salvarAprovado>>, fd: FormData) => {
    const r = await salvarAprovado(prev, fd);
    if (r.ok && r.id && !aprovado) router.push(`/admin/aprovados/${r.id}?novo=1`);
    return r;
  }, {});

  const [v, setV] = useState({
    renda: dinheiro(a.renda_familiar),
    financiamento: dinheiro(a.financiamento),
    subsidio: dinheiro(a.subsidio),
    fgts: dinheiro(a.fgts),
    entrada: dinheiro(a.entrada),
    parcela: dinheiro(a.parcela_max),
  });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV((s) => ({ ...s, [k]: maskMoney(e.target.value) }));
  const poder = ["financiamento", "subsidio", "fgts", "entrada"].reduce((t, k) => t + parseMoney(v[k as keyof typeof v]), 0);
  const faixa = useMemo(() => {
    const r = parseMoney(v.renda);
    return r > 0 ? faixas.find((f) => r >= f.renda_min && r <= f.renda_max) : null;
  }, [v.renda, faixas]);

  const campoDinheiro = (k: keyof typeof v, name: string, label: string, hint?: string) => (
    <label>
      <span className="label">{label}</span>
      <input name={name} value={v[k]} onChange={set(k)} inputMode="numeric" placeholder="R$ 0,00" className="input" />
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  );

  return (
    <form action={acao} className="card grid gap-4 p-4 sm:grid-cols-2">
      {aprovado && <input type="hidden" name="id" value={aprovado.id} />}

      {estado.erro && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-900 sm:col-span-2">{estado.erro}</p>}
      {estado.ok && aprovado && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900 sm:col-span-2">{estado.mensagem}</p>}

      <p className="text-xs font-bold uppercase tracking-wider text-caixa sm:col-span-2">Cliente</p>
      <label className="sm:col-span-2">
        <span className="label">Vincular a um cliente do CRM (opcional)</span>
        <select name="lead_id" defaultValue={a.lead_id ?? ""} className="input">
          <option value="">Não vincular</option>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nome} — {maskPhone(l.telefone)}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="label">Nome *</span>
        <input name="nome" required defaultValue={a.nome ?? ""} className="input" />
      </label>
      <label>
        <span className="label">WhatsApp *</span>
        <input name="telefone" required defaultValue={a.telefone ? maskPhone(a.telefone) : ""} inputMode="tel" placeholder="(11) 90000-0000" className="input" />
      </label>

      <p className="text-xs font-bold uppercase tracking-wider text-caixa sm:col-span-2">Aprovação</p>
      <label>
        <span className="label">Data da análise</span>
        <input name="data_analise" type="date" defaultValue={a.data_analise ?? ""} className="input" />
      </label>
      <label>
        <span className="label">Vencimento da aprovação</span>
        <input name="vencimento" type="date" defaultValue={a.vencimento ?? ""} className="input" />
      </label>
      <label>
        <span className="label">Tipo de renda</span>
        <select name="tipo_renda" defaultValue={a.tipo_renda ?? ""} className="input">
          <option value="">—</option>
          {TIPOS_RENDA.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>
      {campoDinheiro("renda", "renda_familiar", "Renda familiar", faixa ? `Faixa MCMV: ${faixa.nome}` : parseMoney(v.renda) > 0 ? "Fora das faixas do MCMV" : undefined)}
      {campoDinheiro("financiamento", "financiamento", "Financiamento aprovado")}
      {campoDinheiro("subsidio", "subsidio", "Subsídio")}
      {campoDinheiro("fgts", "fgts", "FGTS")}
      {campoDinheiro("entrada", "entrada", "Entrada à vista (recursos próprios)")}
      <label>
        <span className="label">Prazo (meses)</span>
        <input name="prazo_meses" defaultValue={a.prazo_meses ?? ""} inputMode="numeric" placeholder="420" className="input" />
      </label>
      {campoDinheiro("parcela", "parcela_max", "Parcela máxima")}

      <div className="rounded-2xl bg-caixa p-4 text-white sm:col-span-2">
        <p className="text-xs font-bold uppercase tracking-wider text-white/80">Recursos do cliente</p>
        <p className="font-display text-3xl font-black">{formatBRL(poder)}</p>
        <p className="text-xs text-white/80">
          Financiamento + subsídio + FGTS + entrada à vista. Nos projetos, o sistema ainda soma a entrada parcelada com a construtora (até 20% do imóvel, parcela até
          30% da renda{parseMoney(v.renda) > 0 ? ` = ${formatBRL(parseMoney(v.renda) * 0.3)}/mês` : ""}).
        </p>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-caixa sm:col-span-2">Números no Salesforce (Plano&amp;Plano)</p>
      <label>
        <span className="label">Oportunidade</span>
        <input name="oportunidade_sf" defaultValue={a.oportunidade_sf ?? ""} placeholder="006TT00000…" className="input" maxLength={40} />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label>
          <span className="label">AR (análise de crédito)</span>
          <input name="ar_numero" defaultValue={a.ar_numero ?? ""} placeholder="AR-1035002" className="input" maxLength={30} />
        </label>
        <label>
          <span className="label">AB (aprovação bancária)</span>
          <input name="ab_numero" defaultValue={a.ab_numero ?? ""} placeholder="AB-317630" className="input" maxLength={30} />
        </label>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-caixa sm:col-span-2">Interesse e atendimento</p>
      <fieldset className="sm:col-span-2">
        <legend className="label">Região de interesse</legend>
        <div className="flex flex-wrap gap-2">
          {REGIOES.map((r) => (
            <label key={r.value} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm has-[:checked]:border-caixa has-[:checked]:bg-caixa/10">
              <input type="checkbox" name="regioes" value={r.value} defaultChecked={a.regioes?.includes(r.value)} className="accent-caixa" /> {r.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        <span className="label">Dormitórios (mínimo)</span>
        <select name="dormitorios_min" defaultValue={a.dormitorios_min ?? ""} className="input">
          <option value="">Indiferente</option>
          <option value="1">1 ou mais</option>
          <option value="2">2 ou mais</option>
          <option value="3">3 ou mais</option>
        </select>
      </label>
      <label>
        <span className="label">Classificação</span>
        <select name="classificacao" defaultValue={a.classificacao ?? "morno"} className="input">
          {CLASSIFICACOES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span className="label">Status</span>
        <select name="status" defaultValue={a.status ?? "ativo"} className="input">
          {STATUS_APROVADO.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </label>
      <span className="hidden sm:block" />
      <label className="sm:col-span-2">
        <span className="label">Observações</span>
        <textarea name="observacoes" rows={4} defaultValue={a.observacoes ?? ""} className="input" />
      </label>

      <div className="sm:col-span-2">
        <button className="btn-primary" disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {aprovado ? "Salvar alterações" : "Cadastrar aprovado"}
        </button>
      </div>
    </form>
  );
}
