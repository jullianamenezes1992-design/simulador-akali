"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatBRL, maskMoney, parseMoney } from "@/lib/format";
import { trackEvent } from "@/lib/tracking";

export interface FaixaResumo {
  id: number;
  nome: string;
  renda_min: number;
  renda_max: number;
  teto_imovel: number;
  juros_min: number;
  subsidio_max: number;
}

/** Calculadora da página inicial: o cliente digita a renda e vê na hora a faixa do programa. */
export default function CalculadoraRenda({ faixas }: { faixas: FaixaResumo[] }) {
  const [valor, setValor] = useState("");
  const id = useId();
  const renda = parseMoney(valor);
  const ordenadas = [...faixas].sort((a, b) => a.renda_min - b.renda_min);
  const faixa = renda > 0 ? ordenadas.find((f) => renda >= f.renda_min && renda <= f.renda_max) ?? null : null;
  const acima = renda > 0 && !faixa && ordenadas.length > 0 && renda > ordenadas[ordenadas.length - 1].renda_max;
  const href = renda > 0 ? `/simulacao?renda=${Math.round(renda)}` : "/simulacao";

  return (
    <div className="rounded-3xl bg-white p-4 text-ink shadow-[0_24px_60px_-20px_rgba(0,30,70,0.55)] sm:p-5">
      <label htmlFor={id} className="block text-[15px] font-semibold">
        Quanto sua família ganha por mês?
      </label>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        placeholder="R$ 0,00"
        aria-describedby={`${id}-dica`}
        value={valor}
        onChange={(e) => setValor(maskMoney(e.target.value))}
        className="mt-2 w-full rounded-2xl border-2 border-line bg-mist px-4 py-2 font-display text-2xl font-extrabold tracking-tight text-ink outline-none transition focus:border-caixa focus:bg-white sm:text-3xl"
      />

      <div aria-live="polite">
        {faixa ? (
          <div className="mt-3 rounded-2xl bg-caixa-50 p-3">
            <p className="font-display text-lg font-extrabold text-caixa">Você pode se encaixar na {faixa.nome}</p>
            <ul className="mt-1 grid gap-0.5 text-sm text-ink sm:grid-cols-2">
              <li>Imóveis de até <strong>{formatBRL(faixa.teto_imovel)}</strong></li>
              <li>Juros a partir de <strong>{faixa.juros_min.toLocaleString("pt-BR")}% ao ano</strong></li>
              {faixa.subsidio_max > 0 && (
                <li className="sm:col-span-2">
                  Desconto do governo (subsídio) de até <strong>{formatBRL(faixa.subsidio_max)}</strong>
                </li>
              )}
            </ul>
          </div>
        ) : acima ? (
          <p className="mt-3 rounded-2xl bg-sol-50 p-3 text-sm">
            Essa renda passa do limite do Minha Casa, Minha Vida, mas ainda dá para financiar. Faça a simulação que um corretor
            te mostra as opções.
          </p>
        ) : (
          <p id={`${id}-dica`} className="mt-1.5 text-xs text-ink-soft">
            Some a renda bruta de quem vai comprar junto e veja na hora a sua faixa.
          </p>
        )}
      </div>

      <Link
        href={href}
        onClick={() => trackEvent("simulation_cta", { origem: "calculadora_home", renda_informada: renda > 0 })}
        className="btn-sol mt-3 w-full px-6 py-3 text-base"
      >
        {faixa ? "Ver quanto eu posso financiar" : "Fazer minha simulação grátis"} <ArrowRight size={18} aria-hidden />
      </Link>
      <p className="mt-1.5 text-center text-xs text-ink-soft">Grátis, sem CPF e sem compromisso.</p>
    </div>
  );
}
