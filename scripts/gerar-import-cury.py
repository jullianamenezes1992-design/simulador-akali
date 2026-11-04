#!/usr/bin/env python3
"""
Gera o SQL de importação dos empreendimentos Cury a partir dos dados extraídos do site do
gerente de parcerias (guerato.com.br): página de cada projeto + PDF da tabela de vendas.

Entradas (supabase/import/cury/):
  guerato-raw-AAAA-MM-DD.json   campos da página + menor preço da tabela PDF
  guerato-imgs-AAAA-MM-DD.json  imagem principal e galeria de cada página
Saída: supabase/import/cury/cury-AAAA-MM-DD.sql (rode no SQL Editor do Supabase)

Uso: python3 scripts/gerar-import-cury.py 2026-11-04
"""
import json
import re
import sys
from datetime import date

DATA = sys.argv[1] if len(sys.argv) > 1 else "2026-11-04"
BASE = "supabase/import/cury"
raw = json.load(open(f"{BASE}/guerato-raw-{DATA}.json"))
imgs = json.load(open(f"{BASE}/guerato-imgs-{DATA}.json"))
HOJE = date.fromisoformat(DATA)
SITE = "https://www.guerato.com.br/"
WIX = "https://static.wixstatic.com/media/"
PLACEHOLDER = "1d445c_149b1563ff304"  # imagem genérica usada nos "breve lançamento"

REGIAO = {"zona-norte": "zona_norte", "zona-sul": "zona_sul", "zona-leste": "zona_leste",
          "zona-oeste": "zona_oeste", "cury-centro": "centro", "guarulhos": "grande_sp", "sto-andre": "grande_sp"}
MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
NOMES = {"Wl Boa Vista": "WL Boa Vista", "Nova Leopoldina - Dond. Art": "Nova Leopoldina - Cond. Art",
         "Urban Vila Maria Ii": "Urban Vila Maria II", "Novo Mundo Carrão Ii": "Novo Mundo Carrão II",
         "Atmosfera Jaguaré Ii": "Atmosfera Jaguaré II", "360º Park View": "360º Park View",
         "Parque Das Nações - Cond. Granja Julieta": "Parque das Nações - Cond. Granja Julieta",
         "Parque Das Nações - Cond. Laguna": "Parque das Nações - Cond. Laguna",
         "Cidade Parque Guarapiranga - Atlantica": "Cidade Parque Guarapiranga - Atlântica",
         "Parque Das Perdizes": "Parque das Perdizes", "Bosque Da Barra": "Bosque da Barra",
         "Caminhos Da Liberdade": "Caminhos da Liberdade", "Alto São Domingos": "Alto São Domingos"}


def q(v):
    return "null" if v is None else "'" + str(v).replace("'", "''") + "'"


def titulo(s):
    t = " ".join(w.capitalize() if not re.match(r"^\d", w) else w for w in s.strip().split())
    t = re.sub(r"\b(Da|De|Do|Das|Dos|E)\b", lambda m: m.group(1).lower(), t)
    return NOMES.get(t, NOMES.get(s.strip().title(), t))


def faixas_por_preco(p):
    if p is None:
        return []
    return [1, 2, 3, 4] if p <= 275000 else [3, 4] if p <= 400000 else [4] if p <= 600000 else []


def entrega(txt):
    m = re.match(r"(\d{1,2})/(\d{1,2})/(\d{2,4})", txt or "")
    if not m:
        return None, None
    mes, ano = int(m.group(2)), int(m.group(3))
    ano = ano + 2000 if ano < 100 else ano
    meses = (ano - HOJE.year) * 12 + (mes - HOJE.month)
    return f"{MESES[mes - 1]}/{ano}", meses


rows, resumo = [], {"total": 0, "preco": 0, "fotos": 0}
sql = [f"-- Gerado por scripts/gerar-import-cury.py em {DATA} a partir de {SITE}",
       "-- Empreendimentos Cury com estoque. Pode rodar de novo para atualizar.", "begin;"]

for r in raw:
    estoque = int(re.sub(r"\D", "", r.get("Estoque") or "0") or 0)
    if estoque <= 0:
        continue
    path = r["path"]
    pref, slug_src = path.split("/")
    nome = titulo(r["nome"])
    bairro = titulo(r.get("bairro") or "")
    cidade = "Guarulhos" if pref == "guarulhos" else "São Paulo"
    end = (r.get("Endereço do Terreno") or "").replace(", Brasil", "")
    end = re.sub(r",?\s*\d{5}-\d{3}", "", end).strip(" ,")
    tip = r.get("Tipologia") or ""
    areas = [int(a) for a in re.findall(r"(\d{2,3})\s*m²", tip)] + [int(a) for a in re.findall(r"(\d{2,3})\s*(?:e|à|,)\s*(?=\d{2,3}\s*m²)", tip)]
    dorms = sorted({int(d) for d in re.findall(r"(\d)\s*dorm", tip, re.I)} | ({1} if re.search(r"est[úu]dio", tip, re.I) else set()))
    vagas_txt = (r.get("Vagas") or "").lower()
    vagas = bool(re.search(r"([1-9]\d*)\s*(?:vagas?\s*(?:para\s*)?)?(?:para\s*)?carro", vagas_txt))
    prev, meses = entrega(r.get("Data de Entrega"))
    breve = "breve" in (r.get("Data de Entrega") or "").lower()
    status = "lancamento" if breve or (meses is not None and meses >= 30) else ("pronto" if meses is not None and meses <= 0 else "em_obras")
    preco = round(r["precoMin"]) if r.get("precoMin") else None
    terraco = re.search(r"terra[çc]o|sacada", tip, re.I)
    dif = [d.strip().rstrip(".") for d in (r.get("dif") or []) if not re.match(r"^(Endereço|–|-|R\.|Rua|Av)", d.strip()) and len(d) < 140]
    if terraco:
        dif.insert(0, "Opções com terraço/sacada")
    dif = dif[:8]
    cat = ", ".join(r.get("cat") or [])
    im = imgs.get(path, {})
    hero = im.get("hero")
    hero = None if not hero or hero.startswith(PLACEHOLDER) else WIX + hero
    gal = [WIX + g for g in im.get("gal", []) if not g.startswith(PLACEHOLDER)][:12]
    if not hero and gal:
        hero = gal[0]
    situacao = {"lancamento": "Lançamento", "em_obras": "Em construção", "pronto": "Pronto para morar"}[status]
    desc = (f"Empreendimento Cury em {bairro}, {cidade}. {situacao}."
            + (f" Plantas de {min(areas)} a {max(areas)} m²" if areas else "")
            + (f" com {' e '.join(map(str, dorms))} dormitório(s)." if dorms else ".")
            + (f" Entrega prevista: {prev}." if prev and status != 'pronto' else "")
            + (f" Categorias de uso: {cat}." if cat else ""))
    cond = (f'Valor "a partir de" da tabela Cury (validade {r.get("validade")}), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.'
            if preco else "Preço sob consulta. Confirme a tabela vigente com o corretor.")
    slug = "cury-" + slug_src
    resumo["total"] += 1
    resumo["preco"] += bool(preco)
    resumo["fotos"] += bool(hero)
    rows.append((nome, preco, len(gal), status, prev, estoque))
    media = [f"('foto', {q(u)}, {q(nome + ' - imagem ilustrativa')}, {i})" for i, u in enumerate(gal)]
    arr_txt = "array[" + ",".join(q(d) for d in dif) + "]::text[]" if dif else "'{}'::text[]"
    sql.append(f"""-- {nome}
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ({q(slug)}, {q(nome)}, 'Cury', {q(desc)}, {q(end)}, {q(bairro)}, {q(cidade)}, 'SP', {q(REGIAO[pref])},
     {preco if preco else 'null'}, '{{{','.join(map(str, faixas_por_preco(preco)))}}}'::int[], '{{{','.join(map(str, dorms))}}}'::int[],
     {min(areas) if areas else 'null'}, {max(areas) if areas else 'null'}, {str(vagas).lower()}, {q(status)}, {q(prev)}, true, {estoque},
     {q(cond)}, {arr_txt}, {q(hero)}, true, false, {q(SITE + path)})
  on conflict (slug) do update set
    nome = excluded.nome, descricao = excluded.descricao, endereco = excluded.endereco, bairro = excluded.bairro,
    preco_min = excluded.preco_min, faixas = excluded.faixas, dormitorios = excluded.dormitorios,
    area_min = excluded.area_min, area_max = excluded.area_max, vagas = excluded.vagas, status_obra = excluded.status_obra,
    previsao_entrega = excluded.previsao_entrega, unidades_disponiveis = excluded.unidades_disponiveis,
    condicoes_comerciais = excluded.condicoes_comerciais, diferenciais = excluded.diferenciais, capa_url = excluded.capa_url,
    disponivel = true, fonte_url = excluded.fonte_url
  returning id
), limpa as (
  delete from public.development_media m using d where m.development_id = d.id and m.storage_path is null
)
""" + (f"""insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values {(','+chr(10)+'          ').join(media)}) as v(tipo, url, legenda, ordem);""" if media else "select 1 from d;"))

sql.append("commit;")
sql.append("select nome, preco_min, status_obra, previsao_entrega, unidades_disponiveis from public.developments where construtora = 'Cury' order by preco_min nulls last;")
open(f"{BASE}/cury-{DATA}.sql", "w").write("\n".join(sql) + "\n")
for row in rows:
    print(" | ".join(map(str, row)))
print(resumo)
