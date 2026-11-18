import { describe, expect, it } from "vitest";
import { celular, nomeInvalido } from "./simulacao";

describe("celular", () => {
  it("aceita celular com 11 dígitos começando com 9", () => {
    expect(celular.safeParse("11996726252").success).toBe(true);
  });
  it("recusa número sem o 9 e explica", () => {
    const r = celular.safeParse("1196726252");
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toMatch(/falta o 9/);
  });
  it("recusa telefone fixo", () => {
    expect(celular.safeParse("1133334444").success).toBe(false);
    expect(celular.safeParse("11333344445").success).toBe(false);
  });
  it("recusa DDD inválido e número curto", () => {
    expect(celular.safeParse("01996726252").success).toBe(false);
    expect(celular.safeParse("119967").success).toBe(false);
  });
});

describe("números e nomes inventados", () => {
  it("recusa números de mentira", () => {
    for (const n of ["11999999999", "11912345678", "11987654321", "11912121212", "11912341234", "11999990000", "11900000001"])
      expect(celular.safeParse(n).success, n).toBe(false);
  });
  it("recusa DDD que não existe", () => {
    expect(celular.safeParse("20996726252").success).toBe(false);
  });
  it("aceita números normais", () => {
    for (const n of ["11944565423", "21987456123", "11958170877"]) expect(celular.safeParse(n).success, n).toBe(true);
  });
  it("recusa nomes sem sentido e aceita nomes reais", () => {
    for (const n of ["jhh", "kk", "asdf", "teste", "aaaa", "sdfghj"]) expect(nomeInvalido(n), n).toBe(true);
    for (const n of ["Ana", "Gabriel", "José Dutra", "Lyz", "Raydouglas"]) expect(nomeInvalido(n), n).toBe(false);
  });
});
