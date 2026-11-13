import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { diaSP } from "@/lib/agenda";
import { mensagemBaseFria } from "@/lib/base-fria";
import { filaBaseFria } from "@/lib/server/base-fria";

/**
 * "Meu dia": a rotina da corretora em blocos, na ordem do dia, com os clientes de cada bloco.
 * Um bloco fica feito quando não há mais ninguém para tocar nele hoje, ou quando ela marca como feito.
 */

export type ClienteDia = { id: string; nome: string; telefone: string; detalhe?: string | null; href?: string; status?: string; texto?: string };
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

/** Pausas fixas do dia, mostradas entre os blocos (depois do bloco indicado). */
export const PAUSAS: Record<string, string> = {
  novos: "9h – 9h30 · Café ☕ (liberado no stand)",
  aprovados: "14h30 · Almoço 🍽️",
};

/** Parte da carteira antiga para chamar por dia (5%), entre 3 e 15 clientes. */
export const CARTEIRA_PCT = 0.05;
const CARTEIRA_MIN = 3;
const CARTEIRA_MAX = 15;
/** Ofertas para aprovados por dia. */
const OFERTAS_DIA = 5;

/** Quem entra no "rebater carteira" (o resto já tem bloco próprio no dia). */
const CARTEIRA_STATUS = ["perdido", "reprovado", "vendido"];
const ROTULO_CARTEIRA: Record<string, string> = {
  reprovado: "reprovado: ver se dá para nova análise",
  vendido: "já comprou: pedir indicação",
  perdido: "perdido: tentar reativar",
};
const ATIVOS = ["novo", "em_atendimento", "sem_resposta", "simulacao", "documentacao", "analise_credito", "serasa_bacen", "aprovado", "visita", "proposta"];

export async function montarMeuDia(db: SupabaseClient, hoje = diaSP(), assinatura = "") {
  const inicio = new Date(`${hoje}T00:00:00-03:00`).toISOString();
  const fim = new Date(`${hoje}T23:59:59-03:00`).toISOString();
  const d30 = new Date(Date.now() - 30 * 864e5).toISOString();
  const d7 = new Date(Date.now() - 7 * 864e5).toISOString();
  const d15 = new Date(Date.now() + 15 * 864e5).toISOString().slice(0, 10);
  const d15atras = new Date(Date.now() - 15 * 864e5).toISOString();

  const base = () => db.from("leads").select("id, nome, telefone, status, updated_at, origem, aguardando_docs_em, escolhido:escolhido_id(nome)").is("excluido_em", null).is("anonimizado_em", null);

  const [feitosQ, tarefasQ, eventosQ, novosQ, quentesQ, semRespQ, pastaQ, opsQ, vencendoQ, ofertaQ, carteiraQ, contatos15Q, rebatidosHojeQ, tocadosQ, futurasQ] = await Promise.all([
    db.from("rotina_dia").select("item, nota").eq("dia", hoje),
    db
      .from("lead_tasks")
      .select("id, tipo, quando, descricao, lead:lead_id!inner(id, nome, telefone, excluido_em)")
      .is("lead.excluido_em", null)
      .eq("status", "pendente")
      .lte("quando", fim)
      .order("quando")
      .limit(50),
    // quem já foi tocado hoje (mensagem, etapa, nota, agenda, oferta)
    db.from("lead_events").select("lead_id").gte("created_at", inicio).in("tipo", ["mensagem_enviada", "status_alterado", "nota", "compromisso_agendado", "compromisso_concluido", "oferta_enviada", "carteira_rebatida", "origem_alterada"]).limit(2000),
    base().eq("status", "novo").eq("em_aprovados", false).order("created_at", { ascending: false }).limit(100),
    base().in("status", ["em_atendimento", "simulacao"]).eq("em_aprovados", false).order("updated_at").limit(200),
    base().eq("status", "sem_resposta").eq("em_aprovados", false).order("updated_at").limit(200),
    base().eq("status", "documentacao").eq("em_aprovados", false).order("updated_at").limit(200),
    db.from("oportunidades").select("id", { count: "exact", head: true }).is("visto_em", null),
    db.from("aprovados").select("id, nome, telefone, vencimento").in("status", ["ativo", "negociando"]).gte("vencimento", hoje).lte("vencimento", d15).order("vencimento").limit(30),
    db
      .from("aprovados")
      .select("id, nome, telefone, ultima_oferta_em, vencimento")
      .in("status", ["ativo", "negociando"])
      .or(`vencimento.is.null,vencimento.gte.${hoje}`)
      .or(`ultima_oferta_em.is.null,ultima_oferta_em.lt.${d7}`)
      .order("ultima_oferta_em", { ascending: true, nullsFirst: true })
      .limit(OFERTAS_DIA),
    // carteira: clientes fora do atendimento do dia a dia (perdidos, reprovados, vendidos, parados), sem contato há 15+ dias
    base().in("status", CARTEIRA_STATUS).eq("em_aprovados", false).or(`rebatido_em.is.null,rebatido_em.lt.${d15atras}`).order("rebatido_em", { ascending: true, nullsFirst: true }).order("updated_at").limit(500),
    db.from("lead_events").select("lead_id").gte("created_at", d15atras).in("tipo", ["mensagem_enviada", "oferta_enviada", "carteira_rebatida", "clique_whatsapp"]).limit(5000),
    db.from("leads").select("id, nome, telefone").gte("rebatido_em", inicio).limit(50),
    db.from("leads").select("id, nome, telefone, status").is("excluido_em", null).gte("updated_at", inicio).in("status", ATIVOS).limit(200),
    db.from("lead_tasks").select("lead_id").eq("status", "pendente").gt("quando", fim).limit(2000),
  ]);

  const feitos = new Map((feitosQ.data ?? []).map((f) => [f.item as string, (f.nota as string | null) ?? null]));
  const tocados = new Set((eventosQ.data ?? []).map((e) => e.lead_id as string));
  const comFutura = new Set((futurasQ.data ?? []).map((t) => t.lead_id as string));
  // base fria (planilha antiga), chamada pelo número da carteira
  const { data: cfg } = await db.from("site_settings").select("base_fria_dia, corretora_nome, empresa_nome").eq("id", 1).maybeSingle();
  const metaBF = cfg?.base_fria_dia ?? 30;
  const { count: totalBF } = await db.from("base_fria").select("id", { count: "exact", head: true }).in("situacao", ["fila", "chamado"]);
  const bf = totalBF ? await filaBaseFria(db, metaBF, hoje) : { meta: metaBF, feitos: 0, falta: 0, fila: [] };
  const assin = assinatura || cfg?.corretora_nome || cfg?.empresa_nome || "";
  // dividida em 2 turnos: metade de manhã, o resto no fim da tarde
  const metaManha = Math.ceil(metaBF / 2);
  const faltaManha = Math.max(0, metaManha - bf.feitos);
  const clienteBF = (c: (typeof bf.fila)[number]): ClienteDia => ({
    id: c.id,
    nome: c.nome,
    telefone: c.telefone,
    detalhe: [c.bairro || c.zona, c.renda_texto && `renda ${c.renda_texto}`].filter(Boolean).join(" · ") || null,
    href: "/admin/base-fria",
    status: c.situacao,
    texto: mensagemBaseFria(c, assin, c.situacao === "chamado" ? c.tentativas + 1 : 1),
  });
  const blocoBF = (turno: "manha" | "tarde"): Bloco => {
    const manha = turno === "manha";
    const lista = manha ? bf.fila.slice(0, faltaManha) : bf.fila.slice(faltaManha);
    const meta = manha ? metaManha : metaBF - metaManha;
    const feitosTurno = manha ? Math.min(bf.feitos, metaManha) : Math.max(0, bf.feitos - metaManha);
    const item = manha ? "base_fria_manha" : "base_fria_tarde";
    return {
      item,
      hora: manha ? "11h" : "17h",
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

  type L = { id: string; nome: string; telefone: string; status: string; updated_at: string; origem: string | null; aguardando_docs_em: string | null; escolhido: { nome: string } | null };
  const naoTocado = (l: L) => !tocados.has(l.id) && l.updated_at < inicio;
  const cli = (l: L, detalhe?: string | null): ClienteDia => ({ id: l.id, nome: l.nome, telefone: l.telefone, detalhe: detalhe ?? l.escolhido?.nome ?? null, href: `/admin/leads/${l.id}` });

  // "rebater carteira": quem não recebeu nenhum contato nos últimos 15 dias e não foi cadastrado nesse período
  const contatados15 = new Set((contatos15Q.data ?? []).map((e) => e.lead_id as string));
  type LC = { id: string; nome: string; telefone: string; status: string; updated_at: string; origem: string | null; aguardando_docs_em: string | null; escolhido: { nome: string } | null; created_at?: string };
  const carteiraTodos = ((carteiraQ.data ?? []) as unknown as LC[]).filter((l) => !contatados15.has(l.id) && !tocados.has(l.id));
  const tamCarteira = carteiraTodos.length;
  const metaCarteira = Math.min(CARTEIRA_MAX, Math.max(CARTEIRA_MIN, Math.ceil(tamCarteira * CARTEIRA_PCT)));
  const rebatidosHoje = rebatidosHojeQ.data ?? [];
  const faltaCarteira = Math.max(0, metaCarteira - rebatidosHoje.length);

  // revisão de pasta + análise, 2x ao dia (manhã e tarde)
  const clientesRevisao = (): ClienteDia[] => [
    ...analise.map((l) => ({
      id: l.id,
      nome: l.nome,
      telefone: l.telefone,
      detalhe: [
        l.status === "serasa_bacen" ? "Serasa - Bacen (60+ dias)" : "Análise de crédito",
        l.ar_numero && (/^AR/i.test(l.ar_numero) ? l.ar_numero : `AR ${l.ar_numero}`),
        l.ar_status,
        `há ${diasParado(desde(l))} dia(s) nesta etapa`,
      ]
        .filter(Boolean)
        .join(" · "),
      href: `/admin/leads/${l.id}`,
    })),
    ...pasta.map((l) => ({
      id: l.id,
      nome: l.nome,
      telefone: l.telefone,
      detalhe: ["Montagem de pasta", l.aguardando_docs_em ? "⏳ aguardando documentos" : null, `há ${diasParado(l.updated_at)} dia(s) parado`].filter(Boolean).join(" · "),
      href: `/admin/leads/${l.id}`,
    })),
  ];
  const revisao = (turno: "manha" | "tarde"): Bloco => {
    const item = turno === "manha" ? "revisao_manha" : "revisao_tarde";
    const lista = clientesRevisao();
    return {
      item,
      hora: turno === "manha" ? "10h30" : "16h30",
      titulo: `Revisar pastas e análises · ${turno === "manha" ? "manhã" : "tarde"}`,
      dica:
        turno === "manha"
          ? "Todos em montagem de pasta e em análise: cobre documentos, confira a AR no Salesforce e atualize a etapa."
          : "Segunda revisão do dia: veja o que mudou desde a manhã e dê retorno aos clientes.",
      link: { href: "/admin/montagem", label: "Abrir Montagem de pasta" },
      clientes: lista,
      total: lista.length,
      feito: lista.length === 0 || feitos.has(item),
    };
  };

  type T = { id: string; tipo: string; quando: string; descricao: string | null; lead: { id: string; nome: string; telefone: string } };
  const tarefas = (tarefasQ.data ?? []) as unknown as T[];
  // novos: basta não ter recebido mensagem ainda (o cadastro de hoje já vem com data de hoje)
  const novos = ((novosQ.data ?? []) as unknown as L[]).filter((l) => !tocados.has(l.id));
  const quentes = ((quentesQ.data ?? []) as unknown as L[]).filter(naoTocado);
  const semResp = ((semRespQ.data ?? []) as unknown as L[]).filter(naoTocado);
  // montagem de pasta: todos, revisados 2x ao dia
  const pasta = (pastaQ.data ?? []) as unknown as L[];
  const diasParado = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 864e5));
  type LA = { id: string; nome: string; telefone: string; status: string; updated_at: string; ar_numero: string | null; ar_status: string | null };
  // Serasa-Bacen só volta para a revisão 60 dias depois de marcado nessa etapa
  const serasaIds = ((analiseD ?? []) as LA[]).filter((l) => l.status === "serasa_bacen").map((l) => l.id);
  const desdeSerasa = new Map<string, string>();
  if (serasaIds.length) {
    const { data: ev } = await db.from("lead_events").select("lead_id, created_at, dados").eq("tipo", "status_alterado").in("lead_id", serasaIds).order("created_at", { ascending: false }).limit(1000);
    for (const e of ev ?? []) if ((e.dados as { para?: string } | null)?.para === "serasa_bacen" && !desdeSerasa.has(e.lead_id)) desdeSerasa.set(e.lead_id, e.created_at);
  }
  const desde = (l: LA) => (l.status === "serasa_bacen" ? (desdeSerasa.get(l.id) ?? l.updated_at) : l.updated_at);
  const analise = ((analiseD ?? []) as LA[]).filter((l) => l.status === "analise_credito" || diasParado(desde(l)) >= 60);

  const vencendo = vencendoQ.data ?? [];
  const ofertas = ofertaQ.data ?? [];
  const opsNovas = opsQ.count ?? 0;
  const carteira = (carteiraTodos as unknown as L[]).slice(0, faltaCarteira);
  const rebatidosIds = new Set((rebatidosHojeQ.data ?? []).map((l) => l.id as string));
  const semProximo = ((tocadosQ.data ?? []) as { id: string; nome: string; telefone: string; status: string }[]).filter((l) => !comFutura.has(l.id) && !rebatidosIds.has(l.id));

  const hora = (iso: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  const fezAgenda = tarefas.length === 0;

  const blocos: Bloco[] = [
    {
      item: "agenda",
      hora: "8h30",
      titulo: "Agenda do dia",
      dica: "Veja visitas, ligações e compromissos. Atrasados primeiro.",
      link: { href: "/admin/agenda", label: "Abrir agenda" },
      clientes: tarefas.map((t) => ({ id: t.lead.id, nome: t.lead.nome, telefone: t.lead.telefone, detalhe: `${t.quando < inicio ? "⚠️ atrasado · " : ""}${hora(t.quando)}${t.descricao ? ` · ${t.descricao}` : ""}`, href: `/admin/leads/${t.lead.id}` })),
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
      feito: novos.length === 0 || feitos.has("novos"),
    },
    {
      item: "quentes",
      hora: "9h30",
      titulo: "Leads quentes (atendimento e simulação)",
      dica: "Responder, enviar a simulação e avançar a etapa.",
      clientes: quentes.map((l) => cli(l, l.status === "simulacao" ? "enviar simulação" : l.escolhido?.nome)),
      total: quentes.length,
      feito: quentes.length === 0 || feitos.has("quentes"),
    },
    {
      item: "sem_resposta",
      hora: "10h15",
      titulo: "Não responderam",
      dica: "Mande a próxima mensagem da sequência (1, 2, 3).",
      clientes: semResp.map((l) => cli(l)),
      total: semResp.length,
      feito: semResp.length === 0 || feitos.has("sem_resposta"),
    },
    revisao("manha"),
    blocoBF("manha"),
    {
      item: "conteudo",
      hora: "11h30",
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
      hora: "13h30",
      titulo: "Aprovados: ofertas do dia",
      dica: `${opsNovas ? `${opsNovas} oportunidade(s) nova(s) (preço baixou ou promoção). ` : ""}${vencendo.length ? `${vencendo.length} aprovação(ões) vencendo em 15 dias. ` : ""}Ofereça um projeto para até ${OFERTAS_DIA} clientes.`,
      link: { href: "/admin/aprovados", label: "Abrir Aprovados" },
      clientes: [
        ...vencendo.map((a) => ({ id: a.id, nome: a.nome, telefone: a.telefone, detalhe: `⏳ vence ${String(a.vencimento).split("-").reverse().join("/")}`, href: `/admin/aprovados/${a.id}` })),
        ...ofertas.filter((o) => !vencendo.some((v) => v.id === o.id)).map((a) => ({ id: a.id, nome: a.nome, telefone: a.telefone, detalhe: a.ultima_oferta_em ? "oferta antiga" : "nunca recebeu oferta", href: `/admin/aprovados/${a.id}` })),
      ],
      total: vencendo.length + ofertas.length + opsNovas,
      feito: (vencendo.length === 0 && ofertas.length === 0 && opsNovas === 0) || feitos.has("aprovados"),
    },
    {
      item: "carteira",
      hora: "15h30",
      titulo: "Rebater carteira",
      dica: `Chame ${metaCarteira} cliente(s) da carteira por dia (5% de ${tamCarteira} sem contato há 15+ dias: perdidos, reprovados e quem já comprou). Hoje: ${rebatidosHoje.length} de ${metaCarteira}.`,
      clientes: carteira.map((l) => ({ ...cli(l, ROTULO_CARTEIRA[l.status] ?? "sem contato há 15+ dias"), status: l.status })),
      total: faltaCarteira,
      feito: faltaCarteira === 0 || tamCarteira === 0 || feitos.has("carteira"),
      meta: `${rebatidosHoje.length}/${metaCarteira}`,
    },
    revisao("tarde"),
    blocoBF("tarde"),
    {
      item: "redes",
      hora: "17h30",
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
      hora: "17h45",
      titulo: "Fechamento: todo cliente com próximo passo",
      dica: "Clientes que você mexeu hoje e ainda não têm nada marcado na agenda.",
      clientes: semProximo.map((l) => ({ id: l.id, nome: l.nome, telefone: l.telefone, detalhe: "agendar próximo passo", href: `/admin/leads/${l.id}` })),
      total: semProximo.length,
      feito: semProximo.length === 0 || feitos.has("fechamento"),
    },
  ];
  const finalizado = feitos.has("dia_finalizado");
  return { hoje, blocos, finalizado, metaCarteira, rebatidosHoje: rebatidosHoje.length };
}
