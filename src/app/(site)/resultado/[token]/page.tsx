import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
/* eslint-disable @next/next/no-img-element -- foto da corretora vem do Storage */
import {
  CheckCircle2,
  Info,
  MessageCircle,
  Sparkles,
  UserPlus,
  UserRound,
} from "lucide-react";
import { getSettings } from "@/lib/data";
import DevelopmentCard from "@/components/site/DevelopmentCard";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import ResultadoTracker from "@/components/simulacao/ResultadoTracker";
import { formatDate, firstName, maskPhone } from "@/lib/format";
import {
  getLeadPorToken,
  listarAtivosParaMatch,
  prefsDoLead,
  ranquearDevs,
} from "@/lib/server/leads";
import { supabaseConfigurado } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Resultado da sua simulação",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Tira valores da análise das frases de compatibilidade (o resultado vai pelo WhatsApp). */
function semValores(m: string): string | null {
  if (/^Atende a /.test(m)) return "Compatível com a renda informada";
  if (/^Valor a partir de .* dentro da capacidade/.test(m))
    return "Valor dentro do que a sua simulação indica";
  if (/^Pode caber com entrada/.test(m))
    return "Pode caber com entrada parcelada (a corretora te explica)";
  // avisos de valor/faixa não aparecem para o cliente: o imóvel encanta, a realidade a corretora mostra depois
  if (
    /acima da capacidade estimada|^Valor acima do teto|voltado a outras faixas|^Preço sob consulta/.test(
      m,
    )
  )
    return null;
  return m;
}
const limpar = (l: string[]) =>
  l.map(semValores).filter((m): m is string => !!m);

export default async function ResultadoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!supabaseConfigurado()) notFound();
  const lead = await getLeadPorToken(token);
  if (!lead || !lead.simulacao) notFound();

  const sim = lead.simulacao;
  const [devs, s] = await Promise.all([listarAtivosParaMatch({ site: true }), getSettings()]);
  const corretora = s.corretora_nome || s.empresa_nome;
  const telCorretora = s.whatsapp_numero
    ? maskPhone(s.whatsapp_numero.replace(/^55/, ""))
    : null;
  const { compativeis, demais } = ranquearDevs(devs, sim, prefsDoLead(lead));
  const nome = firstName(lead.nome);

  return (
    <div className="bg-mist">
      <ResultadoTracker token={token} codigo={lead.codigo} />
      <div className="container-page py-8 sm:py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-caixa">
              Pré-simulação enviada
            </p>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
              {nome}, recebemos a sua simulação
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Código da simulação:{" "}
              <strong className="text-ink">{lead.codigo}</strong> •{" "}
              {formatDate(lead.created_at, true)}
            </p>
          </div>
          <WhatsAppButton
            token={token}
            label="Falar com um corretor"
            className="w-full sm:w-auto"
            pagina="resultado"
          />
        </div>

        {/* Apresentação da corretora: o cliente reconhece quando ela entrar em contato */}
        <section className="mt-6 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-caixa-50 ring-4 ring-sol/60">
            {s.corretora_foto_url ? (
              <img
                src={s.corretora_foto_url}
                alt={`Foto de ${corretora}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound size={36} className="text-caixa" aria-hidden />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold">
              {nome}, em breve a {corretora} vai entrar em contato com você
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {s.empresa_nome}
              {s.creci ? ` · ${s.creci}` : ""}
              {telCorretora ? ` · WhatsApp ${telCorretora}` : ""}. Salve o
              contato para reconhecer a mensagem quando ela chegar.
            </p>
          </div>
          <a href="/api/contato" className="btn-secondary shrink-0">
            <UserPlus size={16} aria-hidden /> Salvar contato
          </a>
        </section>

        {/* O resultado da análise vai pelo WhatsApp: a página mostra só os projetos compatíveis */}
        <section className="mt-6 rounded-3xl bg-caixa p-5 text-white shadow-sm sm:p-6">
          <p className="flex items-center gap-2 font-display text-lg font-bold">
            <MessageCircle size={20} aria-hidden /> Sua simulação foi recebida!
          </p>
          <p className="mt-2 text-sm text-white/90">
            A {corretora} vai analisar as suas informações e te chamar no
            WhatsApp
            {telCorretora ? ` (${telCorretora})` : ""} para passar o resultado
            da sua simulação: valor do imóvel que você pode comprar,
            financiamento, uso do FGTS e possível subsídio.
          </p>
          <p className="mt-2 text-sm text-white/90">
            Enquanto isso, veja abaixo os empreendimentos que combinam com o seu
            perfil.
          </p>
          <WhatsAppButton
            token={token}
            label="Quero receber agora pelo WhatsApp"
            className="mt-4 w-full sm:w-auto"
            pagina="resultado"
          />
        </section>

        <div className="mt-4 flex gap-3 rounded-2xl border border-sol/50 bg-sol-50 p-4 text-sm">
          <Info className="mt-0.5 shrink-0 text-sol-dark" size={18} />
          <p>
            <strong>
              A simulação é uma estimativa, não uma aprovação de crédito.
            </strong>{" "}
            Os valores dependem da análise da Caixa Econômica Federal ou de
            outro agente financeiro e das regras vigentes do programa na data da
            contratação.
          </p>
        </div>

        {/* Compatíveis */}
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl">
            <Sparkles className="text-sol" size={22} /> Empreendimentos
            compatíveis com o seu perfil
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Compatibilidade com base nas informações da simulação — não
            significa aprovação de crédito.
          </p>
          {compativeis.length === 0 ? (
            <div className="card mt-4 p-6 text-sm text-ink-soft">
              Não encontramos empreendimentos que combinem com todas as
              informações agora. Veja as demais opções abaixo ou fale com um
              corretor: ele pode indicar alternativas.
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
                    {limpar(match.motivos)
                      .slice(0, 4)
                      .map((m) => (
                        <li key={m} className="flex gap-1.5">
                          <CheckCircle2
                            size={13}
                            className="mt-0.5 shrink-0 text-emerald-600"
                          />{" "}
                          {m}
                        </li>
                      ))}
                    {limpar(match.atencao)
                      .slice(0, 2)
                      .map((m) => (
                        <li key={m} className="flex gap-1.5">
                          <Info
                            size={13}
                            className="mt-0.5 shrink-0 text-sol-dark"
                          />{" "}
                          {m}
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
            <h2 className="text-xl font-extrabold sm:text-2xl">
              Outros empreendimentos
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Explore à vontade: a corretora te ajuda a encontrar o melhor
              caminho para o imóvel que você gostar.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {demais.map(({ dev, match }) => (
                <DevelopmentCard key={dev.id} d={dev}>
                  {limpar(match.atencao).length > 0 && (
                    <ul className="mt-3 space-y-1 border-t border-line pt-3 text-xs text-ink-soft">
                      {limpar(match.atencao)
                        .slice(0, 3)
                        .map((m) => (
                          <li key={m} className="flex gap-1.5">
                            <Info
                              size={13}
                              className="mt-0.5 shrink-0 text-ink-soft"
                            />{" "}
                            {m}
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
