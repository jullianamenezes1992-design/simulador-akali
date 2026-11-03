import ExcelJS from "exceljs";
import { NextResponse, type NextRequest } from "next/server";
import { LEAD_STATUS, PRAZOS_COMPRA, TIPOS_RENDA, labelOf, leadStatusInfo, regiaoLabel, statusObraLabel } from "@/lib/constants";
import { assertAdmin } from "@/lib/server/auth";
import type { SimulationResult } from "@/lib/simulacao/types";

type Linha = Record<string, string | number | null>;

const simNao = (v: boolean | null | undefined) => (v == null ? "" : v ? "Sim" : "Não");
const dataBR = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }) : "";

/** Evita injeção de fórmulas ao abrir a planilha (CSV/Excel). */
const seguro = (v: unknown): string | number | null => {
  if (v == null) return null;
  if (typeof v === "number") return v;
  const s = String(v);
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
};

function csv(linhas: Linha[]): string {
  if (!linhas.length) return "﻿";
  const cols = Object.keys(linhas[0]);
  const esc = (v: unknown) => {
    const s = v == null ? "" : typeof v === "number" ? String(v).replace(".", ",") : String(v);
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + [cols.join(";"), ...linhas.map((l) => cols.map((c) => esc(l[c])).join(";"))].join("\r\n");
}

async function xlsx(nome: string, linhas: Linha[]) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Simulador Akali";
  const ws = wb.addWorksheet(nome);
  const cols = linhas.length ? Object.keys(linhas[0]) : ["Sem dados"];
  ws.columns = cols.map((c) => ({ header: c, key: c, width: Math.min(45, Math.max(12, c.length + 4)) }));
  linhas.forEach((l) => ws.addRow(l));
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF005CA9" } };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: cols.length } };
  return Buffer.from(await wb.xlsx.writeBuffer());
}

export async function GET(req: NextRequest) {
  let ctx;
  try {
    ctx = await assertAdmin();
  } catch {
    return NextResponse.json({ erro: "Acesso negado." }, { status: 401 });
  }
  const { supabase } = ctx;
  const sp = req.nextUrl.searchParams;
  const tipo = sp.get("tipo") === "empreendimentos" ? "empreendimentos" : "leads";
  const formato = sp.get("formato") === "csv" ? "csv" : "xlsx";

  let linhas: Linha[] = [];

  if (tipo === "leads") {
    let q = supabase
      .from("leads")
      .select("*, escolhido:escolhido_id(nome), responsavel:responsavel_id(nome)")
      .order("created_at", { ascending: false })
      .limit(20000);
    const status = sp.get("status");
    if (status && LEAD_STATUS.some((s) => s.value === status)) q = q.eq("status", status);
    const busca = (sp.get("q") ?? "").replace(/[%,()]/g, " ").trim();
    if (busca) q = q.or(`nome.ilike.%${busca}%,codigo.ilike.%${busca}%,email.ilike.%${busca}%`);
    const de = sp.get("de");
    const ate = sp.get("ate");
    if (de && /^\d{4}-\d{2}-\d{2}$/.test(de)) q = q.gte("created_at", `${de}T00:00:00-03:00`);
    if (ate && /^\d{4}-\d{2}-\d{2}$/.test(ate)) q = q.lte("created_at", `${ate}T23:59:59-03:00`);
    const { data: leads, error } = await q;
    if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

    const ids = (leads ?? []).map((l) => l.id);
    const [{ data: devs }, { data: views }, { data: notas }] = await Promise.all([
      supabase.from("developments").select("id, nome"),
      ids.length
        ? supabase.from("lead_events").select("lead_id, development_id").eq("tipo", "visualizou_empreendimento").in("lead_id", ids.slice(0, 1000))
        : Promise.resolve({ data: [] as { lead_id: string; development_id: string }[] }),
      ids.length
        ? supabase.from("lead_notes").select("lead_id, texto, created_at").in("lead_id", ids.slice(0, 1000)).order("created_at")
        : Promise.resolve({ data: [] as { lead_id: string; texto: string; created_at: string }[] }),
    ]);
    const nomeDev = new Map((devs ?? []).map((d) => [d.id, d.nome]));
    const vistos = new Map<string, Set<string>>();
    (views ?? []).forEach((v) => {
      if (!vistos.has(v.lead_id)) vistos.set(v.lead_id, new Set());
      vistos.get(v.lead_id)!.add(nomeDev.get(v.development_id) ?? "—");
    });
    const obs = new Map<string, string[]>();
    (notas ?? []).forEach((n) => obs.set(n.lead_id, [...(obs.get(n.lead_id) ?? []), `[${dataBR(n.created_at)}] ${n.texto}`]));

    linhas = (leads ?? []).map((l) => {
      const sim = l.simulacao as SimulationResult | null;
      return {
        "Código": l.codigo,
        "Data do cadastro": dataBR(l.created_at),
        "Nome": seguro(l.nome),
        "Telefone": l.telefone,
        "E-mail": seguro(l.email),
        "Profissão": seguro(l.profissao),
        "Tipo de renda": labelOf(TIPOS_RENDA, l.tipo_renda),
        "Renda principal": Number(l.renda_principal),
        "Renda composição": Number(l.renda_composicao),
        "Renda familiar": Number(l.renda_total),
        "Dependentes": l.dependentes,
        "Faixa": sim?.faixa?.nome ?? "Fora do programa",
        "Saldo FGTS": Number(l.fgts_saldo),
        "FGTS 3 anos": simNao(l.fgts_tres_anos),
        "Possui imóvel": simNao(l.possui_imovel),
        "Financiamento ativo": simNao(l.financiamento_ativo),
        "Já beneficiado": simNao(l.ja_beneficiado),
        "Restrição no nome": { nao: "Não", sim: "Sim", nao_sei: "Não sabe" }[l.restricao_credito as string] ?? "",
        "Entrada disponível": Number(l.entrada_disponivel),
        "Imóvel estimado": sim?.capacidadeSemSubsidio ?? null,
        "Imóvel estimado c/ subsídio máx.": sim?.capacidadeComSubsidio ?? null,
        "Financiamento estimado": sim?.financiamentoMax ?? null,
        "Parcela de referência": sim?.parcelaMax ?? null,
        "Regiões": (l.regioes ?? []).map(regiaoLabel).join(", "),
        "Dormitórios mín.": l.dormitorios_min,
        "Precisa vaga": simNao(l.precisa_vaga),
        "Prazo de compra": labelOf(PRAZOS_COMPRA, l.prazo_compra),
        "Recomendados": (l.recomendados ?? []).map((id: string) => nomeDev.get(id) ?? "—").join(" | "),
        "Visualizados": [...(vistos.get(l.id) ?? [])].join(" | "),
        "Escolhido": (l.escolhido as unknown as { nome: string } | null)?.nome ?? "",
        "Origem": seguro(l.origem),
        "utm_source": seguro(l.utm_source),
        "utm_medium": seguro(l.utm_medium),
        "utm_campaign": seguro(l.utm_campaign),
        "utm_term": seguro(l.utm_term),
        "utm_content": seguro(l.utm_content),
        "Status": leadStatusInfo(l.status).label,
        "Responsável": (l.responsavel as unknown as { nome: string } | null)?.nome ?? "",
        "Observações": seguro((obs.get(l.id) ?? []).join("\n")),
        "Aceita marketing": simNao(l.aceita_marketing),
        "Anonimizado": l.anonimizado_em ? "Sim" : "",
      };
    });
  } else {
    const { data, error } = await supabase.from("developments").select("*").order("nome");
    if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
    linhas = (data ?? []).map((d) => ({
      "Nome": seguro(d.nome),
      "Slug": d.slug,
      "Construtora": seguro(d.construtora),
      "Endereço": seguro(d.endereco),
      "Bairro": seguro(d.bairro),
      "Cidade": seguro(d.cidade),
      "Região": regiaoLabel(d.regiao),
      "Preço a partir de": d.preco_min != null ? Number(d.preco_min) : "Sob consulta",
      "Preço até": d.preco_max != null ? Number(d.preco_max) : null,
      "Faixas": (d.faixas ?? []).join(", "),
      "Dormitórios": (d.dormitorios ?? []).join(", "),
      "Área mín.": d.area_min != null ? Number(d.area_min) : null,
      "Área máx.": d.area_max != null ? Number(d.area_max) : null,
      "Vaga": simNao(d.vagas),
      "Estágio": statusObraLabel(d.status_obra),
      "Entrega": seguro(d.previsao_entrega),
      "Unidades disponíveis": d.unidades_disponiveis,
      "Disponível": simNao(d.disponivel),
      "Destaque": simNao(d.oferta_destaque),
      "Ativo": simNao(d.ativo),
      "Exemplo": simNao(d.is_demo),
      "Diferenciais": seguro((d.diferenciais ?? []).join(" | ")),
      "Atualizado em": dataBR(d.updated_at),
    }));
  }

  await supabase.rpc("registrar_auditoria", {
    p_tabela: "exportacao",
    p_registro: null,
    p_acao: `exportou_${tipo}`,
    p_dados: { formato, linhas: linhas.length, filtros: Object.fromEntries(sp.entries()) },
  });

  const stamp = new Date().toISOString().slice(0, 10);
  const nome = `${tipo}-${stamp}.${formato}`;
  if (formato === "csv") {
    return new NextResponse(csv(linhas), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${nome}"`,
        "Cache-Control": "no-store",
      },
    });
  }
  const buf = await xlsx(tipo === "leads" ? "Leads" : "Empreendimentos", linhas);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nome}"`,
      "Cache-Control": "no-store",
    },
  });
}
