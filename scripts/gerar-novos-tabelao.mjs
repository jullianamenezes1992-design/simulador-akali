#!/usr/bin/env node
/**
 * 1) Cadastra os empreendimentos que estão no Tabelão Online e ainda não existiam no site.
 * 2) Esconde (ativo = false) os empreendimentos Plano&Plano que não estão no tabelão (ou estão esgotados).
 * Uso: node scripts/gerar-novos-tabelao.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const slugify = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const slugPP = (origem) => "pp-" + origem.toLowerCase().replace(/[/_]/g, "-").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const q = (v) => (v == null ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const FONTE = "https://tabelao-online.web.app";
const DATA = "02/11/2026";

const faixasPorPreco = (p) => (p == null ? [] : p <= 275000 ? [1, 2, 3, 4] : p <= 400000 ? [3, 4] : p <= 600000 ? [4] : []);

const NOVOS = [
  { nome: "Ares do Horto - Aroeira", endereco: "Estrada do Campo Limpo, s/n - Pirajussara", bairro: "Pirajussara", cidade: "São Paulo", regiao: "zona_sul", preco: 295000, area: [32, 55], dorms: [2, 3], vagas: true, status: "lancamento", entrega: "dez/2029" },
  { nome: "Inspire Mauá Sonhos", endereco: "Rua Pedro Galvano, 8 - Fazenda Capitão João", bairro: "Fazenda Capitão João", cidade: "Mauá", regiao: "grande_sp", preco: 508000, area: [43, 43], dorms: [2], vagas: true, status: "pronto", entrega: "nov/2018" },
  { nome: "Parque Pirituba - Arbore", endereco: "Av. Cabo Adão Pereira, 648 - Vila Pereira Barreto", bairro: "Vila Pereira Barreto", cidade: "São Paulo", regiao: "zona_norte", preco: null, area: null, dorms: [], vagas: false, status: "lancamento", entrega: null },
  { nome: "Penha Parque - Gabriela Mistral", endereco: "Av. Gabriela Mistral, 750 - Penha", bairro: "Penha", cidade: "São Paulo", regiao: "zona_leste", preco: null, area: null, dorms: [], vagas: false, status: "lancamento", entrega: null },
  { nome: "Plano Vista Santo Amaro", endereco: "Av. Guido Caloi, 1002 - Jardim São Luís", bairro: "Jardim São Luís", cidade: "São Paulo", regiao: "zona_sul", preco: null, area: null, dorms: [], vagas: false, status: "lancamento", entrega: null },
  { nome: "Raízes das Mercês - Romão Puiggari", endereco: "R. Romão Puiggari, 1025 e R. Marquês de Lages, 1056 - Vila Moraes", bairro: "Vila Moraes", cidade: "São Paulo", regiao: "zona_sul", preco: null, area: [27, 34], dorms: [1, 2], vagas: true, status: "lancamento", entrega: null },
];

// Slugs (do catálogo Plano&Plano) que estão no tabelão e à venda — os demais ficam ocultos
const fonteMapa = readFileSync("scripts/gerar-precos-tabelao.mjs", "utf8");
const bloco = fonteMapa.slice(fonteMapa.indexOf("const MAPA"), fonteMapa.indexOf("};", fonteMapa.indexOf("const MAPA")));
const ESGOTADOS = new Set(["meu-planoparquedocarmo/figueira", "rio-branco"]);
const manter = [...bloco.matchAll(/": "([^"]+)",/g)].map((m) => m[1]).filter((o) => !ESGOTADOS.has(o)).map(slugPP);

const sql = [`-- Gerado por scripts/gerar-novos-tabelao.mjs (Tabelão Online de ${DATA})`, "begin;"];
for (const n of NOVOS) {
  const status = n.status === "pronto" ? "Imóvel pronto para morar." : "Lançamento.";
  const desc = `Empreendimento Plano&Plano em ${n.bairro}, ${n.cidade}. ${status}${n.dorms.length ? ` Opções de ${n.dorms.join(" e ")} dormitório(s).` : ""}`;
  const cond =
    n.preco == null
      ? `Valores em breve, conforme tabelão Plano&Plano de ${DATA}. Consulte o corretor.`
      : `Valor "a partir de" do tabelão Plano&Plano de ${DATA}, sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.`;
  sql.push(`insert into public.developments
  (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios, area_min, area_max,
   vagas, status_obra, previsao_entrega, disponivel, condicoes_comerciais, diferenciais, ativo, is_demo, fonte_url)
values
  (${q("tab-" + slugify(n.nome))}, ${q(n.nome)}, 'Plano&Plano', ${q(desc)}, ${q(n.endereco)}, ${q(n.bairro)}, ${q(n.cidade)}, 'SP', ${q(n.regiao)},
   ${n.preco ?? "null"}, '{${faixasPorPreco(n.preco).join(",")}}'::int[], '{${n.dorms.join(",")}}'::int[], ${n.area?.[0] ?? "null"}, ${n.area?.[1] ?? "null"},
   ${n.vagas}, ${q(n.status)}, ${q(n.entrega)}, true, ${q(cond)}, '{}'::text[], true, false, ${q(FONTE)})
on conflict (slug) do update set preco_min = excluded.preco_min, faixas = excluded.faixas, status_obra = excluded.status_obra,
  previsao_entrega = excluded.previsao_entrega, condicoes_comerciais = excluded.condicoes_comerciais, ativo = true;`);
}
sql.push(`update public.developments set ativo = false
where slug like 'pp-%' and slug not in (${manter.map(q).join(", ")});`);
sql.push("commit;");
sql.push(`select count(*) filter (where ativo) ativos, count(*) filter (where ativo and preco_min is not null) ativos_com_preco,
  count(*) filter (where not ativo) ocultos from public.developments where not is_demo;`);
writeFileSync("supabase/import/tabelao-2026-11-02-novos.sql", sql.join("\n") + "\n");
console.log("manter:", manter.length);
