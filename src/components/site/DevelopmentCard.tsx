/* eslint-disable @next/next/no-img-element -- mídias vêm do Storage/URLs configuradas no painel */
import Link from "next/link";
import { BedDouble, Car, MapPin, Ruler } from "lucide-react";
import type { Development } from "@/lib/data";
import { regiaoLabel, statusObraLabel } from "@/lib/constants";
import { formatBRL } from "@/lib/format";

interface Props {
  d: Development;
  /** link do detalhe (pode carregar ?ref= do resultado) */
  href?: string;
  destaque?: React.ReactNode;
  children?: React.ReactNode;
}

export function capaDe(d: Development) {
  return d.capa_url ?? d.development_media?.find((m) => m.tipo === "foto")?.url ?? null;
}

export function areaTexto(d: Development) {
  if (!d.area_min) return null;
  return d.area_max && d.area_max !== d.area_min
    ? `${d.area_min.toLocaleString("pt-BR")} a ${d.area_max.toLocaleString("pt-BR")} m²`
    : `${d.area_min.toLocaleString("pt-BR")} m²`;
}

export default function DevelopmentCard({ d, href, destaque, children }: Props) {
  const capa = capaDe(d);
  const area = areaTexto(d);
  const indisponivel = !d.disponivel || d.unidades_disponiveis === 0;
  return (
    <article className="card flex flex-col overflow-hidden transition hover:shadow-lg">
      <Link href={href ?? `/empreendimentos/${d.slug}`} className="relative block aspect-[16/10] bg-mist">
        {capa ? (
          <img src={capa} alt={`Imagem de ${d.nome}`} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-soft">Sem foto</div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="chip bg-white/95 text-ink">{statusObraLabel(d.status_obra)}</span>
          {d.oferta_destaque && <span className="chip bg-sol text-ink">{d.oferta_texto ? "Oferta" : "Destaque"}</span>}
          {indisponivel && <span className="chip bg-ink text-white">Sem unidades</span>}
        </div>
        {d.is_demo && <span className="chip absolute bottom-3 right-3 bg-red-600 text-white">EXEMPLO</span>}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        {destaque}
        <Link href={href ?? `/empreendimentos/${d.slug}`} className="hover:text-caixa">
          <h3 className="text-base font-bold leading-snug">{d.nome}</h3>
        </Link>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink-soft">
          <MapPin size={14} /> {[d.bairro, regiaoLabel(d.regiao)].filter(Boolean).join(" • ")}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
          <span className="flex items-center gap-1">
            <BedDouble size={15} /> {d.dormitorios.join(" e ")} dorm.
          </span>
          {area && (
            <span className="flex items-center gap-1">
              <Ruler size={15} /> {area}
            </span>
          )}
          {d.vagas && (
            <span className="flex items-center gap-1">
              <Car size={15} /> Vaga
            </span>
          )}
        </div>
        <div className="mt-auto pt-4">
          <p className="text-xs text-ink-soft">A partir de</p>
          <p className="text-xl font-extrabold text-caixa">{formatBRL(d.preco_min)}</p>
          {d.faixas.length > 0 && (
            <p className="mt-0.5 text-xs text-ink-soft">MCMV {d.faixas.map((f) => `Faixa ${f}`).join(", ")}</p>
          )}
        </div>
        {children}
      </div>
    </article>
  );
}
