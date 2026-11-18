import { describe, expect, it } from "vitest";
import { calcularFluxoPlano, faixaScore, type FluxoPlano } from "./plano-fluxo";

const penha: FluxoPlano = {
  tabela: "Associativa",
  tabela_nome: null,
  vigencia_fim: null,
  coletado_em: "2026-11-18",
  parcelas: [
    { tipo: "Sinal Ato", qtd: 1, inicio: null, max: null, min: 200 },
    { tipo: "Entrada", qtd: 1, inicio: null, max: [0.4, 0.5, 0.6, 0.8], min: null },
    { tipo: "Financiamento", qtd: 1, inicio: null, max: null, min: null },
    { tipo: "Mensal A", qtd: 8, inicio: null, max: [0.29, 0.32, 0.33, 0.35], min: null },
    { tipo: "Mensal B", qtd: 8, inicio: null, max: [0.29, 0.32, 0.33, 0.35], min: null },
    { tipo: "Anual", qtd: 1, inicio: null, max: [0.75, 1, 1, 1], min: null },
  ],
};

describe("fluxo Plano", () => {
  it("faixas de score", () => {
    expect([0, 499, 500, 600, 601, 799, 800, 1000].map(faixaScore)).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
  });
  it("score 700, renda 3000 (igual ao simulador)", () => {
    const f = calcularFluxoPlano(penha, 3000, 700);
    expect(f.linhas.find((l) => l.tipo === "Mensal A")?.parcelaMax).toBe(990);
    expect(f.total).toBe(1800 + 990 * 16 + 3000);
    expect(f.sinalMin).toBe(200);
  });
});
