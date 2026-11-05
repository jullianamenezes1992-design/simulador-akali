import type { Metadata } from "next";
import Link from "next/link";
import { TarefaItem } from "@/components/admin/Agenda";
import { PageHeader } from "@/components/admin/ui";
import { agoraMs, diaCurtoSP, diaSP, somarDias, type Tarefa } from "@/lib/agenda";
import { requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Agenda" };
export const dynamic = "force-dynamic";

function Grupo({ titulo, cor, itens, hoje, agora, vazio }: { titulo: string; cor?: string; itens: Tarefa[]; hoje: string; agora: number; vazio?: string }) {
  if (!itens.length && !vazio) return null;
  return (
    <section className="card p-4">
      <h2 className={`mb-3 font-bold ${cor ?? ""}`}>
        {titulo} <span className="text-sm font-semibold text-ink-soft">({itens.length})</span>
      </h2>
      {itens.length ? (
        <ul className="space-y-2">
          {itens.map((t) => (
            <TarefaItem key={t.id} t={t} mostrarCliente hoje={hoje} agora={agora} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-soft">{vazio}</p>
      )}
    </section>
  );
}

export default async function AgendaPage() {
  const { supabase } = await requireAdmin();
  const hoje = diaSP();
  const agora = agoraMs();
  const limite = new Date(`${somarDias(hoje, 31)}T00:00:00-03:00`).toISOString();
  const seteDiasAtras = new Date(agora - 7 * 86400000).toISOString();

  const [pend, feitos] = await Promise.all([
    supabase
      .from("lead_tasks")
      .select("*, lead:lead_id(id, nome, codigo, telefone)")
      .eq("status", "pendente")
      .lt("quando", limite)
      .order("quando", { ascending: true })
      .limit(500),
    supabase
      .from("lead_tasks")
      .select("*, lead:lead_id(id, nome, codigo, telefone)")
      .neq("status", "pendente")
      .gte("concluido_em", seteDiasAtras)
      .order("concluido_em", { ascending: false })
      .limit(50),
  ]);
  const ts = (pend.data ?? []) as unknown as Tarefa[];
  const amanha = somarDias(hoje, 1);
  const atrasados = ts.filter((t) => new Date(t.quando).getTime() < agora - 60_000 && diaSP(t.quando) <= hoje);
  const deHoje = ts.filter((t) => diaSP(t.quando) === hoje && !atrasados.includes(t));
  const deAmanha = ts.filter((t) => diaSP(t.quando) === amanha);
  const proximos = ts.filter((t) => diaSP(t.quando) > amanha);
  // agrupa os próximos por dia
  const porDia = new Map<string, Tarefa[]>();
  proximos.forEach((t) => {
    const d = diaSP(t.quando);
    porDia.set(d, [...(porDia.get(d) ?? []), t]);
  });

  return (
    <>
      <PageHeader titulo="Agenda" descricao="Seus compromissos com clientes. Para agendar, abra a ficha do cliente em Leads." />
      <div className="space-y-4">
        <Grupo titulo="Atrasados" cor="text-red-700" itens={atrasados} hoje={hoje} agora={agora} />
        <Grupo titulo="Hoje" itens={deHoje} hoje={hoje} agora={agora} vazio="Nada para hoje." />
        <Grupo titulo="Amanhã" itens={deAmanha} hoje={hoje} agora={agora} />
        {[...porDia.entries()].map(([d, itens]) => (
          <Grupo key={d} titulo={diaCurtoSP(`${d}T12:00:00-03:00`)} itens={itens} hoje={hoje} agora={agora} />
        ))}
        {ts.length === 0 && (
          <p className="card p-4 text-sm text-ink-soft">
            Nenhum compromisso nos próximos 30 dias. Abra um cliente em <Link href="/admin/leads" className="font-semibold text-caixa hover:underline">Leads</Link> e use &quot;Agendar&quot;.
          </p>
        )}
        <Grupo titulo="Concluídos nos últimos 7 dias" itens={(feitos.data ?? []) as unknown as Tarefa[]} hoje={hoje} agora={agora} />
      </div>
    </>
  );
}
