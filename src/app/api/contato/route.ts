import { getSettings } from "@/lib/data";

/** Cartão de contato (.vcf) da corretora: o cliente salva no celular e reconhece quando ela chamar. */
export async function GET() {
  const s = await getSettings();
  const nome = s.corretora_nome || s.empresa_nome;
  const tel = (s.whatsapp_numero ?? "").replace(/\D/g, "");
  const esc = (v: string) => v.replace(/[\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  const linhas = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${esc(`${nome} – ${s.empresa_nome}`)}`,
    `N:${esc(nome)};;;;`,
    `ORG:${esc(s.empresa_nome)}`,
    `TITLE:${esc(["Corretora de imóveis", s.creci].filter(Boolean).join(" · "))}`,
    tel ? `TEL;TYPE=CELL,VOICE:+${tel}` : null,
    s.email_contato ? `EMAIL:${esc(s.email_contato)}` : null,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `URL:https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null,
    "END:VCARD",
  ].filter(Boolean);
  return new Response(linhas.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="akali-imoveis.vcf"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
