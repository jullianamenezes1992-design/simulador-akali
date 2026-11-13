"use client";

import { useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  Calculator,
  Check,
  Copy,
  Loader2,
  MessageCircle,
} from "lucide-react";
import {
  registrarSimulacaoEnviada,
  simularProjetoLead,
} from "@/app/admin/actions";
import { formatBRL } from "@/lib/format";
import { regiaoLabel } from "@/lib/constants";

type Dev = {
  id: string;
  nome: string;
  bairro: string | null;
  regiao: string | null;
  preco_min: number | null;
};
type Resultado = Awaited<ReturnType<typeof simularProjetoLead>>;
type Ok = Extract<Resultado, { ok: true }>;

/** Etapa "Simulação": escolhe o projeto, calcula a simulação do cliente e monta a mensagem de WhatsApp. */
export default function SimulacaoProjeto({
  leadId,
  telefone,
  devs,
  escolhidoId,
}: {
  leadId: string;
  telefone: string;
  devs: Dev[];
  escolhidoId: string | null;
}) {
  const [busca, setBusca] = useState("");
  const [devId, setDevId] = useState(escolhidoId ?? "");
  const [res, setRes] = useState<Resultado | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [pending, start] = useTransition();

  const lista = useMemo(() => {
    const t = busca.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const n = (s: string | null) =>
      (s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return devs.filter(
      (d) =>
        !t ||
        n(d.nome).includes(t) ||
        n(d.bairro).includes(t) ||
        n(regiaoLabel(d.regiao)).includes(t),
    );
  }, [busca, devs]);

  const simular = (id: string) => {
    setDevId(id);
    setRes(null);
    if (!id) return;
    start(async () => setRes(await simularProjetoLead(leadId, id)));
  };

  const r = res && "ok" in res && res.ok ? (res as Ok) : null;
  const registrar = (como: "whatsapp" | "copiada") => {
    if (!r) return;
    registrarSimulacaoEnviada(leadId, {
      empreendimento: r.resumo.projeto,
      devId,
      preco: r.resumo.preco,
      entrada: r.resumo.entradaTotal,
      parcela: r.resumo.parcelaFinanciamento,
      como,
    }).catch(() => undefined);
  };
  const tel = `55${telefone.replace(/\D/g, "")}`;
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr]">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Filtrar por nome, bairro ou zona"
          className="input"
          aria-label="Filtrar projetos"
        />
        <select
          value={devId}
          onChange={(e) => simular(e.target.value)}
          className="input"
          aria-label="Projeto para simular"
        >
          <option value="">Escolha o projeto ({lista.length})</option>
          {lista.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nome}
              {d.bairro ? ` – ${d.bairro}` : ""}
              {d.preco_min ? ` – ${formatBRL(Number(d.preco_min))}` : ""}
            </option>
          ))}
        </select>
      </div>

      {pending && (
        <p className="flex items-center gap-2 text-sm text-ink-soft">
          <Loader2 size={16} className="animate-spin" /> Simulando…
        </p>
      )}
      {res && "erro" in res && res.erro && (
        <p className="rounded-lg bg-red-50 p-2 text-sm text-red-800">
          {res.erro}
        </p>
      )}

      {r && (
        <div className="rounded-xl border border-line p-3 text-sm">
          <p className="mb-2 flex items-center gap-1.5 font-bold">
            <Calculator size={16} className="text-caixa" /> {r.resumo.projeto}
            {r.resumo.faixa ? (
              <span className="font-normal text-ink-soft">
                {" "}
                · {r.resumo.faixa}
              </span>
            ) : null}
          </p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt className="text-ink-soft">Valor do imóvel</dt>
            <dd className="font-semibold">
              {formatBRL(r.resumo.preco)}
              {r.resumo.dorms ? ` (${r.resumo.dorms} dorm.)` : ""}
            </dd>
            <dt className="text-ink-soft">Financiamento estimado</dt>
            <dd>{formatBRL(r.resumo.financiamento)}</dd>
            {r.resumo.fgts > 0 && (
              <>
                <dt className="text-ink-soft">FGTS</dt>
                <dd>{formatBRL(r.resumo.fgts)}</dd>
              </>
            )}
            <dt className="text-ink-soft">Entrada</dt>
            <dd>
              {formatBRL(r.resumo.entradaTotal)}
              {r.resumo.ato ? ` · ato ${formatBRL(r.resumo.ato)}` : ""}
              {r.resumo.mesesObra
                ? ` + ${r.resumo.mesesObra}x ${formatBRL(r.resumo.parcelaObra)}`
                : ""}
              {r.resumo.mesesPos
                ? ` + ${r.resumo.mesesPos}x ${formatBRL(r.resumo.parcelaPos)} pós-chaves`
                : ""}
            </dd>
            {r.resumo.parcelaFinanciamento ? (
              <>
                <dt className="text-ink-soft">Parcela Caixa</dt>
                <dd>~{formatBRL(r.resumo.parcelaFinanciamento)}/mês</dd>
              </>
            ) : null}
            {r.resumo.subsidioPossivel > 0 && (
              <>
                <dt className="text-ink-soft">Subsídio possível</dt>
                <dd>
                  até {formatBRL(r.resumo.subsidioPossivel)} (reduz a entrada)
                </dd>
              </>
            )}
          </dl>
          {r.resumo.excede && (
            <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 p-2 text-amber-900">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" /> A entrada
              passa de 20% do imóvel ou de 30% da renda por mês. Confira antes
              de enviar ou escolha outro projeto.
            </p>
          )}
          {r.resumo.semAvaliacao && (
            <p className="mt-2 text-xs text-ink-soft">
              Projeto sem avaliação cadastrada: o financiamento não foi limitado
              a 80% da avaliação.
            </p>
          )}
          <details className="mt-2">
            <summary className="cursor-pointer text-xs font-semibold text-caixa">
              Ver a mensagem
            </summary>
            <p className="mt-2 whitespace-pre-wrap rounded-lg bg-mist p-2 text-sm">
              {r.texto}
            </p>
          </details>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`https://wa.me/${tel}?text=${encodeURIComponent(r.texto)}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => registrar("whatsapp")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 font-bold text-white"
            >
              <MessageCircle size={15} /> Enviar no WhatsApp
            </a>
            <button
              type="button"
              className="btn-secondary !py-1.5"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(r.texto);
                  registrar("copiada");
                  setCopiado(true);
                  setTimeout(() => setCopiado(false), 2000);
                } catch {
                  /* sem permissão */
                }
              }}
            >
              {copiado ? <Check size={15} /> : <Copy size={15} />}{" "}
              {copiado ? "Copiada!" : "Copiar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
