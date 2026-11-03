import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DevelopmentForm from "@/components/admin/DevelopmentForm";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Novo empreendimento" };

export default async function NovoEmpreendimento() {
  await requireAdmin();
  return (
    <>
      <Link href="/admin/empreendimentos" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-caixa hover:underline">
        <ArrowLeft size={14} /> Empreendimentos
      </Link>
      <PageHeader titulo="Novo empreendimento" descricao="Após salvar, você poderá enviar fotos, plantas e vídeos. A página pública é criada automaticamente." />
      <DevelopmentForm />
    </>
  );
}
