import { describe, expect, it } from "vitest";
import { celular } from "./simulacao";

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
