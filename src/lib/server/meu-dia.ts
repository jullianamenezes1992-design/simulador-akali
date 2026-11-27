import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { diaSP } from "@/lib/agenda";
import { mensagemBaseFria } from "@/lib/base-fria";
import { filaBaseFria, sugestaoProjetoBF } from "@/lib/server/base-fria";

/**
 * "Meu dia": a rotina da corretora em blocos, na ordem do dia, com os clientes de cada bloco.
 * Um bloco fica feito quando não há mais ninguém para tocar nele hoje, ou quando ela marca como feito.
 */

export type ClienteDia = {
  id: string;
  nome: string;
  telefone: string;
  detalhe?: string | null;
  href?: string;
  status?: string;
  texto?: string;
};
export type Bloco = {
  item: string;
  hora: string;
  titulo: string;
  dica: string;
  link?: { href: string; label: string };
  clientes: ClienteDia[];
  total: number;
  /** blocos sem lista (gravar conteúdo, redes) só ficam feitos quando marcados */
  manual?: boolean;
  feito: boolean;
  nota?: string | null;
  meta?: string;
};

/** Mensagem de cobrança dos documentos da pasta. */
export function msgCobrarDocs(nome: string, pendencias: string | null) {
  const p = (nome.trim().split(/\s+/)[0] || "").replace(/^./, (c) =>
    c.toUpperCase(),
  );
  const falta = (pendencias ?? "").trim();
  return [
    `Oi, ${p}! Tudo bem? 😊`,
    "",
    falta
      ? `Passando para lembrar dos documentos que faltam para seguir com a sua análise:\n*${falta}*`
      : "Passando para lembrar dos documentos que faltam para seguir com a sua análise.",
    "",
    "Assim que você me mandar, já dou andamento no processo. Qualquer dúvida, é só me chamar!",
  ].join("\n");
}

/** Em dia de evento/meeting (externo), só estes blocos aparecem. */
export const ESSENCIAIS_EXTERNO = ["agenda", "novos", "quentes", "fechamento"];

/** Pausas fixas do dia, mostradas entre os blocos (depois do bloco indicado). */
export const PAUSAS: Record<string, string> = {
  novos: "9h – 9h30 · Café ☕ (liberado no stand)",
  carteira: "14h30 – 15h30 · Almoço 🍽️",
  base_fria_tarde:
    "16h15 – 17h15 · Tempo livre para retornos, visitas e imprevistos",
};

/** Parte da carteira antiga para chamar por dia (5%), entre 3 e 15 clientes. */
export const CARTEIRA_PCT = 0.05;
/** Ofertas para aprovados por dia (contando as já enviadas hoje). */
const OFERTAS_DIA = 2;
/** Reanálises de reprovados por dia. */
const REANALISES_DIA = 2;
const ATIVOS = [
  "novo",
  "em_atendimento",
  "sem_resposta",
  "simulacao",
  "documentacao",
  "analise_credito",
  "serasa_bacen",
  "aprovado",
  "visita",
  "proposta",
];

export async function montarMeuDia(
  db: SupabaseClient,
  hoje = diaSP(),
  assinatura = "",
) {
  const inicio = new Date(`${hoje}T00:00:00-03:00`).toISOString();
  const fim = new Date(`${hoje}T23:59:59-03:00`).toISOString();
  const d30 = new Date(Date.now() - 30 * 864e5).toISOString();
  const d7 = new Date(Date.now() - 7 * 864e5).toISOString();
  const d15 = new Date(Date.now() + 15 * 864e5).toISOString().slice(0, 10);

  const base = () =>
    db
      .from("leads")
      .select(
        "id, nome, telefone, status, updated_at, created_at, origem, aguardando_docs_em, escolhido:escolhido_id(nome)",
      )
      .is("excluido_em", null)
      .is("anonimizado_em", null);

  const [
    feitosQ,
    tarefasQ,
    eventosQ,
    novosQ,
    quentesQ,
    semRespQ,
    pastaQ,
    opsQ,
    vencendoQ,
    ofertaQ,
    carteiraQ,
    ofertasHojeQ,
    rebatidosHojeQ,
    tocadosQ,
    futurasQ,
    equipeNovosQ,
  ] = await Promise.all([
    db.from("rotina_dia").select("item, nota, feito_em").eq("dia", hoje),
    db
      .from("lead_tasks")
      .select(
        "id, tipo, quando, descricao, lead:lead_id!inner(id, nome, telefone, excluido_em)",
      )
      .is("lead.excluido_em", null)
      .eq("status", "pendente")
      .lte("quando", fim)
      .order("quando")
      .limit(50),
    // quem já foi tocado hoje (mensagem, etapa, nota, agenda, oferta)
    db
      .from("lead_events")
      .select("lead_id")
      .gte("created_at", inicio)
      .in("tipo", [
        "mensagem_enviada",
        "status_alterado",
        "nota",
        "compromisso_agendado",
        "compromisso_concluido",
        "oferta_enviada",
        "carteira_rebatida",
        "origem_alterada",
      ])
      .limit(2000),
    base()
      .eq("status", "novo")
      .eq("em_aprovados", false)
      .order("created_at", { ascending: false })
      .limit(100),
    base()
      .in("status", ["em_atendimento", "simulacao"])
      .eq("em_aprovados", false)
      .order("updated_at")
      .limit(200),
    base()
      .eq("status", "sem_resposta")
      .eq("em_aprovados", false)
      .order("updated_at")
      .limit(200),
    db
      .from("leads")
      .select(
        "id, nome, telefone, status, updated_at, aguardando_docs_em, pendencias",
      )
      .is("excluido_em", null)
      .is("anonimizado_em", null)
      .eq("status", "documentacao")
      .eq("em_aprovados", false)
      .order("updated_at")
      .limit(200),
    db
      .from("oportunidades")
      .select("id", { count: "exact", head: true })
      .is("visto_em", null),
    db
      .from("aprovados")
      .select(
        "id, nome, telefone, vencimento, lead_id, ultima_oferta_em, ultima_resposta_em",
      )
      .in("status", ["ativo", "negociando"])
      .gte("vencimento", hoje)
      .lte("vencimento", d15)
      // quem recebeu oferta nos últimos 7 dias não volta só porque a aprovação está vencendo
      .or(`ultima_oferta_em.is.null,ultima_oferta_em.lt.${d7}`)
      .order("vencimento")
      .limit(30),
    db
      .from("aprovados")
      .select(
        "id, nome, telefone, ultima_oferta_em, vencimento, lead_id, ultima_resposta_em",
      )
      .in("status", ["ativo", "negociando"])
      .or(`vencimento.is.null,vencimento.gte.${hoje}`)
      .or(`ultima_oferta_em.is.null,ultima_oferta_em.lt.${d7}`)
      .order("ultima_oferta_em", { ascending: true, nullsFirst: true })
      .limit(300),
    // reanálises: reprovados sem data de reanálise ou com a data chegando
    db
      .from("leads")
      .select(
        "id, nome, telefone, status, updated_at, reanalise_em, rebatido_em",
      )
      .is("excluido_em", null)
      .is("anonimizado_em", null)
      .eq("em_aprovados", false)
      .eq("status", "reprovado")
      .or(`reanalise_em.is.null,reanalise_em.lte.${hoje}`)
      .order("reanalise_em", { ascending: true, nullsFirst: false })
      .limit(300),
    // ofertas já enviadas hoje (contam na meta diária de aprovados)
    db
      .from("ofertas_enviadas")
      .select("aprovado_id")
      .gte("enviado_em", inicio)
      .limit(1000),
    db
      .from("leads")
      .select("id, nome, telefone, status")
      .gte("rebatido_em", inicio)
      .limit(200),
    db
      .from("leads")
      .select("id, nome, telefone, status")
      .is("excluido_em", null)
      .gte("updated_at", inicio)
      .in("status", ATIVOS)
      .limit(200),
    db
      .from("lead_tasks")
      .select("lead_id")
      .eq("status", "pendente")
      .gt("quando", fim)
      .limit(2000),
    // leads que acabaram de chegar do CRM da equipe (já podem vir com outra etapa, ex.: em atendimento)
    base()
      .eq("origem", "Equipe")
      .eq("em_aprovados", false)
      .in("status", ["novo", "em_atendimento", "simulacao", "sem_resposta"])
      .gte("created_at", d7)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const feitos = new Map(
    (feitosQ.data ?? []).map((f) => [
      f.item as string,
      (f.nota as string | null) ?? null,
    ]),
  );
  const feitoEm = new Map(
    (feitosQ.data ?? []).map((f) => [
      f.item as string,
      (f.feito_em as string | null) ?? null,
    ]),
  );
  const tocados = new Set(
    (eventosQ.data ?? []).map((e) => e.lead_id as string),
  );
  const comFutura = new Set(
    (futurasQ.data ?? []).map((t) => t.lead_id as string),
  );
  // base fria (planilha antiga), chamada pelo número da carteira
  const { data: cfg } = await db
    .from("site_settings")
    .select("base_fria_dia, corretora_nome, empresa_nome")
    .eq("id", 1)
    .maybeSingle();
  const metaBF = cfg?.base_fria_dia ?? 30;
  const { count: totalBF } = await db
    .from("base_fria")
    .select("id", { count: "exact", head: true })
    .in("situacao", ["fila", "chamado"]);
  const bf = totalBF
    ? await filaBaseFria(db, metaBF, hoje)
    : { meta: metaBF, feitos: 0, falta: 0, fila: [] };
  const assin = assinatura || cfg?.corretora_nome || cfg?.empresa_nome || "";
  const projetoBF = bf.fila.length ? await sugestaoProjetoBF(db) : () => null;
  // dividida em 2 turnos: metade de manhã, o resto no fim da tarde
  const metaManha = Math.ceil(metaBF / 2);
  const faltaManha = Math.max(0, metaManha - bf.feitos);
  const clienteBF = (c: (typeof bf.fila)[number]): ClienteDia => ({
    id: c.id,
    nome: c.nome,
    telefone: c.telefone,
    detalhe:
      [c.bairro || c.zona, c.renda_texto && `renda ${c.renda_texto}`]
        .filter(Boolean)
        .join(" · ") || null,
    href: "/admin/base-fria",
    status: c.situacao,
    texto: mensagemBaseFria(
      c,
      assin,
      c.situacao === "chamado" ? c.tentativas + 1 : 1,
      projetoBF(c),
    ),
  });
  const blocoBF = (turno: "manha" | "tarde"): Bloco => {
    const manha = turno === "manha";
    const lista = manha
      ? bf.fila.slice(0, faltaManha)
      : bf.fila.slice(faltaManha);
    const meta = manha ? metaManha : metaBF - metaManha;
    const feitosTurno = manha
      ? Math.min(bf.feitos, metaManha)
      : Math.max(0, bf.feitos - metaManha);
    const item = manha ? "base_fria_manha" : "base_fria_tarde";
    return {
      item,
      hora: manha ? "11h45" : "15h45",
      titulo: `Base fria · ${manha ? "manhã" : "fim da tarde"} (nº da carteira)`,
      dica: totalBF
        ? `Chame ${meta} contato(s) da planilha antiga pelo WhatsApp da carteira. ${manha ? "Quem responder durante o dia, marque “Respondeu” na tela da Base fria." : "Aproveite e marque quem respondeu de manhã."}`
        : "Importe a planilha da carteira na tela Base fria para começar.",
      link: { href: "/admin/base-fria", label: "Abrir Base fria" },
      clientes: lista.map(clienteBF),
      total: lista.length,
      feito: !totalBF || lista.length === 0 || feitos.has(item),
      meta: `${feitosTurno}/${meta}`,
    };
  };

  // clientes em análise de crédito / Serasa-Bacen: conferir o andamento todo dia
  const { data: analiseD } = await db
    .from("leads")
    .select("id, nome, telefone, status, updated_at, ar_numero, ar_status")
    .is("excluido_em", null)
    .is("anonimizado_em", null)
    .eq("em_aprovados", false)
    .in("status", ["analise_credito", "serasa_bacen"])
    .order("updated_at")
    .limit(100);

  type L = {
    id: string;
    nome: string;
    telefone: string;
    status: string;
    updated_at: string;
    created_at: string;
    origem: string | null;
    aguardando_docs_em: string | null;
    escolhido: { nome: string } | null;
  };
  const naoTocado = (l: L) => !tocados.has(l.id) && l.updated_at < inicio;
  const cli = (l: L, detalhe?: string | null): ClienteDia => ({
    id: l.id,
    nome: l.nome,
    telefone: l.telefone,
    detalhe: detalhe ?? l.escolhido?.nome ?? null,
    href: `/admin/leads/${l.id}`,
  });

  type LC = {
    id: string;
    nome: string;
    telefone: string;
    status: string;
    updated_at: string;
    reanalise_em: string | null;
    rebatido_em: string | null;
  };
  const lc = ((carteiraQ.data ?? []) as LC[]).filter((l) => !tocados.has(l.id));
  // reprovado: sem data de reanálise ou com a data chegando; ao chamar, a próxima fica para daqui a 2 meses
  // no máximo REANALISES_DIA por dia (primeiro quem tem data vencida, depois quem ainda não tem data)
  // conta como reanálise de hoje: "Chamar" na reanálise, quem saiu de Reprovado hoje
  // (mudou de etapa) e o reprovado com quem você falou hoje por outro caminho
  const { data: evReanalise } = await db
    .from("lead_events")
    .select("lead_id, tipo, dados")
    .gte("created_at", inicio)
    .in("tipo", ["carteira_rebatida", "status_alterado"])
    .limit(2000);
  const reanalisadosIds = new Set<string>();
  for (const e of evReanalise ?? []) {
    const d = (e.dados ?? {}) as { reanalise?: boolean; de?: string };
    if (
      (e.tipo === "carteira_rebatida" && d.reanalise) ||
      (e.tipo === "status_alterado" && d.de === "reprovado")
    )
      reanalisadosIds.add(e.lead_id as string);
  }
  for (const l of (carteiraQ.data ?? []) as LC[])
    if (l.status === "reprovado" && tocados.has(l.id))
      reanalisadosIds.add(l.id);
  const reanalisadosHoje = reanalisadosIds.size;
  const reanalisesTodas = lc
    .filter(
      (l) =>
        l.status === "reprovado" && (!l.reanalise_em || l.reanalise_em <= hoje),
    )
    .sort((a, b) => (a.reanalise_em ? 0 : 1) - (b.reanalise_em ? 0 : 1));
  const reanalises = reanalisesTodas.slice(
    0,
    Math.max(0, REANALISES_DIA - reanalisadosHoje),
  );
  const metaCarteira = reanalises.length;
  const rebatidosHoje = rebatidosHojeQ.data ?? [];

  // revisão das análises (aprovando no sistema da Caixa), 2x ao dia
  const clientesAnalise = (turno: "manha" | "tarde"): ClienteDia[] =>
    analise
      .filter((l) => turno === "manha" || l.status === "analise_credito")
      .map((l) => ({
        id: l.id,
        nome: l.nome,
        telefone: l.telefone,
        detalhe: [
          l.status === "serasa_bacen"
            ? "Serasa - Bacen (60+ dias)"
            : "Análise de crédito",
          l.ar_numero &&
            (/^AR/i.test(l.ar_numero) ? l.ar_numero : `AR ${l.ar_numero}`),
          l.ar_status,
          `há ${diasParado(desde(l))} dia(s) nesta etapa`,
        ]
          .filter(Boolean)
          .join(" · "),
        href: `/admin/leads/${l.id}`,
      }));
  const revisao = (turno: "manha" | "tarde"): Bloco => {
    const item = turno === "manha" ? "revisao_manha" : "revisao_tarde";
    const lista = clientesAnalise(turno);
    return {
      item,
      hora: turno === "manha" ? "11h30" : "15h30",
      titulo: `Revisar análises · ${turno === "manha" ? "manhã" : "tarde"}`,
      dica:
        turno === "manha"
          ? "Clientes aprovando no sistema da Caixa: confira a AR no Salesforce, dê retorno ao cliente e atualize a etapa. Quem tem compromisso na agenda só aparece depois da data marcada."
          : "Segunda conferência do dia: veja o que mudou desde a manhã e dê retorno aos clientes.",
      clientes: lista,
      total: lista.length,
      feito: lista.length === 0 || feitos.has(item),
    };
  };

  type T = {
    id: string;
    tipo: string;
    quando: string;
    descricao: string | null;
    lead: { id: string; nome: string; telefone: string };
  };
  const tarefas = (tarefasQ.data ?? []) as unknown as T[];
  // novos: basta não ter recebido mensagem ainda (o cadastro de hoje já vem com data de hoje)
  const novosStatus = ((novosQ.data ?? []) as unknown as L[]).filter(
    (l) => !tocados.has(l.id),
  );
  // leads que chegaram do CRM da equipe (últimos 7 dias) entram em Novos mesmo
  // vindo com outra etapa, até receberem a primeira mensagem/atendimento
  const jaEmNovos = new Set(novosStatus.map((l) => l.id));
  const equipeCand = ((equipeNovosQ.data ?? []) as unknown as L[]).filter(
    (l) => !jaEmNovos.has(l.id) && !tocados.has(l.id),
  );
  let equipeNovos: L[] = [];
  if (equipeCand.length) {
    const { data: atendidos } = await db
      .from("lead_events")
      .select("lead_id")
      .in(
        "lead_id",
        equipeCand.map((l) => l.id),
      )
      .in("tipo", [
        "mensagem_enviada",
        "nota",
        "compromisso_agendado",
        "oferta_enviada",
        "simulacao_enviada",
      ])
      .limit(2000);
    const ja = new Set((atendidos ?? []).map((e) => e.lead_id as string));
    equipeNovos = equipeCand.filter((l) => !ja.has(l.id));
  }
  const novos = [...novosStatus, ...equipeNovos].sort((a, b) =>
    (b.created_at ?? "").localeCompare(a.created_at ?? ""),
  );
  const idsNovos = new Set(novos.map((l) => l.id));
  // "Novos" marcado como feito volta a abrir se chegar alguém depois
  const novosFeitoEm = feitoEm.get("novos");
  const chegouDepois = novosFeitoEm
    ? novos.some(
        (l) => new Date(l.created_at).getTime() > new Date(novosFeitoEm).getTime(),
      )
    : false;
  // leads quentes: só voltam para a lista depois de 1 dia inteiro sem contato
  // (mensagem, simulação enviada, observação, mudança de etapa ou edição no cadastro)
  const quentesTodos = (quentesQ.data ?? []) as unknown as L[];
  const ontemIni = new Date(new Date(inicio).getTime() - 864e5).toISOString();
  const idsQ = quentesTodos.map((l) => l.id);
  const recentes = new Set<string>();
  const simEnviada = new Set<string>();
  if (idsQ.length) {
    const [evR, notasR, simR] = await Promise.all([
      db
        .from("lead_events")
        .select("lead_id")
        .in("lead_id", idsQ)
        .gte("created_at", ontemIni)
        .in("tipo", [
          "mensagem_enviada",
          "simulacao_enviada",
          "nota",
          "status_alterado",
          "carteira_rebatida",
          "oferta_enviada",
        ])
        .limit(2000),
      db
        .from("lead_notes")
        .select("lead_id")
        .in("lead_id", idsQ)
        .gte("created_at", ontemIni)
        .limit(2000),
      db
        .from("lead_events")
        .select("lead_id")
        .in("lead_id", idsQ)
        .eq("tipo", "simulacao_enviada")
        .limit(2000),
    ]);
    for (const r of [...(evR.data ?? []), ...(notasR.data ?? [])])
      recentes.add(r.lead_id as string);
    for (const r of simR.data ?? []) simEnviada.add(r.lead_id as string);
  }
  const quentes = quentesTodos.filter(
    (l) =>
      !tocados.has(l.id) &&
      !recentes.has(l.id) &&
      !idsNovos.has(l.id) &&
      l.updated_at < ontemIni,
  );
  const semResp = ((semRespQ.data ?? []) as unknown as L[]).filter(
    (l) => naoTocado(l) && !idsNovos.has(l.id),
  );
  // montagem de pasta: cobrar documentos 1x ao dia (some da lista quem já foi cobrado/atendido hoje)
  type LP = {
    id: string;
    nome: string;
    telefone: string;
    status: string;
    updated_at: string;
    aguardando_docs_em: string | null;
    pendencias: string | null;
  };
  const pasta = ((pastaQ.data ?? []) as LP[]).filter((l) => !tocados.has(l.id));
  const diasParado = (iso: string) =>
    Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 864e5));
  type LA = {
    id: string;
    nome: string;
    telefone: string;
    status: string;
    updated_at: string;
    ar_numero: string | null;
    ar_status: string | null;
  };
  // Serasa-Bacen só volta para a revisão 60 dias depois de marcado nessa etapa
  const serasaIds = ((analiseD ?? []) as LA[])
    .filter((l) => l.status === "serasa_bacen")
    .map((l) => l.id);
  const desdeSerasa = new Map<string, string>();
  if (serasaIds.length) {
    const { data: ev } = await db
      .from("lead_events")
      .select("lead_id, created_at, dados")
      .eq("tipo", "status_alterado")
      .in("lead_id", serasaIds)
      .order("created_at", { ascending: false })
      .limit(1000);
    for (const e of ev ?? [])
      if (
        (e.dados as { para?: string } | null)?.para === "serasa_bacen" &&
        !desdeSerasa.has(e.lead_id)
      )
        desdeSerasa.set(e.lead_id, e.created_at);
  }
  const desde = (l: LA) =>
    l.status === "serasa_bacen"
      ? (desdeSerasa.get(l.id) ?? l.updated_at)
      : l.updated_at;
  // quem tem compromisso marcado (hoje ou no futuro) só volta para a revisão depois da data agendada
  const comAgendamento = new Set<string>([
    ...comFutura,
    ...((tarefasQ.data ?? []) as unknown as { lead?: { id: string } | null }[])
      .map((t) => t.lead?.id)
      .filter((x): x is string => !!x),
  ]);
  const analise = ((analiseD ?? []) as LA[]).filter(
    (l) =>
      !comAgendamento.has(l.id) &&
      (l.status === "analise_credito" || diasParado(desde(l)) >= 60),
  );

  // 3 ofertas seguidas sem resposta: a próxima só depois de 15 dias
  type AO = {
    id: string;
    ultima_oferta_em: string | null;
    ultima_resposta_em: string | null;
  };
  const candidatos = [
    ...((ofertaQ.data ?? []) as AO[]),
    ...((vencendoQ.data ?? []) as AO[]),
  ];
  const ofertasSemResp = new Map<string, number>();
  if (candidatos.length) {
    const { data: ofs } = await db
      .from("ofertas_enviadas")
      .select("aprovado_id, enviado_em")
      .in("aprovado_id", [...new Set(candidatos.map((a) => a.id))])
      .gte("enviado_em", new Date(Date.now() - 120 * 864e5).toISOString())
      .limit(5000);
    const ultResp = new Map(
      candidatos.map((a) => [a.id, a.ultima_resposta_em]),
    );
    for (const o of ofs ?? []) {
      const r = ultResp.get(o.aprovado_id);
      if (!r || o.enviado_em > r)
        ofertasSemResp.set(
          o.aprovado_id,
          (ofertasSemResp.get(o.aprovado_id) ?? 0) + 1,
        );
    }
  }
  const d15oferta = new Date(Date.now() - 15 * 864e5).toISOString();
  const podeOfertar = (a: AO) =>
    (ofertasSemResp.get(a.id) ?? 0) < 3 ||
    !a.ultima_oferta_em ||
    a.ultima_oferta_em < d15oferta;
  const vencendo = (
    (vencendoQ.data ?? []) as (AO & {
      nome: string;
      telefone: string;
      vencimento: string;
      lead_id: string | null;
    })[]
  ).filter(podeOfertar);
  const ofertas = (
    (ofertaQ.data ?? []) as (AO & {
      nome: string;
      telefone: string;
      vencimento: string | null;
      lead_id: string | null;
    })[]
  ).filter(podeOfertar);
  const opsNovas = opsQ.count ?? 0;
  // meta de OFERTAS_DIA ofertas por dia: quem já recebeu oferta hoje conta
  const ofertadosHoje = new Set(
    (ofertasHojeQ.data ?? []).map((o) => o.aprovado_id as string),
  ).size;
  const vagasOfertas = Math.max(0, OFERTAS_DIA - ofertadosHoje);
  const carteira = reanalises;

  const hora = (iso: string) =>
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  const fezAgenda = tarefas.length === 0;

  const blocos: Bloco[] = [
    {
      item: "agenda",
      hora: "8h30",
      titulo: "Agenda do dia",
      dica: "Veja visitas, ligações e compromissos. Atrasados primeiro.",
      link: { href: "/admin/agenda", label: "Abrir agenda" },
      clientes: tarefas.map((t) => ({
        id: t.lead.id,
        nome: t.lead.nome,
        telefone: t.lead.telefone,
        detalhe: `${t.quando < inicio ? "⚠️ atrasado · " : ""}${hora(t.quando)}${t.descricao ? ` · ${t.descricao}` : ""}`,
        href: `/admin/leads/${t.lead.id}`,
      })),
      total: tarefas.length,
      feito: fezAgenda || feitos.has("agenda"),
    },
    {
      item: "novos",
      hora: "8h45",
      titulo: "Novos cadastros",
      dica: "Mande a mensagem de Boas-vindas para cada um.",
      link: { href: "/admin/leads?status=novo", label: "Ver em Leads" },
      clientes: novos.map((l) => cli(l, l.origem)),
      total: novos.length,
      feito: novos.length === 0 || (feitos.has("novos") && !chegouDepois),
    },
    {
      item: "quentes",
      hora: "9h30",
      titulo: "Leads quentes (atendimento e simulação)",
      dica: "Responder, enviar a simulação e avançar a etapa. Quem você atendeu ontem ou hoje só volta depois de 1 dia sem contato.",
      clientes: quentes.map((l) =>
        cli(
          l,
          l.status === "simulacao"
            ? simEnviada.has(l.id)
              ? "simulação já enviada: cobrar retorno"
              : "enviar simulação"
            : l.escolhido?.nome,
        ),
      ),
      total: quentes.length,
      feito: quentes.length === 0 || feitos.has("quentes"),
    },
    {
      item: "sem_resposta",
      hora: "10h45",
      titulo: "Sem retorno",
      dica: "Mande a próxima mensagem da sequência (1, 2, 3).",
      clientes: semResp.map((l) => cli(l)),
      total: semResp.length,
      feito: semResp.length === 0 || feitos.has("sem_resposta"),
    },
    {
      item: "pasta",
      hora: "11h",
      titulo: "Cobrar documentos (montagem de pasta)",
      dica: "Uma cobrança por dia para cada cliente com pasta em montagem. Toque em “Cobrar” para mandar a mensagem com o que falta.",
      link: { href: "/admin/montagem", label: "Abrir Montagem de pasta" },
      clientes: pasta.map((l) => ({
        id: l.id,
        nome: l.nome,
        telefone: l.telefone,
        detalhe: [
          l.pendencias ? `Falta: ${l.pendencias}` : null,
          l.aguardando_docs_em ? "⏳ prometeu documentos" : null,
          `há ${diasParado(l.updated_at)} dia(s) parado`,
        ]
          .filter(Boolean)
          .join(" · "),
        href: `/admin/leads/${l.id}`,
        texto: msgCobrarDocs(l.nome, l.pendencias),
      })),
      total: pasta.length,
      feito: pasta.length === 0 || feitos.has("pasta"),
    },
    revisao("manha"),
    blocoBF("manha"),
    {
      item: "conteudo",
      hora: "12h15",
      titulo: "Gravar conteúdo para as redes",
      dica: "Pelo menos 1 vídeo por dia: tour, dica de MCMV, cliente que comprou… É de lá que vêm os leads.",
      clientes: [],
      total: 0,
      manual: true,
      feito: feitos.has("conteudo"),
      nota: feitos.get("conteudo") ?? null,
      meta: "1 vídeo",
    },
    {
      item: "aprovados",
      hora: "13h",
      titulo: "Aprovados: ofertas do dia",
      dica: `Ofereça um projeto para ${OFERTAS_DIA} clientes por dia (hoje: ${Math.min(ofertadosHoje, OFERTAS_DIA)} de ${OFERTAS_DIA}). Primeiro quem tem a aprovação vencendo, depois quem está há mais tempo sem oferta.${opsNovas ? ` ${opsNovas} oportunidade(s) nova(s) (preço baixou ou promoção) para usar nas ofertas.` : ""}`,
      link: { href: "/admin/aprovados", label: "Abrir Aprovados" },
      clientes: [
        ...vencendo.map((a) => ({
          id: a.id,
          nome: a.nome,
          telefone: a.telefone,
          detalhe: `⏳ vence ${String(a.vencimento).split("-").reverse().join("/")}`,
          href: `/admin/aprovados/${a.id}`,
        })),
        ...ofertas
          .filter((o) => !vencendo.some((v) => v.id === o.id))
          .map((a) => ({
            id: a.id,
            nome: a.nome,
            telefone: a.telefone,
            detalhe: a.ultima_oferta_em
              ? "oferta antiga"
              : "nunca recebeu oferta",
            href: `/admin/aprovados/${a.id}`,
          })),
      ],
      total: vencendo.length + ofertas.length,
      feito:
        (vencendo.length === 0 && ofertas.length === 0) ||
        feitos.has("aprovados"),
    },
    {
      item: "carteira",
      hora: "13h45",
      titulo: "Reanálises dos reprovados",
      dica: `${REANALISES_DIA} por dia (hoje: ${Math.min(reanalisadosHoje, REANALISES_DIA)} de ${REANALISES_DIA}; ${reanalisesTodas.length} na fila). Veja se a renda mudou ou se limpou o nome. Ao tocar em “Chamar”, fica registrada a reanálise de hoje e a próxima volta em 2 meses.`,
      clientes: carteira.map((l) => ({
        id: l.id,
        nome: l.nome,
        telefone: l.telefone,
        detalhe: l.reanalise_em
          ? `reanálise prevista para ${l.reanalise_em.split("-").reverse().join("/")}`
          : "reprovado: primeira reanálise (sem data ainda)",
        href: `/admin/leads/${l.id}`,
        status: l.status,
      })),
      total: carteira.length,
      feito: carteira.length === 0 || feitos.has("carteira"),
    },
    revisao("tarde"),
    blocoBF("tarde"),
    {
      item: "redes",
      hora: "17h15",
      titulo: "Contatos das redes sociais",
      dica: "Cadastre no CRM quem chamou no Instagram/TikTok hoje.",
      link: { href: "/admin/redes", label: "Abrir Redes sociais" },
      clientes: [],
      total: 0,
      manual: true,
      feito: feitos.has("redes"),
    },
    {
      item: "fechamento",
      hora: "17h30",
      titulo: "Fechamento do dia",
      dica: "Confira se ficou algo pendente e anote nas observações o que combinou com cada cliente. Quem precisa de retorno em data marcada, agende na Agenda; os outros seguem as etapas normais.",
      clientes: [],
      total: 0,
      feito: feitos.has("fechamento"),
    },
  ];
  // regra geral: cliente com atividade agendada (hoje ou no futuro) só volta para os afazeres
  // depois da data do agendamento — até lá ele aparece só na Agenda
  // aprovados: o agendamento é do lead vinculado
  for (const a of [
    ...((vencendoQ.data ?? []) as { id: string; lead_id: string | null }[]),
    ...((ofertaQ.data ?? []) as { id: string; lead_id: string | null }[]),
  ])
    if (a.lead_id && comAgendamento.has(a.lead_id)) comAgendamento.add(a.id);
  for (const b of blocos) {
    if (
      b.item === "agenda" ||
      b.item.startsWith("base_fria") ||
      !b.clientes.length
    )
      continue;
    const antes = b.clientes.length;
    b.clientes = b.clientes.filter((c) => !comAgendamento.has(c.id));
    const tirados = antes - b.clientes.length;
    if (!tirados) continue;
    b.total = Math.max(0, b.total - tirados);
    if (b.clientes.length === 0 && !b.manual) b.feito = true;
  }
  // aprovados: no máximo OFERTAS_DIA ofertas por dia (as já enviadas hoje contam)
  const blocoAprov = blocos.find((b) => b.item === "aprovados");
  if (blocoAprov) {
    blocoAprov.clientes = blocoAprov.clientes.slice(0, vagasOfertas);
    blocoAprov.total = blocoAprov.clientes.length;
    if (blocoAprov.clientes.length === 0) blocoAprov.feito = true;
  }
  const finalizado = feitos.has("dia_finalizado");
  return {
    hoje,
    blocos,
    finalizado,
    metaCarteira,
    rebatidosHoje: rebatidosHoje.length,
  };
}
