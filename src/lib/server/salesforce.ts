import "server-only";
import { encryptCPF, hashCPF } from "@/lib/crypto";
import { isValidCPF } from "@/lib/cpf";
import { onlyDigits } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

/** Grava o CPF cifrado do cliente (substitui o anterior) e os 2 últimos dígitos para conferência. */
export async function gravarCPF(leadId: string, cpfBruto: string): Promise<{ ok: true } | { erro: string }> {
  const cpf = onlyDigits(cpfBruto);
  if (!isValidCPF(cpf)) return { erro: "CPF inválido." };
  const db = createAdminClient();
  const { error } = await db
    .from("lead_sensitive")
    .upsert({ lead_id: leadId, cpf_enc: encryptCPF(cpf), cpf_hash: hashCPF(cpf) }, { onConflict: "lead_id" });
  if (error) return { erro: error.message };
  const { error: e2 } = await db.from("leads").update({ cpf_final: cpf.slice(-2) }).eq("id", leadId);
  if (e2) return { erro: e2.message };
  return { ok: true };
}

/** Números do Salesforce: só letras, números e hífen. O ID da oportunidade diferencia maiúsculas. */
export function limparCodigoSF(v: unknown, max: number, maiusculo = false) {
  const t = String(v ?? "").trim().replace(/[^A-Za-z0-9-]/g, "").slice(0, max);
  return t ? (maiusculo ? t.toUpperCase() : t) : null;
}
