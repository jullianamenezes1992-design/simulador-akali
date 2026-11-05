import { describe, expect, it } from "vitest";
import { encontrarFaixa, entradaParcelavel, financiamentoMaximo, mesesAteEntrega, primeiraParcela, simular, validarParametros, valorMaximoImovel } from "./engine";
import { ranquear } from "./matching";
import type { DevelopmentForMatch, SimulationInput, SimulationParams } from "./types";

const params: SimulationParams = {
  comprometimento_renda_max: 0.3,
  prazo_max_meses: 420,
  idade_min_anos: 18,
  idade_max_quitacao_meses: 966,
  sistema_amortizacao: "SAC",
  taxa_referencia: "max",
  cota_financiamento_max: null,
  fgts_exige_3_anos: true,
  faixas: [
    { id: 1, nome: "Faixa 1", renda_min: 0, renda_max: 3200, juros_min: 4.25, juros_max: 5, teto_imovel: 275000, subsidio_max: 55000 },
    { id: 2, nome: "Faixa 2", renda_min: 3200.01, renda_max: 5000, juros_min: 4.75, juros_max: 7, teto_imovel: 275000, subsidio_max: 55000 },
    { id: 3, nome: "Faixa 3", renda_min: 5000.01, renda_max: 9600, juros_min: 7.66, juros_max: 8.16, teto_imovel: 400000, subsidio_max: 0 },
    { id: 4, nome: "Faixa 4", renda_min: 9600.01, renda_max: 13000, juros_min: 10, juros_max: 10.5, teto_imovel: 600000, subsidio_max: 0 },
  ],
};

const base: SimulationInput = {
  rendaPrincipal: 3000,
  rendaComposicao: 0,
  idadeMeses: 30 * 12,
  fgtsSaldo: 10000,
  fgtsTresAnos: true,
  entrada: 5000,
  possuiImovel: false,
  financiamentoAtivo: false,
  jaBeneficiado: false,
  restricaoCredito: "nao",
};

describe("faixas", () => {
  it("enquadra pelos limites da portaria, inclusive nas bordas", () => {
    expect(encontrarFaixa(3200, params)?.id).toBe(1);
    expect(encontrarFaixa(3200.01, params)?.id).toBe(2);
    expect(encontrarFaixa(5000, params)?.id).toBe(2);
    expect(encontrarFaixa(9600.01, params)?.id).toBe(4);
    expect(encontrarFaixa(13000.01, params)).toBeNull();
  });
});

describe("amortização", () => {
  it("SAC: financiamento máximo gera 1ª parcela igual ao limite", () => {
    const p = financiamentoMaximo(900, 5, 420, "SAC");
    expect(primeiraParcela(p, 5, 420, "SAC")).toBeCloseTo(900, 6);
    expect(Math.round(p)).toBe(137455);
  });
  it("PRICE: financiamento máximo gera parcela igual ao limite", () => {
    const p = financiamentoMaximo(1500, 8.16, 420, "PRICE");
    expect(primeiraParcela(p, 8.16, 420, "PRICE")).toBeCloseTo(1500, 6);
  });
  it("cota máxima limita o valor do imóvel pelos recursos próprios", () => {
    expect(valorMaximoImovel(300000, 20000, 0.8)).toBeCloseTo(100000, 6);
    expect(valorMaximoImovel(50000, 20000, 0.8)).toBe(70000);
    expect(valorMaximoImovel(50000, 20000, null)).toBe(70000);
  });
});

describe("simulação", () => {
  it("Faixa 1: soma financiamento, FGTS e entrada; subsídio só no cenário otimista", () => {
    const r = simular(base, params);
    expect(r.faixa?.id).toBe(1);
    expect(r.taxaAnual).toBe(5);
    expect(r.parcelaMax).toBe(900);
    expect(r.capacidadeSemSubsidio).toBe(137455 + 15000);
    expect(r.capacidadeComSubsidio).toBe(137455 + 15000 + 55000);
    expect(r.impedimentos).toHaveLength(0);
  });

  it("composição de renda muda a faixa", () => {
    const r = simular({ ...base, rendaComposicao: 2500 }, params);
    expect(r.rendaTotal).toBe(5500);
    expect(r.faixa?.id).toBe(3);
    expect(r.subsidioPotencial).toBe(0);
  });

  it("respeita o teto do imóvel da faixa", () => {
    const r = simular({ ...base, rendaPrincipal: 5000, entrada: 200000 }, params);
    expect(r.capacidadeSemSubsidio).toBe(275000);
    expect(r.capacidadeComSubsidio).toBe(275000);
  });

  it("renda acima do programa gera impedimento e nenhuma faixa", () => {
    const r = simular({ ...base, rendaPrincipal: 15000 }, params);
    expect(r.faixa).toBeNull();
    expect(r.enquadrado).toBe(false);
    expect(r.impedimentos[0]).toMatch(/acima do limite/);
    expect(r.financiamentoMax).toBe(0);
  });

  it("idade limita o prazo (80 anos e 6 meses na quitação)", () => {
    const r = simular({ ...base, idadeMeses: 70 * 12 }, params);
    expect(r.prazoMeses).toBe(966 - 840);
    expect(r.alertas.some((a) => a.includes("126 meses"))).toBe(true);
  });

  it("menor de idade não financia", () => {
    const r = simular({ ...base, idadeMeses: 17 * 12 }, params);
    expect(r.prazoMeses).toBe(0);
    expect(r.impedimentos.some((i) => i.includes("18 anos"))).toBe(true);
  });

  it("FGTS ignorado sem 3 anos de trabalho", () => {
    const r = simular({ ...base, fgtsTresAnos: false }, params);
    expect(r.fgtsConsiderado).toBe(0);
  });

  it("quem já possui imóvel recebe impedimento e quem já foi beneficiado perde o subsídio potencial", () => {
    const r = simular({ ...base, possuiImovel: true, jaBeneficiado: true }, params);
    expect(r.impedimentos.length).toBeGreaterThan(0);
    expect(r.subsidioPotencial).toBe(0);
  });
});

describe("validação de parâmetros", () => {
  it("aceita os parâmetros padrão", () => {
    expect(validarParametros(params).ok).toBe(true);
  });
  it("rejeita faixas sobrepostas e juros invertidos", () => {
    const ruim = { ...params, faixas: [params.faixas[0], { ...params.faixas[1], renda_min: 3000, juros_min: 9, juros_max: 7 }] };
    const v = validarParametros(ruim);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.erros.length).toBeGreaterThanOrEqual(2);
  });
});

describe("compatibilidade", () => {
  const dev = (o: Partial<DevelopmentForMatch>): DevelopmentForMatch => ({
    id: o.slug ?? "x",
    slug: "x",
    nome: "x",
    regiao: "zona_leste",
    preco_min: 200000,
    preco_max: null,
    faixas: [1, 2],
    dormitorios: [2],
    vagas: false,
    disponivel: true,
    unidades_disponiveis: 10,
    status_obra: "lancamento",
    ...o,
  });
  const prefs = { regioes: ["zona_leste"], dormitoriosMin: 2, precisaVaga: false, preferenciaObra: "indiferente" as const };

  it("mostra primeiro os compatíveis e explica o motivo", () => {
    const sim = simular(base, params);
    const { compativeis, demais } = ranquear(
      [
        dev({ slug: "caro", preco_min: 500000, faixas: [4] }),
        dev({ slug: "ok-leste", preco_min: 200000 }),
        dev({ slug: "ok-sul", preco_min: 190000, regiao: "zona_sul" }),
        dev({ slug: "esgotado", preco_min: 180000, disponivel: false }),
      ],
      sim,
      prefs
    );
    expect(compativeis.map((c) => c.dev.slug)).toEqual(["ok-leste", "ok-sul"]);
    expect(demais.map((c) => c.dev.slug)).toContain("caro");
    expect(demais.map((c) => c.dev.slug)).toContain("esgotado");
    expect(compativeis[0].match.motivos.join(" ")).toMatch(/Faixa 1/);
  });

  it("sem enquadramento, nada é marcado como compatível", () => {
    const sim = simular({ ...base, rendaPrincipal: 20000 }, params);
    const { compativeis } = ranquear([dev({})], sim, prefs);
    expect(compativeis).toHaveLength(0);
  });
});

describe("preço sob consulta", () => {
  it("não é marcado como compatível, mas aparece com ponto de atenção", () => {
    const sim = simular(base, params);
    const dev: DevelopmentForMatch = {
      id: "sc", slug: "sc", nome: "sc", regiao: "zona_leste", preco_min: null, preco_max: null,
      faixas: [1, 2], dormitorios: [2], vagas: false, disponivel: true, unidades_disponiveis: null, status_obra: "lancamento",
    };
    const { compativeis, demais } = ranquear([dev], sim, { regioes: [], dormitoriosMin: null, precisaVaga: false, preferenciaObra: "indiferente" });
    expect(compativeis).toHaveLength(0);
    expect(demais[0].match.atencao.join(" ")).toMatch(/sob consulta/i);
  });
});

describe("entrada parcelada na obra", () => {
  const pEp: SimulationParams = {
    ...params,
    entrada_parcelada: { pct_max: 0.25, comprometimento: 0.3, meses_lancamento: 30, meses_obras: 12 },
  };
  const devBase: DevelopmentForMatch = {
    id: "x", slug: "x", nome: "x", regiao: "zona_leste", preco_min: 0, preco_max: null,
    faixas: [1, 2], dormitorios: [2], vagas: false, disponivel: true, unidades_disponiveis: null, status_obra: "lancamento",
  };
  const prefs = { regioes: [], dormitoriosMin: null, precisaVaga: false, preferenciaObra: "indiferente" as const };

  it("lê a previsão de entrega em formatos comuns", () => {
    const hoje = new Date(2026, 10, 3); // nov/2026
    expect(mesesAteEntrega("12/2027", hoje)).toBe(13);
    expect(mesesAteEntrega("Dez/2027", hoje)).toBe(13);
    expect(mesesAteEntrega("março de 2028", hoje)).toBe(16);
    expect(mesesAteEntrega("2027", hoje)).toBe(13);
    expect(mesesAteEntrega("em breve", hoje)).toBeNull();
  });

  it("limita ao menor entre % do preço e parcelas que cabem na renda", () => {
    const sim = simular({ ...base, entrada: 0 }, pEp); // renda 3000 → até 900/mês
    expect(sim.entradaParcelada?.parcelaMensalMax).toBe(900);
    expect(entradaParcelavel(200000, devBase, sim).valorMax).toBe(27000); // 900 × 30 < 25%
    expect(entradaParcelavel(80000, devBase, sim).valorMax).toBe(20000); // 25% < 900 × 30
    expect(entradaParcelavel(200000, { status_obra: "pronto" }, sim).valorMax).toBe(0);
  });

  it("torna compatível o imóvel que só cabe parcelando a entrada", () => {
    const semEp = simular({ ...base, entrada: 0 }, params);
    const comEp = simular({ ...base, entrada: 0 }, pEp);
    const preco = semEp.capacidadeComSubsidio + 15000;
    const d = { ...devBase, preco_min: preco };
    expect(ranquear([d], semEp, prefs).compativeis).toHaveLength(0);
    const r = ranquear([d], comEp, prefs).compativeis;
    expect(r).toHaveLength(1);
    expect(r[0].match.entradaParcelada?.meses).toBe(30);
    expect(r[0].match.motivos.join(" ")).toMatch(/na obra/);
    // imóvel pronto não ganha parcelamento
    expect(ranquear([{ ...d, status_obra: "pronto" }], comEp, prefs).compativeis).toHaveLength(0);
  });
});

describe("entrada parcelada com parcelas após as chaves", () => {
  it("soma obra + pós-chaves, limitado ao % do preço, e divide as parcelas", async () => {
    const { dividirEntrada } = await import("./engine");
    const pPos: SimulationParams = {
      ...params,
      entrada_parcelada: { pct_max: 0.2, comprometimento: 0.3, meses_lancamento: 10, meses_obras: 6, meses_pos_chaves: 48 },
    };
    const sim = simular({ ...base, entrada: 0 }, pPos); // renda 3000 → 900/mês
    const dev = { status_obra: "em_obras", previsao_entrega: null };
    // 900×6 + 900×48 = 48.600, mas o limite é 20% de 200 mil = 40 mil
    expect(entradaParcelavel(200000, dev, sim).valorMax).toBe(40000);
    // sem pós-chaves seria só 900×6
    const semPos = simular({ ...base, entrada: 0 }, { ...pPos, entrada_parcelada: { ...pPos.entrada_parcelada!, meses_pos_chaves: 0 } });
    expect(entradaParcelavel(200000, dev, semPos).valorMax).toBe(5400);
    const d = dividirEntrada(10000, 6, 48, 900, 900);
    expect(d.parcela).toBe(900);
    expect(d.mesesPos).toBe(6); // 4.600 restantes em parcelas de até 900
    expect(d.parcelaPos).toBe(767);
  });
});
