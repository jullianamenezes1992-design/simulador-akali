import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";
import {
  ChamarCarteira,
  FinalizarDia,
  MarcarBloco,
} from "@/components/admin/RotinaControles";
import { getSettings } from "@/lib/data";
import { maskPhone } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";
import { montarMeuDia, PAUSAS } from "@/lib/server/meu-dia";
import { Fragment } from "react";

export const metadata: Metadata = { title: "Meu dia" };
export const dynamic = "force-dynamic";

const MOSTRAR = 8;

export default async function MeuDiaPage() {
  const { supabase, nome } = await requireAdmin();
  const [{ hoje, blocos, finalizado }, s] = await Promise.all([
    montarMeuDia(supabase),
    getSettings(),
  ]);
  const feitos = blocos.filter((b) => b.feito).length;
  const pct = Math.round((feitos / blocos.length) * 100);
  const dataLonga = new Date(`${hoje}T12:00:00-03:00`).toLocaleDateString(
    "pt-BR",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      timeZone: "America/Sao_Paulo",
    },
  );
  const assinatura = s.corretora_nome || s.empresa_nome;
  const msgCarteira = (n: string, status?: string) => {
    const p = (n.trim().split(/\s+/)[0] || "").replace(/^./, (c) =>
      c.toUpperCase(),
    );
    if (status === "vendido")
      return `Oi, ${p}! Tudo bem? 😊\n\nAqui é da ${assinatura}. Passando para saber como está tudo com o seu apartamento! 🏡\n\nSe tiver algum amigo ou parente querendo sair do aluguel, me indica? Eu cuido de tudo com o mesmo carinho que tive com você 💙`;
    if (status === "reprovado")
      return `Oi, ${p}! Tudo bem? 😊\n\nAqui é da ${assinatura}. Lembrei de você: saíram novas condições no *Minha Casa Minha Vida* e às vezes dá para fazer uma *nova análise* (ou compor renda com alguém da família).\n\nQuer que eu veja se agora dá certo para você?`;
    return `Oi, ${p}! Tudo bem? 😊\n\nAqui é da ${assinatura}. Saíram novas condições no *Minha Casa Minha Vida* e lançamentos com entrada facilitada.\n\nVocê ainda está procurando o seu apartamento? Posso te mandar as opções atualizadas? 🏡`;
  };

  return (
    <>
      <div className="mb-5">
        <p className="text-sm font-semibold capitalize text-ink-soft">
          {dataLonga}
        </p>
        <h1 className="text-2xl font-extrabold">
          Bom dia{nome ? `, ${nome.split(" ")[0]}` : ""}! Este é o seu dia
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-mist">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="shrink-0 text-sm font-bold">
            {feitos} de {blocos.length}
          </span>
        </div>
      </div>

      <ol className="space-y-3">
        {blocos.map((b, i) => (
          <Fragment key={b.item}>
            <li className={`card p-4 ${b.feito ? "opacity-70" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-caixa">
                    {i + 1}. {b.hora}
                  </p>
                  <h2 className="flex items-center gap-2 text-lg font-extrabold">
                    {b.feito && (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    )}
                    {b.titulo}
                    {!b.manual && b.total > 0 && !b.feito && (
                      <span className="rounded-full bg-sol px-2 text-sm text-ink">
                        {b.total}
                      </span>
                    )}
                    {b.meta && (
                      <span className="rounded-full bg-mist px-2 text-xs font-bold text-ink-soft">
                        {b.item === "carteira" ? b.meta : `meta: ${b.meta}`}
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-ink-soft">{b.dica}</p>
                  {b.nota && (
                    <p className="mt-1 text-sm font-semibold">📹 {b.nota}</p>
                  )}
                </div>
                <MarcarBloco
                  item={b.item}
                  feito={b.feito}
                  auto={!b.manual && b.total === 0}
                  pedirNota={
                    b.item === "conteudo" ? "O que você gravou?" : undefined
                  }
                  nota={b.nota}
                />
              </div>

              {!b.feito && b.clientes.length > 0 && (
                <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
                  {b.clientes.slice(0, MOSTRAR).map((c) => (
                    <li
                      key={`${b.item}-${c.id}`}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                    >
                      <Link
                        href={c.href ?? `/admin/leads/${c.id}`}
                        className="min-w-0 flex-1 hover:text-caixa"
                      >
                        <span className="font-semibold">{c.nome}</span>
                        <span className="text-ink-soft">
                          {" "}
                          · {maskPhone(c.telefone)}
                        </span>
                        {c.detalhe && (
                          <span className="block text-xs text-ink-soft [overflow-wrap:anywhere]">
                            {c.detalhe}
                          </span>
                        )}
                      </Link>
                      {b.item === "carteira" ? (
                        <ChamarCarteira
                          leadId={c.id}
                          telefone={c.telefone}
                          texto={msgCarteira(c.nome, c.status)}
                        />
                      ) : (
                        <ChevronRight size={16} className="text-ink-soft" />
                      )}
                    </li>
                  ))}
                  {b.clientes.length > MOSTRAR && (
                    <li className="px-3 py-2 text-xs text-ink-soft">
                      + {b.clientes.length - MOSTRAR} cliente(s)
                    </li>
                  )}
                </ul>
              )}
              {b.link && !b.feito && (
                <Link
                  href={b.link.href}
                  className="mt-2 inline-block text-sm font-semibold text-caixa hover:underline"
                >
                  {b.link.label} →
                </Link>
              )}
            </li>
            {PAUSAS[b.item] && (
              <li
                className="flex items-center gap-3 px-2 text-sm font-semibold text-ink-soft"
                aria-label="Pausa"
              >
                <span className="h-px flex-1 bg-line" /> {PAUSAS[b.item]}{" "}
                <span className="h-px flex-1 bg-line" />
              </li>
            )}
          </Fragment>
        ))}
      </ol>

      <div className="mt-5">
        <FinalizarDia
          pronto={feitos === blocos.length}
          finalizado={finalizado}
          faltam={blocos.filter((b) => !b.feito).map((b) => b.titulo)}
        />
      </div>
    </>
  );
}
