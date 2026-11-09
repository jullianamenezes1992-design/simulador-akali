/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BedDouble, Building, CalendarClock, Car, Check, MapPin, Ruler, Tag } from "lucide-react";
import Gallery from "@/components/site/Gallery";
import ViewTracker from "@/components/site/ViewTracker";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import { areaTexto, ULTIMAS_UNIDADES } from "@/components/site/DevelopmentCard";
import { getPublicDevelopment } from "@/lib/data";
import { regiaoLabel, statusObraLabel } from "@/lib/constants";
import { formatBRL, formatPreco } from "@/lib/format";
import { embedUrl, isVideoFile } from "@/lib/video";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const d = await getPublicDevelopment(slug);
  if (!d) return { title: "Empreendimento não encontrado" };
  return {
    title: d.nome,
    description: `${d.nome} — ${d.bairro ?? regiaoLabel(d.regiao)}, ${d.preco_min == null ? "preço sob consulta" : `a partir de ${formatBRL(d.preco_min)}`}. ${d.dormitorios.join(" e ")} dormitório(s).`,
    // foto do empreendimento redimensionada para o WhatsApp/Facebook mostrarem na prévia do link
    openGraph: { images: [{ url: `/api/og/${d.slug}?v=1`, width: 1200, height: 630, alt: d.nome }] },
    twitter: { card: "summary_large_image", images: [`/api/og/${d.slug}?v=1`] },
  };
}

export default async function EmpreendimentoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const d = await getPublicDevelopment(slug);
  if (!d) notFound();

  const media = d.development_media ?? [];
  const fotos = media.filter((m) => m.tipo === "foto");
  if (fotos.length === 0 && d.capa_url) fotos.push({ id: "capa", development_id: d.id, tipo: "foto", url: d.capa_url, storage_path: null, legenda: null, ordem: 0 });
  const plantas = media.filter((m) => m.tipo === "planta");
  const videos = [...media.filter((m) => m.tipo === "video").map((m) => m.url), ...(d.video_url ? [d.video_url] : [])];
  const area = areaTexto(d);
  const contem = (t: string | null) => !!t && !!d.endereco && d.endereco.toLowerCase().includes(t.toLowerCase());
  const local = [d.endereco, contem(d.bairro) ? null : d.bairro, contem(d.cidade) ? null : d.cidade, d.uf].filter(Boolean).join(", ");
  const mapaQ = d.latitude != null && d.longitude != null ? `${d.latitude},${d.longitude}` : local;
  const indisponivel = !d.disponivel || d.unidades_disponiveis === 0;

  return (
    <div className="pb-24 lg:pb-0">
      <ViewTracker developmentId={d.id} nome={d.nome} preco={d.preco_min} />
      <div className="container-page py-6 sm:py-10">
        <nav className="text-xs text-ink-soft">
          <Link href="/empreendimentos" className="hover:text-caixa">Empreendimentos</Link> / {d.nome}
        </nav>

        {d.is_demo && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
            Empreendimento FICTÍCIO, cadastrado apenas como exemplo para demonstração da plataforma.
          </p>
        )}

        <div className="mt-4 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="min-w-0">
            <Gallery fotos={fotos.map((f) => ({ url: f.url, legenda: f.legenda }))} nome={d.nome} />

            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                <span className="chip bg-caixa-50 text-caixa-dark">{statusObraLabel(d.status_obra)}</span>
                {!indisponivel && d.unidades_disponiveis != null && d.unidades_disponiveis > 0 && d.unidades_disponiveis <= ULTIMAS_UNIDADES && (
                  <span className="chip border-red-600 bg-red-600 text-white">
                    {d.unidades_disponiveis === 1 ? "Última unidade!" : "Últimas unidades!"}
                  </span>
                )}
                {d.faixas.map((f) => (
                  <span key={f} className="chip bg-mist text-ink">MCMV Faixa {f}</span>
                ))}
                {d.oferta_destaque && d.oferta_texto && <span className="chip bg-sol text-ink">{d.oferta_texto}</span>}
              </div>
              <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">{d.nome}</h1>
              {d.construtora && <p className="mt-1 text-sm text-ink-soft">por {d.construtora}</p>}
              <p className="mt-2 flex items-start gap-1.5 text-sm text-ink-soft">
                <MapPin size={16} className="mt-0.5 shrink-0" /> {local} • {regiaoLabel(d.regiao)}
              </p>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: BedDouble, t: "Dormitórios", v: d.dormitorios.join(" ou ") },
                { icon: Ruler, t: "Área privativa", v: area ?? "—" },
                { icon: Car, t: "Vaga", v: d.vagas ? "Sim" : "Não" },
                { icon: CalendarClock, t: "Entrega", v: d.previsao_entrega ?? "—" },
              ].map(({ icon: Icon, t, v }) => (
                <div key={t} className="rounded-xl bg-mist p-3">
                  <Icon size={18} className="text-caixa" />
                  <dt className="mt-1 text-xs text-ink-soft">{t}</dt>
                  <dd className="text-sm font-bold">{v}</dd>
                </div>
              ))}
            </dl>

            {d.descricao && (
              <section className="mt-8">
                <h2 className="text-lg font-extrabold">Sobre o empreendimento</h2>
                <p className="mt-2 whitespace-pre-line text-ink-soft">{d.descricao}</p>
              </section>
            )}

            {d.diferenciais.length > 0 && (
              <section className="mt-8">
                <h2 className="text-lg font-extrabold">Diferenciais</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {d.diferenciais.map((x) => (
                    <li key={x} className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-emerald-600" /> {x}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {plantas.length > 0 && (
              <section className="mt-8">
                <h2 className="text-lg font-extrabold">Plantas</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {plantas.map((p) => (
                    <figure key={p.id} className="card overflow-hidden">
                      <a href={p.url} target="_blank" rel="noreferrer">
                        <img src={p.url} alt={p.legenda ?? "Planta"} className="aspect-[4/3] w-full bg-white object-contain p-2" loading="lazy" />
                      </a>
                      {p.legenda && <figcaption className="border-t border-line px-3 py-2 text-xs text-ink-soft">{p.legenda}</figcaption>}
                    </figure>
                  ))}
                </div>
              </section>
            )}

            {videos.length > 0 && (
              <section className="mt-8">
                <h2 className="text-lg font-extrabold">Vídeos</h2>
                <div className="mt-3 grid gap-3">
                  {videos.map((v) => {
                    const emb = embedUrl(v);
                    return emb ? (
                      <iframe
                        key={v}
                        src={emb}
                        title={`Vídeo de ${d.nome}`}
                        className="aspect-video w-full rounded-2xl"
                        allow="accelerometer; encrypted-media; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : isVideoFile(v) ? (
                      <video key={v} src={v} controls preload="metadata" className="aspect-video w-full rounded-2xl bg-black" />
                    ) : (
                      <a key={v} href={v} target="_blank" rel="noreferrer" className="text-sm font-semibold text-caixa underline">
                        Assistir vídeo
                      </a>
                    );
                  })}
                </div>
              </section>
            )}

            {mapaQ && (
              <section className="mt-8">
                <h2 className="text-lg font-extrabold">Localização</h2>
                <iframe
                  title={`Mapa de ${d.nome}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapaQ)}&z=15&output=embed`}
                  className="mt-3 aspect-[16/9] w-full rounded-2xl border border-line"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </section>
            )}
          </div>

          {/* Lateral */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <p className="text-xs text-ink-soft">{d.preco_min == null ? "Preço" : "A partir de"}</p>
              <p className="text-3xl font-extrabold text-caixa">{formatPreco(d.preco_min)}</p>
              {d.preco_min == null && <p className="text-sm text-ink-soft">Fale com o corretor para receber a tabela atualizada.</p>}
              {d.preco_max && d.preco_min != null && d.preco_max > d.preco_min && (
                <p className="text-sm text-ink-soft">Unidades até {formatBRL(d.preco_max)}</p>
              )}
              <p className="mt-3 flex items-center gap-1.5 text-sm">
                <Building size={15} className="text-caixa" />
                {indisponivel
                  ? "Sem unidades disponíveis no momento"
                  : d.unidades_disponiveis != null
                    ? `${d.unidades_disponiveis} unidade(s) disponível(is)`
                    : "Unidades disponíveis"}
              </p>
              {d.condicoes_comerciais && (
                <div className="mt-4 rounded-xl bg-sol-50 p-3 text-sm">
                  <p className="flex items-center gap-1.5 font-bold">
                    <Tag size={14} /> Condições comerciais
                  </p>
                  <p className="mt-1 whitespace-pre-line text-ink-soft">{d.condicoes_comerciais}</p>
                </div>
              )}
              <WhatsAppButton developmentId={d.id} developmentNome={d.nome} label="Tenho interesse" className="mt-5 hidden lg:block" pagina="empreendimento" />
              <Link href="/simulacao" className="btn-secondary mt-2 w-full">
                Simular financiamento
              </Link>
            </div>
            <p className="px-1 text-xs text-ink-soft">
              Valores, disponibilidade e condições sujeitos a alteração sem aviso. Imagens ilustrativas{d.construtora ? `, fornecidas pela ${d.construtora}` : ""}. A aprovação do
              financiamento depende de análise do agente financeiro.
            </p>
          </aside>
        </div>
      </div>

      {/* CTA fixo no celular */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white p-3 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <p className="text-[11px] text-ink-soft">{d.preco_min == null ? "Preço" : "A partir de"}</p>
            <p className="text-lg font-extrabold text-caixa">{formatPreco(d.preco_min)}</p>
          </div>
          <WhatsAppButton developmentId={d.id} developmentNome={d.nome} label="Tenho interesse" className="flex-1" pagina="empreendimento" />
        </div>
      </div>
    </div>
  );
}
