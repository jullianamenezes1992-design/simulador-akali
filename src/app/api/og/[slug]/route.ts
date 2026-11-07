import { NextResponse } from "next/server";
import sharp from "sharp";
import { getPublicDevelopment } from "@/lib/data";

/**
 * Foto de capa do empreendimento em tamanho de pré-visualização (1200×630, JPEG leve).
 * O WhatsApp só mostra a foto do link quando a imagem é pequena (~300 KB);
 * as fotos originais das construtoras têm de 0,5 a 12 MB, por isso aparecia a imagem padrão.
 */
export const runtime = "nodejs";
export const revalidate = 86400;

const MAX = 30 * 1024 * 1024;

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await getPublicDevelopment(slug);
  const foto = d?.development_media?.find((m) => m.tipo === "foto")?.url;
  const fonte = [d?.capa_url, foto].find((u) => u && /^https:\/\//.test(u));
  if (!fonte) return NextResponse.redirect(new URL("/og-mini.jpg?v=3", _req.url));
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const r = await fetch(fonte, { signal: ctrl.signal }).finally(() => clearTimeout(t));
    const tipo = r.headers.get("content-type") ?? "";
    if (!r.ok || !tipo.startsWith("image/")) throw new Error(`imagem ${r.status} ${tipo}`);
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > MAX) throw new Error("imagem grande demais");
    const jpg = await sharp(buf, { failOn: "none" })
      .rotate()
      .resize(1200, 630, { fit: "cover", position: "attention" })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 72, mozjpeg: true })
      .toBuffer();
    return new NextResponse(new Uint8Array(jpg), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
      },
    });
  } catch (e) {
    console.error("og do empreendimento falhou", slug, e);
    return NextResponse.redirect(new URL("/og-mini.jpg?v=3", _req.url));
  }
}
