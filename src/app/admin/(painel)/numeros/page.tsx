import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { diaSP } from "@/lib/agenda";
import { LEAD_STATUS } from "@/lib/constants";
import { requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Números" };
export const dynamic = "force-dynamic";

type P = "dia" | "semana" | "mes";
const ROTULO: Record<P, { atual: string; anterior: string }> = {
  dia: { atual: "Hoje", anterior: "ontem" },
  semana: { atual: "Esta semana", anterior: "semana passada (mesmos dias)" },
  mes: { atual: "Este mês", anterior: "mês passado (mesmos dias)" },
};

const addDias = (d: string, n: number) => {
  const x = new Date(`${d}T12:00:00Z`);
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
};
const inicioSP = (d: string) => new Date(`${d}T00:00:00-03:00`).toISOString();

/** Períodos (datas de São Paulo): atual = [ini, fim), anterior = mesmo tamanho logo antes. */
function periodos(p: P, hoje: string) {
  const fim = addDias(hoje, 1);
  let ini = hoje;
  let iniAnt: string;
  if (p === "dia") iniAnt = addDias(hoje, -1);
  else if (p === "semana") {
    const dow = new Date(`${hoje}T12:00:00Z`).getUTCDay(); // 0 = domingo
    ini = addDias(hoje, -((dow + 6) % 7)); // segunda-feira
    iniAnt = addDias(ini, -7);
  } else {
    ini = `${hoje.slice(0, 8)}01`;
    const m = new Date(`${ini}T12:00:00Z`);
    m.setUTCMonth(m.getUTCMonth() - 1);
    iniAnt = m.toISOString().slice(0, 10);
  }
  const dias = Math.round((Date.parse(fim) - Date.parse(ini)) / 864e5);
  const fimAnt = p === "dia" ? ini : addDias(iniAnt, dias);
  return { ini, fim, iniAnt, fimAnt, dias };
}

type Ev = {
  tipo: string;
  created_at: string;
  dados: Record<string, unknown> | null;
};

export default async function NumerosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const p: P = sp.p === "dia" || sp.p === "mes" ? sp.p : "semana";
  const hoje = diaSP();
  const { ini, fim, iniAnt, fimAnt, dias } = periodos(p, hoje);
  const desde = inicioSP(iniAnt);
  const ate = inicioSP(fim);

  const [leadsQ, evQ, bfChamQ, bfRespQ, ofQ, rotQ] = await Promise.all([
    supabase
      .from("leads")
      .select("created_at, origem")
      .is("excluido_em", null)
      .gte("created_at", desde)
      .lt("created_at", ate)
      .limit(10000),
    supabase
      .from("lead_events")
      .select("tipo, created_at, dados")
      .gte("created_at", desde)
      .lt("created_at", ate)
      .in("tipo", [
        "simulacao_concluida",
        "clique_whatsapp",
        "mensagem_enviada",
        "simulacao_enviada",
        "carteira_rebatida",
        "nota",
        "status_alterado",
        "base_fria_reativado",
      ])
      .limit(20000),
    supabase
      .from("base_fria")
      .select("chamado_em")
      .gte("chamado_em", desde)
      .lt("chamado_em", ate)
      .limit(10000),
    supabase
      .from("base_fria")
      .select("resolvido_em")
      .eq("situacao", "virou_lead")
      .gte("resolvido_em", desde)
      .lt("resolvido_em", ate)
      .limit(10000),
    supabase
      .from("ofertas_enviadas")
      .select("enviado_em")
      .gte("enviado_em", desde)
      .lt("enviado_em", ate)
      .limit(10000),
    supabase
      .from("rotina_dia")
      .select("dia, item")
      .gte("dia", iniAnt)
      .lt("dia", fim)
      .limit(5000),
  ]);

  const noAtual = (iso: string | null | undefined) =>
    !!iso && diaSP(iso) >= ini && diaSP(iso) < fim;
  const noAnt = (iso: string | null | undefined) =>
    !!iso && diaSP(iso) >= iniAnt && diaSP(iso) < fimAnt;
  const conta = <T,>(
    arr: T[],
    data: (x: T) => string | null | undefined,
    filtro: (x: T) => boolean = () => true,
  ) => ({
    atual: arr.filter((x) => filtro(x) && noAtual(data(x))).length,
    ant: arr.filter((x) => filtro(x) && noAnt(data(x))).length,
  });

  const leads = (leadsQ.data ?? []) as {
    created_at: string;
    origem: string | null;
  }[];
  const ev = (evQ.data ?? []) as Ev[];
  const tipo = (t: string | string[]) => (e: Ev) =>
    Array.isArray(t) ? t.includes(e.tipo) : e.tipo === t;
  const para = (s: string) => (e: Ev) =>
    e.tipo === "status_alterado" && e.dados?.para === s;
  const evData = (e: Ev) => e.created_at;

  const novos = conta(leads, (l) => l.created_at);
  const simulacoes = conta(ev, evData, tipo("simulacao_concluida"));
  const cliques = conta(ev, evData, tipo("clique_whatsapp"));
  const mensagens = conta(
    ev,
    evData,
    (e) =>
      ["mensagem_enviada", "simulacao_enviada", "carteira_rebatida"].includes(
        e.tipo,
      ) ||
      (e.tipo === "nota" &&
        String(e.dados?.texto ?? "").startsWith("Cobrança")),
  );
  const ofertas = conta(
    (ofQ.data ?? []) as { enviado_em: string }[],
    (o) => o.enviado_em,
  );
  const bfCham = conta(
    (bfChamQ.data ?? []) as { chamado_em: string }[],
    (b) => b.chamado_em,
  );
  const bfResp = conta(
    (bfRespQ.data ?? []) as { resolvido_em: string }[],
    (b) => b.resolvido_em,
  );
  const rot = (rotQ.data ?? []) as { dia: string; item: string }[];
  const finalizados = {
    atual: rot.filter(
      (r) => r.item === "dia_finalizado" && r.dia >= ini && r.dia < fim,
    ).length,
    ant: rot.filter(
      (r) => r.item === "dia_finalizado" && r.dia >= iniAnt && r.dia < fimAnt,
    ).length,
  };

  const ETAPAS = [
    "simulacao",
    "documentacao",
    "analise_credito",
    "aprovado",
    "reprovado",
    "visita",
    "proposta",
    "vendido",
  ];
  const funil = ETAPAS.map((s) => ({
    s,
    label: LEAD_STATUS.find((x) => x.value === s)?.label ?? s,
    ...conta(ev, evData, para(s)),
  }));

  // origem dos leads novos no período atual
  const origens = new Map<string, number>();
  leads
    .filter((l) => noAtual(l.created_at))
    .forEach((l) =>
      origens.set(
        l.origem || "Não informada",
        (origens.get(l.origem || "Não informada") ?? 0) + 1,
      ),
    );
  const topOrigens = [...origens.entries()].sort((a, b) => b[1] - a[1]);
  const maxOrigem = Math.max(1, ...topOrigens.map(([, n]) => n));

  // por dia (semana e mês): leads novos e contatos feitos
  const diasLista = Array.from({ length: dias }, (_, i) => addDias(ini, i));
  const porDia = diasLista.map((d) => ({
    d,
    leads: leads.filter((l) => diaSP(l.created_at) === d).length,
    contatos:
      ev.filter(
        (e) =>
          diaSP(e.created_at) === d &&
          ([
            "mensagem_enviada",
            "simulacao_enviada",
            "carteira_rebatida",
          ].includes(e.tipo) ||
            (e.tipo === "nota" &&
              String(e.dados?.texto ?? "").startsWith("Cobrança"))),
      ).length +
      ((bfChamQ.data ?? []) as { chamado_em: string }[]).filter(
        (b) => diaSP(b.chamado_em) === d,
      ).length +
      ((ofQ.data ?? []) as { enviado_em: string }[]).filter(
        (o) => diaSP(o.enviado_em) === d,
      ).length,
  }));
  const maxDia = Math.max(
    1,
    ...porDia.map((x) => Math.max(x.leads, x.contatos)),
  );

  const taxa = (a: number, b: number) =>
    b ? `${Math.round((a / b) * 100)}%` : "—";
  const contatosTotal = {
    atual: mensagens.atual + ofertas.atual + bfCham.atual,
    ant: mensagens.ant + ofertas.ant + bfCham.ant,
  };

  return (
    <>
      <PageHeader
        titulo="Números"
        descricao={`${ROTULO[p].atual}, comparado com ${ROTULO[p].anterior}.`}
      >
        <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm">
          {(["dia", "semana", "mes"] as P[]).map((x) => (
            <Link
              key={x}
              href={`/admin/numeros?p=${x}`}
              className={`rounded-lg px-3 py-1.5 text-sm font-bold ${p === x ? "bg-caixa text-white" : "text-ink-soft hover:bg-mist"}`}
            >
              {x === "dia" ? "Dia" : x === "semana" ? "Semana" : "Mês"}
            </Link>
          ))}
        </div>
      </PageHeader>

      <Secao titulo="Captação">
        <Num label="Leads novos" v={novos} />
        <Num label="Simulações concluídas no site" v={simulacoes} />
        <Num label="Cliques no WhatsApp (site)" v={cliques} />
        <Num
          label="Respostas da Base fria"
          v={bfResp}
          sub={`taxa de resposta: ${taxa(bfResp.atual, bfCham.atual)}`}
        />
      </Secao>

      <Secao titulo="Seu atendimento">
        <Num
          label="Contatos feitos (total)"
          v={contatosTotal}
          sub="mensagens + ofertas + Base fria"
        />
        <Num
          label="Mensagens enviadas"
          v={mensagens}
          sub="mensagens prontas, simulações, reanálises e cobranças"
        />
        <Num label="Ofertas a aprovados" v={ofertas} />
        <Num label="Base fria chamados" v={bfCham} />
        <Num
          label="Dias finalizados no Meu dia"
          v={finalizados}
          sub={`de ${dias - rot.filter((r) => r.item === "folga" && r.dia >= ini && r.dia < fim).length} dia(s) de trabalho (sem folgas)`}
        />
      </Secao>

      <Secao titulo="Funil: clientes que entraram em cada etapa">
        {funil.map((f) => (
          <Num key={f.s} label={f.label} v={f} />
        ))}
      </Secao>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-4">
          <h2 className="mb-3 font-bold">
            De onde vieram os leads ({ROTULO[p].atual.toLowerCase()})
          </h2>
          {topOrigens.length ? (
            <ul className="space-y-2">
              {topOrigens.map(([o, n]) => (
                <li key={o} className="text-sm">
                  <div className="flex justify-between">
                    <span>{o}</span>
                    <b>{n}</b>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-mist">
                    <div
                      className="h-full rounded-full bg-caixa"
                      style={{ width: `${(n / maxOrigem) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-soft">
              Nenhum lead novo no período.
            </p>
          )}
        </section>

        {p !== "dia" && (
          <section className="card p-4">
            <h2 className="mb-1 font-bold">Dia a dia</h2>
            <p className="mb-3 flex gap-4 text-xs text-ink-soft">
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-caixa" /> leads novos
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />{" "}
                contatos feitos
              </span>
            </p>
            <div className="flex h-40 items-end gap-1 overflow-x-auto">
              {porDia.map((x) => (
                <div
                  key={x.d}
                  className="flex min-w-[18px] flex-1 flex-col items-center gap-1"
                  title={`${x.d.split("-").reverse().join("/")}: ${x.leads} leads, ${x.contatos} contatos`}
                >
                  <div className="flex h-32 w-full items-end justify-center gap-0.5">
                    <div
                      className="w-1/2 rounded-t bg-caixa"
                      style={{ height: `${(x.leads / maxDia) * 100}%` }}
                    />
                    <div
                      className="w-1/2 rounded-t bg-amber-400"
                      style={{ height: `${(x.contatos / maxDia) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-ink-soft">
                    {x.d.slice(8)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4">
      <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink-soft">
        {titulo}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {children}
      </div>
    </section>
  );
}

function Num({
  label,
  v,
  sub,
}: {
  label: string;
  v: { atual: number; ant: number };
  sub?: string;
}) {
  const dif = v.atual - v.ant;
  const Icone = dif > 0 ? ArrowUpRight : dif < 0 ? ArrowDownRight : Minus;
  const cor =
    dif > 0 ? "text-emerald-700" : dif < 0 ? "text-rose-700" : "text-ink-soft";
  return (
    <div className="card p-3">
      <p className="text-xs font-semibold text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">
        {v.atual.toLocaleString("pt-BR")}
      </p>
      <p
        className={`mt-0.5 inline-flex items-center gap-0.5 text-xs font-semibold ${cor}`}
      >
        <Icone size={13} />{" "}
        {dif === 0 ? "igual" : `${dif > 0 ? "+" : ""}${dif}`}{" "}
        <span className="font-normal text-ink-soft">vs {v.ant}</span>
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-ink-soft">{sub}</p>}
    </div>
  );
}
