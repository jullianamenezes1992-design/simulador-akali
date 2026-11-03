/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import ToggleAtivo from "@/components/admin/ToggleAtivo";
import { regiaoLabel, statusObraLabel } from "@/lib/constants";
import { formatBRL, formatDate } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Empreendimentos" };

export default async function EmpreendimentosAdmin({ searchParams }: { searchParams: Promise<{ excluido?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data } = await supabase
    .from("developments")
    .select("id, slug, nome, bairro, regiao, preco_min, faixas, status_obra, unidades_disponiveis, disponivel, ativo, is_demo, oferta_destaque, capa_url, updated_at")
    .order("ativo", { ascending: false })
    .order("updated_at", { ascending: false });
  const devs = data ?? [];
  const demos = devs.filter((d) => d.is_demo && d.ativo).length;

  return (
    <>
      <PageHeader titulo="Empreendimentos" descricao={`${devs.length} cadastrado(s) • ${devs.filter((d) => d.ativo).length} ativo(s) no site.`}>
        <a href="/api/admin/export?tipo=empreendimentos&formato=xlsx" className="btn-secondary">
          <Download size={16} /> Exportar
        </a>
        <Link href="/admin/empreendimentos/novo" className="btn-primary">
          <Plus size={16} /> Novo empreendimento
        </Link>
      </PageHeader>

      {sp.excluido && <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">Empreendimento excluído.</p>}
      {demos > 0 && (
        <p className="mb-4 rounded-xl bg-sol-50 px-4 py-3 text-sm">
          Há <strong>{demos} empreendimento(s) de EXEMPLO</strong> ativos no site. Desative ou exclua-os antes de divulgar.
        </p>
      )}

      <div className="grid gap-3">
        {devs.map((d) => (
          <div key={d.id} className={`card flex flex-col gap-3 p-3 sm:flex-row sm:items-center ${d.ativo ? "" : "opacity-60"}`}>
            <div className="h-20 w-full shrink-0 overflow-hidden rounded-xl bg-mist sm:w-32">
              {d.capa_url && <img src={d.capa_url} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Link href={`/admin/empreendimentos/${d.id}`} className="font-bold text-ink hover:text-caixa">
                  {d.nome}
                </Link>
                {d.is_demo && <span className="chip bg-red-100 text-red-700">Exemplo</span>}
                {d.oferta_destaque && <span className="chip bg-sol-50 text-sol-dark">Destaque</span>}
                {(!d.disponivel || d.unidades_disponiveis === 0) && <span className="chip bg-slate-200 text-slate-700">Sem unidades</span>}
              </div>
              <p className="mt-0.5 text-sm text-ink-soft">
                {[d.bairro, regiaoLabel(d.regiao)].filter(Boolean).join(" • ")} • {statusObraLabel(d.status_obra)} • a partir de{" "}
                {formatBRL(Number(d.preco_min))} • {d.faixas.length ? d.faixas.map((f: number) => `F${f}`).join(", ") : "sem faixa"}
              </p>
              <p className="text-xs text-ink-soft">Atualizado em {formatDate(d.updated_at, true)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ToggleAtivo id={d.id} ativo={d.ativo} />
              <Link href={`/empreendimentos/${d.slug}`} target="_blank" className="btn-secondary px-3">
                Ver
              </Link>
              <Link href={`/admin/empreendimentos/${d.id}`} className="btn-secondary px-3">
                Editar
              </Link>
            </div>
          </div>
        ))}
        {devs.length === 0 && <div className="card p-10 text-center text-ink-soft">Nenhum empreendimento cadastrado.</div>}
      </div>
    </>
  );
}
