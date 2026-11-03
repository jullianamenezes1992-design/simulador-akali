#!/usr/bin/env node
/**
 * Atualiza preços "a partir de", status da obra, previsão de entrega e vaga a partir do
 * Tabelão Online (Plano & House Parcerias), copiado em supabase/import/tabelao-AAAA-MM-DD.txt.
 * Formato de cada linha: status;região;nome;preço;área;dorms;vagas;entrega;unidades
 *
 * Uso: node scripts/gerar-precos-tabelao.mjs supabase/import/tabelao-2026-11-02.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const arquivo = process.argv[2] ?? "supabase/import/tabelao-2026-11-02.txt";
const dataTab = arquivo.match(/(\d{4})-(\d{2})-(\d{2})/);
const dataBR = dataTab ? `${dataTab[3]}/${dataTab[2]}/${dataTab[1]}` : "";

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const slugPP = (origem) => "pp-" + slugify(origem.replace(/[/_]/g, "-"));
const q = (v) => (v == null ? "null" : `'${String(v).replace(/'/g, "''")}'`);

/** Nome no tabelão → caminho do empreendimento no site da Plano&Plano (base do slug no nosso banco). */
const MAPA = {
  "Alto Cantareira": "planoalto-cantareira",
  "Alto Morumbi": "plano-altomorumbi",
  "Ares do Horto - Cajueiro": "ares-do-horto/cajueiro",
  "Ares do Horto - Ipê Amarelo": "ares-do-horto/ipe-amarelo",
  "Ares do Horto - Pau Brasil": "ares-do-horto/pau-brasil",
  "Barão de Campinas - Plano & Plano": "centroe-baraodecampinas",
  "Bosque do Carmo - Embaúba": "plano-bosque-do-carmo/embauba",
  "Bosque do Carmo - Eucalipto": "plano-bosque-do-carmo/eucalipto-2",
  "Bosque do Carmo - Seringueira": "plano-bosque-do-carmo/seringueira",
  "Boulevard Mooca - Acácia": "vila-boulevard-mooca",
  "Caminhos do Jaçanã": "plano-caminhos-jacana",
  "Campos Elísios": "centrocampos-eliseos",
  "Duetto São Domingos": "duetto-sao-domingos",
  "Essencia Life": "plano-essencia/life",
  "Essência Club": "plano-essencia/essencia-club",
  "Estação Mooca - residencial e NR": "planoestacao-mooca/residencial-2",
  "Itaquera - Amoreira": "meu-plano-itaquera/amoreira",
  "Itaquera - Ipê": "meu-plano-itaquera/ipe-4",
  "Jaçanã": "planojacana",
  "Jd. das Origens - Pq. Aruá": "jardim-das-origens/arua",
  "Jd. das Origens - Pq. Mariá - Abertura espelho 05/11": "jardim-das-origens/maira",
  "Mais B. Funda - Marquês de São Vicente": "planomais-barra-funda/marques-de-sao-vicente",
  "Mais B. Funda - Thomas Edison": "planomais-barra-funda/thomas-edison",
  "Mais Belém": "planomais-belem-2",
  "Mais Butantã": "eliseu-de-almeida",
  "Mais Interlagos - Refúgio": "planomais-interlagos-refugio",
  "Mais Interlagos - Reserva": "plano-maisinterlagos",
  "Mais Penha": "planomais-penha",
  "Mistá Tupinás - Residencial e NR": "mista-by-planoplano/tupinas",
  "Mistá Ubiatans - Residencial e NR": "mista-by-planoplano/ubiatans",
  "Mundo Park - Alvorada": "mundopark/alvorada",
  "Mundo Park - Aurora": "mundopark/aurora",
  "Mundo Park - Sólis": "mundopark/solis",
  "Nid Alphaville": "nid-alphaville",
  "Oriz - residencial e NR": "oriz-by-planoplano/residencial",
  "Park Santo Amaro": "planopark-santo-amaro",
  "Parque do Carmo - Ipê": "meu-planoparquedocarmo/ipe",
  "Parque do Carmo - Figueira": "meu-planoparquedocarmo/figueira",
  "Plano Laguna": "laguna-2",
  "Plano Mogeiro": "mogeiro",
  "Plano Visconde de Parnaiba": "visconde-de-parnaiba",
  "Polo Paulista -  LANÇAMENTO NOVEMBRO": "polo-paulista",
  "Praça  Pirituba - Flora": "plano-praca-pirituba/flora",
  "Raizes das Mercês - Marques de Lages": "romao-puiggari/marques-de-lages",
  "Reserva da Mooca": "planoreserva-da-mooca",
  "Santa Cecilia - Plano&Plano": "centroe-santacecilia",
  "Sphera Panamby - Club": "sphera-panamby/club",
  "Sphera Panamby - Park": "sphera-panamby/park",
  "Sphera Panamby - Urban": "sphera-panamby/urban",
  "Start Joy": "start-joy",
  "Tikoá Origem": "gabriela-mistral/tikoa",
  "Unni Brás Residences": "unni-bras",
  "Unni Limão - Felicitá": "unni-by-planoplano/felicita",
  "Unni Limão - Harmoni": "unni-by-planoplano/harmoni",
  "Vila Ema": "planovila-ema",
  "Vila Leopoldina - Carlos Weber": "planoe-vilaleopoldina/carlos-weber",
  "Vila Leopoldina - Sebastião Bach": "planoe-vilaleopoldina/sebastiao-bach",
  "Viz": "viz-by-planoplano",
  "MAPP Rio Branco": "rio-branco",
};
// Linhas do tabelão que não existem no nosso catálogo (ou são outra fase do mesmo cadastro)
const IGNORAR = new Set(["Boulevard Mooca - Jacarandá"]);

const STATUS = { "Em Obras": "em_obras", "Lançado": "lancamento", "Lançamento": "lancamento", Novidade: "lancamento", Entregue: "pronto" };
const MES = { jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6, jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12 };

const faixasPorPreco = (preco) => {
  if (preco == null) return null;
  if (preco <= 275000) return [1, 2, 3, 4];
  if (preco <= 400000) return [3, 4];
  if (preco <= 600000) return [4];
  return [];
};

const atualizados = [];
const semPreco = [];
const esgotados = [];
const fora = [];
const sql = [
  `-- Gerado por scripts/gerar-precos-tabelao.mjs a partir de ${arquivo}`,
  `-- Preços "a partir de" do Tabelão Online de ${dataBR} (arredondados ao milhar no tabelão).`,
  "begin;",
];

for (const linha of readFileSync(arquivo, "utf8").split("\n").filter(Boolean)) {
  const [st, , nome, precoTxt, , , vagasTxt, entrega] = linha.split(";");
  if (IGNORAR.has(nome)) continue;
  const origem = MAPA[nome];
  if (!origem) {
    fora.push(`${nome} (${precoTxt || st})`);
    continue;
  }
  const slug = slugPP(origem);

  if (st === "Esgotado") {
    esgotados.push(nome);
    sql.push(`update public.developments set disponivel = false where slug = ${q(slug)};`);
    continue;
  }

  const m = precoTxt.match(/R\$\s*([\d.,]+)\s*K/i);
  const k = m ? Number(m[1].replace(/\./g, "").replace(",", ".")) : null;
  const set = [];
  const status = STATUS[st];
  if (status) set.push(`status_obra = ${q(status)}`);
  const em = entrega?.match(/^([a-z]{3})\/(\d{2})$/);
  if (em && MES[em[1]]) set.push(`previsao_entrega = ${q(`${em[1]}/20${em[2]}`)}`);
  const maxVaga = Math.max(0, ...String(vagasTxt).split("-").map(Number).filter((n) => Number.isFinite(n) && n < 10));
  if (/\d/.test(vagasTxt)) set.push(`vagas = ${maxVaga > 0}`);

  if (k != null) {
    const novo = Math.round(k * 1000);
    // mantém o valor exato já cadastrado quando ele arredonda para o mesmo milhar do tabelão
    set.push(`preco_min = case when round(coalesce(preco_min, 0) / 1000) = ${k} then preco_min else ${novo} end`);
    set.push(`faixas = '{${faixasPorPreco(novo).join(",")}}'::int[]`);
    set.push(
      `condicoes_comerciais = ${q(`Valor "a partir de" do tabelão Plano&Plano de ${dataBR}, sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.`)}`
    );
    set.push("disponivel = true");
    atualizados.push(`${nome}: R$ ${k} mil`);
  } else {
    semPreco.push(nome);
  }
  if (set.length) sql.push(`update public.developments set ${set.join(", ")} where slug = ${q(slug)};`);
}
sql.push("commit;");
sql.push(
  `select nome, preco_min, status_obra, previsao_entrega, vagas, disponivel from public.developments where slug in (${Object.values(MAPA)
    .map((o) => q(slugPP(o)))
    .join(", ")}) order by nome;`
);

const saida = arquivo.replace(/\.txt$/, ".sql");
writeFileSync(saida, sql.join("\n") + "\n");
console.log(`SQL: ${saida}`);
console.log(`Com preço (${atualizados.length})`);
console.log(`Valores em breve (${semPreco.length}): ${semPreco.join(" | ")}`);
console.log(`Esgotados (${esgotados.length}): ${esgotados.join(" | ")}`);
console.log(`Fora do catálogo (${fora.length}): ${fora.join(" | ")}`);
