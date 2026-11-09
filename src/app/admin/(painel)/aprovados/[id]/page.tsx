import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, ExternalLink, User } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import AprovadoForm from "@/components/admin/AprovadoForm";
import EnviarOferta from "@/components/admin/EnviarOferta";
import ExcluirAprovado from "@/components/admin/ExcluirAprovado";
import { STATUS_EM_ABERTO, compativeis, diasParaVencer, mensagemOferta, type Aprovado } from "@/lib/aprovados";
import { getSettings } from "@/lib/data";
import { regiaoLabel } from "@/lib/constants";
import { formatBRL, formatDate } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";
import { devsAtivos } from "@/lib/server/aprovados";
import { apoioFormAprovado } from "@/lib/server/aprovados-form";
import { siteUrl } from "@/lib/server/notificacoes";

export const metadata: Metadata = { title: "Cliente aprovado" };

export default async function AprovadoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ novo?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase, papel } = await requireAdmin();
  const { data } = await supabase.from("aprovados").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const a = data as Aprovado;
  const [devs, apoio, s] = await Promise.all([devsAtivos(supabase), apoioFormAprovado(supabase), getSettings()]);

  const assinatura = s.corretora_nome || s.empresa_nome;
  const base = siteUrl();
  const cabem = compativeis(a, devs);
  const quase = compativeis(a, devs, 0.05).filter((c) => c.acimaDoPoder);
  const dias = diasParaVencer(a.vencimento);
  const aberto = STATUS_EM_ABERTO.includes(a.status);

  const linha = (c: ReturnType<typeof compativeis>[number]) => {
    const link = `${base}/empreendimentos/${c.dev.slug}?utm_source=whatsapp&utm_medium=corretora&utm_content=aprovado`;
    return (
      <li key={c.dev.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
        <div className="min-w-0">
          <Link href={`/empreendimentos/${c.dev.slug}`} target="_blank" className="font-semibold hover:text-caixa">
            {c.dev.nome} <ExternalLink size={12} className="inline" />
          </Link>
          <p className="text-xs text-ink-soft">
            {[c.dev.bairro, regiaoLabel(c.dev.regiao)].filter(Boolean).join(" · ")} · a partir de <strong>{formatBRL(Number(c.dev.preco_min))}</strong>
            {c.folga >= 0 ? ` · sobra ${formatBRL(c.folga)}` : ` · faltam ${formatBRL(-c.folga)}`}
          </p>
          <p className="mt-0.5 flex flex-wrap gap-1 text-[11px] font-semibold">
            {c.regiaoOk && a.regioes?.length ? <span className="rounded-full bg-emerald-100 px-2 text-emerald-800">região certa</span> : null}
            {c.dormOk && a.dormitorios_min ? <span className="rounded-full bg-emerald-100 px-2 text-emerald-800">dormitórios ok</span> : null}
            {c.dev.oferta_destaque && <span className="rounded-full bg-sol px-2 text-ink">promoção</span>}
            {c.dev.unidades_disponiveis != null && c.dev.unidades_disponiveis < 50 && <span className="rounded-full bg-red-600 px-2 text-white">últimas unidades</span>}
          </p>
        </div>
        <EnviarOferta aprovadoId={a.id} telefone={a.telefone} devNome={c.dev.nome} texto={mensagemOferta(a, c.dev, link, assinatura)} />
      </li>
    );
  };

  return (
    <>
      <Link href="/admin/aprovados" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-caixa hover:underline">
        <ArrowLeft size={14} /> Clientes aprovados
      </Link>
      <PageHeader titulo={a.nome} descricao={`Poder de compra ${formatBRL(Number(a.poder_compra))}${a.faixa ? ` · Faixa ${a.faixa}` : ""}`}>
        {a.lead_id && (
          <Link href={`/admin/leads/${a.lead_id}`} className="btn-secondary">
            <User size={16} /> Ficha no CRM
          </Link>
        )}
      </PageHeader>

      {sp.novo && <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">Aprovado cadastrado! Veja abaixo os projetos que cabem no bolso dele.</p>}
      {aberto && dias != null && dias <= 15 && (
        <p className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${dias < 0 ? "bg-zinc-100 text-zinc-700" : "bg-red-50 text-red-800"}`}>
          <AlertTriangle size={16} />
          {dias < 0 ? "A aprovação já venceu. Se o cliente ainda quiser comprar, será preciso uma nova análise." : `A aprovação vence em ${dias} dia(s) (${formatDate(`${a.vencimento}T12:00:00Z`)}). Priorize este cliente!`}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
        <section className="card p-4">
          <h2 className="mb-1 font-bold">Projetos que cabem no poder de compra ({cabem.length})</h2>
          <p className="mb-2 text-xs text-ink-soft">Empreendimentos ativos com preço “a partir de” até {formatBRL(Number(a.poder_compra))}. Os que combinam com a região e os dormitórios aparecem primeiro.</p>
          {!aberto ? (
            <p className="text-sm text-ink-soft">Este cadastro não está em aberto (status: {a.status}).</p>
          ) : cabem.length ? (
            <ul className="divide-y divide-line">{cabem.slice(0, 40).map(linha)}</ul>
          ) : (
            <p className="text-sm text-ink-soft">Nenhum projeto cabe hoje. Você será avisada quando algum baixar de preço ou entrar em promoção.</p>
          )}
          {aberto && quase.length > 0 && (
            <>
              <h3 className="mb-1 mt-4 text-sm font-bold">Quase cabem (até 5% acima)</h3>
              <ul className="divide-y divide-line">{quase.slice(0, 15).map(linha)}</ul>
            </>
          )}
        </section>
        <div className="space-y-3">
          <AprovadoForm aprovado={a} faixas={apoio.faixas} leads={apoio.leads} />
          {papel === "admin" && <ExcluirAprovado id={a.id} />}
        </div>
      </div>
    </>
  );
}
