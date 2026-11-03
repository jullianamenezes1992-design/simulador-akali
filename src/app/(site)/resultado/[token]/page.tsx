import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, Info, Sparkles } from "lucide-react";
import DevelopmentCard from "@/components/site/DevelopmentCard";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import ResultadoTracker from "@/components/simulacao/ResultadoTracker";
import { formatBRL, formatDate, firstName } from "@/lib/format";
import { getLeadPorToken, listarAtivosParaMatch, prefsDoLead, ranquearDevs } from "@/lib/server/leads";
import { supabaseConfigurado } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Resultado da sua simulação",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Stat({ label, valor, sub, forte = false }: { label: string; valor: string; sub?: string; forte?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${forte ? "bg-caixa text-white" : "bg-white"}`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${forte ? "text-white/70" : "text-ink-soft"}`}>{label}</p>
      <p className="mt-1 text-xl font-extrabold sm:text-2xl">{valor}</p>
      {sub && <p className={`mt-0.5 text-xs ${forte ? "text-white/80" : "text-ink-soft"}`}>{sub}</p>}
    </div>
  );
}

export default async function ResultadoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!supabaseConfigurado()) notFound();
  const lead = await getLeadPorToken(token);
  if (!lead || !lead.simulacao) notFound();

  const sim = lead.simulacao;
  const devs = await listarAtivosParaMatch();
  const { compativeis, demais } = ranquearDevs(devs, sim, prefsDoLead(lead));
  const nome = firstName(lead.nome);

  return (
    <div className="bg-mist">
      <ResultadoTracker token={token} codigo={lead.codigo} />
      <div className="container-page py-8 sm:py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-caixa">Pré-simulação concluída</p>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{nome}, veja a sua estimativa</h1>
            <p className="mt-1 text-sm text-ink-soft">
              Código da simulação: <strong className="text-ink">{lead.codigo}</strong> • {formatDate(lead.created_at, true)}
            </p>
          </div>
          <WhatsAppButton token={token} label="Falar com um corretor" className="w-full sm:w-auto" pagina="resultado" />
        </div>

        {/* Ressalva obrigatória */}
        <div className="mt-6 flex gap-3 rounded-2xl border border-sol/50 bg-sol-50 p-4 text-sm">
          <Info className="mt-0.5 shrink-0 text-sol-dark" size={18} />
          <p>
            <strong>Isto é uma estimativa, não uma aprovação de crédito.</strong> Os valores dependem da análise cadastral,
            de renda e de crédito e da aprovação da Caixa Econômica Federal ou de outro agente financeiro, além das regras
            vigentes do programa na data da contratação.
          </p>
        </div>

        {sim.impedimentos.length > 0 && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="flex items-center gap-2 font-bold">
              <AlertTriangle size={18} /> Pontos que podem impedir o enquadramento no programa
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              {sim.impedimentos.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Números */}
        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            forte
            label="Imóvel de até (estimativa)"
            valor={formatBRL(sim.capacidadeSemSubsidio)}
            sub={
              sim.subsidioPotencial > 0 && sim.capacidadeComSubsidio > sim.capacidadeSemSubsidio
                ? `Até ${formatBRL(sim.capacidadeComSubsidio)} se houver subsídio aprovado`
                : "Somando financiamento e FGTS"
            }
          />
          <Stat label="Faixa do programa" valor={sim.faixa?.nome ?? "Fora do programa"} sub={`Renda familiar ${formatBRL(sim.rendaTotal, true)}`} />
          <Stat
            label="Financiamento estimado"
            valor={formatBRL(sim.financiamentoMax)}
            sub={sim.taxaAnual != null ? `${sim.prazoMeses} meses • ${sim.taxaAnual.toLocaleString("pt-BR")}% a.a. (${sim.sistema})` : undefined}
          />
          <Stat label="Parcela de referência" valor={`até ${formatBRL(sim.parcelaMax)}`} sub="Comprometimento máximo da renda" />
        </section>

        <section className="mt-3 grid gap-3 sm:grid-cols-2">
          <Stat label="FGTS considerado" valor={formatBRL(sim.fgtsConsiderado)} />
          <Stat
            label="Subsídio possível"
            valor={sim.subsidioPotencial > 0 ? `até ${formatBRL(sim.subsidioPotencial)}` : "Não se aplica"}
            sub={sim.subsidioPotencial > 0 ? "Valor real depende de renda, local e análise" : undefined}
          />
        </section>

        {sim.entradaParcelada && (
          <div className="mt-3 rounded-2xl bg-white p-4 text-sm">
            <p className="font-bold">Entrada parcelada durante a obra</p>
            <p className="mt-1 text-ink-soft">
              Em imóveis na planta ou em construção, a construtora costuma permitir parcelar parte do valor (até{" "}
              {Math.round(sim.entradaParcelada.pctMax * 100)}% do imóvel) até a entrega das chaves. Pela sua renda,
              estimamos parcelas de até <strong className="text-ink">{formatBRL(sim.entradaParcelada.parcelaMensalMax)}</strong>{" "}
              por mês. Por isso alguns imóveis acima do valor estimado aparecem como compatíveis. As condições dependem de
              cada construtora.
            </p>
          </div>
        )}

        {sim.alertas.length > 0 && (
          <div className="mt-4 rounded-2xl bg-white p-4 text-sm">
            <p className="font-bold">Pontos de atenção</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft">
              {sim.alertas.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-3 text-xs text-ink-soft">
          A parcela de referência não inclui seguros obrigatórios e tarifas. Cálculo com a taxa de referência da faixa e o
          sistema {sim.sistema}. Parâmetros versão {sim.paramsVersao ?? "—"}.
        </p>

        {/* Compatíveis */}
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl">
            <Sparkles className="text-sol" size={22} /> Empreendimentos compatíveis com o seu perfil
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Compatibilidade com base nas informações da simulação — não significa aprovação de crédito.
          </p>
          {compativeis.length === 0 ? (
            <div className="card mt-4 p-6 text-sm text-ink-soft">
              Não encontramos empreendimentos que combinem com todas as informações agora. Veja as demais opções abaixo ou
              fale com um corretor: ele pode indicar alternativas.
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {compativeis.map(({ dev, match }) => (
                <DevelopmentCard
                  key={dev.id}
                  d={dev}
                  destaque={
                    <span className="chip mb-2 w-fit bg-emerald-100 text-emerald-800">
                      <CheckCircle2 size={12} className="mr-1" /> Compatível
                    </span>
                  }
                >
                  <ul className="mt-3 space-y-1 border-t border-line pt-3 text-xs text-ink-soft">
                    {match.motivos.slice(0, 4).map((m) => (
                      <li key={m} className="flex gap-1.5">
                        <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-600" /> {m}
                      </li>
                    ))}
                    {match.atencao.slice(0, 2).map((m) => (
                      <li key={m} className="flex gap-1.5">
                        <Info size={13} className="mt-0.5 shrink-0 text-sol-dark" /> {m}
                      </li>
                    ))}
                  </ul>
                  <WhatsAppButton
                    token={token}
                    developmentId={dev.id}
                    developmentNome={dev.nome}
                    label="Tenho interesse"
                    className="mt-4"
                    pagina="resultado"
                  />
                </DevelopmentCard>
              ))}
            </div>
          )}
        </section>

        {/* Demais */}
        {demais.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-extrabold sm:text-2xl">Outros empreendimentos</h2>
            <p className="mt-1 text-sm text-ink-soft">Explore livremente o catálogo. Indicamos o que pode não combinar com a simulação.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {demais.map(({ dev, match }) => (
                <DevelopmentCard key={dev.id} d={dev}>
                  {match.atencao.length > 0 && (
                    <ul className="mt-3 space-y-1 border-t border-line pt-3 text-xs text-ink-soft">
                      {match.atencao.slice(0, 3).map((m) => (
                        <li key={m} className="flex gap-1.5">
                          <Info size={13} className="mt-0.5 shrink-0 text-ink-soft" /> {m}
                        </li>
                      ))}
                    </ul>
                  )}
                  <WhatsAppButton
                    token={token}
                    developmentId={dev.id}
                    developmentNome={dev.nome}
                    label="Quero saber mais"
                    className="mt-4"
                    pagina="resultado"
                  />
                </DevelopmentCard>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 text-center">
          <Link href="/empreendimentos" className="btn-secondary">
            Ver catálogo completo com filtros
          </Link>
        </div>
      </div>
    </div>
  );
}
