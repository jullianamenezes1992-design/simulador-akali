import type { Metadata } from "next";
import { AcoesBaseCury } from "@/components/admin/BaseCuryControles";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { compativeis, regraEntrada, type Aprovado } from "@/lib/aprovados";
import { getActiveParams, getSettings } from "@/lib/data";
import { formatBRL, formatDate, maskPhone } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";
import { devsAtivos } from "@/lib/server/aprovados";

export const metadata: Metadata = { title: "Base Cury" };
export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

type ClienteCury = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  participantes: { nome: string; tipo: string }[];
  propostas: {
    pv: string;
    empreendimento: string | null;
    etapa: string | null;
  }[];
  empreendimento: string | null;
  etapa: string | null;
  ab_status: string | null;
  ab_substatus: string | null;
  valor_aprovado: number | null;
  banco: string | null;
  validade: string | null;
  renda_total: number | null;
  parcela_max: number | null;
  fgts: number | null;
  primeiro_imovel: boolean | null;
  observacoes_sf: string | null;
  situacao: string;
  chamado_em: string | null;
  aprovado_id: string | null;
};

const FILTROS = [
  { v: "abertos", label: "Para trabalhar" },
  { v: "nova", label: "Novos" },
  { v: "chamado", label: "Chamados" },
  { v: "aprovado", label: "Nos Aprovados" },
  { v: "descartado", label: "Descartados" },
  { v: "todos", label: "Todos" },
];

/** Mensagem de primeiro contato para um cliente com pasta na Cury. */
function mensagem(c: ClienteCury, assinatura: string) {
  const primeiro = c.nome.split(" ")[0];
  const nome = primeiro.charAt(0) + primeiro.slice(1).toLowerCase();
  return [
    `Oi, ${nome}! Tudo bem? Aqui é ${assinatura}, corretora parceira da Cury.`,
    c.empreendimento
      ? `Vi que você tem uma análise de crédito aprovada para comprar seu apartamento${c.empreendimento ? ` (você tinha interesse no ${c.empreendimento})` : ""}.`
      : "Vi que você tem uma análise de crédito aprovada para comprar seu apartamento.",
    "Ainda está procurando? Tenho opções que cabem na sua aprovação e posso te mostrar sem compromisso. 😊",
  ].join("\n\n");
}

export default async function BaseCuryPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const filtro = FILTROS.some((f) => f.v === sp.f) ? sp.f! : "abertos";
  const q = (sp.q ?? "").trim();
  const [s, ativo, devs, { data: todos }] = await Promise.all([
    getSettings(),
    getActiveParams(),
    devsAtivos(supabase),
    supabase
      .from("base_cury")
      .select(
        "id, nome, telefone, email, participantes, propostas, empreendimento, etapa, ab_status, ab_substatus, valor_aprovado, banco, validade, renda_total, parcela_max, fgts, primeiro_imovel, observacoes_sf, situacao, chamado_em, aprovado_id",
      )
      .order("validade", { ascending: false, nullsFirst: false })
      .limit(2000),
  ]);
  const assinatura = s.corretora_nome || s.empresa_nome;
  const regra = regraEntrada(ativo?.params);
  const hoje = new Date().toISOString().slice(0, 10);
  const lista = (todos ?? []) as ClienteCury[];
  const cont = (sit: string) => lista.filter((c) => c.situacao === sit).length;
  const digitos = q.replace(/\D/g, "");
  const termo = q.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const mostrados = lista
    .filter((c) =>
      filtro === "todos"
        ? true
        : filtro === "abertos"
          ? c.situacao === "nova" || c.situacao === "chamado"
          : c.situacao === filtro,
    )
    .filter((c) =>
      !q
        ? true
        : digitos.length >= 4
          ? (c.telefone ?? "").includes(digitos)
          : c.nome
              .normalize("NFD")
              .replace(/[̀-ͯ]/g, "")
              .toLowerCase()
              .includes(termo),
    );

  // quantos projetos cabem para cada cliente (mesma conta dos Aprovados)
  const cabem = (c: ClienteCury) => {
    if (!(Number(c.valor_aprovado) > 0)) return null;
    const a = {
      id: c.id,
      nome: c.nome,
      renda_familiar: Number(c.renda_total) || 0,
      faixa: null,
      financiamento: Number(c.valor_aprovado) || 0,
      subsidio: 0,
      fgts: Number(c.fgts) || 0,
      entrada: 0,
      poder_compra: (Number(c.valor_aprovado) || 0) + (Number(c.fgts) || 0),
      parcela_max: c.parcela_max,
      dormitorios_min: null,
      regioes: [],
    } as unknown as Aprovado;
    return compativeis(a, devs, 0, regra);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        titulo="Base Cury"
        descricao="Clientes com pasta na Cury (propostas do Salesforce da Cury). Ficam separados dos seus leads e aprovados até você decidir trabalhar o cliente."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Para trabalhar"
          valor={cont("nova") + cont("chamado")}
          sub={`${cont("chamado")} já chamados`}
        />
        <StatCard label="Nos Aprovados" valor={cont("aprovado")} />
        <StatCard label="Descartados" valor={cont("descartado")} />
        <StatCard
          label="Aprovação vencida"
          valor={
            lista.filter(
              (c) =>
                c.validade &&
                c.validade < hoje &&
                (c.situacao === "nova" || c.situacao === "chamado"),
            ).length
          }
          sub="entre os para trabalhar"
        />
      </div>

      <form className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {FILTROS.map((f) => (
            <a
              key={f.v}
              href={`/admin/base-cury?f=${f.v}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${filtro === f.v ? "bg-caixa text-white" : "border border-line bg-white text-ink"}`}
            >
              {f.label}
            </a>
          ))}
        </div>
        <input type="hidden" name="f" value={filtro} />
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar nome ou telefone"
          className="input !py-1.5 max-w-xs"
        />
      </form>

      <section className="card p-4">
        {mostrados.length ? (
          <ul className="divide-y divide-line">
            {mostrados.slice(0, 300).map((c) => {
              const cb = cabem(c);
              const vencida = !!c.validade && c.validade < hoje;
              return (
                <li
                  key={c.id}
                  className="flex flex-col gap-2 py-3 lg:flex-row lg:items-start lg:justify-between"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-bold">
                      {c.nome}{" "}
                      <span className="font-normal text-ink-soft">
                        {c.telefone
                          ? `· ${maskPhone(c.telefone)}`
                          : "· sem celular"}
                      </span>
                    </p>
                    <p className="text-xs text-ink-soft">
                      {c.propostas
                        .map(
                          (p) =>
                            `${p.empreendimento ?? "?"} (${p.pv}${p.etapa ? ` · ${p.etapa}` : ""})`,
                        )
                        .join(" · ")}
                    </p>
                    <p className="text-xs">
                      {c.ab_status ? (
                        <span className="font-semibold text-emerald-700">
                          {c.ab_status}
                          {c.ab_substatus ? ` / ${c.ab_substatus}` : ""}
                        </span>
                      ) : (
                        <span className="text-ink-soft">
                          sem análise bancária
                        </span>
                      )}
                      {c.valor_aprovado ? (
                        <>
                          {" "}
                          · aprovação{" "}
                          <strong>{formatBRL(Number(c.valor_aprovado))}</strong>
                        </>
                      ) : null}
                      {c.banco ? ` · ${c.banco.replace(/^\d+\s*/, "")}` : ""}
                      {c.validade ? (
                        <span
                          className={
                            vencida ? "font-semibold text-red-700" : ""
                          }
                        >
                          {" "}
                          · {vencida ? "venceu" : "válida até"}{" "}
                          {formatDate(`${c.validade}T12:00:00Z`)}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {c.renda_total
                        ? `Renda ${formatBRL(Number(c.renda_total))}`
                        : "Renda não informada"}
                      {c.parcela_max
                        ? ` · parcela máx. ${formatBRL(Number(c.parcela_max))}`
                        : ""}
                      {Number(c.fgts) > 0
                        ? ` · FGTS ${formatBRL(Number(c.fgts))}`
                        : ""}
                      {c.primeiro_imovel === true ? " · 1º imóvel" : ""}
                      {c.participantes.length > 1
                        ? ` · com ${c.participantes
                            .filter((p) => p.nome !== c.nome)
                            .map(
                              (p) =>
                                `${p.nome.split(" ")[0]} (${p.tipo.toLowerCase()})`,
                            )
                            .join(", ")}`
                        : ""}
                    </p>
                    {cb && (
                      <p className="text-xs font-semibold text-caixa">
                        {cb.length
                          ? `Cabe em ${cb.length} projeto(s): ${cb
                              .slice(0, 3)
                              .map((x) => x.dev.nome)
                              .join(", ")}${cb.length > 3 ? "…" : ""}`
                          : "Nenhum projeto cabe com essa aprovação hoje"}
                      </p>
                    )}
                    {c.observacoes_sf && (
                      <p className="text-xs italic text-ink-soft">
                        “{c.observacoes_sf}”
                      </p>
                    )}
                  </div>
                  <AcoesBaseCury
                    id={c.id}
                    telefone={c.telefone}
                    texto={mensagem(c, assinatura)}
                    situacao={c.situacao}
                    aprovadoId={c.aprovado_id}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft">
            {lista.length
              ? "Nenhum cliente neste filtro."
              : "Ainda não há clientes importados do Salesforce da Cury."}
          </p>
        )}
        {mostrados.length > 300 && (
          <p className="mt-2 text-xs text-ink-soft">
            Mostrando 300 de {mostrados.length}. Use a busca para achar os
            outros.
          </p>
        )}
      </section>
    </div>
  );
}
