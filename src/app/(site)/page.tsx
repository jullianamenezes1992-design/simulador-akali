/* eslint-disable @next/next/no-img-element -- fotos vêm das construtoras/Storage */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgePercent, ChevronDown, HandCoins, MessageCircle, PiggyBank, ShieldCheck, Clock } from "lucide-react";
import { getActiveParams, getSettings, listPublicDevelopments } from "@/lib/data";
import { formatBRL, formatDate } from "@/lib/format";
import { REGIOES } from "@/lib/constants";
import DevelopmentCard, { capaDe } from "@/components/site/DevelopmentCard";
import CalculadoraRenda, { type FaixaResumo } from "@/components/site/CalculadoraRenda";

// foto de um prédio na prévia do link da página inicial (WhatsApp/Facebook), no lugar da imagem azul
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = `${s.empresa_nome} — Simulador Minha Casa, Minha Vida`;
  const description = "Faça uma pré-simulação gratuita e veja os empreendimentos em São Paulo que combinam com o seu perfil.";
  return {
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: s.empresa_nome,
      title,
      description,
      images: [{ url: "/api/og-regiao/todas?v=1", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", images: ["/api/og-regiao/todas?v=1"] },
  };
}

const ICONES = [BadgePercent, HandCoins, PiggyBank, Clock];
const REGIOES_SP = ["zona_norte", "zona_leste", "zona_sul", "zona_oeste", "centro"] as const;

const PERGUNTAS: [string, string][] = [
  [
    "Preciso ter dinheiro para a entrada?",
    "Depende do valor do imóvel e de quanto o banco aprova para você. Em imóveis na planta, a diferença costuma poder ser parcelada com a construtora durante a obra, e o FGTS também pode ajudar. A simulação mostra o que cabe no seu bolso.",
  ],
  [
    "Posso usar o meu FGTS?",
    "Em geral, sim: quem soma pelo menos 3 anos de trabalho com carteira assinada e não tem outro imóvel na cidade pode usar o saldo para a compra. O corretor confere as regras do seu caso.",
  ],
  [
    "Trabalho por conta própria. Consigo financiar?",
    "É possível. A renda de autônomos e informais pode ser comprovada com extratos e outros documentos, e a análise final é feita pelo banco.",
  ],
  [
    "Tenho o nome negativado. Posso comprar?",
    "Restrição no CPF costuma impedir a aprovação do financiamento. Normalmente é preciso regularizar antes, e o corretor pode te orientar sobre o melhor caminho.",
  ],
  [
    "A simulação me compromete com alguma coisa?",
    "Não. A simulação é gratuita, não pede CPF e não consulta o seu nome. Ela só mostra uma estimativa e os imóveis que combinam com o seu perfil.",
  ],
];

export default async function Home() {
  const [s, ativo, devs] = await Promise.all([getSettings(), getActiveParams(), listPublicDevelopments()]);
  const c = s.landing_conteudo;
  const faixas = ativo?.params.faixas ?? [];
  const comPreco = devs.filter((d) => d.preco_min != null && d.disponivel !== false);
  const menorPreco = comPreco.length ? Math.min(...comPreco.map((d) => Number(d.preco_min))) : null;
  const construtoras = [...new Set(devs.map((d) => d.construtora).filter(Boolean))] as string[];

  // Foto principal: o imóvel mais barato que tenha foto (mostra o "a partir de" real)
  const vitrine = [...comPreco].filter((d) => capaDe(d)).sort((a, b) => Number(a.preco_min) - Number(b.preco_min));
  const heroDev = vitrine[0] ?? null;
  const heroDev2 = vitrine.find((d) => d.regiao !== heroDev?.regiao) ?? vitrine[1] ?? null;

  const regioes = REGIOES_SP.map((r) => {
    const lista = devs.filter((d) => d.regiao === r);
    const precos = lista.map((d) => d.preco_min).filter((p): p is number => p != null);
    const foto = lista.map(capaDe).find(Boolean) ?? null;
    return { r, label: REGIOES.find((x) => x.value === r)?.label ?? r, n: lista.length, desde: precos.length ? Math.min(...precos) : null, foto };
  }).filter((x) => x.n > 0);

  const destaques = vitrine.filter((d) => d.id !== heroDev?.id && d.id !== heroDev2?.id).slice(0, 6);

  const faixasResumo: FaixaResumo[] = faixas.map((f) => ({
    id: f.id,
    nome: f.nome,
    renda_min: f.renda_min,
    renda_max: f.renda_max,
    teto_imovel: f.teto_imovel,
    juros_min: f.juros_min,
    subsidio_max: f.subsidio_max,
  }));

  return (
    <>
      {/* HERO: a calculadora de renda é o convite para simular */}
      <section className="relative overflow-hidden bg-caixa text-white">
        <svg aria-hidden className="pointer-events-none absolute -right-40 top-10 h-[520px] w-[520px] text-white/[0.06]" viewBox="0 0 34 34">
          <path d="M8 18.5 17 10l9 8.5V26a1 1 0 0 1-1 1h-5.5v-5.5h-5V27H9a1 1 0 0 1-1-1z" fill="currentColor" />
        </svg>
        <div className="container-page relative grid gap-8 pb-10 pt-7 sm:pb-12 sm:pt-9 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:gap-12">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90">
              <span className="h-2 w-2 rounded-full bg-sol" aria-hidden /> Minha Casa, Minha Vida em São Paulo
            </p>
            <h1 className="mt-3 text-[2.1rem] font-black leading-[1.05] sm:text-5xl">
              {c.hero_titulo ?? "Saia do aluguel e conquiste a sua casa própria"}
            </h1>
            <p className="mt-3 max-w-xl text-base text-white/85">
              {c.hero_subtitulo ??
                "Descubra quanto você pode financiar e veja os apartamentos que cabem no seu bolso."}
            </p>
            <div className="mt-5 max-w-lg">
              <CalculadoraRenda faixas={faixasResumo} />
            </div>
          </div>

          {/* Fotos reais de empreendimentos */}
          {heroDev && (
            <div className="relative hidden min-h-[430px] lg:block">
              <Link href={`/empreendimentos/${heroDev.slug}`} className="group absolute right-0 top-0 block h-[370px] w-[86%] overflow-hidden rounded-[2rem] shadow-2xl">
                <img src={capaDe(heroDev)!} alt={heroDev.nome} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16">
                  <p className="text-sm text-white/80">{heroDev.bairro}</p>
                  <p className="font-display text-xl font-bold">{heroDev.nome}</p>
                </div>
              </Link>
              <div className="absolute left-0 top-10 rounded-2xl bg-sol px-6 py-4 text-[#14202b] shadow-xl ring-4 ring-white/25">
                <p className="text-[15px] font-bold">Apartamentos a partir de</p>
                <p className="font-display text-[2.6rem] font-black leading-none tracking-tight">{formatBRL(Number(heroDev.preco_min))}</p>
              </div>
              {heroDev2 && (
                <Link href={`/empreendimentos/${heroDev2.slug}`} className="absolute bottom-0 left-4 block h-40 w-56 overflow-hidden rounded-3xl border-4 border-caixa shadow-2xl">
                  <img src={capaDe(heroDev2)!} alt={heroDev2.nome} className="h-full w-full object-cover" />
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* NÚMEROS REAIS DO CATÁLOGO */}
      <section className="border-b border-line bg-white">
        <div className="container-page grid grid-cols-2 gap-4 py-6 text-center sm:grid-cols-4">
          <div>
            <p className="font-display text-3xl font-black text-caixa">{devs.length}</p>
            <p className="text-sm text-ink-soft">empreendimentos à venda</p>
          </div>
          <div>
            <p className="font-display text-3xl font-black text-caixa">{menorPreco ? `R$ ${Math.floor(menorPreco / 1000)} mil` : "—"}</p>
            <p className="text-sm text-ink-soft">menor preço hoje</p>
          </div>
          <div>
            <p className="font-display text-3xl font-black text-caixa">3 min</p>
            <p className="text-sm text-ink-soft">para fazer a simulação</p>
          </div>
          <div>
            <p className="font-display text-xl font-black leading-9 text-caixa">{construtoras.slice(0, 2).join(" e ") || "Construtoras parceiras"}</p>
            <p className="text-sm text-ink-soft">construtoras parceiras</p>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA (é uma sequência de verdade) */}
      <section className="container-page py-14">
        <h2 className="text-3xl font-black sm:text-4xl">Do aluguel à chave na mão</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            ["Faça a simulação", "Conte sobre a sua renda, família e o imóvel que procura. É grátis e não pede CPF."],
            ["Veja o que cabe no bolso", "Você recebe na hora a sua faixa, o valor estimado do financiamento e os imóveis que combinam com você."],
            ["Fale com a corretora", "Escolha o imóvel e chame no WhatsApp. A gente cuida da análise de crédito e da documentação com você."],
          ].map(([t, d], i) => (
            <li key={t} className="relative pl-14">
              <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-sol font-display text-lg font-black text-ink">
                {i + 1}
              </span>
              <h3 className="text-xl font-bold">{t}</h3>
              <p className="mt-1 text-ink-soft">{d}</p>
            </li>
          ))}
        </ol>
        <Link href="/simulacao" className="btn-primary mt-8 px-7 text-base">
          Começar minha simulação <ArrowRight size={18} aria-hidden />
        </Link>
      </section>

      {/* EXPLORE POR REGIÃO */}
      {regioes.length > 0 && (
        <section className="bg-mist py-14">
          <div className="container-page">
            <h2 className="text-3xl font-black sm:text-4xl">Onde você quer morar?</h2>
            <p className="mt-2 text-ink-soft">Apartamentos em toda a cidade de São Paulo.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {regioes.map((g) => (
                <Link
                  key={g.r}
                  href={`/empreendimentos?regiao=${g.r}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-caixa text-white"
                >
                  {g.foto && <img src={g.foto} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="font-display text-xl font-black">{g.label}</p>
                    <p className="text-sm text-white/85">
                      {g.n} {g.n === 1 ? "opção" : "opções"}
                      {g.desde ? ` · desde R$ ${Math.floor(g.desde / 1000)} mil` : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAIXAS DO PROGRAMA */}
      {faixas.length > 0 && (
        <section className="container-page py-14">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <h2 className="text-3xl font-black sm:text-4xl">Em qual faixa você está?</h2>
              <p className="mt-3 text-ink-soft">
                {c.programa_texto ??
                  "O Minha Casa, Minha Vida é o programa habitacional do Governo Federal que facilita a compra do primeiro imóvel com juros menores e, nas faixas de menor renda, com desconto do governo (subsídio)."}
              </p>
              <p className="mt-3 text-xs text-ink-soft">
                Referência: {ativo?.params.localidade ?? "área urbana"}, atualizado em{" "}
                {formatDate(ativo?.params.data_referencia ? `${ativo.params.data_referencia}T12:00:00Z` : null)}. Valores podem mudar por
                nova norma do governo.
              </p>
              <Link href="/simulacao" className="btn-sol mt-6 px-6 text-base">
                Descobrir a minha faixa <ArrowRight size={18} aria-hidden />
              </Link>
            </div>
            <div className="overflow-hidden rounded-3xl border border-line">
              <table className="w-full text-left text-sm">
                <thead className="bg-caixa text-white">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Faixa</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Renda familiar</th>
                    <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Imóvel até</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Subsídio</th>
                  </tr>
                </thead>
                <tbody>
                  {faixas.map((f, i) => (
                    <tr key={f.id} className={i % 2 ? "bg-mist" : "bg-white"}>
                      <th scope="row" className="px-4 py-3 font-display font-bold text-caixa">{f.nome}</th>
                      <td className="px-4 py-3">
                        {f.renda_min > 0 ? `${formatBRL(f.renda_min)} a ` : "Até "}
                        {formatBRL(f.renda_max)}
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">{formatBRL(f.teto_imovel)}</td>
                      <td className="px-4 py-3">{f.subsidio_max > 0 ? `até ${formatBRL(f.subsidio_max)}` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* BENEFÍCIOS (texto editável no painel) */}
      {(c.beneficios ?? []).length > 0 && (
        <section className="bg-caixa-50 py-14">
          <div className="container-page">
            <h2 className="text-3xl font-black sm:text-4xl">Por que vale a pena</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {(c.beneficios ?? []).map((b, i) => {
                const Icon = ICONES[i % ICONES.length];
                return (
                  <div key={b.titulo}>
                    <Icon className="text-caixa" size={28} aria-hidden />
                    <h3 className="mt-3 text-lg font-bold">{b.titulo}</h3>
                    <p className="mt-1 text-sm text-ink-soft">{b.texto}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* IMÓVEIS */}
      {destaques.length > 0 && (
        <section className="container-page py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black sm:text-4xl">Alguns imóveis à venda</h2>
              <p className="mt-1 text-ink-soft">Faça a simulação para ver primeiro os que combinam com a sua renda.</p>
            </div>
            <Link href="/empreendimentos" className="text-sm font-semibold text-caixa hover:underline">
              Ver todos os {devs.length} imóveis
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destaques.map((d) => (
              <DevelopmentCard key={d.id} d={d} />
            ))}
          </div>
        </section>
      )}

      {/* DÚVIDAS */}
      <section className="bg-mist py-14">
        <div className="container-page grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-black sm:text-4xl">Dúvidas comuns</h2>
            <p className="mt-3 text-ink-soft">Ficou com alguma outra pergunta? Fale com a gente pelo WhatsApp.</p>
          </div>
          <div className="divide-y divide-line rounded-3xl bg-white px-5">
            {PERGUNTAS.map(([p, r]) => (
              <details key={p} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {p}
                  <ChevronDown size={18} className="shrink-0 text-caixa transition group-open:rotate-180" aria-hidden />
                </summary>
                <p className="mt-2 text-ink-soft">{r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONVITE FINAL */}
      <section className="bg-caixa text-white">
        <div className="container-page flex flex-col items-start gap-6 py-14 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black sm:text-4xl">O primeiro passo leva 3 minutos</h2>
            <p className="mt-2 text-white/85">
              Faça a sua simulação agora e receba as opções que cabem no seu bolso. Sem custo e sem compromisso.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/simulacao" className="btn-sol px-7 py-3.5 text-base">
              Fazer minha simulação <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href="/empreendimentos" className="btn border border-white/40 text-white hover:bg-white/10">
              <MessageCircle size={18} aria-hidden /> Ver imóveis
            </Link>
          </div>
        </div>
      </section>

      {/* PRIVACIDADE + RESSALVA */}
      <section className="container-page py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <ShieldCheck className="shrink-0 text-caixa" size={32} aria-hidden />
          <div className="text-sm text-ink-soft">
            <p>
              <strong className="text-ink">Seus dados protegidos.</strong> Não pedimos CPF nem documentos na simulação, usamos seus dados
              só para o atendimento que você pedir e o link do WhatsApp não leva dados financeiros. Você pode pedir acesso, correção ou
              exclusão dos seus dados a qualquer momento (LGPD).{" "}
              <Link href="/privacidade" className="font-semibold text-caixa hover:underline">
                Política de Privacidade
              </Link>
            </p>
            <p className="mt-3 text-xs">
              Os resultados da simulação são estimativas e não representam aprovação de crédito. A contratação depende de análise
              cadastral, de crédito e de documentação pela Caixa Econômica Federal ou outro agente financeiro. Este site não é um canal
              oficial da Caixa nem do Governo Federal.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
