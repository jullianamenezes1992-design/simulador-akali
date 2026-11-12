import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, ExternalLink } from "lucide-react";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { formatDate, maskPhone } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";
import { clientesDaEtapa } from "@/lib/server/abas-clientes";
import { diaSP } from "@/lib/agenda";

export const metadata: Metadata = { title: "Reprovados" };

type SP = Promise<Record<string, string | undefined>>;
const PORTAL = "https://planoeplano.my.site.com/corretores/s/opportunity/";
const data = (d: string | null) => (d ? formatDate(`${d}T12:00:00Z`) : "—");

export default async function ReprovadosPage({ searchParams }: { searchParams: SP }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const q = sp.q ?? "";
  const todos = await clientesDaEtapa(supabase, "reprovado", q);
  const hoje = diaSP();
  const motivos = [...new Set(todos.map((c) => c.parecer_reprovacao).filter(Boolean) as string[])].sort();
  const motivo = motivos.includes(sp.m ?? "") ? sp.m! : "";
  const podeReanalisar = todos.filter((c) => c.reanalise_em && c.reanalise_em <= hoje);
  const lista = todos
    .filter((c) => !motivo || c.parecer_reprovacao === motivo)
    // quem já pode tentar de novo primeiro; depois os mais recentes
    .sort(
      (x, y) =>
        Number(!!y.reanalise_em && y.reanalise_em <= hoje) - Number(!!x.reanalise_em && x.reanalise_em <= hoje) ||
        (y.reprovado_em ?? y.updated_at).localeCompare(x.reprovado_em ?? x.updated_at)
    );
  const link = (m: string) => `/admin/reprovados?${new URLSearchParams({ ...(m ? { m } : {}), ...(q ? { q } : {}) })}`;

  return (
    <>
      <PageHeader titulo="Reprovados" descricao="Clientes com renda ou crédito reprovado: o motivo, e quando vale tentar uma nova análise." />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Reprovados" valor={todos.length} />
        <StatCard label="Já podem reanalisar" valor={podeReanalisar.length} sub="data de reanálise chegou" />
        <StatCard label="Motivos diferentes" valor={motivos.length} />
      </div>

      {motivos.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          <Link href={link("")} className={`filtro ${!motivo ? "filtro-on" : ""}`}>
            Todos os motivos
          </Link>
          {motivos.map((m) => (
            <Link key={m} href={link(m)} className={`filtro ${motivo === m ? "filtro-on" : ""}`}>
              {m} <b>{todos.filter((c) => c.parecer_reprovacao === m).length}</b>
            </Link>
          ))}
        </div>
      )}
      <form className="mb-4 flex gap-2" action="/admin/reprovados">
        {motivo && <input type="hidden" name="m" value={motivo} />}
        <input name="q" defaultValue={q} placeholder="Buscar por nome, telefone, código ou AR" className="input min-w-0 flex-1" />
        <button className="btn-secondary">Buscar</button>
      </form>

      {lista.length === 0 ? (
        <p className="card p-6 text-center text-sm text-ink-soft">Nenhum cliente reprovado{motivo || q ? " com esse filtro" : ""}.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {lista.map((c) => {
            const reanalisar = c.reanalise_em && c.reanalise_em <= hoje;
            return (
              <li key={c.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/admin/leads/${c.id}`} className="font-bold hover:text-caixa">
                      {c.nome}
                    </Link>
                    <p className="text-sm text-ink-soft">{maskPhone(c.telefone)}</p>
                  </div>
                  {c.parecer_reprovacao && <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">{c.parecer_reprovacao}</span>}
                </div>
                {c.motivo_reprovacao && <p className="mt-2 line-clamp-4 rounded-lg bg-mist p-2 text-sm [overflow-wrap:anywhere]">{c.motivo_reprovacao}</p>}
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
                  <dt className="text-ink-soft">Reprovado em</dt>
                  <dd>{data(c.reprovado_em)}</dd>
                  <dt className="text-ink-soft">Nova análise</dt>
                  <dd className={reanalisar ? "font-bold text-emerald-700" : ""}>
                    {c.reanalise_em ? (
                      <>
                        <CalendarClock size={13} className="mr-1 inline" />
                        {reanalisar ? `já pode (desde ${data(c.reanalise_em)})` : data(c.reanalise_em)}
                      </>
                    ) : (
                      "—"
                    )}
                  </dd>
                  <dt className="text-ink-soft">Imóvel</dt>
                  <dd>{c.escolhido?.nome ?? "—"}</dd>
                </dl>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <Link href={`/admin/leads/${c.id}`} className="btn-secondary !py-1.5">
                    Abrir ficha
                  </Link>
                  {c.oportunidade_sf && (
                    <a href={`${PORTAL}${c.oportunidade_sf}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-caixa hover:underline">
                      Salesforce <ExternalLink size={12} />
                    </a>
                  )}
                  {c.ar_numero && <span className="ml-auto font-mono text-xs text-ink-soft">{c.ar_numero}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
