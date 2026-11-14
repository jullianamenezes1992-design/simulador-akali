import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Tipologia } from "@/lib/aprovados";

/**
 * Tabelas Cury do site do gerente de parcerias (guerato.com.br): lê o PDF "TABELA" de cada projeto
 * e atualiza preço "a partir de" (unidade residencial mais barata COM estoque), estoque, preço por
 * dormitório, avaliações por enquadramento (MCMV/MCMV3/MCMV4/SBPE) e os tipos de unidade.
 * Projeto sem tabela no site (ou tabela que não deu para ler) não é alterado.
 */

const SITE = "https://www.guerato.com.br/";
/** slug no CRM → página no site */
const MAPA_CURY: Record<string, string> = {
  "cury-urban-vila-guilherme": "zona-norte/urban-vila-guilherme",
  "cury-360-park-view": "zona-norte/360-park-view",
  "cury-urban-vila-maria-2": "zona-norte/urban-vila-maria-2",
  "cury-dez-limao": "zona-norte/dez-limao",
  "cury-merito-vila-maria": "zona-norte/merito-vila-maria",
  "cury-blue-lyne-pirituba": "zona-norte/blue-lyne-pirituba",
  "cury-marco-freguesia": "zona-norte/marco-freguesia",
  "cury-alto-sao-domingos": "zona-norte/alto-sao-domingos",
  "cury-urban-vila-maria": "zona-norte/urban-vila-maria",
  "cury-silver-lyne-pirituba": "zona-norte/silver-lyne-pirituba",
  "cury-green-lyne-pirituba": "zona-norte/green-lyne-pirituba",
  "cury-lyne-pirituba": "zona-norte/lyne-pirituba",
  "cury-lyne-santo-amaro": "zona-sul/lyne-santo-amaro",
  "cury-cidade-parque-guarapiranga": "zona-sul/cidade-parque-guarapiranga",
  "cury-parque-das-nacoes-condominio-granja-julieta":
    "zona-sul/parque-das-nacoes-condominio-granja-julieta",
  "cury-parque-das-nacoes-cond-laguna":
    "zona-sul/parque-das-nacoes-cond-laguna",
  "cury-alto-chacara-santo-antonio": "zona-sul/alto-chacara-santo-antonio",
  "cury-like-campo-limpo": "zona-sul/like-campo-limpo",
  "cury-wl-boa-vista": "zona-sul/wl-boa-vista",
  "cury-alto-granja-julieta": "zona-sul/alto-granja-julieta",
  "cury-chacara-santo-antonio": "zona-sul/chacara-santo-antonio",
  "cury-neo-sacoma": "zona-sul/neo-sacoma",
  "cury-the-one-granja-julieta": "zona-sul/the-one-granja-julieta",
  "cury-novo-mundo-carrao-guilherme-giogi":
    "zona-leste/novo-mundo-carrao-guilherme-giogi",
  "cury-novo-mundo-carrao": "zona-leste/novo-mundo-carrao",
  "cury-supreme-analia-franco": "zona-leste/supreme-analia-franco",
  "cury-merito-belenzinho": "zona-leste/merito-belenzinho",
  "cury-cidade-mooca-navona": "zona-leste/cidade-mooca-navona",
  "cury-cidade-mooca-san-pietro": "zona-leste/cidade-mooca-san-pietro",
  "cury-novo-mundo-carrao-2": "zona-leste/novo-mundo-carrao-2",
  "cury-modern-mooca": "zona-leste/modern-mooca",
  "cury-cidade-mooca-venezia": "zona-leste/cidade-mooca-venezia",
  "cury-dez-belenzinho": "zona-leste/dez-belenzinho",
  "cury-cidade-mooca-duomo": "zona-leste/cidade-mooca-duomo",
  "cury-cidade-mooca-san-marco": "zona-leste/cidade-mooca-san-marco",
  "cury-atmosfera-jaguare-2": "zona-oeste/atmosfera-jaguare-2",
  "cury-bosque-da-barra": "zona-oeste/bosque-da-barra",
  "cury-nova-leopoldina-condominio-art":
    "zona-oeste/nova-leopoldina-condominio-art",
  "cury-lyne-agua-branca": "zona-oeste/lyne-agua-branca",
  "cury-supreme-vila-romana": "zona-oeste/supreme-vila-romana",
  "cury-atmosfera": "zona-oeste/atmosfera",
  "cury-parque-das-perdizes": "zona-oeste/parque-das-perdizes",
  "cury-cidade-lapa-perdizes": "zona-oeste/cidade-lapa-perdizes",
  "cury-cidade-villa-lobos-condominio-tenor":
    "zona-oeste/cidade-villa-lobos-condominio-tenor",
  "cury-barra-funda-900": "zona-oeste/barra-funda-900",
  "cury-merito-lapa": "zona-oeste/merito-lapa",
  "cury-barra-funda-930": "zona-oeste/barra-funda-930",
  "cury-merito-ipiranga": "cury-centro/merito-ipiranga",
  "cury-cidade-central": "cury-centro/cidade-central",
  "cury-caminhos-da-liberdade": "cury-centro/caminhos-da-liberdade",
  "cury-ar-que": "cury-centro/ar-que",
  "cury-next-guarulhos": "guarulhos/next-guarulhos",
  "cury-energy-guarulhos": "guarulhos/energy-guarulhos",
  "cury-merito-guarulhos": "guarulhos/merito-guarulhos",
  "cury-elo-sto-andre": "sto-andre/elo-sto-andre",
  "cury-maximo-jardim": "sto-andre/maximo-jardim",
  "cury-tutto-jardim": "sto-andre/tutto-jardim",
  "cury-unico-sto-andre": "sto-andre/unico-sto-andre",
};

type Unid = {
  preco: number;
  qtd: number;
  area: number | null;
  nome: string;
  av: Record<string, number>;
};
type Item = { s: string; x: number; y: number; cx: number };

async function baixar(url: string, ms = 20000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, {
      signal: ctl.signal,
      headers: { "user-agent": "Mozilla/5.0 (CRM corretora)" },
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r;
  } finally {
    clearTimeout(t);
  }
}

/** Link do PDF do botão "TABELA" na página do projeto. */
function linkTabela(html: string): string | null {
  const re =
    /href="(https:\/\/www\.guerato\.com\.br\/_files\/ugd\/[^"]+\.pdf)"[^>]*aria-label="TABELA"/i;
  const m = html.match(re);
  if (m) return m[1];
  const re2 =
    /aria-label="TABELA"[^>]*href="(https:\/\/www\.guerato\.com\.br\/_files\/ugd\/[^"]+\.pdf)"/i;
  return html.match(re2)?.[1] ?? null;
}

async function lerTabela(
  buf: ArrayBuffer,
): Promise<{ validade: string | null; unidades: Unid[] }> {
  const { getDocumentProxy } = await import("unpdf");
  const doc = await getDocumentProxy(new Uint8Array(buf));
  let validade: string | null = null;
  const unidades: Unid[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const pg = await doc.getPage(p);
    const c = await pg.getTextContent();
    const it: Item[] = (
      c.items as { str?: string; transform?: number[]; width?: number }[]
    )
      .filter((i) => i.str && i.transform)
      .map((i) => ({
        s: i.str!.trim(),
        x: i.transform![4],
        y: i.transform![5],
        cx: i.transform![4] + (i.width || 0) / 2,
      }))
      .filter((i) => i.s);
    const v = it
      .map((i) => i.s)
      .join(" ")
      .match(/Validade da tabela:\s*([\d/]+\s*a\s*[\d/]+)/);
    if (v && !validade) validade = v[1];
    const hq = it.find((i) => /^Quantidade de/i.test(i.s));
    if (!hq) continue;
    const ha = it.find((i) => i.s === "m²");
    const head = (re: RegExp) =>
      it.find((i) => re.test(i.s) && Math.abs(i.y - hq.y) < 25);
    const cols: Record<string, Item | undefined> = {
      mcmv: head(/^MCMV$|avalia[cç][aã]o MCMV$/i),
      mcmv3: head(/MCMV ?3$/i),
      mcmv4: head(/MCMV ?4$/i),
      sbpe: head(/SBPE$/i),
    };
    const precos = it
      .filter((i) => /^R\$\s*[\d.]+$/.test(i.s) && i.x < 90)
      .map((i) => ({ v: Number(i.s.replace(/[^\d.]/g, "")), y: i.y }));
    if (!precos.length) continue;
    const qtds = it.filter(
      (i) => Math.abs(i.cx - hq.cx) < 22 && /^\d+$/.test(i.s) && i.y < hq.y - 5,
    );
    const perto = <T extends { y: number }>(arr: T[], y: number) =>
      arr.reduce<T | null>(
        (b, a) => (!b || Math.abs(a.y - y) < Math.abs(b.y - y) ? a : b),
        null,
      );
    const colVals: Record<string, { v: number; y: number }[]> = {};
    for (const [k, h] of Object.entries(cols))
      colVals[k] = h
        ? it
            .filter(
              (i) =>
                Math.abs(i.cx - h.cx) < 25 &&
                /^\d+\.\d{2}$/.test(i.s) &&
                i.y < hq.y - 5,
            )
            .map((i) => ({ v: Number(i.s), y: i.y }))
        : [];
    for (const q of qtds) {
      const pr = perto(precos, q.y);
      if (!pr) continue;
      const linha = it.filter((i) => Math.abs(i.y - q.y) < 4);
      const area = ha
        ? linha.find(
            (i) => Math.abs(i.cx - ha.cx) < 22 && /^\d+(,\d+)?$/.test(i.s),
          )
        : null;
      const nome = linha
        .filter((i) => !/^[\d.,]+$/.test(i.s) && !/^R\$/.test(i.s))
        .map((i) => i.s)
        .join(" ")
        .slice(0, 160);
      const av: Record<string, number> = {};
      for (const k of Object.keys(colVals)) {
        const n = perto(colVals[k], q.y);
        if (n && Math.abs(n.y - q.y) < 40) av[k] = n.v;
      }
      unidades.push({
        preco: pr.v,
        qtd: Number(q.s),
        area: area ? Number(area.s.replace(",", ".")) : null,
        nome,
        av,
      });
    }
  }
  return { validade, unidades };
}

const NAO_RESID = /\bNR\b|n[aã]o resid|loja/i;
const faixasPorPreco = (p: number) =>
  p <= 275000 ? [1, 2, 3, 4] : p <= 400000 ? [3, 4] : p <= 600000 ? [4] : [];
const r2 = (v: number) => Math.round(v * 100) / 100;

/** Resumo do projeto a partir das unidades da tabela. */
function resumir(unidades: Unid[]) {
  const res = unidades
    .filter((u) => u.qtd > 0 && u.preco > 80000 && !NAO_RESID.test(u.nome))
    .sort((a, b) => a.preco - b.preco);
  const dormsDe = (u: Unid) => {
    const m = u.nome.match(/(\d+)\s*dorm/i);
    const n = m
      ? Number(m[1])
      : /studio|est[uú]dio/i.test(u.nome)
        ? 1
        : u.area && u.area >= 30
          ? 2
          : 1;
    return Math.max(1, n);
  };
  const porDorm: Record<string, number> = {};
  const tipos = new Map<
    string,
    {
      dorms: number;
      area: number | null;
      varanda: boolean | null;
      suite: boolean;
      vaga: boolean | null;
      preco: number;
      qtd: number;
      av: Record<string, number>;
    }
  >();
  for (const u of res) {
    const d = dormsDe(u);
    if (!(porDorm[String(d)] <= u.preco)) porDorm[String(d)] = r2(u.preco);
    const varanda = /com (sacada|varanda|terra[cç]o)/i.test(u.nome)
      ? true
      : /sem (sacada|varanda)/i.test(u.nome)
        ? false
        : null;
    const vaga = /com vaga/i.test(u.nome)
      ? true
      : /sem vaga/i.test(u.nome)
        ? false
        : null;
    const suite = /su[ií]te/i.test(u.nome);
    const area = u.area ? Math.round(u.area) : null;
    const k = [d, area, varanda, suite, vaga].join("|");
    const t = tipos.get(k);
    if (!t)
      tipos.set(k, {
        dorms: d,
        area,
        varanda,
        suite,
        vaga,
        preco: r2(u.preco),
        qtd: u.qtd,
        av: u.av,
      });
    else {
      t.qtd += u.qtd;
      if (u.preco < t.preco) {
        t.preco = r2(u.preco);
        t.av = u.av;
      }
    }
  }
  const tipologias = [...tipos.values()]
    .sort((a, b) => a.preco - b.preco)
    .slice(0, 15)
    .map((t) => ({
      rotulo: [
        `${t.dorms} dorm.`,
        t.area ? `${t.area} m²` : null,
        t.suite ? "com suíte" : null,
        t.varanda === true
          ? "com sacada"
          : t.varanda === false
            ? "sem sacada"
            : null,
        t.vaga === true ? "com vaga" : t.vaga === false ? "sem vaga" : null,
      ]
        .filter(Boolean)
        .join(" · "),
      dorms: t.dorms,
      area: t.area,
      varanda: t.varanda,
      vaga: t.vaga,
      preco: t.preco,
      qtd: t.qtd,
      avaliacoes: t.av,
    }));
  const maisBarata = res[0];
  return {
    disponiveis: res.reduce((s, u) => s + u.qtd, 0),
    preco: maisBarata ? r2(maisBarata.preco) : null,
    avaliacoes: maisBarata?.av ?? {},
    porDorm,
    tipologias,
  };
}

/** Mantém a avaliação já cadastrada de cada tipo de unidade. */
function travarAvTipologias(
  novas: Tipologia[],
  antigas: Tipologia[] | null,
): Tipologia[] {
  const chave = (t: Tipologia) => `${t.dorms}|${t.area}|${t.varanda}|${t.vaga}`;
  const velhas = new Map((antigas ?? []).map((t) => [chave(t), t.avaliacoes]));
  return novas.map((t) => {
    const v = velhas.get(chave(t));
    if (!v) return t;
    const av: Record<string, number> = { ...v };
    for (const [k, n] of Object.entries(t.avaliacoes ?? {}))
      if (!(Number(av[k]) > 0) && Number(n) > 0) av[k] = n as number;
    return { ...t, avaliacoes: av };
  });
}

export type ResultadoCury = {
  ok: boolean;
  atualizados: number;
  sem_tabela: number;
  erros: string[];
  mudancas: { nome: string; de: number | null; para: number | null }[];
};

export async function sincronizarCury(): Promise<ResultadoCury> {
  const db = createAdminClient();
  const res: ResultadoCury = {
    ok: false,
    atualizados: 0,
    sem_tabela: 0,
    erros: [],
    mudancas: [],
  };
  const { data: devs, error } = await db
    .from("developments")
    .select("id, slug, nome, preco_min, avaliacoes, avaliacao_min, tipologias")
    .in("slug", Object.keys(MAPA_CURY));
  if (error) return { ...res, erros: [error.message] };
  const fila = [...(devs ?? [])];
  const inicio = Date.now();
  const trabalhar = async () => {
    for (let d = fila.shift(); d; d = fila.shift()) {
      if (Date.now() - inicio > 45000) {
        res.erros.push(
          "tempo esgotado: o resto fica para a próxima atualização",
        );
        return;
      }
      try {
        const html = await (
          await baixar(SITE + MAPA_CURY[d.slug as string])
        ).text();
        const link = linkTabela(html);
        if (!link) {
          res.sem_tabela++;
          continue;
        }
        const { validade, unidades } = await lerTabela(
          await (await baixar(link)).arrayBuffer(),
        );
        if (!unidades.length) {
          res.sem_tabela++;
          continue;
        }
        const r = resumir(unidades);
        const upd: Record<string, unknown> = {
          unidades_disponiveis: r.disponiveis,
          disponivel: r.disponiveis > 0,
          precos_por_dorm: r.porDorm,
          tipologias: travarAvTipologias(
            r.tipologias,
            d.tipologias as Tipologia[] | null,
          ),
        };
        if (r.preco) {
          upd.preco_min = r.preco;
          upd.faixas = faixasPorPreco(r.preco);
          // avaliação cadastrada não muda mais: só preenche o que estiver vazio
          const atuais = (d.avaliacoes ?? {}) as Record<string, number>;
          const juntas: Record<string, number> = { ...atuais };
          for (const [k, v] of Object.entries(r.avaliacoes))
            if (!(Number(juntas[k]) > 0) && Number(v) > 0) juntas[k] = v;
          upd.avaliacoes = juntas;
          if (!(Number(d.avaliacao_min) > 0) && juntas.mcmv)
            upd.avaliacao_min = juntas.mcmv;
          upd.condicoes_comerciais = `Valor "a partir de" da unidade mais barata disponível na tabela Cury${validade ? ` (validade ${validade})` : ""}, sem contar unidades não residenciais (NR). Sujeito a alteração e disponibilidade.`;
        }
        const { error: e } = await db
          .from("developments")
          .update(upd)
          .eq("id", d.id);
        if (e) res.erros.push(`${d.nome}: ${e.message}`);
        else {
          res.atualizados++;
          if (r.preco !== Number(d.preco_min))
            res.mudancas.push({
              nome: d.nome as string,
              de: d.preco_min as number | null,
              para: r.preco,
            });
        }
      } catch (e) {
        res.erros.push(
          `${d.nome}: ${e instanceof Error ? e.message : String(e)}`.slice(
            0,
            160,
          ),
        );
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, trabalhar));
  res.ok = res.atualizados > 0;
  return res;
}
