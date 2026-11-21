"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import EnviarOferta from "@/components/admin/EnviarOferta";
import {
  categoriasPermitidas,
  mensagemOferta,
  podeComprarUnidade,
  preSimulacao,
  type Aprovado,
  type DevCompat,
  type RegraEntrada,
} from "@/lib/aprovados";
import { formatBRL } from "@/lib/format";

/**
 * "Simular outro tipo de unidade": a oferta padrão continua sendo a unidade mais barata;
 * aqui dá para escolher outro tipo (maior, com vaga…) e mandar a simulação dele.
 */
export default function OutraUnidade({
  aprovado,
  dev,
  regra,
  link,
  assinatura,
  jaEnviada,
}: {
  aprovado: Aprovado;
  dev: DevCompat;
  regra: RegraEntrada;
  link: string;
  assinatura: string;
  jaEnviada: string | null;
}) {
  // só os tipos de unidade em que o cliente se enquadra pela renda
  const todos = dev.tipologias ?? [];
  const tipos = todos.filter((t) =>
    podeComprarUnidade(aprovado.renda_familiar, t.enquadramento),
  );
  const filtrou = tipos.length < todos.length;
  const [aberto, setAberto] = useState(false);
  const [i, setI] = useState<number>(-1);
  const t = i >= 0 ? tipos[i] : null;
  const ps = t ? preSimulacao(aprovado, dev, regra, new Date(), t) : null;
  if (tipos.length < 2) return null;

  if (!aberto)
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-caixa hover:underline"
      >
        <Layers size={13} /> Simular outro tipo de unidade
      </button>
    );

  return (
    <div className="mt-1 w-full rounded-xl border border-line bg-mist/50 p-3 text-sm">
      <label className="block">
        <span className="label">Tipo de unidade</span>
        <select
          value={i}
          onChange={(e) => setI(Number(e.target.value))}
          className="input"
        >
          <option value={-1}>Escolha…</option>
          {tipos.map((u, k) => (
            <option key={k} value={k}>
              {u.rotulo} — a partir de {formatBRL(u.preco)}
              {u.qtd != null ? ` (${u.qtd} disp.)` : ""}
            </option>
          ))}
        </select>
      </label>
      {filtrou && (
        <p className="mt-1 text-xs text-ink-soft">
          Pela renda, este cliente só pode comprar unidades{" "}
          {categoriasPermitidas(aprovado.renda_familiar).join(", ")}. As outras
          categorias ficaram de fora.
        </p>
      )}
      {ps && (
        <div className="mt-2 space-y-1 text-xs">
          <p>
            Financiamento: <b>{formatBRL(ps.financiamento)}</b> · Entrada:{" "}
            <b>{formatBRL(ps.entradaTotal)}</b>
            {ps.aParcelar > 0 && (
              <>
                {" "}
                (a parcelar <b>{formatBRL(ps.aParcelar)}</b>)
              </>
            )}
          </p>
          {ps.atoExtra > 0 ? (
            <p className="font-semibold text-amber-900">
              ⚠️ Não fecha só com o parcelamento: faltam{" "}
              {formatBRL(ps.atoExtra)}, somados ao ato ({formatBRL(ps.ato)}).
            </p>
          ) : (
            <p className="text-emerald-800">
              ✅ Cabe nas regras de entrada parcelada.
            </p>
          )}
          <EnviarOferta
            aprovadoId={aprovado.id}
            telefone={aprovado.telefone}
            devNome={dev.nome}
            devId={dev.id}
            jaEnviada={jaEnviada}
            rotulo="Enviar esta simulação"
            texto={mensagemOferta(aprovado, dev, link, assinatura, ps)}
          />
        </div>
      )}
    </div>
  );
}
