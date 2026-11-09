import "server-only";
import ExcelJS from "exceljs";
import { createAdminClient } from "@/lib/supabase/admin";
import { diaSP } from "@/lib/agenda";

/**
 * Cópia de segurança semanal: uma planilha com clientes, agenda, observações e empreendimentos.
 * Fica guardada no Storage (pasta privada "backups", últimas 12 cópias) e vai por e-mail se o Resend estiver configurado.
 */

const BUCKET = "backups";
const MANTER = 12;
// Nunca vai para a planilha: o token secreto do link de resultado do cliente
const OCULTAR = new Set(["access_token"]);

type Linha = Record<string, unknown>;

const seguro = (v: unknown): string | number | boolean | Date | null => {
  if (v == null) return null;
  if (typeof v === "number" || typeof v === "boolean") return v;
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  const s = String(v);
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s; // evita fórmulas ao abrir no Excel
};

function aba(wb: ExcelJS.Workbook, nome: string, linhas: Linha[]) {
  const ws = wb.addWorksheet(nome);
  const cols = linhas.length ? Object.keys(linhas[0]).filter((c) => !OCULTAR.has(c)) : ["Sem dados"];
  ws.columns = cols.map((c) => ({ header: c, key: c, width: Math.min(40, Math.max(12, c.length + 4)) }));
  linhas.forEach((l) => ws.addRow(Object.fromEntries(cols.map((c) => [c, seguro(l[c])]))));
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF005CA9" } };
  ws.views = [{ state: "frozen", ySplit: 1 }];
}

async function todas(tabela: string, colunas = "*", ordem = "created_at") {
  const db = createAdminClient();
  const out: Linha[] = [];
  for (let de = 0; de < 50000; de += 1000) {
    const { data, error } = await db.from(tabela).select(colunas).order(ordem, { ascending: true }).range(de, de + 999);
    if (error) throw new Error(`${tabela}: ${error.message}`);
    out.push(...((data ?? []) as unknown as Linha[]));
    if (!data || data.length < 1000) break;
  }
  return out;
}

export async function gerarBackup(): Promise<{ nome: string; caminho: string; buffer: Buffer; clientes: number }> {
  const [leads, tarefas, notas, devs, aprovados] = await Promise.all([
    todas("leads"),
    todas("lead_tasks"),
    todas("lead_notes"),
    todas("developments", "id, slug, nome, construtora, bairro, cidade, regiao, preco_min, faixas, dormitorios, status_obra, previsao_entrega, disponivel, ativo, updated_at"),
    todas("aprovados").catch(() => [] as Linha[]),
  ]);
  // Resumo da simulação em colunas legíveis
  const clientes = leads.map((l) => {
    const sim = l.simulacao as { faixa?: { nome?: string } | null; financiamentoMax?: number; capacidadeSemSubsidio?: number } | null;
    const { simulacao, ...resto } = l;
    void simulacao;
    return {
      ...resto,
      sim_faixa: sim?.faixa?.nome ?? null,
      sim_financiamento: sim?.financiamentoMax ?? null,
      sim_imovel_ate: sim?.capacidadeSemSubsidio ?? null,
    };
  });

  const wb = new ExcelJS.Workbook();
  wb.creator = "Simulador Akali";
  wb.created = new Date();
  aba(wb, "Clientes", clientes);
  aba(wb, "Agenda", tarefas);
  aba(wb, "Observações", notas);
  aba(wb, "Empreendimentos", devs);
  aba(wb, "Aprovados", aprovados);
  const buffer = Buffer.from(await wb.xlsx.writeBuffer());
  const dia = diaSP();
  const nome = `backup-akali-${dia}.xlsx`;
  return { nome, caminho: nome, buffer, clientes: leads.length };
}

/** Gera, guarda no Storage e apaga as cópias mais antigas. */
export async function salvarBackup() {
  const b = await gerarBackup();
  const db = createAdminClient();
  const { error } = await db.storage
    .from(BUCKET)
    .upload(b.caminho, b.buffer, { contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", upsert: true });
  if (error) throw new Error(`Storage: ${error.message}`);
  const { data: lista } = await db.storage.from(BUCKET).list("", { sortBy: { column: "name", order: "desc" }, limit: 100 });
  const velhos = (lista ?? []).filter((f) => f.name.startsWith("backup-akali-")).slice(MANTER).map((f) => f.name);
  if (velhos.length) await db.storage.from(BUCKET).remove(velhos);
  return b;
}

export async function listarBackups() {
  const db = createAdminClient();
  const { data } = await db.storage.from(BUCKET).list("", { sortBy: { column: "name", order: "desc" }, limit: MANTER });
  return (data ?? []).filter((f) => f.name.startsWith("backup-akali-")).map((f) => ({ nome: f.name, tamanho: (f.metadata as { size?: number } | null)?.size ?? null }));
}

export async function linkBackup(nome: string) {
  if (!/^backup-akali-\d{4}-\d{2}-\d{2}\.xlsx$/.test(nome)) throw new Error("Arquivo inválido.");
  const db = createAdminClient();
  const { data, error } = await db.storage.from(BUCKET).createSignedUrl(nome, 120, { download: nome });
  if (error || !data) throw new Error("Não foi possível gerar o link.");
  return data.signedUrl;
}
