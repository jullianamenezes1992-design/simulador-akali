/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import ToggleAtivo from "@/components/admin/ToggleAtivo";
import CompartilharImovel from "@/components/admin/CompartilharImovel";
import { REGIOES, regiaoLabel, statusObraLabel } from "@/lib/constants";
import { formatDate, formatPreco } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Empreendimentos" };

export default async function EmpreendimentosAdmin({ searchParams }: { searchParams: Promise<{ excluido?: string; regiao?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data } = await supabase
    .from("developments")
    .select("id, slug, nome, bairro, regiao, preco_min, faixas, status_obra, unidades_disponiveis, disponivel, ativo, is_demo, oferta_destaque, capa_url, updated_at")
    .order("ativo", { ascending: false })
    .order("updated_at", { ascending: false });
  const todos = data ?? [];
  const regiao = REGIOES.some((r) => r.value === sp.regiao) ? sp.regiao! : null;
  const devs = regiao ? todos.filter((d) => d.regiao === regiao) : todos;
  const demos = todos.filter((d) => d.is_demo && d.ativo).length;
  const contagem = (r: string) => todos.filter((d) => d.regiao === r && d.ativo).length;
  const regioesComImoveis = REGIOES.filter((r) => todos.some((d) => d.regiao === r.value && d.ativo));

  return (
    <>
      <PageHeader titulo="Empreendimentos" descricao={`${todos.length} cadastrado(s) • ${todos.filter((d) => d.ativo).length} ativo(s) no site.`}>
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

      {/* Filtro por região */}
      <nav aria-label="Filtrar por região" className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Link
          href="/admin/empreendimentos"
          className={`chip shrink-0 px-3.5 py-2 text-sm ${!regiao ? "bg-caixa text-white" : "bg-white text-ink ring-1 ring-line"}`}
        >
          Todas <span className="ml-1 opacity-70">{todos.filter((d) => d.ativo).length}</span>
        </Link>
        {regioesComImoveis.map((r) => (
          <Link
            key={r.value}
            href={`/admin/empreendimentos?regiao=${r.value}`}
            className={`chip shrink-0 px-3.5 py-2 text-sm ${regiao === r.value ? "bg-caixa text-white" : "bg-white text-ink ring-1 ring-line"}`}
          >
            {r.label} <span className="ml-1 opacity-70">{contagem(r.value)}</span>
          </Link>
        ))}
      </nav>

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
                {[d.bairro, regiaoLabel(d.regiao)].filter(Boolean).join(" • ")} • {statusObraLabel(d.status_obra)} • {d.preco_min == null ? "preço" : "a partir de"}{" "}
                {formatPreco(d.preco_min == null ? null : Number(d.preco_min))} • {d.faixas.length ? d.faixas.map((f: number) => `F${f}`).join(", ") : "sem faixa"}
              </p>
              <p className="text-xs text-ink-soft">Atualizado em {formatDate(d.updated_at, true)}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {d.ativo && <CompartilharImovel slug={d.slug} nome={d.nome} preco={d.preco_min == null ? null : Number(d.preco_min)} />}
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
        {devs.length === 0 && <div className="card p-10 text-center text-ink-soft">Nenhum empreendimento nesta região.</div>}
      </div>
    </>
  );
}
