"use client";

import { useActionState, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { salvarParametros, type ActionState } from "@/app/admin/actions";
import { simular } from "@/lib/simulacao/engine";
import type { FaixaParam, SimulationParams } from "@/lib/simulacao/types";
import { formatBRL } from "@/lib/format";
import { Feedback } from "./ui";

const N = (v: string) => (v.trim() === "" ? NaN : Number(v.replace(",", ".")));

export default function ParamsEditor({ inicial }: { inicial: SimulationParams }) {
  const [p, setP] = useState<SimulationParams>(() => ({
    ...inicial,
    entrada_parcelada: inicial.entrada_parcelada ?? {
      pct_max: null,
      comprometimento: inicial.comprometimento_renda_max,
      meses_lancamento: 30,
      meses_obras: 12,
    },
  }));
  const ep = p.entrada_parcelada!;
  const setEp = (k: keyof NonNullable<SimulationParams["entrada_parcelada"]>, v: number | null) =>
    setP((x) => ({ ...x, entrada_parcelada: { ...x.entrada_parcelada!, [k]: v } }));
  const pct = (v: number | null) => (v == null || !Number.isFinite(v) ? "" : String(Math.round(v * 10000) / 100));
  const [state, action, pending] = useActionState<ActionState, FormData>(salvarParametros, {});
  const [teste, setTeste] = useState({ renda: "4000", idade: "30", fgts: "10000", entrada: "5000" });

  const setF = (i: number, k: keyof FaixaParam, v: string) =>
    setP((x) => ({ ...x, faixas: x.faixas.map((f, j) => (j === i ? { ...f, [k]: k === "nome" ? v : N(v) } : f)) }));

  let previa: ReturnType<typeof simular> | null = null;
  try {
    previa = simular(
      {
        rendaPrincipal: Number(teste.renda) || 0,
        rendaComposicao: 0,
        idadeMeses: (Number(teste.idade) || 30) * 12,
        fgtsSaldo: Number(teste.fgts) || 0,
        fgtsTresAnos: true,
        entrada: Number(teste.entrada) || 0,
        possuiImovel: false,
        financiamentoAtivo: false,
        jaBeneficiado: false,
        restricaoCredito: "nao",
      },
      p
    );
  } catch {
    previa = null;
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="params" value={JSON.stringify(p)} />

      <section className="card grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <h2 className="font-bold sm:col-span-2 lg:col-span-3">Regras gerais</h2>
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="label" htmlFor="localidade">Localidade de referência</label>
          <input id="localidade" value={p.localidade ?? ""} onChange={(e) => setP({ ...p, localidade: e.target.value })} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="comp">Comprometimento máx. da renda (%)</label>
          <input
            id="comp"
            inputMode="decimal"
            value={Number.isFinite(p.comprometimento_renda_max) ? Math.round(p.comprometimento_renda_max * 10000) / 100 : ""}
            onChange={(e) => setP({ ...p, comprometimento_renda_max: N(e.target.value) / 100 })}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="prazo">Prazo máximo (meses)</label>
          <input id="prazo" inputMode="numeric" value={p.prazo_max_meses} onChange={(e) => setP({ ...p, prazo_max_meses: N(e.target.value) })} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="idmax">Idade máx. na quitação (meses)</label>
          <input
            id="idmax"
            inputMode="numeric"
            value={p.idade_max_quitacao_meses ?? ""}
            onChange={(e) => setP({ ...p, idade_max_quitacao_meses: e.target.value === "" ? null : N(e.target.value) })}
            className="input"
          />
          <p className="hint">966 = 80 anos e 6 meses. Vazio = não aplicar.</p>
        </div>
        <div>
          <label className="label" htmlFor="idmin">Idade mínima (anos)</label>
          <input id="idmin" inputMode="numeric" value={p.idade_min_anos} onChange={(e) => setP({ ...p, idade_min_anos: N(e.target.value) })} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="sist">Sistema de amortização</label>
          <select id="sist" value={p.sistema_amortizacao} onChange={(e) => setP({ ...p, sistema_amortizacao: e.target.value as "SAC" | "PRICE" })} className="input">
            <option value="SAC">SAC (1ª parcela)</option>
            <option value="PRICE">PRICE (parcela fixa)</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="taxa">Taxa usada na estimativa</label>
          <select id="taxa" value={p.taxa_referencia} onChange={(e) => setP({ ...p, taxa_referencia: e.target.value as "min" | "max" })} className="input">
            <option value="max">Maior taxa da faixa (conservador)</option>
            <option value="min">Menor taxa da faixa</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="cota">Cota máx. de financiamento (%)</label>
          <input
            id="cota"
            inputMode="decimal"
            value={p.cota_financiamento_max == null ? "" : Math.round(p.cota_financiamento_max * 10000) / 100}
            onChange={(e) => setP({ ...p, cota_financiamento_max: e.target.value === "" ? null : N(e.target.value) / 100 })}
            className="input"
            placeholder="Não aplicar"
          />
          <p className="hint">Preencha com o percentual informado pelo correspondente.</p>
        </div>
        <label className="option self-end">
          <input type="checkbox" checked={p.fgts_exige_3_anos} onChange={(e) => setP({ ...p, fgts_exige_3_anos: e.target.checked })} className="accent-caixa" />
          FGTS exige 3 anos de trabalho
        </label>
        <div>
          <label className="label" htmlFor="dataref">Data de referência</label>
          <input id="dataref" type="date" value={p.data_referencia ?? ""} onChange={(e) => setP({ ...p, data_referencia: e.target.value })} className="input" />
        </div>
      </section>

      <section className="card grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-4">
          <h2 className="font-bold">Entrada parcelada na obra</h2>
          <p className="hint">
            Considera que parte do preço pode ser paga à construtora em parcelas até a entrega das chaves. Só vale para
            imóveis na planta ou em obras. Deixe o percentual vazio para não considerar.
          </p>
        </div>
        <div>
          <label className="label" htmlFor="ep_pct">Até quanto do preço (%)</label>
          <input id="ep_pct" inputMode="decimal" value={pct(ep.pct_max)} placeholder="Não considerar"
            onChange={(e) => setEp("pct_max", e.target.value === "" ? null : N(e.target.value) / 100)} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="ep_comp">Parcela máx. por mês (% da renda)</label>
          <input id="ep_comp" inputMode="decimal" value={pct(ep.comprometimento)}
            onChange={(e) => setEp("comprometimento", N(e.target.value) / 100)} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="ep_ml">Nº de parcelas — lançamento</label>
          <input id="ep_ml" inputMode="numeric" value={Number.isFinite(ep.meses_lancamento) ? ep.meses_lancamento : ""}
            onChange={(e) => setEp("meses_lancamento", N(e.target.value))} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="ep_mo">Nº de parcelas — em obras</label>
          <input id="ep_mo" inputMode="numeric" value={Number.isFinite(ep.meses_obras) ? ep.meses_obras : ""}
            onChange={(e) => setEp("meses_obras", N(e.target.value))} className="input" />
          <p className="hint">Usado quando o empreendimento não tem previsão de entrega cadastrada.</p>
        </div>
      </section>

      <section className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Faixas de renda</h2>
          <button
            type="button"
            className="btn-secondary min-h-9 px-3 py-1.5"
            onClick={() =>
              setP({
                ...p,
                faixas: [
                  ...p.faixas,
                  { id: Math.max(0, ...p.faixas.map((f) => f.id)) + 1, nome: "Nova faixa", renda_min: NaN, renda_max: NaN, juros_min: NaN, juros_max: NaN, teto_imovel: NaN, subsidio_max: 0 },
                ],
              })
            }
          >
            <Plus size={14} /> Faixa
          </button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="text-left text-xs text-ink-soft">
              <tr>
                <th className="pb-2">ID</th>
                <th className="pb-2">Nome</th>
                <th className="pb-2">Renda de (R$)</th>
                <th className="pb-2">Renda até (R$)</th>
                <th className="pb-2">Juros mín. (%)</th>
                <th className="pb-2">Juros máx. (%)</th>
                <th className="pb-2">Teto imóvel (R$)</th>
                <th className="pb-2">Subsídio máx. (R$)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {p.faixas.map((f, i) => (
                <tr key={i}>
                  {(["id", "nome", "renda_min", "renda_max", "juros_min", "juros_max", "teto_imovel", "subsidio_max"] as const).map((k) => (
                    <td key={k} className="pr-2 pb-2">
                      <input
                        value={typeof f[k] === "number" && Number.isNaN(f[k]) ? "" : String(f[k])}
                        onChange={(e) => setF(i, k, e.target.value)}
                        inputMode={k === "nome" ? "text" : "decimal"}
                        className={`input min-h-9 py-1.5 ${k === "id" ? "w-14" : k === "nome" ? "w-44" : "w-28"}`}
                        aria-label={`${k} da faixa ${i + 1}`}
                      />
                    </td>
                  ))}
                  <td className="pb-2">
                    <button
                      type="button"
                      aria-label="Remover faixa"
                      onClick={() => setP({ ...p, faixas: p.faixas.filter((_, j) => j !== i) })}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint">O ID da faixa é o número usado no cadastro dos empreendimentos (Faixa 1, 2, 3…).</p>
      </section>

      <section className="card grid gap-4 p-4">
        <h2 className="font-bold">Fontes e observações</h2>
        <textarea
          rows={3}
          value={(p.fontes ?? []).map((f) => `${f.descricao} | ${f.url}`).join("\n")}
          onChange={(e) =>
            setP({
              ...p,
              fontes: e.target.value
                .split("\n")
                .map((l) => l.split("|").map((s) => s.trim()))
                .filter((x) => x[0])
                .map(([descricao, url]) => ({ descricao, url: url ?? "" })),
            })
          }
          className="input font-mono text-xs"
          aria-label="Fontes"
          placeholder="Descrição | https://link-da-fonte"
        />
        <textarea rows={3} value={p.observacoes ?? ""} onChange={(e) => setP({ ...p, observacoes: e.target.value })} className="input" aria-label="Observações" />
      </section>

      <section className="card p-4">
        <h2 className="font-bold">Teste rápido</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              ["renda", "Renda familiar"],
              ["idade", "Idade"],
              ["fgts", "FGTS"],
              ["entrada", "Entrada"],
            ] as const
          ).map(([k, l]) => (
            <div key={k}>
              <label className="label">{l}</label>
              <input inputMode="numeric" value={teste[k]} onChange={(e) => setTeste({ ...teste, [k]: e.target.value.replace(/\D/g, "") })} className="input" />
            </div>
          ))}
        </div>
        {previa && (
          <p className="mt-3 text-sm">
            <strong>{previa.faixa?.nome ?? "Fora do programa"}</strong> • financiamento {formatBRL(previa.financiamentoMax)} • parcela até{" "}
            {formatBRL(previa.parcelaMax)} • imóvel até {formatBRL(previa.capacidadeSemSubsidio)} (com subsídio máx.:{" "}
            {formatBRL(previa.capacidadeComSubsidio)})
            {previa.entradaParcelada && (
              <> • entrada parcelada na obra: até {formatBRL(previa.entradaParcelada.parcelaMensalMax)}/mês, limitada a{" "}
                {Math.round(previa.entradaParcelada.pctMax * 100)}% do preço</>
            )}
          </p>
        )}
      </section>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <input name="descricao" placeholder="Descrição da versão (ex.: Portaria nº …)" className="input max-w-sm" />
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="ativar" defaultChecked className="h-4 w-4 accent-caixa" /> Ativar ao salvar
        </label>
        <button className="btn-primary" disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar nova versão
        </button>
        <div className="w-full">
          <Feedback erro={state.erro} mensagem={state.ok ? state.mensagem : undefined} />
        </div>
      </div>
    </form>
  );
}
