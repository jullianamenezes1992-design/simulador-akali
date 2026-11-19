import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, FileSearch } from "lucide-react";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { formatDate, maskPhone } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";
import { clientesDaEtapa, diasDesde } from "@/lib/server/abas-clientes";

export const metadata: Metadata = { title: "Pastas em análise" };

type SP = Promise<Record<string, string | undefined>>;
const PORTAL = "https://planoeplano.my.site.com/corretores/s/opportunity/";

const corAR = (s: string | null) =>
  !s ? "bg-mist text-ink-soft" : /aprovad/i.test(s) ? "bg-emerald-100 text-emerald-800" : /reprov/i.test(s) ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900";

/** Clientes na etapa "Análise de crédito": pasta enviada, esperando o resultado. */
export default async function AnalisePage({ searchParams }: { searchParams: SP }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const q = sp.q ?? "";
  const filtro = ["demorando", "sem_ar"].includes(sp.f ?? "") ? sp.f! : "";
  const todos = await clientesDaEtapa(supabase, "analise_credito", q);

  const comDias = todos.map((c) => ({ c, dias: diasDesde(c.updated_at) ?? 0 }));
  const demorando = comDias.filter(({ dias }) => dias >= 5);
  const semAR = comDias.filter(({ c }) => !c.ar_numero);
  const lista = (filtro === "demorando" ? demorando : filtro === "sem_ar" ? semAR : comDias).sort((x, y) => y.dias - x.dias);
  const link = (f: string) => `/admin/analise?${new URLSearchParams({ ...(f ? { f } : {}), ...(q ? { q } : {}) })}`;

  return (
    <>
      <PageHeader titulo="Pastas em análise" descricao="Pasta enviada, esperando o resultado da análise de crédito. Quem espera há mais tempo aparece primeiro." />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <StatCard label="Em análise" valor={todos.length} />
        <StatCard label="Há 5+ dias" valor={demorando.length} sub="cobrar retorno" />
        <StatCard label="Sem nº de AR" valor={semAR.length} sub="anotar na ficha" />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {[
          ["", "Todas"],
          ["demorando", `Há 5+ dias (${demorando.length})`],
          ["sem_ar", "Sem nº de AR"],
        ].map(([v, l]) => (
          <Link key={v} href={link(v)} className={`filtro ${filtro === v ? "filtro-on" : ""}`}>
            {l}
          </Link>
        ))}
      </div>
      <form className="mb-4 flex gap-2" action="/admin/analise">
        {filtro && <input type="hidden" name="f" value={filtro} />}
        <input name="q" defaultValue={q} placeholder="Buscar por nome, telefone, código ou AR" className="input min-w-0 flex-1" />
        <button className="btn-secondary">Buscar</button>
      </form>

      {lista.length === 0 ? (
        <p className="card p-6 text-center text-sm text-ink-soft">
          {filtro || q ? "Nenhuma pasta com esse filtro." : "Nenhuma pasta em análise. Quando você mudar a etapa do cliente para \"Análise de crédito\", ele aparece aqui."}
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {lista.map(({ c, dias }) => (
            <li key={c.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/admin/leads/${c.id}`} className="font-bold hover:text-caixa">
                    {c.nome}
                  </Link>
                  <p className="text-sm text-ink-soft">{maskPhone(c.telefone)}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${dias >= 5 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"}`}>
                  <FileSearch size={12} className="mr-1 inline" />
                  {dias === 0 ? "hoje" : `${dias} dia${dias === 1 ? "" : "s"}`}
                </span>
              </div>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm [overflow-wrap:anywhere]">
                <dt className="text-ink-soft">Imóvel</dt>
                <dd>{c.escolhido?.nome ?? "—"}</dd>
                <dt className="text-ink-soft">Análise</dt>
                <dd>
                  {c.ar_numero ? (
                    <>
                      <span className="font-mono">{c.ar_numero}</span>{" "}
                      <span className={`rounded-full px-2 text-xs font-bold ${corAR(c.ar_status)}`}>{c.ar_status ?? "sem status"}</span>
                    </>
                  ) : (
                    <span className="text-amber-800">sem nº de AR</span>
                  )}
                </dd>
                {c.pendencias && (
                  <>
                    <dt className="text-ink-soft">Falta</dt>
                    <dd className="font-semibold text-caixa">{c.pendencias}</dd>
                  </>
                )}
                <dt className="text-ink-soft">Origem</dt>
                <dd>{c.origem ?? "—"}</dd>
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
                <span className="ml-auto text-xs text-ink-soft">Atualizado em {formatDate(c.updated_at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
