import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import EnviarOferta from "@/components/admin/EnviarOferta";
import { STATUS_EM_ABERTO, cabe, classificacaoInfo, diasParaVencer, mensagemOferta, type Aprovado, type DevCompat } from "@/lib/aprovados";
import { getSettings } from "@/lib/data";
import { formatBRL, formatDate, maskPhone } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";
import { CAMPOS_DEV } from "@/lib/server/aprovados";
import { siteUrl } from "@/lib/server/notificacoes";

export const metadata: Metadata = { title: "Aprovados que cabem no projeto" };

const TOLERANCIAS = [0, 3, 5, 10];

export default async function CabemPage({ searchParams }: { searchParams: Promise<{ dev?: string; tol?: string }> }) {
  const sp = await searchParams;
  if (!sp.dev || !/^[0-9a-f-]{36}$/i.test(sp.dev)) notFound();
  const tol = TOLERANCIAS.includes(Number(sp.tol)) ? Number(sp.tol) : 0;
  const { supabase } = await requireAdmin();
  const [{ data: d }, { data }, s] = await Promise.all([
    supabase.from("developments").select(CAMPOS_DEV).eq("id", sp.dev).maybeSingle(),
    supabase.from("aprovados").select("*").in("status", STATUS_EM_ABERTO).order("poder_compra", { ascending: false }).limit(2000),
    getSettings(),
  ]);
  if (!d) notFound();
  const dev = d as DevCompat;
  const preco = Number(dev.preco_min);
  const lista = ((data ?? []) as Aprovado[])
    .filter((a) => {
      const dias = diasParaVencer(a.vencimento);
      return (dias == null || dias >= 0) && cabe(Number(a.poder_compra), preco, tol / 100);
    })
    .sort((x, y) => Number(y.classificacao === "quente") - Number(x.classificacao === "quente") || Number(y.poder_compra) - Number(x.poder_compra));
  const link = `${siteUrl()}/empreendimentos/${dev.slug}?utm_source=whatsapp&utm_medium=corretora&utm_content=aprovado`;
  const assinatura = s.corretora_nome || s.empresa_nome;

  return (
    <>
      <Link href={`/admin/empreendimentos/${dev.id}`} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-caixa hover:underline">
        <ArrowLeft size={14} /> {dev.nome}
      </Link>
      <PageHeader
        titulo={`Aprovados que cabem no ${dev.nome}`}
        descricao={`A partir de ${preco ? formatBRL(preco) : "—"}. Mostra quem tem poder de compra igual ou acima desse valor${tol ? `, ou até ${tol}% abaixo` : ""}.`}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold text-ink-soft">Tolerância:</span>
        {TOLERANCIAS.map((t) => (
          <Link key={t} href={`/admin/aprovados/cabem?dev=${dev.id}${t ? `&tol=${t}` : ""}`} className={`filtro ${tol === t ? "filtro-on" : ""}`}>
            {t ? `até ${t}% abaixo` : "só quem cabe"}
          </Link>
        ))}
      </div>
      {lista.length === 0 ? (
        <p className="card p-6 text-center text-sm text-ink-soft">Nenhum aprovado em aberto cabe neste projeto{tol ? " com essa tolerância" : ""}.</p>
      ) : (
        <ul className="card divide-y divide-line px-4">
          {lista.map((a) => {
            const falta = preco - Number(a.poder_compra);
            const cl = classificacaoInfo(a.classificacao);
            return (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <Link href={`/admin/aprovados/${a.id}`} className="font-semibold hover:text-caixa">
                    {a.nome}
                  </Link>{" "}
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${cl.cor}`}>{cl.label}</span>
                  <p className="text-xs text-ink-soft">
                    {maskPhone(a.telefone)} · poder {formatBRL(Number(a.poder_compra))}
                    {falta > 0 ? <span className="font-semibold text-amber-700"> · faltam {formatBRL(falta)}</span> : ` · sobra ${formatBRL(-falta)}`}
                    {a.vencimento ? ` · vence ${formatDate(`${a.vencimento}T12:00:00Z`)}` : ""}
                  </p>
                </div>
                <EnviarOferta aprovadoId={a.id} telefone={a.telefone} devNome={dev.nome} texto={mensagemOferta(a, dev, link, assinatura)} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
