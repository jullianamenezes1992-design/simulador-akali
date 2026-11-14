/**
 * Base fria: carteira antiga de contatos (planilha), separada dos leads.
 * Funções puras usadas na importação (navegador e servidor) e na tela.
 */

export type ItemBaseFria = {
  telefone: string;
  nome: string;
  email?: string | null;
  bairro?: string | null;
  zona?: string | null;
  renda_texto?: string | null;
  prazo_compra?: string | null;
  origem?: string | null;
  campanhas?: string | null;
  status_original?: string | null;
  observacoes?: string | null;
  ultima_entrada?: string | null;
  primeira_entrada?: string | null;
  qtd_cadastros?: number | null;
};

export const SITUACOES_BASE_FRIA = [
  { value: "fila", label: "Na fila", cor: "bg-slate-100 text-slate-800" },
  { value: "chamado", label: "Chamado", cor: "bg-sky-100 text-sky-900" },
  {
    value: "virou_lead",
    label: "Respondeu (virou lead)",
    cor: "bg-emerald-100 text-emerald-900",
  },
  {
    value: "numero_errado",
    label: "Número errado",
    cor: "bg-amber-100 text-amber-900",
  },
  {
    value: "nao_quer",
    label: "Não quer mais",
    cor: "bg-rose-100 text-rose-900",
  },
  {
    value: "comprou",
    label: "Já comprou",
    cor: "bg-violet-100 text-violet-900",
  },
  {
    value: "no_crm",
    label: "Já está no CRM",
    cor: "bg-zinc-100 text-zinc-700",
  },
] as const;

export const situacaoBF = (v: string) =>
  SITUACOES_BASE_FRIA.find((s) => s.value === v);

/** Dias até chamar de novo quem não respondeu. */
export const DIAS_PARA_NOVA_TENTATIVA = 90;
/** Depois de tantas tentativas sem resposta, sai da fila. */
export const MAX_TENTATIVAS = 2;

/** Telefone só com dígitos, DDD + número (sem o 55). Retorna null se não parece celular/fixo válido. */
export function normalizarTelefone(v: unknown): string | null {
  let d = String(v ?? "").replace(/\D/g, "");
  if (d.length >= 12 && d.startsWith("55")) d = d.slice(2);
  if (d.startsWith("0")) d = d.replace(/^0+/, "");
  if (!/^[1-9]{2}\d{8,9}$/.test(d)) return null;
  // celular com 9 dígitos precisa começar com 9
  if (d.length === 11 && d[2] !== "9") return null;
  return d;
}

const limpar = (v: unknown, max = 300): string | null => {
  if (v == null) return null;
  const s = String(v)
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!s || s === "0" || /^sem região informada$/i.test(s)) return null;
  return s.slice(0, max);
};

/** Nome bonito: primeira letra maiúscula em cada palavra (mantém "de", "da"...). */
export function nomeBonito(v: unknown): string {
  const s = limpar(v, 120) ?? "";
  if (!s) return "";
  return s
    .toLowerCase()
    .split(" ")
    .map((w, i) =>
      i > 0 && /^(de|da|do|das|dos|e)$/.test(w)
        ? w
        : w.charAt(0).toUpperCase() + w.slice(1),
    )
    .join(" ");
}

export const primeiroNome = (n: string) => {
  const p = (n.trim().split(/\s+/)[0] || "").replace(/[^\p{L}'-]/gu, "");
  return p.length >= 2
    ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
    : "";
};

/** Monta um item a partir de uma linha da planilha (cabeçalhos do "LEADS_UNIFICADOS" ou parecidos). */
export function itemDaLinha(
  linha: Record<string, unknown>,
): ItemBaseFria | null {
  const get = (...nomes: string[]) => {
    for (const n of nomes) {
      const k = Object.keys(linha).find(
        (c) => c.trim().toLowerCase() === n.toLowerCase(),
      );
      if (k && linha[k] != null && linha[k] !== "") return linha[k];
    }
    return null;
  };
  const telefone = normalizarTelefone(
    get("Telefone", "Celular", "WhatsApp", "Fone"),
  );
  if (!telefone) return null;
  const data = (v: unknown) => {
    if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString();
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) return v;
    if (typeof v === "string" && /^\d{2}\/\d{2}\/\d{4}/.test(v)) {
      const [d, m, a] = v.slice(0, 10).split("/");
      return `${a}-${m}-${d}`;
    }
    return null;
  };
  return {
    telefone,
    nome: nomeBonito(get("Nome", "Nome completo")) || "Sem nome",
    email: limpar(get("E-mail", "Email"), 200),
    bairro: limpar(get("Bairro de interesse", "Bairro"), 120),
    zona: limpar(get("Zona", "Região"), 60),
    renda_texto: limpar(get("Renda informada", "Renda"), 120),
    prazo_compra: limpar(get("Prazo de compra", "Prazo"), 80),
    origem: limpar(get("Origem"), 80),
    campanhas: limpar(get("Campanha(s)", "Campanha"), 600),
    status_original: limpar(get("Status"), 80),
    observacoes: limpar(get("Observações", "Observacoes", "Obs"), 600),
    ultima_entrada: data(get("Última entrada", "Ultima entrada", "Data")),
    primeira_entrada: data(get("Primeira entrada")),
    qtd_cadastros: Math.max(
      1,
      Math.min(99, Number(get("Qtd. de cadastros")) || 1),
    ),
  };
}

/** Situação inicial ao importar. */
export function situacaoInicial(i: ItemBaseFria): "fila" | "comprou" {
  return /venda ganha|neg[oó]cio fechado/i.test(i.status_original ?? "")
    ? "comprou"
    : "fila";
}

/**
 * Prioridade na fila (maior = chama antes): cadastro recente, renda e região informadas,
 * prazo curto, cadastrou mais de uma vez, já negociou antes, DDD de São Paulo.
 */
export function prioridade(i: ItemBaseFria): number {
  let p = 0;
  const ano = i.ultima_entrada ? Number(i.ultima_entrada.slice(0, 4)) : 0;
  const anoAtual = new Date().getFullYear();
  if (ano >= anoAtual) p += 30;
  else if (ano === anoAtual - 1) p += 20;
  else if (ano === anoAtual - 2) p += 10;
  if (i.renda_texto) p += 15;
  if (i.zona || i.bairro) p += 10;
  const prazo = (i.prazo_compra ?? "").toLowerCase();
  if (/imediat|1 m[eê]s|pr[oó]ximo m[eê]s|3 meses/.test(prazo)) p += 15;
  else if (prazo && !/pesquisando|n[aã]o decidi/.test(prazo)) p += 5;
  p += Math.min(15, ((i.qtd_cadastros ?? 1) - 1) * 5);
  const st = (i.status_original ?? "").toLowerCase();
  if (/negocia|contato feito|aguardando doc/.test(st)) p += 10;
  if (/arquivado/.test(st)) p -= 10;
  const ddd = Number(i.telefone.slice(0, 2));
  if (ddd === 11) p += 5;
  else if (ddd < 11 || ddd > 19) p -= 10; // fora do estado de SP
  return p;
}

const ZONA_PARA_REGIAO: Record<string, string> = {
  "zona norte": "zona_norte",
  "zona sul": "zona_sul",
  "zona leste": "zona_leste",
  "zona oeste": "zona_oeste",
  centro: "centro",
  "grande sp": "grande_sp",
};

/** "Zona Leste / Centro" → ["zona_leste", "centro"] */
export function regioesDaZona(zona: string | null | undefined): string[] {
  return (zona ?? "")
    .split("/")
    .map((z) => ZONA_PARA_REGIAO[z.trim().toLowerCase()])
    .filter(Boolean);
}

export type DevBF = {
  id: string;
  slug: string;
  nome: string;
  bairro: string | null;
  regiao: string | null;
  preco_min: number | null;
  oferta_destaque?: boolean | null;
};

const semAcento = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * Projeto para sugerir na mensagem: o do mesmo bairro, senão o da mesma zona
 * (em oferta primeiro, depois o de menor preço). Sem região informada, nenhum.
 */
export function projetoParaContato(
  c: { bairro?: string | null; zona?: string | null },
  devs: DevBF[],
): DevBF | null {
  const ordem = (a: DevBF, b: DevBF) =>
    Number(!!b.oferta_destaque) - Number(!!a.oferta_destaque) ||
    (a.preco_min ?? Infinity) - (b.preco_min ?? Infinity);
  if (c.bairro) {
    const b = semAcento(c.bairro);
    const noBairro = devs.filter(
      (d) =>
        d.bairro &&
        (semAcento(d.bairro).includes(b) || b.includes(semAcento(d.bairro))),
    );
    if (noBairro.length) return [...noBairro].sort(ordem)[0];
  }
  const regioes = regioesDaZona(c.zona);
  if (!regioes.length) return null;
  const naZona = devs.filter((d) => d.regiao && regioes.includes(d.regiao));
  return naZona.length ? [...naZona].sort(ordem)[0] : null;
}

const brl = (v: number) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

/** Mensagem do primeiro contato com a base fria (com o link de um projeto da região, quando houver). */
/**
 * Mensagem do primeiro contato com a base fria. Duas abordagens (as que deram retorno),
 * intercaladas pelo telefone para não mandar sempre o mesmo texto (ajuda a não bloquear o WhatsApp).
 * Na 2ª tentativa (90 dias depois) vai o link de um projeto da região.
 */
export function mensagemBaseFria(
  c: { nome: string; telefone?: string; bairro?: string | null; zona?: string | null },
  assinatura: string,
  tentativa = 1,
  projeto?: { dev: DevBF; link: string } | null,
): string {
  const p = primeiroNome(c.nome);
  const lugar = c.bairro ? ` na região de *${c.bairro}*` : c.zona ? ` na *${c.zona}*` : "";
  const proj = projeto
    ? `\n\nSeparei uma opção na sua região: *${projeto.dev.nome}*${projeto.dev.bairro && !projeto.dev.nome.toLowerCase().includes(projeto.dev.bairro.toLowerCase()) ? ` (${projeto.dev.bairro})` : ""}${projeto.dev.preco_min ? `, a partir de ${brl(projeto.dev.preco_min)}` : ""}.\nVeja fotos e plantas: ${projeto.link}`
    : "";
  if (tentativa > 1) {
    const oi = p ? `Oi, ${p}! Tudo bem? 😊` : "Oi! Tudo bem? 😊";
    return `${oi}\n\nAqui é da ${assinatura} de novo. Tem lançamento novo pelo *Minha Casa Minha Vida*${lugar}, com entrada facilitada e uso do FGTS.\n\nAinda faz sentido para você? Se quiser, te mando as opções 🏡${proj}\n\n_Se não quiser mais receber, é só me avisar._`;
  }
  const marca = assinatura.replace(/^corretora\s+/i, "").trim() || assinatura;
  const variante = Number((c.telefone ?? c.nome).replace(/\D/g, "").slice(-1) || c.nome.length) % 2;
  if (variante === 0)
    return [
      `*Oi${p ? ` ${p}` : ""}! 😊 Tudo bem?*`,
      "",
      `Aqui é a ${assinatura}. Trabalho com crédito imobiliário pelo *Minha Casa Minha Vida*.`,
      "",
      "Estou entrando em contato para te ajudar a verificar as possibilidades para você comprar seu apartamento. 🏠",
      "",
      "Temos empreendimentos com condições de *entrada a partir de R$ 500* e financiamento com parcelas planejadas para caber no seu orçamento.",
      "",
      "*Posso te explicar como funciona?*",
    ].join("\n");
  return [
    `*Olá${p ? ` ${p}` : ""}, tudo bem? 😊*`,
    "",
    `Meu nome é *${marca}* e sou especialista em crédito imobiliário pelo *Programa Minha Casa Minha Vida* e estou aqui pra te ajudar a conquistar o seu tão sonhado apê — *entrada a partir de R$ 500* e parcelas que cabem no seu bolso 💸🏠`,
    "",
    "*Posso te enviar mais informações agora?*",
  ].join("\n");
}
