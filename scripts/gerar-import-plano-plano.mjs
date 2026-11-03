#!/usr/bin/env node
/**
 * Gera o SQL de importação do catálogo Plano&Plano a partir do arquivo JSON extraído
 * da página do corretor (comprarseuap.com.br/akali).
 *
 * Uso:  node scripts/gerar-import-plano-plano.mjs supabase/import/plano-plano-2026-11-03.json
 * Saída: supabase/import/plano-plano-2026-11-03.sql  (rode no SQL Editor do Supabase)
 *
 * Formato de cada linha do JSON:
 * [projeto, fase|null, slugOrigem, regiao, cidade(0=São Paulo), bairro, status(l|e|p), dorms("12"),
 *  preco|null, endereco, areaMin|null, areaMax|null, [fotos], [plantas], videoYoutubeId|null, "dif1;dif2"]
 */
import { readFileSync, writeFileSync } from "node:fs";

const entrada = process.argv[2] ?? "supabase/import/plano-plano-2026-11-03.json";
const saida = entrada.replace(/\.json$/, ".sql");
const DATA_REF = (entrada.match(/(\d{4}-\d{2}-\d{2})/) ?? [])[1] ?? new Date().toISOString().slice(0, 10);
const [ano, mes, dia] = DATA_REF.split("-");
const dataBR = `${dia}/${mes}/${ano}`;

const IMG_BASE = "https://www.planoeplano.com.br/estatico/";
const PAGINA_BASE = "https://www.comprarseuap.com.br/akali/imoveis/";
const REGIOES = { zleste: "zona_leste", zoeste: "zona_oeste", zsul: "zona_sul", znorte: "zona_norte", c: "centro", g: "grande_sp", i: "interior" };
const STATUS = { l: "lancamento", e: "em_obras", p: "pronto" };

// Tetos de imóvel por faixa (parâmetros v1). Usados só para sugerir as faixas atendidas.
const faixasPorPreco = (preco) => {
  if (preco == null) return [];
  if (preco <= 275000) return [1, 2, 3, 4];
  if (preco <= 400000) return [3, 4];
  if (preco <= 600000) return [4];
  return [];
};

const img = (p) => IMG_BASE + p.replace(/!$/, ".png").replace(/~$/, ".jpeg").replace(/^(.*[^.]{40})$/, "$1.jpg");
const q = (v) => (v == null ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const num = (v) => (v == null ? "null" : String(Number(v)));
const arrInt = (a) => `'{${a.join(",")}}'::int[]`;
const arrTxt = (a) => (a.length ? `array[${a.map(q).join(",")}]::text[]` : "'{}'::text[]");
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const linhas = JSON.parse(readFileSync(entrada, "utf8"));
const out = [];
out.push(`-- =====================================================================
-- Importação do catálogo Plano&Plano — dados de ${dataBR}
-- Origem: ${PAGINA_BASE.replace(/imoveis\/$/, "")}
-- Gerado por scripts/gerar-import-plano-plano.mjs. Pode ser executado de novo para
-- atualizar preços e fotos (não altera o campo "ativo" de quem já existe).
-- Pré-requisito: migration 20261103000003_preco_sob_consulta.sql aplicada.
-- =====================================================================
begin;

-- Retira do site os empreendimentos de EXEMPLO
update public.developments set ativo = false where is_demo;
`);

let ativos = 0;
const resumo = { total: 0, comPreco: 0, inativos: 0 };
for (const r of linhas) {
  const [proj, fase, slugOrigem, reg, cidade, bairro, st, dorms, preco, endereco, aMin, aMax, fotos, plantas, video, dif] = r;
  const nome = fase ? `${proj.trim()} - ${fase.trim()}` : proj.trim();
  const slug = "pp-" + slugify(slugOrigem.replace(/[/_]/g, "-"));
  const regiao = REGIOES[reg];
  if (!regiao) throw new Error(`Região desconhecida: ${reg} (${slugOrigem})`);
  const dormitorios = [...new Set(String(dorms).split("").filter(Boolean).map(Number))];
  const fotosUrls = fotos.map(img);
  const plantasUrls = plantas.map(img);
  const ativo = fotosUrls.length > 0 && dormitorios.length > 0;
  const diferenciais = [...new Set(String(dif).split(";").map((s) => s.trim()).filter((s) => s && !/breve lan/i.test(s)))];
  const statusObra = STATUS[st];
  const videoUrl = video && /^[\w-]{11}$/.test(video) ? `https://www.youtube.com/watch?v=${video}` : null;
  const descricao =
    `Empreendimento Plano&Plano em ${bairro}${cidade ? `, ${cidade}` : ""}. ` +
    (statusObra === "pronto" ? "Imóvel pronto para morar." : statusObra === "em_obras" ? "Em construção." : "Lançamento.") +
    (dormitorios.length ? ` Opções de ${dormitorios.join(" e ")} dormitório(s).` : "");
  const condicoes =
    preco == null
      ? `Preço sob consulta. Informações da Plano&Plano em ${dataBR}; confirme a tabela vigente com o corretor.`
      : `Valor "a partir de" informado pela Plano&Plano em ${dataBR}, sujeito a alteração e disponibilidade.`;

  resumo.total++;
  if (preco != null) resumo.comPreco++;
  if (!ativo) resumo.inativos++;
  else ativos++;

  const media = [
    ...fotosUrls.map((u, i) => `('foto', ${q(u)}, ${q(`${nome} - perspectiva ilustrada`)}, ${i})`),
    ...plantasUrls.map((u, i) => `('planta', ${q(u)}, ${q(`Planta ilustrativa - ${nome}`)}, ${i})`),
  ];

  out.push(`-- ${nome}
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    (${q(slug)}, ${q(nome)}, 'Plano&Plano', ${q(descricao)}, ${q(endereco)}, ${q(bairro)}, ${q(cidade || "São Paulo")}, 'SP', ${q(regiao)},
     ${num(preco)}, ${arrInt(faixasPorPreco(preco))}, ${arrInt(dormitorios)}, ${num(aMin)}, ${num(aMax)}, false, ${q(statusObra)}, true,
     ${q(condicoes)}, ${arrTxt(diferenciais)}, ${q(videoUrl)}, ${q(fotosUrls[0] ?? null)}, ${ativo}, false, ${q(PAGINA_BASE + slugOrigem)})
  on conflict (slug) do update set
    nome = excluded.nome, descricao = excluded.descricao, endereco = excluded.endereco, bairro = excluded.bairro,
    cidade = excluded.cidade, regiao = excluded.regiao, preco_min = excluded.preco_min, faixas = excluded.faixas,
    dormitorios = excluded.dormitorios, area_min = excluded.area_min, area_max = excluded.area_max,
    status_obra = excluded.status_obra, condicoes_comerciais = excluded.condicoes_comerciais,
    diferenciais = excluded.diferenciais, video_url = excluded.video_url, capa_url = excluded.capa_url,
    fonte_url = excluded.fonte_url
  returning id
), limpa as (
  delete from public.development_media m using d where m.development_id = d.id and m.storage_path is null
)
${
  media.length
    ? `insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ${media.join(",\n          ")}) as v(tipo, url, legenda, ordem);`
    : "select 1 from d;"
}
`);
}

out.push(`commit;

-- Resumo: ${resumo.total} empreendimentos/fases • ${resumo.comPreco} com preço • ${resumo.total - resumo.comPreco} sob consulta • ${resumo.inativos} importados como inativos (sem fotos/tipologia)
`);

writeFileSync(saida, out.join("\n"));
console.log(`Gerado ${saida}: ${resumo.total} registros (${ativos} ativos, ${resumo.inativos} inativos, ${resumo.comPreco} com preço).`);
