import { NextResponse } from "next/server";
import { nomeContato, vcard } from "@/lib/contato";
import { assertAdmin } from "@/lib/server/auth";

/** Baixa o contato do cliente (.vcf) para salvar no celular. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ erro: "Cliente inválido" }, { status: 400 });
  let ctx;
  try {
    ctx = await assertAdmin();
  } catch {
    return NextResponse.json({ erro: "Acesso negado" }, { status: 401 });
  }
  const { data: l } = await ctx.supabase.from("leads").select("nome, telefone, regiao_detalhe, regioes, origem, codigo, anonimizado_em").eq("id", id).maybeSingle();
  if (!l || l.anonimizado_em) return NextResponse.json({ erro: "Cliente não encontrado" }, { status: 404 });
  const nome = nomeContato(l);
  const arquivo = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w -]+/g, "").trim().slice(0, 80) || "contato";
  return new NextResponse(vcard(nome, l.telefone, `Cliente ${l.codigo} (CRM)`), {
    headers: {
      "content-type": "text/vcard; charset=utf-8",
      "content-disposition": `attachment; filename="${arquivo}.vcf"`,
      "cache-control": "no-store",
    },
  });
}
