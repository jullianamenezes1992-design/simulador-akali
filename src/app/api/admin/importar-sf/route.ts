import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/server/auth";
import { gravarCPF, limparCodigoSF } from "@/lib/server/salesforce";

/**
 * Complementa clientes já importados do Salesforce Plano&Plano: CPF (cifrado) e números
 * da oportunidade, AR e AB. Localiza o cliente pelo ID da oportunidade ou pelo telefone.
 * Uso interno do painel (sessão de administrador).
 */
type Item = { telefone?: string; nome?: string; cpf?: string; oportunidade?: string; ar?: string; ab?: string };

export async function POST(req: Request) {
  // só aceita chamadas JSON do próprio site (evita envio a partir de outra página)
  const origem = req.headers.get("origin");
  if (!req.headers.get("content-type")?.includes("application/json") || (origem && new URL(origem).host !== new URL(req.url).host)) {
    return NextResponse.json({ erro: "Requisição inválida" }, { status: 400 });
  }
  let ctx;
  try {
    ctx = await assertAdmin(true);
  } catch (e) {
    return NextResponse.json({ erro: e instanceof Error ? e.message : "Acesso negado" }, { status: 401 });
  }
  const { supabase } = ctx;
  const body = (await req.json().catch(() => null)) as { itens?: Item[] } | null;
  const itens = Array.isArray(body?.itens) ? body!.itens.slice(0, 1000) : [];
  const r = { leads: 0, aprovados: 0, cpfs: 0, nao_encontrados: [] as string[], cpf_invalido: [] as string[] };

  for (const it of itens) {
    let tel = String(it.telefone ?? "").replace(/\D/g, "");
    if (tel.length >= 12 && tel.startsWith("55")) tel = tel.slice(2);
    const op = limparCodigoSF(it.oportunidade, 40);
    const ar = limparCodigoSF(it.ar, 30, true);
    const ab = limparCodigoSF(it.ab, 30, true);
    const nums = Object.fromEntries(Object.entries({ oportunidade_sf: op, ar_numero: ar, ab_numero: ab }).filter(([, v]) => v));

    let leadId: string | null = null;
    if (op) leadId = (await supabase.from("leads").select("id").eq("oportunidade_sf", op).is("excluido_em", null).limit(1).maybeSingle()).data?.id ?? null;
    if (!leadId && /^\d{10,11}$/.test(tel)) {
      leadId = (await supabase.from("leads").select("id").eq("telefone", tel).is("excluido_em", null).order("created_at").limit(1).maybeSingle()).data?.id ?? null;
    }
    if (!leadId) {
      r.nao_encontrados.push(String(it.nome ?? tel).slice(0, 80));
      continue;
    }
    if (Object.keys(nums).length) {
      const { error } = await supabase.from("leads").update(nums).eq("id", leadId);
      if (!error) r.leads++;
      const { data: ap } = await supabase.from("aprovados").update(nums).or(`lead_id.eq.${leadId}${/^\d{10,11}$/.test(tel) ? `,telefone.eq.${tel}` : ""}`).select("id");
      r.aprovados += ap?.length ?? 0;
    }
    if (it.cpf) {
      const g = await gravarCPF(leadId, it.cpf);
      if ("ok" in g) r.cpfs++;
      else r.cpf_invalido.push(String(it.nome ?? tel).slice(0, 80));
    }
  }
  return NextResponse.json(r);
}
