import "server-only";
import { NextResponse } from "next/server";
import sharp from "sharp";
import type { Development } from "@/lib/data";

/**
 * Foto em tamanho de pré-visualização de link (1200×630, JPEG leve).
 * O WhatsApp só mostra a foto do link quando a imagem é pequena (~300 KB);
 * as fotos originais das construtoras têm de 0,5 a 12 MB.
 */
const MAX = 30 * 1024 * 1024;
const PADRAO = "/og-mini.jpg?v=3";

export function fotoDe(d: Development | null | undefined) {
  const foto = d?.development_media?.find((m) => m.tipo === "foto")?.url;
  return [d?.capa_url, foto].find((u) => u && /^https:\/\//.test(u)) ?? null;
}

export async function respostaOg(fonte: string | null, req: Request, rotulo: string) {
  if (!fonte) return NextResponse.redirect(new URL(PADRAO, req.url));
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
    console.error("imagem de prévia falhou", rotulo, e);
    return NextResponse.redirect(new URL(PADRAO, req.url));
  }
}
