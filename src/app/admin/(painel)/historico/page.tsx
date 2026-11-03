import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { formatDate } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Histórico de alterações" };

const TABELAS: Record<string, string> = {
  developments: "Empreendimentos",
  development_media: "Mídias",
  leads: "Leads",
  simulation_params: "Parâmetros",
  site_settings: "Configurações",
  admin_users: "Usuários",
  exportacao: "Exportações",
};

const POR_PAGINA = 50;

const resumo = (v: unknown) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s && s.length > 60 ? `${s.slice(0, 60)}…` : s;
};

export default async function HistoricoPage({ searchParams }: { searchParams: Promise<{ t?: string; p?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const tabela = sp.t && TABELAS[sp.t] ? sp.t : "";
  const pagina = Math.max(1, Number(sp.p) || 1);

  let q = supabase
    .from("audit_log")
    .select("id, tabela, registro_id, acao, ator_id, dados_antigos, dados_novos, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);
  if (tabela) q = q.eq("tabela", tabela);
  const [{ data, count }, { data: equipe }] = await Promise.all([q, supabase.from("admin_users").select("user_id, nome")]);
  const nomes = new Map((equipe ?? []).map((e) => [e.user_id, e.nome]));
  const total = Math.max(1, Math.ceil((count ?? 0) / POR_PAGINA));

  const linkDe = (r: { tabela: string; registro_id: string | null }) =>
    r.tabela === "leads" && r.registro_id ? `/admin/leads/${r.registro_id}` : r.tabela === "developments" && r.registro_id ? `/admin/empreendimentos/${r.registro_id}` : null;

  return (
    <>
      <PageHeader titulo="Histórico de alterações" descricao="Registro automático de cadastros, edições, exclusões e acessos a dados sensíveis." />
      <div className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1">
        <Link href="/admin/historico" className={`chip shrink-0 px-3 py-1.5 ${!tabela ? "bg-caixa text-white" : "bg-white"}`}>Tudo</Link>
        {Object.entries(TABELAS).map(([k, v]) => (
          <Link key={k} href={`/admin/historico?t=${k}`} className={`chip shrink-0 px-3 py-1.5 ${tabela === k ? "bg-caixa text-white" : "bg-white"}`}>
            {v}
          </Link>
        ))}
      </div>
      <div className="card divide-y divide-line">
        {(data ?? []).map((r) => {
          const href = linkDe(r);
          const mudancas = r.acao === "update" && r.dados_novos ? Object.entries(r.dados_novos as Record<string, unknown>) : [];
          return (
            <div key={r.id} className="px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p>
                  <span className="font-semibold">{TABELAS[r.tabela] ?? r.tabela}</span> • {r.acao} • {nomes.get(r.ator_id ?? "") ?? "sistema"}
                  {href && (
                    <Link href={href} className="ml-2 text-caixa hover:underline">abrir</Link>
                  )}
                </p>
                <span className="text-xs text-ink-soft">{formatDate(r.created_at, true)}</span>
              </div>
              {mudancas.length > 0 && (
                <ul className="mt-1 space-y-0.5 text-xs text-ink-soft">
                  {mudancas.slice(0, 8).map(([k, v]) => (
                    <li key={k}>
                      <span className="font-mono">{k}</span>: {resumo((r.dados_antigos as Record<string, unknown> | null)?.[k])} → {resumo(v)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        {(data ?? []).length === 0 && <p className="p-8 text-center text-ink-soft">Sem registros.</p>}
      </div>
      {total > 1 && (
        <div className="mt-4 flex justify-between text-sm">
          {pagina > 1 ? <Link className="btn-secondary" href={`/admin/historico?${tabela ? `t=${tabela}&` : ""}p=${pagina - 1}`}>Anterior</Link> : <span />}
          <span className="text-ink-soft">Página {pagina} de {total}</span>
          {pagina < total ? <Link className="btn-secondary" href={`/admin/historico?${tabela ? `t=${tabela}&` : ""}p=${pagina + 1}`}>Próxima</Link> : <span />}
        </div>
      )}
    </>
  );
}
