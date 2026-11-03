import "server-only";
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

/**
 * Criptografia do CPF (AES-256-GCM). A chave fica em CPF_ENCRYPTION_KEY
 * (32 bytes em base64) e nunca é armazenada no banco.
 * Gere uma chave com:  openssl rand -base64 32
 */
function getKey(): Buffer {
  const raw = process.env.CPF_ENCRYPTION_KEY;
  if (!raw) throw new Error("CPF_ENCRYPTION_KEY não configurada");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("CPF_ENCRYPTION_KEY deve ter 32 bytes (base64)");
  return key;
}

export function encryptCPF(cpf: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(cpf, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptCPF(payload: string): string {
  const [v, ivB, tagB, encB] = payload.split(":");
  if (v !== "v1") throw new Error("formato de CPF cifrado desconhecido");
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivB, "base64"));
  decipher.setAuthTag(Buffer.from(tagB, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encB, "base64")), decipher.final()]).toString("utf8");
}

/** HMAC determinístico para localizar cadastros repetidos sem expor o CPF. */
export function hashCPF(cpf: string): string {
  return createHmac("sha256", getKey()).update(`cpf:${cpf}`).digest("hex");
}
