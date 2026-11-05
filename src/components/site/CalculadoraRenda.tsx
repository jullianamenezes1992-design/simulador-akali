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
    <div className="rounded-3xl bg-white p-5 text-ink shadow-[0_24px_60px_-20px_rgba(0,30,70,0.55)] sm:p-6">
      <label htmlFor={id} className="block text-[15px] font-semibold">
        Quanto sua família ganha por mês?
      </label>
      <p className="mt-0.5 text-sm text-ink-soft">Some a renda bruta de quem vai comprar junto.</p>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        placeholder="R$ 0,00"
        value={valor}
        onChange={(e) => setValor(maskMoney(e.target.value))}
        className="mt-3 w-full rounded-2xl border-2 border-line bg-mist px-4 py-3 font-display text-3xl font-extrabold tracking-tight text-ink outline-none transition focus:border-caixa focus:bg-white sm:text-4xl"
      />

      <div aria-live="polite" className="mt-4 min-h-[88px]">
        {faixa ? (
          <div className="rounded-2xl bg-caixa-50 p-4">
            <p className="font-display text-xl font-extrabold text-caixa">Você pode se encaixar na {faixa.nome}</p>
            <ul className="mt-2 grid gap-1 text-sm text-ink sm:grid-cols-2">
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
          <p className="rounded-2xl bg-sol-50 p-4 text-sm">
            Essa renda passa do limite do Minha Casa, Minha Vida, mas ainda dá para financiar. Faça a simulação que um corretor
            te mostra as opções.
          </p>
        ) : (
          <p className="rounded-2xl border border-dashed border-line p-4 text-sm text-ink-soft">
            Digite a renda e veja na hora a sua faixa do programa, o valor máximo do imóvel e os juros.
          </p>
        )}
      </div>

      <Link
        href={href}
        onClick={() => trackEvent("simulation_cta", { origem: "calculadora_home", renda_informada: renda > 0 })}
        className="btn-sol mt-4 w-full px-6 py-3.5 text-base"
      >
        {faixa ? "Ver quanto eu posso financiar" : "Fazer minha simulação grátis"} <ArrowRight size={18} aria-hidden />
      </Link>
      <p className="mt-2 text-center text-xs text-ink-soft">Grátis, sem CPF e sem compromisso. Leva cerca de 3 minutos.</p>
    </div>
  );
}
