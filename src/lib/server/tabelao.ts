import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { IGNORAR_TABELAO, MAPA_TABELAO, normNome } from "@/lib/tabelao-mapa";

/**
 * Atualiza os empreendimentos Plano&Plano a partir do Tabelão On-line
 * (https://rummeniggelima.github.io/tabelao/), que é atualizado todo dia com o Espelho de Vendas.
 *
 * Fontes:
 *  - index.html → lista "D" com cada empreendimento (status, entrega, preço de referência, estoque...)
 *  - unidades.json → todas as unidades à venda no dia (o "a partir de" sai da unidade mais barata)
 *  - promocoes.json → encarte do mês da Plano&Plano, com as parcelas da entrada após as chaves de cada projeto
 *
 * Regras de segurança:
 *  - se a carga vier pequena ou com formato estranho, não altera nada;
 *  - nunca mexe em "ativo" (visível no site) nem em empreendimentos de outras construtoras;
 *  - só grava o que mudou (o histórico de alterações registra cada mudança);
 *  - o texto de condições comerciais só é trocado se estiver vazio ou for o texto automático.
 */

export const TABELAO_URL = "https://rummeniggelima.github.io/tabelao/";
const TEXTO_AUTO =
  'Valor "a partir de" conforme o tabelão Plano&Plano (atualizado automaticamente todos os dias), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.';
const MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

type LinhaD = [string, string, string, string, string, number | null, number | null, number | null, number | null, number | null, number | null, number | null, number | null, string | null, string | null, string | null, number | null, ...unknown[]];
type Unidades = { geradoEm?: string; blocos?: string[]; campos: string[]; consultados: number[]; rows: (number | string | null)[][] };

export interface Mudanca {
  nome: string;
  campo: string;
  de: string | number | boolean | null;
  para: string | number | boolean | null;
}
export interface Novo {
  nome: string;
  status: string;
  preco: number | null;
  estoque: number | null;
}
export interface ResultadoTabelao {
  ok: boolean;
  atualizados: number;
  sem_mudanca: number;
  esgotados: number;
  dados_de: string | null;
  mudancas: Mudanca[];
  novos: Novo[];
  erro?: string;
}

async function baixar(caminho: string) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(TABELAO_URL + caminho, { cache: "no-store", signal: ctrl.signal, headers: { "User-Agent": "SimuladorAkali/1.0" } });
    if (!r.ok) throw new Error(`${caminho} respondeu ${r.status}`);
    return r;
  } finally {
    clearTimeout(t);
  }
}

type Promocoes = { ativo?: boolean; validoAte?: string; campos?: string[]; grupos?: { n?: number[] }[]; rows?: (string | number | null)[][] };

/**
 * Parcelas pós-chaves por empreendimento (n do tabelão) a partir do encarte do mês.
 * "24"/"36"/"48" → número; "Não" → 0; vazio ou "SIM" (sem quantidade) → não mexe.
 */
export function posChavesDoEncarte(p: Promocoes | null): Map<number, number> {
  const out = new Map<number, number>();
  if (!p?.rows?.length || !p.grupos?.length || !p.campos) return out;
  const iG = p.campos.indexOf("g");
  const iP = p.campos.indexOf("posChaves");
  if (iG < 0 || iP < 0) return out;
  const valores = new Map<number, Set<number>>();
  for (const r of p.rows) {
    const t = String(r[iP] ?? "").trim().toLowerCase();
    const v = /^\d{1,3}$/.test(t) ? Number(t) : /^n[aã]o$/.test(t) ? 0 : null;
    if (v == null || v > 120) continue;
    const g = Number(r[iG]);
    if (!valores.has(g)) valores.set(g, new Set());
    valores.get(g)!.add(v);
  }
  valores.forEach((vs, g) => {
    if (vs.size !== 1) return; // valores diferentes no mesmo projeto: deixa como está
    const v = [...vs][0];
    for (const n of p.grupos![g]?.n ?? []) out.set(Number(n), v);
  });
  return out;
}

/** Extrai a lista "const D = [...]" do index.html sem executar código de terceiros. */
export function extrairLista(html: string): LinhaD[] {
  const i = html.indexOf("const D = [");
  if (i < 0) throw new Error("Formato do tabelão mudou (lista D não encontrada).");
  const j = html.indexOf("];", i);
  const bruto = html.slice(i + "const D = ".length, j + 1);
  // objetos extras usam chaves sem aspas ({esg:"02/11/2026"}) — põe aspas para virar JSON
  const json = bruto.replace(/([{,])\s*([A-Za-z_]\w*)\s*:/g, '$1"$2":').replace(/,\s*([\]}])/g, "$1");
  const D = JSON.parse(json) as LinhaD[];
  if (!Array.isArray(D) || D.length < 40 || typeof D[0]?.[0] !== "string") throw new Error("Lista do tabelão veio incompleta.");
  return D;
}

const entregaBR = (s: string | null) => {
  const m = s?.match(/^(\d{4})-(\d{2})$/);
  return m ? `${MES[Number(m[2]) - 1]}/${m[1]}` : null;
};
const statusObra = (st: string) => (st === "O" ? "em_obras" : st === "E" ? "pronto" : ["N", "V", "L"].includes(st) ? "lancamento" : null);
const STATUS_TXT: Record<string, string> = { N: "Lançamento", V: "Novidade", L: "Lançado", O: "Em obras", E: "Pronto", X: "Esgotado" };

async function tetosFaixas(): Promise<{ id: number; teto: number }[]> {
  const db = createAdminClient();
  const { data } = await db.from("simulation_params").select("params").eq("ativo", true).maybeSingle();
  const fx = ((data?.params as { faixas?: { id: number; teto_imovel: number }[] } | null)?.faixas ?? []).filter((f) => f.teto_imovel > 0);
  return fx.length ? fx.map((f) => ({ id: f.id, teto: f.teto_imovel })) : [
    { id: 1, teto: 275000 },
    { id: 2, teto: 275000 },
    { id: 3, teto: 400000 },
    { id: 4, teto: 600000 },
  ];
}

export async function sincronizarTabelao(origem: "automatico" | "manual" = "automatico"): Promise<ResultadoTabelao> {
  const db = createAdminClient();
  const res: ResultadoTabelao = { ok: false, atualizados: 0, sem_mudanca: 0, esgotados: 0, dados_de: null, mudancas: [], novos: [] };
  try {
    const [html, uni, promo] = await Promise.all([
      baixar("index.html").then((r) => r.text()),
      baixar("unidades.json").then((r) => r.json() as Promise<Unidades>),
      // o encarte é opcional: se não vier, o resto atualiza normalmente
      baixar("promocoes.json").then((r) => r.json() as Promise<Promocoes>).catch(() => null),
    ]);
    const posChaves = posChavesDoEncarte(promo);
    const D = extrairLista(html);
    if (!uni?.rows || uni.rows.length < 3000 || (uni.consultados?.length ?? 0) < 40) throw new Error("Lista de unidades veio pequena demais; nada foi alterado.");
    res.dados_de = uni.geradoEm ?? null;
    const C = uni.campos;
    const ix = (k: string) => C.indexOf(k);
    const [iN, iArea, iValor, iTipo, iBloco, iUnid] = [ix("n"), ix("area"), ix("valor"), ix("tipo"), ix("bloco"), ix("unidade")];
    // unidades não residenciais (NR, fachada ativa/lojas, garagem) não entram no MCMV nem no "a partir de"
    const NAO_RESID = /\bNR|fachada|garagem|loja/i;
    const blocos = uni.blocos ?? [];
    if ([iN, iArea, iValor].some((x) => x < 0)) throw new Error("Formato das unidades mudou; nada foi alterado.");

    // unidades residenciais válidas por empreendimento (ignora garagem, loja e valores quebrados)
    const porEmp = new Map<number, number[]>();
    for (const r of uni.rows) {
      const n = Number(r[iN]);
      const valor = Number(r[iValor]);
      const area = Number(r[iArea]);
      const tipo = iTipo >= 0 ? r[iTipo] : 0;
      if (!porEmp.has(n)) porEmp.set(n, []);
      const bloco = iBloco >= 0 ? (typeof r[iBloco] === "number" ? (blocos[r[iBloco] as number] ?? "") : String(r[iBloco] ?? "")) : "";
      const unid = iUnid >= 0 ? String(r[iUnid] ?? "") : "";
      if (NAO_RESID.test(bloco) || NAO_RESID.test(unid)) continue;
      if ((tipo === 0 || tipo == null) && valor >= 80000 && valor <= 5000000 && area >= 20) porEmp.get(n)!.push(valor);
    }
    const consultados = new Set(uni.consultados.map(Number));
    const tetos = await tetosFaixas();

    const slugs = Object.values(MAPA_TABELAO);
    const { data: atuais, error } = await db
      .from("developments")
      .select("id, slug, nome, preco_min, preco_max, faixas, status_obra, previsao_entrega, vagas, unidades_disponiveis, disponivel, condicoes_comerciais, meses_pos_chaves")
      .in("slug", slugs);
    if (error) throw new Error(error.message);
    const porSlug = new Map((atuais ?? []).map((d) => [d.slug as string, d]));
    const vistos = new Set<string>();
    const falhas: string[] = [];

    for (let i = 0; i < D.length; i++) {
      const d = D[i];
      const n = i + 1;
      const nomeT = d[0];
      const chave = normNome(nomeT);
      if (IGNORAR_TABELAO.has(chave)) continue;
      const st = d[1];
      let unidades = consultados.has(n) ? (porEmp.get(n) ?? []) : null;
      // lançamento sem unidades válidas ainda (espelho não aberto ou valores quebrados): usa o resumo do tabelão
      if (unidades && !unidades.length && (st === "N" || st === "V")) unidades = null;
      const estoque = unidades ? unidades.length : (d[16] ?? null);
      const precoMin = unidades?.length ? Math.min(...unidades) : d[5] && d[5] >= 80000 ? d[5] : null;
      const precoMax = unidades?.length ? Math.max(...unidades) : d[6] && d[6] >= 80000 ? d[6] : null;
      const esgotado = st === "X" || (unidades !== null && unidades.length === 0 && st !== "N" && st !== "V");

      const slug = MAPA_TABELAO[chave];
      const atual = slug ? porSlug.get(slug) : undefined;
      if (!atual) {
        if (!esgotado && !vistos.has(chave)) res.novos.push({ nome: nomeT, status: STATUS_TXT[st] ?? st, preco: precoMin ? Math.round(precoMin) : null, estoque });
        vistos.add(chave);
        continue;
      }
      if (vistos.has(slug)) continue;
      vistos.add(slug);

      const novo: Record<string, unknown> = {};
      const muda = (campo: string, valor: unknown, rotulo = campo) => {
        const velho = (atual as Record<string, unknown>)[campo];
        const igual = Array.isArray(valor) ? JSON.stringify(valor) === JSON.stringify(velho) : typeof valor === "number" ? Math.abs(Number(velho ?? -1) - valor) < 1 : velho === valor;
        if (igual) return;
        novo[campo] = valor;
        if (["preco_min", "disponivel", "status_obra", "previsao_entrega", "meses_pos_chaves"].includes(campo))
          res.mudancas.push({ nome: atual.nome as string, campo: rotulo, de: (velho as string | number | boolean | null) ?? null, para: valor as string | number | boolean });
      };

      const so = statusObra(st);
      if (so) muda("status_obra", so, "status");
      const ent = entregaBR(d[14]);
      if (ent) muda("previsao_entrega", ent, "entrega");
      if (d[12] != null) muda("vagas", Number(d[12]) > 0);
      if (estoque != null) muda("unidades_disponiveis", estoque);
      muda("disponivel", !esgotado, "à venda");
      if (posChaves.has(n)) muda("meses_pos_chaves", posChaves.get(n)!, "parcelas pós-chaves");
      if (esgotado) res.esgotados++;
      if (precoMin && !esgotado) {
        const pMin = Math.round(precoMin * 100) / 100;
        muda("preco_min", pMin, "a partir de");
        // lojas/NR deixam o "até" absurdo; só grava se for um teto plausível para apartamento
        const minFinal = Number((novo.preco_min as number | undefined) ?? atual.preco_min ?? pMin);
        const pMax = precoMax ? Math.round(precoMax * 100) / 100 : null;
        muda("preco_max", pMax && pMax >= minFinal && pMax <= minFinal * 3 ? pMax : null);
        muda("faixas", [...new Set(tetos.filter((t) => pMin <= t.teto).map((t) => t.id))].sort());
        const cond = (atual.condicoes_comerciais as string | null) ?? "";
        if (!cond || /tabel[aã]o Plano&Plano/i.test(cond)) muda("condicoes_comerciais", TEXTO_AUTO);
      }

      if (Object.keys(novo).length) {
        const { error: e } = await db.from("developments").update(novo).eq("id", atual.id);
        if (e) {
          // um cadastro com problema não impede os outros de atualizar
          falhas.push(`${atual.nome}: ${e.message}`);
          res.mudancas = res.mudancas.filter((m) => m.nome !== atual.nome);
        } else res.atualizados++;
      } else res.sem_mudanca++;
    }
    res.ok = true;
    if (falhas.length) res.erro = `Não atualizou ${falhas.length}: ${falhas.join(" | ")}`.slice(0, 1000);
  } catch (e) {
    res.erro = e instanceof Error ? e.message : String(e);
  }
  await db.from("tabelao_sync").insert({
    origem,
    ok: res.ok,
    atualizados: res.atualizados,
    sem_mudanca: res.sem_mudanca,
    esgotados: res.esgotados,
    dados_de: res.dados_de,
    mudancas: res.mudancas.slice(0, 300),
    novos: res.novos,
    erro: res.erro ?? null,
  });
  return res;
}
