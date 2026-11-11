import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, ExternalLink, User } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import AprovadoForm from "@/components/admin/AprovadoForm";
import EnviarOferta from "@/components/admin/EnviarOferta";
import ExcluirAprovado from "@/components/admin/ExcluirAprovado";
import { STATUS_EM_ABERTO, compativeis, compraAte, diasParaVencer, mensagemOferta, ofertaDoProjeto, preSimulacao, ofertasPorProjeto, regraEntrada, type Aprovado, type OfertaEnviada } from "@/lib/aprovados";
import { getActiveParams, getSettings } from "@/lib/data";
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
  const [devs, apoio, s, ativo, { data: ofs }] = await Promise.all([
    devsAtivos(supabase),
    apoioFormAprovado(supabase),
    getSettings(),
    getActiveParams(),
    supabase.from("ofertas_enviadas").select("aprovado_id, development_id, dev_nome, enviado_em").eq("aprovado_id", id).order("enviado_em", { ascending: false }).limit(200),
  ]);
  const ofertas = (ofs ?? []) as OfertaEnviada[];
  const jaOfertado = ofertasPorProjeto(ofertas);
  // projetos já oferecidos vão para o fim da lista (o oferecido há mais tempo antes)
  const naoRepetir = <T extends { dev: { id: string; nome: string } }>(lista: T[]) => {
    const quando = (c: T) => ofertaDoProjeto(jaOfertado, c.dev);
    return [...lista.filter((c) => !quando(c)), ...lista.filter((c) => quando(c)).sort((x, y) => quando(x)!.localeCompare(quando(y)!))];
  };
  const regra = regraEntrada(ativo?.params);

  const assinatura = s.corretora_nome || s.empresa_nome;
  const base = siteUrl();
  const cabem = naoRepetir(compativeis(a, devs, 0, regra));
  const quase = naoRepetir(compativeis(a, devs, 0.05, regra).filter((c) => c.acimaDoPoder));
  const dias = diasParaVencer(a.vencimento);
  const aberto = STATUS_EM_ABERTO.includes(a.status);

  const linha = (c: ReturnType<typeof compativeis>[number]) => {
    const link = `${base}/empreendimentos/${c.dev.slug}?utm_source=whatsapp&utm_medium=corretora&utm_content=aprovado`;
    const enviada = ofertaDoProjeto(jaOfertado, c.dev);
    const ps = preSimulacao(a, c.dev, regra);
    const psOk = ps && !ps.excede ? ps : undefined;
    return (
      <li key={c.dev.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
        <div className="min-w-0">
          <Link href={`/empreendimentos/${c.dev.slug}`} target="_blank" className="font-semibold hover:text-caixa">
            {c.dev.nome} <ExternalLink size={12} className="inline" />
          </Link>
          <p className="text-xs text-ink-soft">
            {[c.dev.bairro, regiaoLabel(c.dev.regiao)].filter(Boolean).join(" · ")} ·{" "}
            {c.av.dorms ? (
              <>
                {c.av.dorms} dorm. a partir de <strong>{formatBRL(c.av.preco)}</strong>
              </>
            ) : (
              <>
                a partir de <strong>{formatBRL(Number(c.dev.preco_min))}</strong>
              </>
            )}
            {c.folga < 0 ? ` · faltam ${formatBRL(-c.folga)}` : ""}
          </p>
          <p className="text-xs text-ink-soft">
            {c.av.entradaParcelar > 0 ? (
              <>
                Entrada a parcelar: <strong>{formatBRL(c.av.entradaParcelar)}</strong>
                {c.av.meses ? ` ≈ ${c.av.meses}x de ${formatBRL(c.av.parcelaEntrada)}` : ""}
              </>
            ) : (
              "Os recursos já cobrem o valor, sem parcelar entrada."
            )}
          </p>
          <p className="mt-0.5 flex flex-wrap gap-1 text-[11px] font-semibold">
            {c.regiaoOk && a.regioes?.length ? <span className="rounded-full bg-emerald-100 px-2 text-emerald-800">região certa</span> : null}
            {c.dormOk && a.dormitorios_min ? <span className="rounded-full bg-emerald-100 px-2 text-emerald-800">dormitórios ok</span> : null}
            {c.dev.oferta_destaque && <span className="rounded-full bg-sol px-2 text-ink">promoção</span>}
            {c.dev.unidades_disponiveis != null && c.dev.unidades_disponiveis < 50 && <span className="rounded-full bg-red-600 px-2 text-white">últimas unidades</span>}
            {enviada && <span className="rounded-full bg-zinc-200 px-2 text-zinc-800">📤 oferta enviada em {formatDate(enviada)}</span>}
            {!(Number(c.dev.avaliacao_min) > 0) && <span className="rounded-full bg-amber-100 px-2 text-amber-900" title="Cadastre a avaliação no empreendimento para limitar o financiamento a 80% dela">sem avaliação</span>}
          </p>
        </div>
        <EnviarOferta aprovadoId={a.id} telefone={a.telefone} devNome={c.dev.nome} devId={c.dev.id} jaEnviada={enviada} texto={mensagemOferta(a, c.dev, link, assinatura, psOk)} />
      </li>
    );
  };

  return (
    <>
      <Link href="/admin/aprovados" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-caixa hover:underline">
        <ArrowLeft size={14} /> Clientes aprovados
      </Link>
      <PageHeader
        titulo={a.nome}
        descricao={`Atualizado em ${formatDate(a.updated_at, true)} · Compra até ~${formatBRL(compraAte(a, regra))} · recursos ${formatBRL(Number(a.poder_compra))}${a.faixa ? ` · Faixa ${a.faixa}` : ""}${[a.oportunidade_sf && "Oportunidade " + a.oportunidade_sf, a.ar_numero, a.ab_numero].filter(Boolean).map((x) => " · " + x).join("")}`}
      >
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
          <h2 className="mb-1 font-bold">Projetos que cabem ({cabem.length})</h2>
          <p className="mb-2 text-xs text-ink-soft">
            Recursos ({formatBRL(Number(a.poder_compra))}) + entrada parcelada com a construtora de até 20% do imóvel, com parcela de até 30% da renda (
            {formatBRL(Number(a.renda_familiar) * regra.comprometimento)}/mês) até a entrega das chaves, mais as parcelas pós-chaves nos projetos que oferecem. Os que combinam com a região e os dormitórios aparecem primeiro.
          </p>
          {!aberto ? (
            <p className="text-sm text-ink-soft">Este cadastro não está em aberto (status: {a.status}).</p>
          ) : cabem.length ? (
            <ul className="divide-y divide-line">{cabem.slice(0, 40).map(linha)}</ul>
          ) : (
            <p className="text-sm text-ink-soft">Nenhum projeto cabe hoje. Você será avisada quando algum baixar de preço ou entrar em promoção.</p>
          )}
          {cabem.some((c) => ofertaDoProjeto(jaOfertado, c.dev)) && (
            <p className="mt-2 text-xs text-ink-soft">Os projetos que você já ofereceu a este cliente ficam no fim da lista, marcados com 📤.</p>
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
          {ofertas.length > 0 && (
            <section className="card p-4">
              <h2 className="mb-2 font-bold">Ofertas enviadas ({ofertas.length})</h2>
              <ul className="divide-y divide-line text-sm">
                {ofertas.map((o, i) => (
                  <li key={i} className="flex justify-between gap-2 py-1.5">
                    <span>{o.dev_nome}</span>
                    <span className="shrink-0 text-ink-soft">{formatDate(o.enviado_em, true)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {papel === "admin" && <ExcluirAprovado id={a.id} />}
        </div>
      </div>
    </>
  );
}
