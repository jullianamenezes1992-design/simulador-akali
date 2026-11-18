import type { Metadata } from "next";
import Link from "next/link";
import {
  AtSign,
  BadgeCheck,
  Download,
  FolderOpen,
  MoreHorizontal,
  Search,
  Trash2,
  UserPlus,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import NovoContatoRedes from "@/components/admin/NovoContatoRedes";
import { LEAD_STATUS, leadStatusInfo } from "@/lib/constants";
import { formatBRL, formatDate, maskPhone } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Leads" };

const POR_PAGINA = 30;

/** Etapas que têm aba própria (saem da lista de Leads). */
const ABA_PROPRIA: Record<string, { href: string; label: string }> = {
  documentacao: { href: "/admin/montagem", label: "Montagem de pasta" },
  reprovado: { href: "/admin/reprovados", label: "Reprovados" },
};
const FORA_DE_LEADS = `(${Object.keys(ABA_PROPRIA).join(",")})`;

type SP = Promise<Record<string, string | undefined>>;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const status = LEAD_STATUS.some((s) => s.value === sp.status)
    ? sp.status!
    : "";
  const q = (sp.q ?? "")
    .replace(/[%,()]/g, " ")
    .trim()
    .slice(0, 60);
  const de = /^\d{4}-\d{2}-\d{2}$/.test(sp.de ?? "") ? sp.de! : "";
  const ate = /^\d{4}-\d{2}-\d{2}$/.test(sp.ate ?? "") ? sp.ate! : "";
  const pagina = Math.max(1, Number(sp.p) || 1);
  const incompletas = sp.inc === "1";

  let query = supabase
    .from("leads")
    .select(
      "id, codigo, nome, telefone, renda_total, simulacao, simulacao_completa, etapa_parou, status, origem, utm_campaign, created_at, escolhido:escolhido_id(nome)",
      {
        count: "exact",
      },
    )
    // quem já está em "Clientes aprovados", "Montagem de pasta" ou "Reprovados" fica só lá
    .eq("em_aprovados", false)
    .not("status", "in", FORA_DE_LEADS)
    .order("created_at", { ascending: false })
    .range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);
  if (status) query = query.eq("status", status);
  // arquivados (sem potencial) só aparecem no filtro deles ou na busca
  else if (!q) query = query.neq("status", "arquivado");
  if (incompletas) query = query.eq("simulacao_completa", false);
  if (q) {
    const dig = q.replace(/\D/g, "");
    query = query.or(
      [
        `nome.ilike.%${q}%`,
        `codigo.ilike.%${q}%`,
        `email.ilike.%${q}%`,
        dig.length >= 4 ? `telefone.ilike.%${dig}%` : null,
      ]
        .filter(Boolean)
        .join(","),
    );
  }
  if (de) query = query.gte("created_at", `${de}T00:00:00-03:00`);
  if (ate) query = query.lte("created_at", `${ate}T23:59:59-03:00`);

  const [
    contagens,
    totalIncompletas,
    totalAprovados,
    achadosEmAprovados,
    totalPasta,
    totalReprov,
  ] = await Promise.all([
    Promise.all(
      LEAD_STATUS.map((s) =>
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("status", s.value)
          .eq("em_aprovados", false),
      ),
    ),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("simulacao_completa", false)
      .eq("em_aprovados", false)
      .not("status", "in", FORA_DE_LEADS)
      .neq("status", "arquivado"),
    supabase
      .from("aprovados")
      .select("id", { count: "exact", head: true })
      .in("status", ["ativo", "negociando"]),
    // a busca também avisa se o cliente procurado está em Aprovados
    q
      ? supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .or(`em_aprovados.eq.true,status.in.${FORA_DE_LEADS}`)
          .or(
            [
              `nome.ilike.%${q}%`,
              `codigo.ilike.%${q}%`,
              q.replace(/\D/g, "").length >= 4
                ? `telefone.ilike.%${q.replace(/\D/g, "")}%`
                : null,
            ]
              .filter(Boolean)
              .join(","),
          )
      : Promise.resolve({ count: 0 }),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "documentacao")
      .eq("em_aprovados", false),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "reprovado")
      .eq("em_aprovados", false),
  ]);
  const { data: leads, count } = await query;
  const totalPaginas = Math.max(1, Math.ceil((count ?? 0) / POR_PAGINA));

  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (incompletas) params.set("inc", "1");
  if (q) params.set("q", q);
  if (de) params.set("de", de);
  if (ate) params.set("ate", ate);
  const link = (extra: Record<string, string | number | null>) => {
    const p = new URLSearchParams(params);
    Object.entries(extra).forEach(([k, v]) =>
      v == null || v === "" ? p.delete(k) : p.set(k, String(v)),
    );
    return `/admin/leads?${p.toString()}`;
  };
  const exportar = (formato: string) =>
    `/api/admin/export?tipo=leads&formato=${formato}&${params.toString()}`;

  return (
    <>
      <PageHeader
        titulo="Leads"
        descricao={`${count ?? 0} cadastro(s) encontrados.`}
      >
        <NovoContatoRedes titulo="Novo lead" origemPadrao="Base Salesforce" />
        {/* computador: todos os botões à mostra */}
        <div className="hidden flex-wrap gap-2 sm:flex">
          <a
            href="/api/admin/contatos-google"
            className="btn-secondary"
            title="Todos os leads no formato do Google Contatos: Nome - Bairro Zona - Origem"
          >
            <UserPlus size={16} /> Contatos p/ Google
          </a>
          <a href={exportar("xlsx")} className="btn-secondary">
            <Download size={16} /> Excel
          </a>
          <a href={exportar("csv")} className="btn-secondary">
            <Download size={16} /> CSV
          </a>
          <Link href="/admin/redes" className="btn-secondary">
            <AtSign size={16} /> Redes sociais
          </Link>
          <Link href="/admin/leads/lixeira" className="btn-secondary">
            <Trash2 size={16} /> Lixeira
          </Link>
        </div>
        {/* celular: só "Novo lead" à mostra, o resto num menu */}
        <details className="relative sm:hidden">
          <summary className="btn-secondary cursor-pointer list-none">
            <MoreHorizontal size={16} /> Mais opções
          </summary>
          <div className="absolute right-0 z-30 mt-2 grid w-60 gap-1 rounded-2xl border border-line bg-white p-2 shadow-lg [&>a]:justify-start [&>a]:border-0 [&>a]:shadow-none">
            <a
              href="/api/admin/contatos-google"
              className="btn-secondary w-full"
              title="Todos os leads no formato do Google Contatos: Nome - Bairro Zona - Origem"
            >
              <UserPlus size={16} /> Contatos p/ Google
            </a>
            <a href={exportar("xlsx")} className="btn-secondary w-full">
              <Download size={16} /> Excel
            </a>
            <a href={exportar("csv")} className="btn-secondary w-full">
              <Download size={16} /> CSV
            </a>
            <Link href="/admin/redes" className="btn-secondary w-full">
              <AtSign size={16} /> Redes sociais
            </Link>
            <Link href="/admin/leads/lixeira" className="btn-secondary w-full">
              <Trash2 size={16} /> Lixeira
            </Link>
          </div>
        </details>
      </PageHeader>
      {sp.lixeira === "1" && (
        <p className="mb-4 rounded-xl bg-caixa-50 px-4 py-3 text-sm">
          Cliente movido para a lixeira. Para desfazer, abra a{" "}
          <Link
            href="/admin/leads/lixeira"
            className="font-semibold text-caixa underline"
          >
            Lixeira
          </Link>{" "}
          e toque em Restaurar.
        </p>
      )}

      {/* Etapas comerciais */}
      <div className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <Link
          href={link({ status: null, inc: null, p: null })}
          className={`chip shrink-0 px-3 py-1.5 ${!status && !incompletas ? "bg-caixa text-white" : "bg-white text-ink"}`}
        >
          Todos
        </Link>
        <Link
          href={link({ status: null, inc: incompletas ? null : "1", p: null })}
          className={`chip shrink-0 px-3 py-1.5 ${incompletas ? "bg-sol text-ink" : "bg-sol-50 text-ink"}`}
        >
          Simulação incompleta{" "}
          <span className="ml-1 opacity-70">{totalIncompletas.count ?? 0}</span>
        </Link>
        {LEAD_STATUS.map((s, i) =>
          ABA_PROPRIA[s.value] ? null : (
            <Link
              key={s.value}
              href={link({ status: s.value, p: null })}
              className={`chip shrink-0 px-3 py-1.5 ${status === s.value ? "bg-caixa text-white" : "bg-white text-ink"}`}
            >
              {s.label}{" "}
              <span className="ml-1 opacity-70">{contagens[i].count ?? 0}</span>
            </Link>
          ),
        )}
        <Link
          href="/admin/montagem"
          className="chip shrink-0 border-violet-300 bg-violet-50 px-3 py-1.5 text-violet-900"
        >
          <FolderOpen size={14} className="mr-1" /> Montagem de pasta{" "}
          <span className="ml-1 opacity-70">{totalPasta.count ?? 0}</span> →
        </Link>
        <Link
          href="/admin/aprovados"
          className="chip shrink-0 border-emerald-300 bg-emerald-50 px-3 py-1.5 text-emerald-900"
        >
          <BadgeCheck size={14} className="mr-1" /> Em Aprovados{" "}
          <span className="ml-1 opacity-70">{totalAprovados.count ?? 0}</span> →
        </Link>
        <Link
          href="/admin/reprovados"
          className="chip shrink-0 border-red-300 bg-red-50 px-3 py-1.5 text-red-900"
        >
          <XCircle size={14} className="mr-1" /> Reprovados{" "}
          <span className="ml-1 opacity-70">{totalReprov.count ?? 0}</span> →
        </Link>
      </div>
      <p className="-mt-2 mb-3 text-xs text-ink-soft">
        Clientes em documentação, aprovados e reprovados ficam nas abas
        próprias.
      </p>

      <form method="get" className="card mb-4 space-y-2 p-3">
        {status && <input type="hidden" name="status" value={status} />}
        {incompletas && <input type="hidden" name="inc" value="1" />}
        <div className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar nome, telefone ou código"
            className="input min-w-0 flex-1"
          />
          <button className="btn-primary shrink-0 px-4" aria-label="Buscar">
            <Search size={16} />
            <span className="hidden sm:inline">Buscar</span>
          </button>
        </div>
        {/* período de cadastro: fica recolhido para não poluir a tela */}
        <details open={!!(de || ate)} className="group">
          <summary className="cursor-pointer list-none text-xs font-semibold text-caixa">
            <span className="group-open:hidden">
              + Filtrar por data de cadastro
            </span>
            <span className="hidden group-open:inline">− Data de cadastro</span>
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:max-w-md">
            <label className="min-w-0 text-xs font-semibold text-ink-soft">
              De
              <input
                type="date"
                name="de"
                defaultValue={de}
                className="input mt-1 w-full min-w-0"
              />
            </label>
            <label className="min-w-0 text-xs font-semibold text-ink-soft">
              Até
              <input
                type="date"
                name="ate"
                defaultValue={ate}
                className="input mt-1 w-full min-w-0"
              />
            </label>
          </div>
        </details>
      </form>

      {q && (achadosEmAprovados.count ?? 0) > 0 && (
        <p className="mb-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {achadosEmAprovados.count} cliente(s) com essa busca estão em outra
          aba:{" "}
          <Link
            href={`/admin/montagem?q=${encodeURIComponent(q)}`}
            className="font-semibold underline"
          >
            Montagem de pasta
          </Link>
          ,{" "}
          <Link
            href={`/admin/aprovados?q=${encodeURIComponent(q)}`}
            className="font-semibold underline"
          >
            Aprovados
          </Link>{" "}
          ou{" "}
          <Link
            href={`/admin/reprovados?q=${encodeURIComponent(q)}`}
            className="font-semibold underline"
          >
            Reprovados
          </Link>
          .
        </p>
      )}

      {/* celular: um cartão por cliente */}
      <ul className="space-y-2 sm:hidden">
        {(leads ?? []).map((l) => {
          const st = leadStatusInfo(l.status);
          const faixa = !l.simulacao_completa
            ? "Sem simulação"
            : ((l.simulacao as { faixa?: { nome: string } | null } | null)
                ?.faixa?.nome ?? "Fora do programa");
          const escolhido = (l.escolhido as unknown as { nome: string } | null)
            ?.nome;
          return (
            <li key={l.id}>
              <Link
                href={`/admin/leads/${l.id}`}
                className="card block p-4 transition active:scale-[0.99] active:bg-mist"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate font-bold text-ink">
                    {l.nome}
                  </p>
                  <span className={`chip shrink-0 ${st.cor}`}>{st.label}</span>
                </div>
                <p className="mt-0.5 text-sm text-ink-soft">
                  {maskPhone(l.telefone)}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft">
                  <span>
                    💰{" "}
                    {Number(l.renda_total) > 0
                      ? formatBRL(Number(l.renda_total))
                      : "renda —"}{" "}
                    · {faixa}
                  </span>
                  {l.origem && <span>📍 {l.origem}</span>}
                  <span>📅 {formatDate(l.created_at)}</span>
                </div>
                {escolhido && (
                  <p className="mt-1 truncate text-xs font-semibold text-caixa">
                    🏠 {escolhido}
                  </p>
                )}
                {!l.simulacao_completa && (
                  <span className="chip mt-2 w-fit bg-sol-50 text-ink">
                    Simulação incompleta
                    {l.etapa_parou ? ` · parou na etapa ${l.etapa_parou}` : ""}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
        {(leads ?? []).length === 0 && (
          <li className="card p-8 text-center text-sm text-ink-soft">
            Nenhum lead encontrado.
          </li>
        )}
      </ul>

      <div className="card hidden overflow-hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-mist text-left text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Renda / faixa</th>
                <th className="px-4 py-3">Escolhido</th>
                <th className="px-4 py-3">Origem</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(leads ?? []).map((l) => {
                const st = leadStatusInfo(l.status);
                const faixa = !l.simulacao_completa
                  ? "Ainda sem simulação"
                  : ((l.simulacao as { faixa?: { nome: string } | null } | null)
                      ?.faixa?.nome ?? "Fora do programa");
                return (
                  <tr key={l.id} className="hover:bg-mist/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/leads/${l.id}`}
                        className="font-semibold text-caixa hover:underline"
                      >
                        {l.nome}
                      </Link>
                      <p className="text-xs text-ink-soft">
                        {l.codigo} • {maskPhone(l.telefone)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {Number(l.renda_total) > 0
                        ? formatBRL(Number(l.renda_total))
                        : "—"}
                      <p className="text-xs text-ink-soft">{faixa}</p>
                    </td>
                    <td className="px-4 py-3">
                      {(l.escolhido as unknown as { nome: string } | null)
                        ?.nome ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {l.origem ?? "—"}
                      {l.utm_campaign && (
                        <p className="text-xs text-ink-soft">
                          {l.utm_campaign}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(l.created_at, true)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`chip ${st.cor}`}>{st.label}</span>
                      {!l.simulacao_completa && (
                        <span className="chip mt-1 block w-fit bg-sol-50 text-ink">
                          Incompleta
                          {l.etapa_parou
                            ? ` • parou na etapa ${l.etapa_parou}`
                            : ""}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {(leads ?? []).length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-ink-soft"
                  >
                    Nenhum lead encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPaginas > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          {pagina > 1 ? (
            <Link href={link({ p: pagina - 1 })} className="btn-secondary">
              Anterior
            </Link>
          ) : (
            <span />
          )}
          <span className="text-ink-soft">
            Página {pagina} de {totalPaginas}
          </span>
          {pagina < totalPaginas ? (
            <Link href={link({ p: pagina + 1 })} className="btn-secondary">
              Próxima
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </>
  );
}
