import type { Metadata } from "next";
import Link from "next/link";
import { Smartphone } from "lucide-react";
import {
  AcoesBaseFria,
  ImportarBaseFria,
  MetaBaseFria,
} from "@/components/admin/BaseFriaControles";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { mensagemBaseFria, situacaoBF } from "@/lib/base-fria";
import { getSettings } from "@/lib/data";
import { formatDate, maskPhone } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";
import {
  CAMPOS_BF,
  filaBaseFria,
  type ContatoBF,
  sugestaoProjetoBF,
} from "@/lib/server/base-fria";

export const metadata: Metadata = { title: "Base fria" };
export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;
const n = (v: number) => v.toLocaleString("pt-BR");
const diasAtras = (d: number) => new Date(Date.now() - d * 864e5).toISOString();

function Lista({
  itens,
  vazio,
  assinatura,
  sugerir,
}: {
  itens: ContatoBF[];
  vazio: string;
  assinatura: string;
  sugerir: Awaited<ReturnType<typeof sugestaoProjetoBF>>;
}) {
  return itens.length ? (
    <ul className="divide-y divide-line">
      {itens.map((c) => (
        <li
          key={c.id}
          className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="font-bold">
              {c.lead_id ? (
                <Link
                  href={`/admin/leads/${c.lead_id}`}
                  className="hover:underline"
                >
                  {c.nome}
                </Link>
              ) : (
                c.nome
              )}{" "}
              <span className="font-normal text-ink-soft">
                · {maskPhone(c.telefone)}
              </span>
              {c.tentativas > 0 && c.situacao === "chamado" && (
                <span className="ml-1 text-xs text-ink-soft">
                  ({c.tentativas}ª tentativa)
                </span>
              )}
            </p>
            <p className="text-xs text-ink-soft [overflow-wrap:anywhere]">
              {[
                c.bairro || c.zona,
                c.renda_texto && `renda ${c.renda_texto}`,
                c.prazo_compra,
                c.ultima_entrada && `cadastro ${formatDate(c.ultima_entrada)}`,
                c.status_original !== "Novo / sem status" && c.status_original,
                c.observacoes,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <AcoesBaseFria
            id={c.id}
            telefone={c.telefone}
            situacao={c.situacao}
            texto={mensagemBaseFria(
              c,
              assinatura,
              c.situacao === "chamado" ? c.tentativas + 1 : 1,
              sugerir(c),
            )}
          />
        </li>
      ))}
    </ul>
  ) : (
    <p className="py-3 text-sm text-ink-soft">{vazio}</p>
  );
}

export default async function BaseFriaPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const s = await getSettings();
  const meta = s.base_fria_dia ?? 30;
  const assinatura = s.corretora_nome || s.empresa_nome;
  const sugerir = await sugestaoProjetoBF(supabase);
  const d7 = diasAtras(7);

  const digitos = q.replace(/\D/g, "");
  const [resumoQ, hoje, aguardandoQ, buscaQ] = await Promise.all([
    supabase.rpc("base_fria_resumo"),
    filaBaseFria(supabase, meta),
    supabase
      .from("base_fria")
      .select(CAMPOS_BF)
      .eq("situacao", "chamado")
      .gte("chamado_em", d7)
      .order("chamado_em", { ascending: false })
      .limit(150),
    q
      ? supabase
          .from("base_fria")
          .select(CAMPOS_BF)
          .or(
            digitos.length >= 4
              ? `telefone.ilike.%${digitos}%`
              : `nome.ilike.%${q.replace(/[%,()*]/g, " ")}%`,
          )
          .order("prioridade", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: null }),
  ]);
  const cont = Object.fromEntries(
    ((resumoQ.data ?? []) as { situacao: string; total: number }[]).map((r) => [
      r.situacao,
      Number(r.total),
    ]),
  );
  const total = Object.values(cont).reduce((a, b) => a + b, 0);
  const aguardando = ((aguardandoQ.data ?? []) as ContatoBF[]).filter(
    (c) => !hoje.fila.some((f) => f.id === c.id),
  );
  const busca = (buscaQ.data ?? null) as ContatoBF[] | null;
  const diasFila = meta > 0 ? Math.ceil((cont.fila ?? 0) / meta) : 0;

  return (
    <>
      <PageHeader
        titulo="Base fria"
        descricao="A carteira antiga da planilha, separada dos leads. Um lote por dia; só vira lead quem responder."
      />

      <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
        <Smartphone size={20} className="mt-0.5 shrink-0" />
        <p>
          <b>Use o número da carteira.</b> Abra esta tela no celular (ou no
          WhatsApp Web) onde está o WhatsApp da carteira, para não usar o seu
          número principal. Quem responder vira lead e aparece em Leads como{" "}
          <b>“Base fria”</b>.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Contatos na base" valor={n(total)} />
        <StatCard
          label="Na fila"
          valor={n(cont.fila ?? 0)}
          sub={diasFila ? `≈ ${n(diasFila)} dias no ritmo atual` : undefined}
        />
        <StatCard
          label="Já chamados"
          valor={n(cont.chamado ?? 0)}
          sub="aguardando resposta"
        />
        <StatCard label="Viraram lead" valor={n(cont.virou_lead ?? 0)} />
      </div>
      {total > 0 && (
        <p className="mb-4 text-xs text-ink-soft">
          {["numero_errado", "nao_quer", "comprou", "no_crm"]
            .filter((k) => cont[k])
            .map((k) => `${situacaoBF(k)?.label}: ${n(cont[k])}`)
            .join(" · ")}
        </p>
      )}

      {total > 0 && (
        <section className="card mb-4 p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold">
              Fila de hoje{" "}
              <span className="text-ink-soft">
                ({n(hoje.feitos)} de {n(meta)} chamados)
              </span>
            </h2>
            <MetaBaseFria valor={meta} />
          </div>
          <p className="text-xs text-ink-soft">
            No Meu dia, a meta é dividida: metade às 11h e metade às 17h. Vêm
            primeiro os cadastros mais recentes, com renda e região informadas e
            prazo de compra mais curto. Quem não responder volta para a fila em
            90 dias (no máximo 2 tentativas).
          </p>
          <Lista
            assinatura={assinatura}
            sugerir={sugerir}
            itens={hoje.fila}
            vazio={
              hoje.falta === 0
                ? "Meta de hoje batida! 🎉 Amanhã tem mais."
                : "Ninguém na fila agora."
            }
          />
        </section>
      )}

      {aguardando.length > 0 && (
        <section className="card mb-4 p-4">
          <h2 className="text-lg font-extrabold">
            Chamados nos últimos 7 dias
          </h2>
          <p className="text-xs text-ink-soft">
            Respondeu com interesse? Toque em “Respondeu”: o contato vira lead e
            abre a ficha dele.
          </p>
          <Lista
            assinatura={assinatura}
            sugerir={sugerir}
            itens={aguardando}
            vazio=""
          />
        </section>
      )}

      <section className="card mb-4 p-4">
        <form className="flex gap-2" action="/admin/base-fria">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar na base fria por nome ou telefone"
            className="input min-w-0 flex-1"
          />
          <button className="btn-secondary">Buscar</button>
        </form>
        {busca && (
          <Lista
            assinatura={assinatura}
            sugerir={sugerir}
            itens={busca}
            vazio="Ninguém encontrado na base fria."
          />
        )}
      </section>

      <details className="card p-4" open={total === 0}>
        <summary className="cursor-pointer text-lg font-extrabold">
          Importar planilha
        </summary>
        <div className="mt-3">
          <ImportarBaseFria />
        </div>
      </details>
    </>
  );
}
