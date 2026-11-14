import { NextResponse } from "next/server";
import { nomeContato } from "@/lib/contato";
import { assertAdmin } from "@/lib/server/auth";

/**
 * Todos os leads do CRM num CSV no formato do Google Contatos
 * (nome "Fulano - Bairro ZN - Origem", telefone +55 e o marcador "CRM Akali").
 */
export async function GET() {
  let ctx;
  try {
    ctx = await assertAdmin();
  } catch {
    return NextResponse.json({ erro: "Acesso negado" }, { status: 401 });
  }
  const linhas: {
    nome: string;
    telefone: string;
    regiao_detalhe: string | null;
    regioes: string[] | null;
    origem: string | null;
    codigo: string | null;
    status: string;
  }[] = [];
  for (let de = 0; ; de += 1000) {
    const { data, error } = await ctx.supabase
      .from("leads")
      .select("nome, telefone, regiao_detalhe, regioes, origem, codigo, status")
      .is("excluido_em", null)
      .is("anonimizado_em", null)
      .order("created_at")
      .range(de, de + 999);
    if (error)
      return NextResponse.json({ erro: error.message }, { status: 500 });
    linhas.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  const vistos = new Set<string>();
  const cel = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [
    [
      "Name",
      "Given Name",
      "Phone 1 - Type",
      "Phone 1 - Value",
      "Notes",
      "Group Membership",
    ].join(","),
    ...linhas
      .filter((l) => {
        const t = l.telefone.replace(/\D/g, "");
        if (t.length < 10 || vistos.has(t)) return false;
        vistos.add(t);
        return true;
      })
      .map((l) => {
        const nome = nomeContato(l);
        return [
          cel(nome),
          cel(nome),
          "Mobile",
          cel(`+55${l.telefone.replace(/\D/g, "")}`),
          cel(`Cliente ${l.codigo ?? ""} (CRM)`),
          cel("CRM Akali ::: * myContacts"),
        ].join(",");
      }),
  ].join("\r\n");
  return new NextResponse("﻿" + csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="contatos-crm-google.csv"`,
      "cache-control": "no-store",
    },
  });
}
