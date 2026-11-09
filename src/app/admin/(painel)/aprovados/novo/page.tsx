import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import AprovadoForm from "@/components/admin/AprovadoForm";
import type { Aprovado } from "@/lib/aprovados";
import { requireAdmin } from "@/lib/server/auth";
import { apoioFormAprovado } from "@/lib/server/aprovados-form";

export const metadata: Metadata = { title: "Novo aprovado" };

export default async function NovoAprovado({ searchParams }: { searchParams: Promise<{ lead?: string }> }) {
  const { supabase } = await requireAdmin();
  const { lead } = await searchParams;
  const apoio = await apoioFormAprovado(supabase);

  // Vindo da ficha do cliente: já preenche com o que o CRM sabe
  let inicial: Partial<Aprovado> | null = null;
  if (lead && /^[0-9a-f-]{36}$/i.test(lead)) {
    const { data: l } = await supabase
      .from("leads")
      .select("id, nome, telefone, tipo_renda, renda_total, fgts_saldo, regioes, dormitorios_min, simulacao")
      .eq("id", lead)
      .maybeSingle();
    if (l) {
      const sim = l.simulacao as { financiamentoMax?: number; subsidioMax?: number } | null;
      inicial = {
        lead_id: l.id,
        nome: l.nome,
        telefone: l.telefone,
        tipo_renda: l.tipo_renda,
        renda_familiar: Number(l.renda_total ?? 0),
        fgts: Number(l.fgts_saldo ?? 0),
        financiamento: Number(sim?.financiamentoMax ?? 0) || 0,
        regioes: l.regioes ?? [],
        dormitorios_min: l.dormitorios_min,
        data_analise: new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" }),
      };
    }
  }

  return (
    <>
      <Link href="/admin/aprovados" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-caixa hover:underline">
        <ArrowLeft size={14} /> Clientes aprovados
      </Link>
      <PageHeader
        titulo="Novo aprovado"
        descricao={inicial ? "Preenchido com os dados da simulação do cliente: confira e ajuste com os valores da aprovação da Caixa." : "Cadastre o cliente com os valores aprovados pela Caixa."}
      />
      <div className="max-w-3xl">
        <AprovadoForm inicial={inicial} faixas={apoio.faixas} leads={apoio.leads} />
      </div>
    </>
  );
}
