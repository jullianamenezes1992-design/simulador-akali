import type { Metadata } from "next";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import DevelopmentCard from "@/components/site/DevelopmentCard";
import { listPublicDevelopments } from "@/lib/data";
import { REGIOES, STATUS_OBRA } from "@/lib/constants";
import { formatBRL } from "@/lib/format";

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = await searchParams;
  const r = REGIOES.find((x) => x.value === sp.regiao);
  const em = r?.value === "interior" ? "no" : "na";
  const title = r ? `Empreendimentos ${em} ${r.label}` : "Empreendimentos Minha Casa, Minha Vida em São Paulo";
  const description = r
    ? `Apartamentos do Minha Casa, Minha Vida ${em} ${r.label}. Veja as opções e faça sua simulação grátis.`
    : "Catálogo de empreendimentos do Minha Casa, Minha Vida em São Paulo e região, com filtros por região e preço.";
  // foto de um prédio da região na prévia do link (WhatsApp/Facebook)
  const img = `/api/og-regiao/${r ? r.value : "todas"}?v=1`;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: img, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", images: [img] },
  };
}

const PRECOS = [220000, 250000, 275000, 300000, 350000, 400000, 500000, 600000];

export default async function Catalogo({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const regiao = REGIOES.some((r) => r.value === str("regiao")) ? str("regiao") : "";
  const status = STATUS_OBRA.some((s) => s.value === str("status")) ? str("status") : "";
  const precoMax = Number(str("preco")) || undefined;
  const dorm = Number(str("dorm")) || undefined;
  const busca = str("q").slice(0, 60);

  const devs = await listPublicDevelopments({ regiao, status, precoMax, dormitorios: dorm, busca });
  const temFiltro = Boolean(regiao || status || precoMax || dorm || busca);

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Empreendimentos</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {devs.length} {devs.length === 1 ? "opção encontrada" : "opções encontradas"} em São Paulo e região.
          </p>
        </div>
        <Link href="/simulacao" className="btn-sol">
          Ver os compatíveis comigo
        </Link>
      </div>

      <form method="get" className="card mt-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className="label" htmlFor="q">Buscar</label>
          <input id="q" name="q" defaultValue={busca} placeholder="Nome ou bairro" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="regiao">Região</label>
          <select id="regiao" name="regiao" defaultValue={regiao} className="input">
            <option value="">Todas</option>
            {REGIOES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="preco">Preço até</label>
          <select id="preco" name="preco" defaultValue={precoMax ? String(precoMax) : ""} className="input">
            <option value="">Qualquer</option>
            {PRECOS.map((p) => (
              <option key={p} value={p}>{formatBRL(p)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="dorm">Dormitórios</label>
          <select id="dorm" name="dorm" defaultValue={dorm ? String(dorm) : ""} className="input">
            <option value="">Todos</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="status">Estágio</label>
          <select id="status" name="status" defaultValue={status} className="input">
            <option value="">Todos</option>
            {STATUS_OBRA.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-6 lg:justify-end">
          {temFiltro && (
            <Link href="/empreendimentos" className="btn-secondary flex-1 lg:flex-none">
              Limpar
            </Link>
          )}
          <button className="btn-primary flex-1 lg:flex-none">
            <SlidersHorizontal size={16} /> Filtrar
          </button>
        </div>
      </form>

      {devs.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-ink-soft">
          Nenhum empreendimento encontrado com esses filtros.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devs.map((d) => (
            <DevelopmentCard key={d.id} d={d} />
          ))}
        </div>
      )}
    </div>
  );
}
