import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { LEAD_STATUS, leadStatusInfo } from "@/lib/constants";
import { formatBRL, formatDate, maskPhone } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Leads" };

const POR_PAGINA = 30;

type SP = Promise<Record<string, string | undefined>>;

export default async function LeadsPage({ searchParams }: { searchParams: SP }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const status = LEAD_STATUS.some((s) => s.value === sp.status) ? sp.status! : "";
  const q = (sp.q ?? "").replace(/[%,()]/g, " ").trim().slice(0, 60);
  const de = /^\d{4}-\d{2}-\d{2}$/.test(sp.de ?? "") ? sp.de! : "";
  const ate = /^\d{4}-\d{2}-\d{2}$/.test(sp.ate ?? "") ? sp.ate! : "";
  const pagina = Math.max(1, Number(sp.p) || 1);

  let query = supabase
    .from("leads")
    .select("id, codigo, nome, telefone, renda_total, simulacao, status, origem, utm_campaign, created_at, escolhido:escolhido_id(nome)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);
  if (status) query = query.eq("status", status);
  if (q) {
    const dig = q.replace(/\D/g, "");
    query = query.or(
      [`nome.ilike.%${q}%`, `codigo.ilike.%${q}%`, `email.ilike.%${q}%`, dig.length >= 4 ? `telefone.ilike.%${dig}%` : null]
        .filter(Boolean)
        .join(",")
    );
  }
  if (de) query = query.gte("created_at", `${de}T00:00:00-03:00`);
  if (ate) query = query.lte("created_at", `${ate}T23:59:59-03:00`);

  const contagens = await Promise.all(
    LEAD_STATUS.map((s) => supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", s.value))
  );
  const { data: leads, count } = await query;
  const totalPaginas = Math.max(1, Math.ceil((count ?? 0) / POR_PAGINA));

  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  if (de) params.set("de", de);
  if (ate) params.set("ate", ate);
  const link = (extra: Record<string, string | number | null>) => {
    const p = new URLSearchParams(params);
    Object.entries(extra).forEach(([k, v]) => (v == null || v === "" ? p.delete(k) : p.set(k, String(v))));
    return `/admin/leads?${p.toString()}`;
  };
  const exportar = (formato: string) => `/api/admin/export?tipo=leads&formato=${formato}&${params.toString()}`;

  return (
    <>
      <PageHeader titulo="Leads" descricao={`${count ?? 0} cadastro(s) encontrados.`}>
        <a href={exportar("xlsx")} className="btn-secondary">
          <Download size={16} /> Excel
        </a>
        <a href={exportar("csv")} className="btn-secondary">
          <Download size={16} /> CSV
        </a>
      </PageHeader>

      {/* Etapas comerciais */}
      <div className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <Link href={link({ status: null, p: null })} className={`chip shrink-0 px-3 py-1.5 ${!status ? "bg-caixa text-white" : "bg-white text-ink"}`}>
          Todos
        </Link>
        {LEAD_STATUS.map((s, i) => (
          <Link
            key={s.value}
            href={link({ status: s.value, p: null })}
            className={`chip shrink-0 px-3 py-1.5 ${status === s.value ? "bg-caixa text-white" : "bg-white text-ink"}`}
          >
            {s.label} <span className="ml-1 opacity-70">{contagens[i].count ?? 0}</span>
          </Link>
        ))}
      </div>

      <form method="get" className="card mb-4 grid gap-3 p-3 sm:grid-cols-[1fr_auto_auto_auto]">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q} placeholder="Buscar por nome, código, e-mail ou telefone" className="input" />
        <input type="date" name="de" defaultValue={de} className="input" aria-label="Data inicial" />
        <input type="date" name="ate" defaultValue={ate} className="input" aria-label="Data final" />
        <button className="btn-primary">Filtrar</button>
      </form>

      <div className="card overflow-hidden">
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
                const faixa = (l.simulacao as { faixa?: { nome: string } | null } | null)?.faixa?.nome ?? "Fora do programa";
                return (
                  <tr key={l.id} className="hover:bg-mist/60">
                    <td className="px-4 py-3">
                      <Link href={`/admin/leads/${l.id}`} className="font-semibold text-caixa hover:underline">
                        {l.nome}
                      </Link>
                      <p className="text-xs text-ink-soft">
                        {l.codigo} • {maskPhone(l.telefone)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {formatBRL(Number(l.renda_total))}
                      <p className="text-xs text-ink-soft">{faixa}</p>
                    </td>
                    <td className="px-4 py-3">{(l.escolhido as unknown as { nome: string } | null)?.nome ?? "—"}</td>
                    <td className="px-4 py-3">
                      {l.origem ?? "—"}
                      {l.utm_campaign && <p className="text-xs text-ink-soft">{l.utm_campaign}</p>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(l.created_at, true)}</td>
                    <td className="px-4 py-3">
                      <span className={`chip ${st.cor}`}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
              {(leads ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
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
          {pagina > 1 ? <Link href={link({ p: pagina - 1 })} className="btn-secondary">Anterior</Link> : <span />}
          <span className="text-ink-soft">
            Página {pagina} de {totalPaginas}
          </span>
          {pagina < totalPaginas ? <Link href={link({ p: pagina + 1 })} className="btn-secondary">Próxima</Link> : <span />}
        </div>
      )}
    </>
  );
}
