import Link from "next/link";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { agoraMs, diaSP } from "@/lib/agenda";
import { CalendarDays } from "lucide-react";
import { LEAD_STATUS, leadStatusInfo } from "@/lib/constants";
import { formatBRL, formatDate } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";

const diasAtras = (n: number) => new Date(Date.now() - n * 864e5).toISOString();

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const d7 = diasAtras(7);
  const d30 = diasAtras(30);

  const fimHoje = new Date(`${diaSP()}T23:59:59-03:00`).toISOString();
  const [total, semana, mes, cliquesMes, devsAtivos, recentes, statusRows, escolhidos, params, incompletas, agendaHoje, agendaAtrasada] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", d7),
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", d30).eq("simulacao_completa", true),
    supabase.from("lead_events").select("lead_id").eq("tipo", "clique_whatsapp").gte("created_at", d30).not("lead_id", "is", null),
    supabase.from("developments").select("id", { count: "exact", head: true }).eq("ativo", true),
    supabase.from("leads").select("id, codigo, nome, renda_total, status, origem, created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("leads").select("status").is("anonimizado_em", null).limit(10000),
    supabase.from("leads").select("escolhido_id, developments:escolhido_id(nome)").not("escolhido_id", "is", null).gte("created_at", d30).limit(5000),
    supabase.from("simulation_params").select("versao, descricao, created_at").eq("ativo", true).maybeSingle(),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("simulacao_completa", false),
    supabase.from("lead_tasks").select("id", { count: "exact", head: true }).eq("status", "pendente").lte("quando", fimHoje).gte("quando", new Date(`${diaSP()}T00:00:00-03:00`).toISOString()),
    supabase.from("lead_tasks").select("id", { count: "exact", head: true }).eq("status", "pendente").lt("quando", new Date(agoraMs() - 60_000).toISOString()),
  ]);

  const porStatus = new Map<string, number>();
  (statusRows.data ?? []).forEach((r) => porStatus.set(r.status, (porStatus.get(r.status) ?? 0) + 1));

  const leadsComClique = new Set((cliquesMes.data ?? []).map((r) => r.lead_id)).size;
  const conversao = mes.count ? Math.round((leadsComClique / mes.count) * 100) : 0;

  const ranking = new Map<string, number>();
  (escolhidos.data ?? []).forEach((r) => {
    const nome = (r.developments as unknown as { nome: string } | null)?.nome ?? "—";
    ranking.set(nome, (ranking.get(nome) ?? 0) + 1);
  });
  const top = [...ranking.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <>
      <PageHeader titulo="Visão geral" descricao="Resumo do funil de simulações e atendimento." />

      <Link
        href="/admin/agenda"
        className={`mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${(agendaAtrasada.count ?? 0) > 0 ? "bg-red-50 text-red-800" : "bg-caixa-50 text-caixa"}`}
      >
        <span className="flex items-center gap-2">
          <CalendarDays size={18} aria-hidden />
          {(agendaHoje.count ?? 0) === 0 ? "Nenhum compromisso para hoje" : `Você tem ${agendaHoje.count} compromisso(s) hoje`}
          {(agendaAtrasada.count ?? 0) > 0 && ` · ${agendaAtrasada.count} atrasado(s)`}
        </span>
        <span className="underline">Abrir agenda</span>
      </Link>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Leads (total)" valor={total.count ?? 0} sub={`${incompletas.count ?? 0} com simulação incompleta`} />
        <StatCard label="Últimos 7 dias" valor={semana.count ?? 0} />
        <StatCard label="Simulação → WhatsApp (30d)" valor={`${conversao}%`} sub={`${leadsComClique} de ${mes.count ?? 0} leads`} />
        <StatCard label="Empreendimentos ativos" valor={devsAtivos.count ?? 0} />
      </div>

      {!params.data && (
        <p className="mt-4 rounded-xl bg-sol-50 px-4 py-3 text-sm font-semibold">
          Nenhuma versão de parâmetros ativa — a simulação pública está indisponível.{" "}
          <Link href="/admin/parametros" className="text-caixa underline">Configurar agora</Link>
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="font-bold">Leads recentes</h2>
            <Link href="/admin/leads" className="text-sm font-semibold text-caixa hover:underline">Ver todos</Link>
          </div>
          <ul className="divide-y divide-line">
            {(recentes.data ?? []).map((l) => {
              const st = leadStatusInfo(l.status);
              return (
                <li key={l.id}>
                  <Link href={`/admin/leads/${l.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-mist">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{l.nome}</p>
                      <p className="text-xs text-ink-soft">
                        {l.codigo} • {formatBRL(Number(l.renda_total))} • {l.origem ?? "—"} • {formatDate(l.created_at, true)}
                      </p>
                    </div>
                    <span className={`chip shrink-0 ${st.cor}`}>{st.label}</span>
                  </Link>
                </li>
              );
            })}
            {(recentes.data ?? []).length === 0 && <li className="px-4 py-8 text-center text-sm text-ink-soft">Nenhum lead ainda.</li>}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="card p-4">
            <h2 className="font-bold">Funil comercial</h2>
            <ul className="mt-3 space-y-2">
              {LEAD_STATUS.map((s) => {
                const n = porStatus.get(s.value) ?? 0;
                const max = Math.max(1, ...porStatus.values());
                return (
                  <li key={s.value}>
                    <Link href={`/admin/leads?status=${s.value}`} className="block text-sm hover:text-caixa">
                      <div className="flex justify-between">
                        <span>{s.label}</span>
                        <span className="font-semibold">{n}</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-mist">
                        <div className="h-full rounded-full bg-caixa" style={{ width: `${(n / max) * 100}%` }} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card p-4">
            <h2 className="font-bold">Mais escolhidos (30 dias)</h2>
            {top.length === 0 ? (
              <p className="mt-2 text-sm text-ink-soft">Ainda sem escolhas registradas.</p>
            ) : (
              <ol className="mt-3 space-y-1.5 text-sm">
                {top.map(([nome, n]) => (
                  <li key={nome} className="flex justify-between gap-2">
                    <span className="truncate">{nome}</span>
                    <span className="font-semibold">{n}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {params.data && (
            <section className="card p-4 text-sm">
              <h2 className="font-bold">Parâmetros ativos</h2>
              <p className="mt-1 text-ink-soft">
                Versão {params.data.versao} — {params.data.descricao ?? "sem descrição"}
              </p>
              <Link href="/admin/parametros" className="mt-2 inline-block font-semibold text-caixa hover:underline">Gerenciar</Link>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
