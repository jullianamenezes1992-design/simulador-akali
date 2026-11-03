import Link from "next/link";
import { ArrowRight, BadgePercent, Building2, Clock, HandCoins, Lock, MessageCircle, PiggyBank, ShieldCheck } from "lucide-react";
import { getActiveParams, getSettings, listPublicDevelopments } from "@/lib/data";
import { formatBRL, formatDate } from "@/lib/format";
import DevelopmentCard from "@/components/site/DevelopmentCard";

const ICONES = [BadgePercent, HandCoins, PiggyBank, Clock];

export default async function Home() {
  const [s, ativo, devs] = await Promise.all([getSettings(), getActiveParams(), listPublicDevelopments()]);
  const c = s.landing_conteudo;
  const destaques = devs.slice(0, 3);
  const faixas = ativo?.params.faixas ?? [];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-caixa text-white">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute -bottom-48 -left-24 h-72 w-72 rounded-full bg-sol/15" />
        <div className="container-page relative grid gap-10 py-12 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <span className="chip bg-sol text-ink">Pré-simulação gratuita • São Paulo</span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
              {c.hero_titulo ?? "Descubra quanto você pode financiar no Minha Casa, Minha Vida"}
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
              {c.hero_subtitulo ??
                "Faça uma pré-simulação gratuita e veja os empreendimentos que combinam com o seu perfil."}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/simulacao" className="btn-sol px-7 text-base">
                Começar simulação <ArrowRight size={18} />
              </Link>
              <Link href="/empreendimentos" className="btn border border-white/40 text-white hover:bg-white/10">
                Ver empreendimentos
              </Link>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-white/70">
              <Lock size={14} /> Leva cerca de 3 minutos. Seus dados são protegidos.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 text-ink shadow-2xl sm:p-6">
            <p className="text-sm font-semibold text-caixa">Como funciona</p>
            <ol className="mt-4 space-y-4">
              {[
                ["Conte sobre você", "Renda, família, FGTS e o imóvel que procura."],
                ["Receba a estimativa", "Faixa do programa, valor estimado e parcela de referência."],
                ["Veja imóveis compatíveis", "Primeiro os que combinam com o seu perfil, depois todo o catálogo."],
                ["Fale com um corretor", "Atendimento no WhatsApp com o código da sua simulação."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-caixa-50 text-sm font-bold text-caixa">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{t}</p>
                    <p className="text-sm text-ink-soft">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* PROGRAMA */}
      <section className="container-page py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">O que é o Minha Casa, Minha Vida</h2>
            <p className="mt-3 text-ink-soft">
              {c.programa_texto ??
                "O Minha Casa, Minha Vida é o programa habitacional do Governo Federal que facilita a compra do primeiro imóvel com juros reduzidos e, para as faixas de menor renda, subsídio."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(c.beneficios ?? []).map((b, i) => {
              const Icon = ICONES[i % ICONES.length];
              return (
                <div key={b.titulo} className="card p-5">
                  <Icon className="text-caixa" size={26} />
                  <h3 className="mt-3 font-bold">{b.titulo}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{b.texto}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAIXAS */}
      {faixas.length > 0 && (
        <section className="bg-mist py-14">
          <div className="container-page">
            <h2 className="text-2xl font-extrabold sm:text-3xl">Faixas de renda do programa</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Referência: {ativo?.params.localidade ?? "área urbana"}. Atualizado em{" "}
              {formatDate(ativo?.params.data_referencia ? `${ativo.params.data_referencia}T12:00:00Z` : null)}. Valores
              podem mudar por nova norma do governo.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {faixas.map((f) => (
                <div key={f.id} className="card overflow-hidden">
                  <div className="bg-caixa px-4 py-3 text-white">
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{f.nome}</p>
                    <p className="text-lg font-bold">
                      {f.renda_min > 0 ? `${formatBRL(f.renda_min)} a ` : "Até "}
                      {formatBRL(f.renda_max)}
                    </p>
                  </div>
                  <dl className="space-y-2 p-4 text-sm">
                    <div className="flex justify-between gap-2">
                      <dt className="text-ink-soft">Imóvel até</dt>
                      <dd className="font-semibold">{formatBRL(f.teto_imovel)}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-ink-soft">Juros (a.a.)</dt>
                      <dd className="font-semibold">
                        {f.juros_min.toLocaleString("pt-BR")}% a {f.juros_max.toLocaleString("pt-BR")}%
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-ink-soft">Subsídio</dt>
                      <dd className="font-semibold">{f.subsidio_max > 0 ? `até ${formatBRL(f.subsidio_max)}` : "Não há"}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-ink-soft">
              Renda bruta familiar mensal. Juros, subsídio e valor financiado dependem de análise e aprovação do agente financeiro.
            </p>
          </div>
        </section>
      )}

      {/* DESTAQUES */}
      {destaques.length > 0 && (
        <section className="container-page py-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">Empreendimentos em destaque</h2>
              <p className="mt-1 text-sm text-ink-soft">Faça a simulação para ver primeiro os que combinam com você.</p>
            </div>
            <Link href="/empreendimentos" className="hidden text-sm font-semibold text-caixa hover:underline sm:block">
              Ver todos
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destaques.map((d) => (
              <DevelopmentCard key={d.id} d={d} />
            ))}
          </div>
        </section>
      )}

      {/* PRIVACIDADE */}
      <section className="container-page pb-6">
        <div className="card grid gap-6 bg-caixa-50 p-6 sm:grid-cols-[auto_1fr] sm:p-8">
          <ShieldCheck className="text-caixa" size={40} />
          <div>
            <h2 className="text-xl font-extrabold">Seus dados protegidos</h2>
            <ul className="mt-3 grid gap-2 text-sm text-ink-soft sm:grid-cols-2">
              <li>• O CPF é armazenado de forma criptografada e só é acessado pela equipe autorizada.</li>
              <li>• Usamos seus dados apenas para a simulação e para o atendimento que você solicitar.</li>
              <li>• O link do WhatsApp não leva CPF nem dados financeiros.</li>
              <li>• Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento (LGPD).</li>
            </ul>
            <Link href="/privacidade" className="mt-4 inline-block text-sm font-semibold text-caixa hover:underline">
              Ler a Política de Privacidade
            </Link>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container-page py-14 text-center">
        <Building2 className="mx-auto text-caixa" size={36} />
        <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Pronto para dar o primeiro passo?</h2>
        <p className="mx-auto mt-2 max-w-lg text-ink-soft">
          A simulação é gratuita e não gera compromisso. Ao final, você pode falar com um corretor pelo WhatsApp.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/simulacao" className="btn-primary px-7 text-base">
            Fazer minha simulação <ArrowRight size={18} />
          </Link>
          <Link href="/empreendimentos" className="btn-secondary px-7 text-base">
            <MessageCircle size={18} /> Explorar imóveis
          </Link>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-xs text-ink-soft">
          Os resultados da simulação são estimativas e não representam aprovação de crédito. A contratação depende de análise
          cadastral, de crédito e de documentação pela Caixa Econômica Federal ou outro agente financeiro.
        </p>
      </section>
    </>
  );
}
