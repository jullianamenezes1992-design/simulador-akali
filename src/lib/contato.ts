/** Nome do contato para salvar no celular: "Juliana Menezes - Limão ZN - TikTok". */
const ZONA: Record<string, string> = {
  zona_norte: "ZN",
  zona_sul: "ZS",
  zona_leste: "ZL",
  zona_oeste: "ZO",
  centro: "Centro",
  grande_sp: "Grande SP",
  interior: "Interior",
};

export function nomeContato(l: { nome: string; regiao_detalhe?: string | null; regioes?: string[] | null; origem?: string | null }): string {
  const zona = (l.regioes ?? []).map((r) => ZONA[r]).filter(Boolean)[0] ?? "";
  const bairro = (l.regiao_detalhe ?? "").trim();
  const lugar = [bairro, zona && !bairro.toLowerCase().includes(zona.toLowerCase()) ? zona : ""].filter(Boolean).join(" ");
  return [l.nome.trim(), lugar, (l.origem ?? "").trim()].filter(Boolean).join(" - ");
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (c) => `\\${c}`);

/** Cartão de contato (vCard 3.0), que o celular abre na tela "Adicionar contato". */
export function vcard(nome: string, telefone: string, nota?: string): string {
  const tel = `+55${telefone.replace(/\D/g, "")}`;
  return ["BEGIN:VCARD", "VERSION:3.0", `FN:${esc(nome)}`, `N:;${esc(nome)};;;`, `TEL;TYPE=CELL:${tel}`, nota ? `NOTE:${esc(nota)}` : "", "END:VCARD"].filter(Boolean).join("\r\n") + "\r\n";
}
