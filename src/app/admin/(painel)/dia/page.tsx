import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";
import {
  ChamarCarteira,
  CobrarDocs,
  FinalizarDia,
  MarcarBloco,
} from "@/components/admin/RotinaControles";
import { AcoesBaseFria } from "@/components/admin/BaseFriaControles";
import { getSettings } from "@/lib/data";
import { maskPhone } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";
import { ESSENCIAIS_EXTERNO, montarMeuDia, PAUSAS } from "@/lib/server/meu-dia";
import { diaSP } from "@/lib/agenda";
import {
  DesfazerFolgaHoje,
  Folgas,
  TIPOS_DIA,
  type DiaEspecial,
} from "@/components/admin/Folgas";
import { Fragment } from "react";

export const metadata: Metadata = { title: "Meu dia" };
export const dynamic = "force-dynamic";

const MOSTRAR = 8;

/** Bom dia / Boa tarde / Boa noite, pelo horário de São Paulo. */
function saudacao() {
  const h = Number(
    new Intl.DateTimeFormat("pt-BR", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    }).format(new Date()),
  );
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export default async function MeuDiaPage() {
  const { supabase, nome } = await requireAdmin();
  const [{ hoje, blocos: todosBlocos, finalizado }, s, folgasQ] =
    await Promise.all([
      montarMeuDia(supabase),
      getSettings(),
      supabase
        .from("rotina_dia")
        .select("dia, item")
        .in("item", ["folga", "evento", "meeting", "live"])
        .gte("dia", diaSP())
        .order("dia")
        .limit(60),
    ]);
  const folgas = (folgasQ.data ?? []).map((f) => ({
    dia: f.dia as string,
    tipo: f.item as DiaEspecial["tipo"],
  }));
  const especial = folgas.find((f) => f.dia === hoje)?.tipo;
  const ehFolga = especial === "folga";
  // evento / meeting (dia externo): só o essencial
  const blocos =
    especial && especial !== "folga"
      ? todosBlocos.filter((b) => ESSENCIAIS_EXTERNO.includes(b.item))
      : todosBlocos;
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

  if (ehFolga)
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <p className="text-sm font-semibold capitalize text-ink-soft">
          {dataLonga}
        </p>
        <p className="mt-4 text-6xl">🌴</p>
        <h1 className="mt-3 text-2xl font-extrabold">
          Hoje é sua folga{nome ? `, ${nome.split(" ")[0]}` : ""}!
        </h1>
        <p className="mt-2 text-ink-soft">
          Nada de tarefas hoje. Amanhã o Meu dia volta com tudo organizado, sem
          acumular.
        </p>
        <div className="mt-6">
          <DesfazerFolgaHoje hoje={hoje} />
        </div>
        <div className="card mt-8 p-4 text-left">
          <Folgas proximas={folgas} hoje={hoje} />
        </div>
      </div>
    );

  return (
    <>
      {especial && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-300 bg-sky-50 p-3 text-sm text-sky-950">
          <p>
            <b>
              {TIPOS_DIA[especial].emoji} Hoje é dia de{" "}
              {TIPOS_DIA[especial].label.toLowerCase()} (externo).
            </b>{" "}
            Só o essencial: agenda, novos cadastros e leads quentes. O resto
            volta amanhã, sem acumular.
          </p>
          <DesfazerFolgaHoje hoje={hoje} rotulo="Mostrar o dia completo" />
        </div>
      )}
      <div className="mb-5">
        <p className="text-sm font-semibold capitalize text-ink-soft">
          {dataLonga}
        </p>
        <h1 className="text-2xl font-extrabold">
          {saudacao()}
          {nome ? `, ${nome.split(" ")[0]}` : ""}! Este é o seu dia
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-mist">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="shrink-0 text-right text-sm font-bold">
            <span className="text-lg text-emerald-700">{pct}%</span>{" "}
            <span className="font-semibold text-ink-soft">
              · {feitos} de {blocos.length}
            </span>
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
                        {b.item === "carteira" || b.item.startsWith("base_fria")
                          ? b.meta
                          : `meta: ${b.meta}`}
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
                  {b.clientes
                    .slice(
                      0,
                      b.item.startsWith("revisao") ||
                        b.item === "pasta" ||
                        b.item === "carteira"
                        ? 60
                        : MOSTRAR,
                    )
                    .map((c) => (
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
                        {b.item.startsWith("base_fria") ? (
                          <AcoesBaseFria
                            id={c.id}
                            telefone={c.telefone}
                            situacao={c.status ?? "fila"}
                            texto={c.texto ?? ""}
                          />
                        ) : b.item === "pasta" ? (
                          <CobrarDocs
                            leadId={c.id}
                            telefone={c.telefone}
                            texto={c.texto ?? ""}
                          />
                        ) : b.item === "carteira" ? (
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
                  {b.clientes.length >
                    (b.item.startsWith("revisao") ||
                    b.item === "pasta" ||
                    b.item === "carteira"
                      ? 60
                      : MOSTRAR) && (
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
      <div className="card mt-6 p-4">
        <Folgas proximas={folgas} hoje={hoje} />
      </div>
    </>
  );
}
