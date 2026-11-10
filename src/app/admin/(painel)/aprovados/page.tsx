import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Plus, TrendingDown, Flame } from "lucide-react";
import { PageHeader, StatCard } from "@/components/admin/ui";
import ImportarAprovados from "@/components/admin/ImportarAprovados";
import MarcarVistas from "@/components/admin/MarcarVistas";
import {
  CLASSIFICACOES,
  STATUS_APROVADO,
  STATUS_EM_ABERTO,
  classificacaoInfo,
  compativeis,
  compraAte,
  regraEntrada,
  diasParaVencer,
  statusAprovadoInfo,
  type Aprovado,
} from "@/lib/aprovados";
import { regiaoLabel } from "@/lib/constants";
import { agoraMs } from "@/lib/agenda";
import { formatBRL, formatDate, maskPhone } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";
import { devsAtivos } from "@/lib/server/aprovados";
import { getActiveParams } from "@/lib/data";

export const metadata: Metadata = { title: "Clientes aprovados" };

type SP = Promise<Record<string, string | undefined>>;
type Op = { id: number; tipo: string; preco_antes: number | null; preco_depois: number | null; aprovados: { id: string; nome: string; poder_compra: number }[]; created_at: string; visto_em: string | null; dev: { id: string; nome: string; slug: string } | null };

export default async function AprovadosPage({ searchParams }: { searchParams: SP }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const status = sp.status ?? "abertos";
  const classif = CLASSIFICACOES.some((c) => c.value === sp.classe) ? sp.classe! : "";
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 60);

  const [{ data }, devs, { data: ops }, ativo] = await Promise.all([
    supabase.from("aprovados").select("*").order("created_at", { ascending: false }).limit(2000),
    devsAtivos(supabase),
    supabase
      .from("oportunidades")
      .select("id, tipo, preco_antes, preco_depois, aprovados, created_at, visto_em, dev:development_id(id, nome, slug)")
      .gte("created_at", new Date(agoraMs() - 30 * 864e5).toISOString())
      .order("created_at", { ascending: false })
      .limit(20),
    getActiveParams(),
  ]);
  const regra = regraEntrada(ativo?.params);
  const todos = (data ?? []) as Aprovado[];
  const oportunidades = (ops ?? []) as unknown as Op[];
  const novas = oportunidades.filter((o) => !o.visto_em);

  const abertos = todos.filter((a) => STATUS_EM_ABERTO.includes(a.status));
  const vencendo = abertos.filter((a) => {
    const d = diasParaVencer(a.vencimento);
    return d != null && d >= 0 && d <= 15;
  });
  const lista = todos.filter(
    (a) =>
      (status === "todos" ? true : status === "abertos" ? STATUS_EM_ABERTO.includes(a.status) : status === "vencendo" ? vencendo.includes(a) : a.status === status) &&
      (!classif || a.classificacao === classif) &&
      (!q || [a.nome, a.telefone, a.observacoes, a.ar_numero, a.ab_numero, a.oportunidade_sf].join(" ").toLowerCase().includes(q))
  );
  const link = (p: Record<string, string>) => {
    const u = new URLSearchParams({ status, ...(classif ? { classe: classif } : {}), ...(q ? { q } : {}), ...p });
    [...u.entries()].forEach(([k, v]) => !v && u.delete(k));
    return `/admin/aprovados?${u}`;
  };

  return (
    <>
      <PageHeader titulo="Clientes aprovados" descricao="Quem já tem crédito aprovado, quanto pode comprar e quais projetos cabem no bolso de cada um.">
        <ImportarAprovados />
        <Link href="/admin/aprovados/novo" className="btn-primary">
          <Plus size={16} /> Novo aprovado
        </Link>
      </PageHeader>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Aprovados em aberto" valor={abertos.length} />
        <StatCard label="Quentes" valor={abertos.filter((a) => a.classificacao === "quente").length} />
        <StatCard label="Vencem em até 15 dias" valor={vencendo.length} />
        <StatCard label="Oportunidades novas" valor={novas.length} sub="preço baixou ou promoção" />
      </div>

      {oportunidades.length > 0 && (
        <section className={`card mb-4 p-4 ${novas.length ? "border-amber-400 bg-amber-50/60" : ""}`}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-bold">
              <TrendingDown size={18} className="text-emerald-700" /> Oportunidades (últimos 30 dias)
            </h2>
            {novas.length > 0 && <MarcarVistas />}
          </div>
          <ul className="divide-y divide-line">
            {oportunidades.map((o) => (
              <li key={o.id} className="py-2.5 text-sm">
                <p>
                  {!o.visto_em && <span className="mr-1.5 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">NOVA</span>}
                  <strong>{o.dev?.nome ?? "Empreendimento"}</strong>{" "}
                  {o.tipo === "preco_baixou" ? (
                    <>
                      baixou de {formatBRL(Number(o.preco_antes))} para <strong className="text-emerald-700">{formatBRL(Number(o.preco_depois))}</strong>
                    </>
                  ) : (
                    <>entrou em promoção (a partir de {formatBRL(Number(o.preco_depois))})</>
                  )}
                  <span className="text-ink-soft"> · {formatDate(o.created_at, true)}</span>
                </p>
                <p className="mt-1 text-ink-soft">
                  {o.tipo === "preco_baixou" ? "Passaram a caber: " : "Cabem: "}
                  {o.aprovados.map((a, i) => (
                    <span key={a.id}>
                      {i > 0 && ", "}
                      <Link href={`/admin/aprovados/${a.id}`} className="font-semibold text-caixa hover:underline">
                        {a.nome}
                      </Link>
                    </span>
                  ))}
                  {o.dev && (
                    <>
                      {" · "}
                      <Link href={`/admin/aprovados/cabem?dev=${o.dev.id}`} className="font-semibold text-caixa underline">
                        enviar oferta
                      </Link>
                    </>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        {[
          ["abertos", "Em aberto"],
          ["vencendo", "Vencendo"],
          ...STATUS_APROVADO.filter((s) => !STATUS_EM_ABERTO.includes(s.value)).map((s) => [s.value, s.label]),
          ["todos", "Todos"],
        ].map(([v, l]) => (
          <Link key={v} href={link({ status: v })} className={`filtro ${status === v ? "filtro-on" : ""}`}>
            {l}
          </Link>
        ))}
      </div>
      <form className="mb-4 flex flex-wrap gap-2" action="/admin/aprovados">
        <input type="hidden" name="status" value={status} />
        <input name="q" defaultValue={q} placeholder="Buscar por nome, telefone ou observação" className="input min-w-0 flex-1" />
        <select name="classe" defaultValue={classif} className="input w-auto">
          <option value="">Todas as classificações</option>
          {CLASSIFICACOES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <button className="btn-secondary">Filtrar</button>
      </form>

      {lista.length === 0 ? (
        <p className="card p-6 text-center text-sm text-ink-soft">
          {todos.length ? "Nenhum aprovado com esse filtro." : "Nenhum aprovado ainda. Cadastre o primeiro ou importe a sua planilha."}
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {lista.map((a) => {
            const st = statusAprovadoInfo(a.status);
            const cl = classificacaoInfo(a.classificacao);
            const dias = diasParaVencer(a.vencimento);
            const n = STATUS_EM_ABERTO.includes(a.status) ? compativeis(a, devs, 0, regra).length : null;
            return (
              <li key={a.id}>
                <Link href={`/admin/aprovados/${a.id}`} className="card block p-4 hover:border-caixa">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold">{a.nome}</p>
                      <p className="text-sm text-ink-soft">{maskPhone(a.telefone)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${st.cor}`}>{st.label}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${cl.cor}`}>{cl.label}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">Compra até (com entrada parcelada)</p>
                  <p className="font-display text-2xl font-black text-caixa">{formatBRL(compraAte(a, regra))}</p>
                  <p className="text-xs text-ink-soft">Recursos {formatBRL(Number(a.poder_compra))} + até 20% do imóvel parcelado</p>
                  <p className="text-sm text-ink-soft">
                    {a.faixa ? `Faixa ${a.faixa}` : "Sem faixa"} · renda {formatBRL(Number(a.renda_familiar))}
                    {a.regioes?.length ? ` · ${a.regioes.map(regiaoLabel).join(", ")}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    {n != null && (
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${n ? "bg-emerald-100 text-emerald-800" : "bg-mist text-ink-soft"}`}>
                        {n} projeto(s) cabem
                      </span>
                    )}
                    {a.vencimento && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          dias != null && dias < 0 ? "bg-zinc-200 text-zinc-700" : dias != null && dias <= 15 ? "bg-red-100 text-red-800" : "bg-mist text-ink"
                        }`}
                      >
                        {dias != null && dias <= 15 && dias >= 0 && <AlertTriangle size={12} />}
                        {dias != null && dias < 0 ? `venceu em ${formatDate(`${a.vencimento}T12:00:00Z`)}` : `vence ${formatDate(`${a.vencimento}T12:00:00Z`)}${dias != null && dias <= 15 ? ` (${dias} dia${dias === 1 ? "" : "s"})` : ""}`}
                      </span>
                    )}
                    {a.classificacao === "quente" && <Flame size={14} className="text-red-600" aria-hidden />}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
