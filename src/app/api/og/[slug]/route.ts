import { getPublicDevelopment } from "@/lib/data";
import { fotoDe, respostaOg } from "@/lib/og-image";

/** Foto de capa do empreendimento para a prévia do link (WhatsApp, Facebook). */
export const runtime = "nodejs";
export const revalidate = 86400;

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return respostaOg(fotoDe(await getPublicDevelopment(slug)), req, slug);
}
