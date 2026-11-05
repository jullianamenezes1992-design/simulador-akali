import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LixeiraItem } from "@/components/admin/LeadControls";
import { PageHeader } from "@/components/admin/ui";
import { formatDate, maskPhone } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Lixeira" };
export const dynamic = "force-dynamic";

type Item = { id: string; codigo: string; nome: string; telefone: string; status: string; origem: string | null; created_at: string; excluido_em: string };

export default async function LixeiraPage() {
  const { supabase, papel } = await requireAdmin();
  if (papel !== "admin") {
    return <p className="card p-4 text-sm text-ink-soft">Somente administradores podem ver a lixeira.</p>;
  }
  const { data } = await supabase.rpc("lixeira_listar");
  const itens = (data ?? []) as Item[];
  const DIA = 86400000;
  return (
    <>
      <Link href="/admin/leads" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-caixa hover:underline">
        <ArrowLeft size={16} aria-hidden /> Voltar para Leads
      </Link>
      <PageHeader titulo="Lixeira" descricao="Clientes excluídos ficam aqui por 30 dias. Depois disso são apagados de vez." />
      {itens.length === 0 ? (
        <p className="card p-4 text-sm text-ink-soft">A lixeira está vazia.</p>
      ) : (
        <ul className="card divide-y divide-line">
          {itens.map((l) => {
            const restam = Math.max(0, 30 - Math.floor((Date.parse(new Date().toISOString()) - Date.parse(l.excluido_em)) / DIA));
            return (
              <LixeiraItem
                key={l.id}
                id={l.id}
                nome={l.nome}
                detalhe={`${l.codigo} · ${maskPhone(l.telefone)} · excluído em ${formatDate(l.excluido_em, true)} · apagado de vez em ${restam} dia(s)`}
              />
            );
          })}
        </ul>
      )}
    </>
  );
}
