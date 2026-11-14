"use client";

import { MessageCircle } from "lucide-react";
import { registrarConversa } from "@/app/admin/actions";

/** Botão "Chamar" da ficha: abre o WhatsApp e registra o contato do dia. */
export default function ChamarLead({ leadId, telefone, rotulo }: { leadId: string; telefone: string; rotulo: string }) {
  return (
    <a
      href={`https://wa.me/55${telefone}`}
      target="_blank"
      rel="noreferrer"
      className="btn-whatsapp"
      onClick={() => {
        registrarConversa(leadId).catch(() => undefined);
      }}
    >
      <MessageCircle size={16} /> {rotulo}
    </a>
  );
}
