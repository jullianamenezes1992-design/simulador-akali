import { onlyDigits } from "./format";

/**
 * Monta o link do WhatsApp. Por regra, a mensagem contém SOMENTE:
 * nome do cliente, código da simulação, empreendimento e o pedido de atendimento.
 * Nunca inclua CPF, renda ou outros dados financeiros.
 */
export function montarLinkWhatsApp(
  numero: string | null | undefined,
  dados: { nome?: string | null; codigo?: string | null; empreendimento?: string | null }
): string | null {
  const tel = onlyDigits(numero ?? "");
  if (tel.length < 10) return null;
  const linhas = [
    dados.nome ? `Olá! Meu nome é ${dados.nome.trim()}.` : "Olá!",
    dados.codigo ? `Código da minha simulação: ${dados.codigo}.` : null,
    dados.empreendimento ? `Tenho interesse no empreendimento: ${dados.empreendimento}.` : null,
    "Gostaria de receber atendimento.",
  ].filter(Boolean);
  return `https://wa.me/${tel}?text=${encodeURIComponent(linhas.join("\n"))}`;
}
