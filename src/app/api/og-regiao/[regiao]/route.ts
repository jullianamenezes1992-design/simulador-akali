import { listPublicDevelopments } from "@/lib/data";
import { REGIOES } from "@/lib/constants";
import { fotoDe, respostaOg } from "@/lib/og-image";

/**
 * Foto de um prédio para a prévia do link da página inicial ("todas")
 * e das páginas de região (/empreendimentos?regiao=...).
 * Usa o primeiro empreendimento da lista (destaques primeiro) que tenha foto.
 */
export const runtime = "nodejs";
export const revalidate = 86400;

export async function GET(req: Request, { params }: { params: Promise<{ regiao: string }> }) {
  const { regiao } = await params;
  const valida = REGIOES.some((r) => r.value === regiao) ? regiao : "";
  const devs = await listPublicDevelopments(valida ? { regiao: valida } : {});
  const fonte = devs.map(fotoDe).find(Boolean) ?? null;
  return respostaOg(fonte, req, `regiao:${regiao}`);
}
