import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { AnonymizeButton, CopiarAtendimentoButton, DeleteLeadButton, OrigemEditor, NoteForm, ResponsavelSelect, RevealCPF, StatusSelect } from "@/components/admin/LeadControls";
import {
  ESTADOS_CIVIS,
  PRAZOS_COMPRA,
  PREFERENCIAS_OBRA,
  RELACOES_COMPOSICAO,
  TIPOS_RENDA,
  labelOf,
  leadStatusInfo,
  regiaoLabel,
} from "@/lib/constants";
import { formatBRL, formatDate, idadeEmMeses, maskPhone } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";
import type { SimulationResult } from "@/lib/simulacao/types";
import { NovaTarefaForm, TarefaItem } from "@/components/admin/Agenda";
import { agoraMs, diaSP, type Tarefa } from "@/lib/agenda";

const simNao = (v: boolean | null | undefined) => (v == null ? "—" : v ? "Sim" : "Não");

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="card p-4">
      <h2 className="mb-3 font-bold">{titulo}</h2>
      {children}
    </section>
  );
}

function Linhas({ itens }: { itens: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
      {itens.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3 border-b border-line/60 pb-1.5 sm:block sm:border-0 sm:pb-0">
          <dt className="text-ink-soft">{k}</dt>
          <dd className="text-right font-medium sm:text-left">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const TIPO_EVENTO: Record<string, string> = {
  compromisso_agendado: "Compromisso agendado",
  origem_alterada: "Origem alterada",
  compromisso_concluido: "Compromisso concluído",
  simulacao_iniciada: "Iniciou a simulação (preencheu nome e WhatsApp)",
  simulacao_concluida: "Concluiu a simulação",
  visualizou_empreendimento: "Visualizou empreendimento",
  escolheu_empreendimento: "Escolheu empreendimento",
  clique_whatsapp: "Clicou no WhatsApp",
  status_alterado: "Etapa alterada",
  nota: "Observação",
};

export default async function LeadDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, papel } = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data: l } = await supabase.from("leads").select("*, escolhido:escolhido_id(id, nome, slug)").eq("id", id).maybeSingle();
  if (!l) notFound();

  const [eventos, notas, equipe, auditoria, recomendados, tarefas] = await Promise.all([
    supabase.from("lead_events").select("id, tipo, dados, created_at, development:development_id(nome, slug)").eq("lead_id", id).order("created_at", { ascending: false }).limit(200),
    supabase.from("lead_notes").select("id, texto, created_at, autor:autor_id(nome)").eq("lead_id", id).order("created_at", { ascending: false }),
    supabase.from("admin_users").select("user_id, nome").order("nome"),
    supabase.from("audit_log").select("id, acao, dados_antigos, dados_novos, created_at, ator_id").eq("tabela", "leads").eq("registro_id", id).order("created_at", { ascending: false }).limit(50),
    l.recomendados?.length
      ? supabase.from("developments").select("id, nome, slug").in("id", l.recomendados)
      : Promise.resolve({ data: [] as { id: string; nome: string; slug: string }[] }),
    supabase.from("lead_tasks").select("*").eq("lead_id", id).order("quando", { ascending: false }).limit(50),
  ]);

  const nomesEquipe = new Map((equipe.data ?? []).map((p) => [p.user_id, p.nome]));
  const sim = l.simulacao as SimulationResult | null;
  const st = leadStatusInfo(l.status);
  const escolhido = l.escolhido as unknown as { id: string; nome: string; slug: string } | null;
  type Ev = { id: number; tipo: string; dados: Record<string, unknown>; created_at: string; development: { nome: string; slug: string } | null };
  const evs = (eventos.data ?? []) as unknown as Ev[];
  const visualizados = [...new Map(evs.filter((e) => e.tipo === "visualizou_empreendimento" && e.development).map((e) => [e.development!.slug, e])).values()];
  const recOrdenados = (l.recomendados as string[]).map((rid) => (recomendados.data ?? []).find((d) => d.id === rid)).filter(Boolean) as { id: string; nome: string; slug: string }[];
  const anonimizado = !!l.anonimizado_em;

  // Resumo em texto para colar no projeto "Atendimento Akali" do Claude
  const idade = l.data_nascimento ? Math.floor(idadeEmMeses(l.data_nascimento) / 12) : null;
  const txt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
  const resumoAtendimento = [
    `CLIENTE: ${l.nome} (código ${l.codigo})`,
    `Cadastro: ${formatDate(l.created_at, true)} • Status: ${st.label}${l.simulacao_completa ? "" : ` • Simulação incompleta (parou na etapa ${l.etapa_parou ?? "?"} de 6)`}`,
    `WhatsApp: ${maskPhone(l.telefone)}${l.email ? ` • E-mail: ${l.email}` : ""}`,
    `Idade: ${idade ?? "—"} anos • Estado civil: ${labelOf(ESTADOS_CIVIS, l.estado_civil)} • Dependentes: ${txt(l.dependentes)}`,
    "",
    "RENDA",
    `Profissão: ${txt(l.profissao)} • Tipo de renda: ${labelOf(TIPOS_RENDA, l.tipo_renda)}`,
    `Renda principal: ${formatBRL(Number(l.renda_principal ?? 0))}`,
    l.compor_renda
      ? `Compõe renda com: ${labelOf(RELACOES_COMPOSICAO, l.relacao_composicao)} • Renda: ${formatBRL(Number(l.renda_composicao ?? 0))} • Idade: ${txt(l.idade_composicao)}`
      : "Não compõe renda",
    `Renda familiar total: ${formatBRL(Number(l.renda_total ?? 0))}`,
    `FGTS: ${formatBRL(Number(l.fgts_saldo ?? 0))} • 3 anos de trabalho registrado: ${simNao(l.fgts_tres_anos)}`,
    `Restrição no nome: ${({ nao: "Não", sim: "Sim", nao_sei: "Não sabe" } as Record<string, string>)[l.restricao_credito as string] ?? "—"}`,
    "",
    "PREFERÊNCIAS",
    `Regiões: ${(l.regioes as string[] | null)?.map(regiaoLabel).join(", ") || "Qualquer"}`,
    `Dormitórios (mín.): ${txt(l.dormitorios_min)} • Precisa de vaga: ${simNao(l.precisa_vaga)} • Obra: ${labelOf(PREFERENCIAS_OBRA, l.preferencia_obra)}`,
    `Prazo para comprar: ${labelOf(PRAZOS_COMPRA, l.prazo_compra)}`,
    "",
    "SIMULAÇÃO (estimativa do site)",
    sim
      ? [
          `Faixa: ${sim.faixa?.nome ?? "Fora do programa"}`,
          `Financiamento estimado: ${formatBRL(sim.financiamentoMax)} • Parcela até ${formatBRL(sim.parcelaMax)} • ${sim.prazoMeses} meses${sim.taxaAnual != null ? ` • ${sim.taxaAnual}% a.a. (${sim.sistema})` : ""}`,
          `Imóvel até (financiamento + FGTS): ${formatBRL(sim.capacidadeSemSubsidio)}${sim.subsidioPotencial > 0 ? ` • com subsídio máx.: ${formatBRL(sim.capacidadeComSubsidio)}` : ""}`,
          sim.entradaParcelada ? `Entrada parcelada na obra: até ${formatBRL(sim.entradaParcelada.parcelaMensalMax)}/mês, limite ${Math.round(sim.entradaParcelada.pctMax * 100)}% do preço` : null,
          sim.impedimentos.length ? `Impedimentos: ${sim.impedimentos.join("; ")}` : null,
          sim.alertas.length ? `Alertas: ${sim.alertas.join("; ")}` : null,
        ]
          .filter(Boolean)
          .join("\n")
      : "Ainda sem simulação.",
    "",
    "EMPREENDIMENTOS",
    `Escolhido: ${escolhido?.nome ?? "—"}`,
    `Recomendados pelo site: ${recOrdenados.map((d) => d.nome).join(", ") || "—"}`,
    `Visualizados: ${visualizados.map((e) => e.development!.nome).join(", ") || "—"}`,
    "",
    `Origem: ${[l.origem, l.utm_source, l.utm_medium, l.utm_campaign].filter(Boolean).join(" / ") || "Direto"}`,
    (notas.data ?? []).length
      ? `\nOBSERVAÇÕES\n${(notas.data ?? []).map((n) => `- ${formatDate(n.created_at)}: ${n.texto}`).join("\n")}`
      : null,
  ]
    .filter((x) => x !== null)
    .join("\n");

  return (
    <>
      <Link href="/admin/leads" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-caixa hover:underline">
        <ArrowLeft size={14} /> Leads
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">{l.nome}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {l.codigo} • cadastrado em {formatDate(l.created_at, true)} • <span className={`chip ${st.cor}`}>{st.label}</span>
            {!l.simulacao_completa && (
              <span className="chip ml-1 bg-sol-50 text-ink">
                Simulação incompleta{l.etapa_parou ? ` • parou na etapa ${l.etapa_parou} de 6` : ""}
              </span>
            )}
          </p>
        </div>
        {!anonimizado && (
          <div className="flex flex-wrap gap-2">
            <CopiarAtendimentoButton texto={resumoAtendimento} />
            <a href={`https://wa.me/55${l.telefone}`} target="_blank" rel="noreferrer" className="btn-whatsapp">
              <MessageCircle size={16} /> Chamar {maskPhone(l.telefone)}
            </a>
          </div>
        )}
      </div>

      {anonimizado && (
        <p className="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm">Dados pessoais anonimizados em {formatDate(l.anonimizado_em, true)}.</p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Bloco titulo="Dados pessoais">
            <Linhas
              itens={[
                ["Nome", l.nome],
                ["CPF", <RevealCPF key="cpf" leadId={l.id} final={l.cpf_final} />],
                ["Nascimento", l.data_nascimento ? formatDate(`${l.data_nascimento}T12:00:00Z`) : "—"],
                ["Estado civil", labelOf(ESTADOS_CIVIS, l.estado_civil)],
                ["Telefone", maskPhone(l.telefone)],
                ["E-mail", l.email ?? "—"],
              ]}
            />
          </Bloco>

          <Bloco titulo="Perfil financeiro">
            <Linhas
              itens={[
                ["Profissão", l.profissao ?? "—"],
                ["Tipo de renda", labelOf(TIPOS_RENDA, l.tipo_renda)],
                ["Renda principal", formatBRL(Number(l.renda_principal), true)],
                ["Compõe renda", l.compor_renda ? `${labelOf(RELACOES_COMPOSICAO, l.relacao_composicao)} (${l.idade_composicao ?? "?"} anos)` : "Não"],
                ["Renda da composição", formatBRL(Number(l.renda_composicao), true)],
                ["Renda familiar", formatBRL(Number(l.renda_total), true)],
                ["Dependentes", l.dependentes],
                ["Saldo FGTS", formatBRL(Number(l.fgts_saldo))],
                ["3 anos de FGTS", simNao(l.fgts_tres_anos)],
                ["Restrição no nome", { nao: "Não", sim: "Sim", nao_sei: "Não sabe" }[l.restricao_credito as string] ?? "—"],
                ["Prazo de compra", labelOf(PRAZOS_COMPRA, l.prazo_compra)],
              ]}
            />
          </Bloco>

          {sim && (
            <Bloco titulo={`Simulação (parâmetros v${l.params_versao ?? "—"})`}>
              <Linhas
                itens={[
                  ["Faixa", sim.faixa?.nome ?? "Fora do programa"],
                  ["Imóvel estimado (sem subsídio)", formatBRL(sim.capacidadeSemSubsidio)],
                  ["Imóvel estimado (com subsídio máx.)", formatBRL(sim.capacidadeComSubsidio)],
                  ["Financiamento estimado", formatBRL(sim.financiamentoMax)],
                  ["Parcela de referência", formatBRL(sim.parcelaMax)],
                  ["Taxa / prazo", sim.taxaAnual != null ? `${sim.taxaAnual}% a.a. • ${sim.prazoMeses} meses (${sim.sistema})` : "—"],
                  ["FGTS considerado", formatBRL(sim.fgtsConsiderado)],
                  ["Subsídio potencial", sim.subsidioPotencial ? `até ${formatBRL(sim.subsidioPotencial)}` : "—"],
                ]}
              />
              {[...sim.impedimentos, ...sim.alertas].length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-ink-soft">
                  {[...sim.impedimentos, ...sim.alertas].map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              )}
            </Bloco>
          )}

          <Bloco titulo="Imóveis">
            <div className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="font-semibold">Escolhido</p>
                {escolhido ? (
                  <Link href={`/empreendimentos/${escolhido.slug}`} target="_blank" className="text-caixa hover:underline">
                    {escolhido.nome}
                  </Link>
                ) : (
                  <p className="text-ink-soft">—</p>
                )}
              </div>
              <div>
                <p className="font-semibold">Recomendados ({recOrdenados.length})</p>
                <ul className="mt-1 space-y-0.5 text-ink-soft">
                  {recOrdenados.map((d) => (
                    <li key={d.id}>{d.nome}</li>
                  ))}
                  {recOrdenados.length === 0 && <li>—</li>}
                </ul>
              </div>
              <div>
                <p className="font-semibold">Visualizados ({visualizados.length})</p>
                <ul className="mt-1 space-y-0.5 text-ink-soft">
                  {visualizados.map((e) => (
                    <li key={e.id}>{e.development!.nome}</li>
                  ))}
                  {visualizados.length === 0 && <li>—</li>}
                </ul>
              </div>
            </div>
            <div className="mt-4 border-t border-line pt-3 text-sm text-ink-soft">
              Preferências: {l.regioes?.length ? l.regioes.map(regiaoLabel).join(", ") : "qualquer região"} •{" "}
              {l.dormitorios_min ? `${l.dormitorios_min}+ dorm.` : "dorm. indiferente"} • vaga: {simNao(l.precisa_vaga)} •{" "}
              {labelOf(PREFERENCIAS_OBRA, l.preferencia_obra)}
            </div>
          </Bloco>
        </div>

        <div className="space-y-4">
          <Bloco titulo="Atendimento">
            <div className="space-y-3">
              <StatusSelect leadId={l.id} status={l.status} />
              <ResponsavelSelect leadId={l.id} atual={l.responsavel_id} equipe={equipe.data ?? []} />
            </div>
          </Bloco>

          <Bloco titulo="Agenda do cliente">
            <NovaTarefaForm leadId={l.id} />
            {(() => {
              const ts = (tarefas.data ?? []) as Tarefa[];
              const pend = ts.filter((t) => t.status === "pendente").sort((a, b) => a.quando.localeCompare(b.quando));
              const outros = ts.filter((t) => t.status !== "pendente").slice(0, 5);
              const hoje = diaSP();
              const agora = agoraMs();
              return (
                <>
                  <ul className="mt-4 space-y-2">
                    {pend.map((t) => (
                      <TarefaItem key={t.id} t={{ ...t, lead: { id: l.id, nome: l.nome, codigo: l.codigo, telefone: l.telefone } }} hoje={hoje} agora={agora} />
                    ))}
                    {pend.length === 0 && <li className="text-sm text-ink-soft">Nenhum compromisso pendente.</li>}
                  </ul>
                  {outros.length > 0 && (
                    <details className="mt-3 text-sm">
                      <summary className="cursor-pointer font-semibold text-ink-soft">Concluídos e cancelados ({outros.length})</summary>
                      <ul className="mt-2 space-y-2">
                        {outros.map((t) => (
                          <TarefaItem key={t.id} t={{ ...t, lead: { id: l.id, nome: l.nome, codigo: l.codigo, telefone: l.telefone } }} hoje={hoje} agora={agora} />
                        ))}
                      </ul>
                    </details>
                  )}
                </>
              );
            })()}
          </Bloco>

          <Bloco titulo="Observações">
            <NoteForm leadId={l.id} />
            <ul className="mt-4 space-y-3">
              {(notas.data ?? []).map((n) => (
                <li key={n.id} className="rounded-xl bg-mist p-3 text-sm">
                  <p className="whitespace-pre-line">{n.texto}</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {(n.autor as unknown as { nome: string } | null)?.nome ?? "—"} • {formatDate(n.created_at, true)}
                  </p>
                </li>
              ))}
            </ul>
          </Bloco>

          <Bloco titulo="Origem e campanha">
            {!anonimizado && <OrigemEditor leadId={l.id} atual={l.origem} />}
            {(() => {
              // Só os nomes mudam (em português); os dados e o rastreamento das campanhas continuam os mesmos
              const campanha = (
                [
                  ["Canal", l.utm_source],
                  ["Tipo de divulgação", l.utm_medium],
                  ["Campanha", l.utm_campaign],
                  ["Palavra pesquisada", l.utm_term],
                  ["Anúncio ou post", l.utm_content],
                  ["Veio de anúncio do Google", l.gclid ? "Sim" : null],
                  ["Veio do Facebook/Instagram", l.fbclid ? "Sim" : null],
                ] as [string, string | null][]
              ).filter(([, v]) => v);
              return campanha.length ? (
                <Linhas itens={campanha as [string, string][]} />
              ) : (
                <p className="text-sm text-ink-soft">Sem informações de campanha: o cliente entrou direto no site.</p>
              );
            })()}
            {l.landing_page && <p className="mt-2 truncate text-xs text-ink-soft">Página de entrada: {l.landing_page}</p>}
          </Bloco>

          <Bloco titulo="Histórico">
            <ol className="space-y-2 text-sm">
              {evs.map((e) => (
                <li key={e.id} className="border-l-2 border-caixa-100 pl-3">
                  <p className="font-medium">
                    {TIPO_EVENTO[e.tipo] ?? e.tipo}
                    {e.development ? `: ${e.development.nome}` : ""}
                    {e.tipo === "status_alterado" && e.dados?.para ? ` → ${leadStatusInfo(String(e.dados.para)).label}` : ""}
                  </p>
                  <p className="text-xs text-ink-soft">{formatDate(e.created_at, true)}</p>
                </li>
              ))}
              {(auditoria.data ?? [])
                .filter((a) => a.acao !== "update")
                .map((a) => (
                  <li key={`a${a.id}`} className="border-l-2 border-sol pl-3">
                    <p className="font-medium">
                      {a.acao === "visualizou_cpf" ? "CPF visualizado" : a.acao === "anonimizou" ? "Dados anonimizados" : a.acao} por{" "}
                      {nomesEquipe.get(a.ator_id ?? "") ?? "sistema"}
                    </p>
                    <p className="text-xs text-ink-soft">{formatDate(a.created_at, true)}</p>
                  </li>
                ))}
            </ol>
          </Bloco>

          <Bloco titulo="LGPD">
            <p className="text-sm text-ink-soft">
              Consentimento em {formatDate(l.consentimento_em, true)} (política v{l.consentimento_versao}). Marketing:{" "}
              {simNao(l.aceita_marketing)}.
            </p>
            {papel === "admin" && (
              <div className="mt-3 flex flex-wrap gap-2">
                {!anonimizado && <AnonymizeButton leadId={l.id} />}
                <DeleteLeadButton leadId={l.id} nome={l.nome} />
              </div>
            )}
          </Bloco>
        </div>
      </div>
    </>
  );
}
