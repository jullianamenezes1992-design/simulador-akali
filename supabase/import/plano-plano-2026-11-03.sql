-- =====================================================================
-- Importação do catálogo Plano&Plano — dados de 03/11/2026
-- Origem: https://www.comprarseuap.com.br/akali/
-- Gerado por scripts/gerar-import-plano-plano.mjs. Pode ser executado de novo para
-- atualizar preços e fotos (não altera o campo "ativo" de quem já existe).
-- Pré-requisito: migration 20261103000003_preco_sob_consulta.sql aplicada.
-- =====================================================================
begin;

-- Retira do site os empreendimentos de EXEMPLO
update public.developments set ativo = false where is_demo;

-- Tikoá
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-gabriela-mistral-tikoa', 'Tikoá', 'Plano&Plano', 'Empreendimento Plano&Plano em Penha. Lançamento. Opções de 2 dormitório(s).', 'Av. Gabriela Mistral, 750 - Penha', 'Penha', 'São Paulo', 'SP', 'zona_leste',
     247543, '{1,2,3,4}'::int[], '{2}'::int[], null, null, false, 'lancamento', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Piscina','Pet Place externo','Playground','Churrasqueira','Quadra de Areia','Funcional','Fitness']::text[], null, 'https://www.planoeplano.com.br/estatico/2026/08/25/17/58/a08bc9eb66179addb0ebcba77a30485152ee29b2.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/gabriela-mistral/tikoa')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/08/25/17/58/a08bc9eb66179addb0ebcba77a30485152ee29b2.png', 'Tikoá - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/08/25/17/58/590828b8e3e168c59a3d7ea6c127fe4fa6755049.png', 'Tikoá - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/08/25/17/58/129071d9e6d1d9e21cea3f74516142ecc80ead6a.png', 'Tikoá - perspectiva ilustrada', 2)) as v(tipo, url, legenda, ordem);

-- Plano&Mais Barra Funda - Thomas Edison
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planomais-barra-funda-thomas-edison', 'Plano&Mais Barra Funda - Thomas Edison', 'Plano&Plano', 'Empreendimento Plano&Plano em Barra Funda. Lançamento. Opções de 1 e 2 dormitório(s).', 'Av. Marquês de S. Vicente, S/N - Barra Funda', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     null, '{}'::int[], '{1,2}'::int[], null, null, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Piscina','Churrasqueira','Cinema','Playground','Praça do fogo','Quadra de areia','Redário','Brinquedoteca']::text[], null, 'https://www.planoeplano.com.br/estatico/2026/09/02/11/24/39d9a5169a6bf095d9b8105ba5648662576d789a.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planomais-barra-funda/thomas-edison')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/09/02/11/24/39d9a5169a6bf095d9b8105ba5648662576d789a.png', 'Plano&Mais Barra Funda - Thomas Edison - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/09/02/11/24/02f6837c2a214537d93c3054a4875f041869172e.png', 'Plano&Mais Barra Funda - Thomas Edison - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/09/02/11/24/471be78eeba9cdd01a2271c001326779d9839584.png', 'Plano&Mais Barra Funda - Thomas Edison - perspectiva ilustrada', 2)) as v(tipo, url, legenda, ordem);

-- Plano&Mais Barra Funda - Marquês de São Vicente
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planomais-barra-funda-marques-de-sao-vicente', 'Plano&Mais Barra Funda - Marquês de São Vicente', 'Plano&Plano', 'Empreendimento Plano&Plano em Barra Funda. Lançamento. Opções de 1 e 2 dormitório(s).', 'Av. Marquês de S. Vicente, S/N - Barra Funda', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     null, '{}'::int[], '{1,2}'::int[], null, null, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Piscina','Churrasqueira','Pet place','Playground','Praça do fogo','Quadra de areia','Redário','Fitness']::text[], null, 'https://www.planoeplano.com.br/estatico/2026/09/02/11/43/213209ac39e1eadc360992b33bdd4346f861f89f.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planomais-barra-funda/marques-de-sao-vicente')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/09/02/11/43/213209ac39e1eadc360992b33bdd4346f861f89f.png', 'Plano&Mais Barra Funda - Marquês de São Vicente - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/09/02/11/43/868e4c0d4acf4538e3f6549595bd7542e04adff7.png', 'Plano&Mais Barra Funda - Marquês de São Vicente - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/09/02/11/43/1b1e8809de19056ecfae5e297028577a90a7b447.png', 'Plano&Mais Barra Funda - Marquês de São Vicente - perspectiva ilustrada', 2)) as v(tipo, url, legenda, ordem);

-- Plano&Caminhos do Jaçanã
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-plano-caminhos-jacana', 'Plano&Caminhos do Jaçanã', 'Plano&Plano', 'Empreendimento Plano&Plano em Jaçanã. Lançamento. Opções de 2 e 3 dormitório(s).', 'Avenida Edu Chaves, nº 505 - Jaçanã', 'Jaçanã', 'São Paulo', 'SP', 'zona_norte',
     252307, '{1,2,3,4}'::int[], '{2,3}'::int[], null, null, false, 'lancamento', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Piscina','Fitness externo','Churrasqueira','Academia','Cinema ao ar livre','Playground','Praça do fogo']::text[], 'https://www.youtube.com/watch?v=6yXYwrX4cE8', 'https://www.planoeplano.com.br/estatico/2026/08/14/17/15/cbe5e10321d678e932e8ae11f178c7e28251c724.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/plano-caminhos-jacana')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/08/14/17/15/cbe5e10321d678e932e8ae11f178c7e28251c724.jpg', 'Plano&Caminhos do Jaçanã - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/08/14/17/15/1d5022642ddf654ddb1e0b1713e7b112800beafd.jpg', 'Plano&Caminhos do Jaçanã - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/08/14/17/15/0f082ee5e63e9081bd13252803b6cced77d388be.jpg', 'Plano&Caminhos do Jaçanã - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/05/22/17/02/2027b209f8f554fa2454ae0ae2b7a5b71d174a67.jpg', 'Planta ilustrativa - Plano&Caminhos do Jaçanã', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/05/22/17/02/0b2765615f473f8665df99604f674828d6faad9f.jpg', 'Planta ilustrativa - Plano&Caminhos do Jaçanã', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Essência - Essência Club
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-plano-essencia-essencia-club', 'Plano&Essência - Essência Club', 'Plano&Plano', 'Empreendimento Plano&Plano em Rio Pequeno. Lançamento. Opções de 2 dormitório(s).', 'Rua Joaquim Lapas Veiga, S/N x Rua Paulo da Silva, S/N - Rio Pequeno', 'Rio Pequeno', 'São Paulo', 'SP', 'zona_oeste',
     null, '{}'::int[], '{2}'::int[], null, null, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Churrasqueira','Piscina','Quadra','Praça','Playground','Bem estar','Coworking']::text[], 'https://www.youtube.com/watch?v=3Xa4YI4p8qk', 'https://www.planoeplano.com.br/estatico/2026/07/28/11/55/c15d228a231736c9791215ad435f860eea8e89e9.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/plano-essencia/essencia-club')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/07/28/11/55/c15d228a231736c9791215ad435f860eea8e89e9.jpg', 'Plano&Essência - Essência Club - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/07/28/11/54/1e6b03054298fff95e7dfe6a4bd50bb6848e2363.jpg', 'Plano&Essência - Essência Club - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/07/28/11/55/1da4711b13f0ca09ee1c91dcbbf0248b859c86fd.jpg', 'Plano&Essência - Essência Club - perspectiva ilustrada', 2)) as v(tipo, url, legenda, ordem);

-- Plano&Essência - Essência Life
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-plano-essencia-life', 'Plano&Essência - Essência Life', 'Plano&Plano', 'Empreendimento Plano&Plano em Rio Pequeno. Lançamento. Opções de 2 dormitório(s).', 'Rua Paulo da Silva, 199 - Rio Pequeno', 'Rio Pequeno', 'São Paulo', 'SP', 'zona_oeste',
     208959, '{1,2,3,4}'::int[], '{2}'::int[], null, null, false, 'lancamento', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Piscina','Praça','Playground','Quadra','Funcional','Bem-estar','Coworking']::text[], 'https://www.youtube.com/watch?v=3Xa4YI4p8qk', 'https://www.planoeplano.com.br/estatico/2026/06/03/17/48/4ed45d60f06cb1c4c70b8d8a2e7ebdf184924d50.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/plano-essencia/life')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/03/17/48/4ed45d60f06cb1c4c70b8d8a2e7ebdf184924d50.jpg', 'Plano&Essência - Essência Life - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/03/17/48/764e674f810e6b8dab1590de1ecd041c61d976b9.jpg', 'Plano&Essência - Essência Life - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/03/17/48/7d9518d8969d431b8454a310a6f6a0a6b49a29a3.jpg', 'Plano&Essência - Essência Life - perspectiva ilustrada', 2)) as v(tipo, url, legenda, ordem);

-- Ares do Horto - Cajueiro
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-ares-do-horto-cajueiro', 'Ares do Horto - Cajueiro', 'Plano&Plano', 'Empreendimento Plano&Plano em Campo Limpo. Lançamento. Opções de 2 dormitório(s).', 'Estrada do Campo Limpo, 1501 - Campo Limpo', 'Campo Limpo', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{2}'::int[], null, null, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Piscina','Playground','Pet Place','Feirinha','Brinquedoteca','Coworking','Delivery']::text[], null, 'https://www.planoeplano.com.br/estatico/2026/10/14/16/57/7f89386115851a98eee26d57a39712ad26a12aff.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/ares-do-horto/cajueiro')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/10/14/16/57/7f89386115851a98eee26d57a39712ad26a12aff.jpg', 'Ares do Horto - Cajueiro - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/10/14/16/57/0cd4b31ac31b6809b6208f371eed65a89037fec0.jpg', 'Ares do Horto - Cajueiro - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/10/14/16/57/67eda83009316f3c67fc27dfd905505057e4c1f7.jpg', 'Ares do Horto - Cajueiro - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/10/14/17/01/c55ec1460e9092522d5caced294e68636534fb6a.jpg', 'Planta ilustrativa - Ares do Horto - Cajueiro', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/10/14/17/01/94a12a5609d49aeed56ea09e20af2341cb6dcf44.jpg', 'Planta ilustrativa - Ares do Horto - Cajueiro', 1)) as v(tipo, url, legenda, ordem);

-- Ares do Horto - Ipê Amarelo
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-ares-do-horto-ipe-amarelo', 'Ares do Horto - Ipê Amarelo', 'Plano&Plano', 'Empreendimento Plano&Plano em Campo Limpo. Lançamento. Opções de 2 dormitório(s).', 'Estrada do Campo Limpo - Campo Limpo', 'Campo Limpo', 'São Paulo', 'SP', 'zona_sul',
     277339, '{3,4}'::int[], '{2}'::int[], null, null, false, 'lancamento', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Piscina','Pet place','Piscina voo','Churrasqueira','Ginástica externa','Playground','Quadra']::text[], 'https://www.youtube.com/watch?v=XdLOW2MC8OI', 'https://www.planoeplano.com.br/estatico/2026/08/06/15/58/55cfa19df8e350b0b25c7835d4a5eec710cd5ae7.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/ares-do-horto/ipe-amarelo')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/08/06/15/58/55cfa19df8e350b0b25c7835d4a5eec710cd5ae7.jpg', 'Ares do Horto - Ipê Amarelo - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/08/06/15/58/ae221f664850dae1f831b648494558fbb61741b6.jpg', 'Ares do Horto - Ipê Amarelo - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/08/06/15/58/e8e8d726ddc9ba42787d2e8fe6b8abe020566cee.jpg', 'Ares do Horto - Ipê Amarelo - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/08/06/16/06/801e8041f0770588b524f210dac5db97a35b8bda.jpg', 'Planta ilustrativa - Ares do Horto - Ipê Amarelo', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/08/06/16/06/63e2c2d06e60b4c37ebf68f9f251ecb6eb74e0ed.jpg', 'Planta ilustrativa - Ares do Horto - Ipê Amarelo', 1)) as v(tipo, url, legenda, ordem);

-- Ares do Horto - Pau Brasil
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-ares-do-horto-pau-brasil', 'Ares do Horto - Pau Brasil', 'Plano&Plano', 'Empreendimento Plano&Plano em Horto do Ipê. Lançamento. Opções de 2 dormitório(s).', 'Estrada do Campo Limpo, 1501 - Horto do Ipê', 'Horto do Ipê', 'São Paulo', 'SP', 'zona_sul',
     285971, '{3,4}'::int[], '{2}'::int[], null, null, false, 'lancamento', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Lareira Rooftop','Churrasqueira','Piquenique','Pet Place','Playground','Brinquedoteca','Delivery']::text[], 'https://www.youtube.com/watch?v=XdLOW2MC8OI', 'https://www.planoeplano.com.br/estatico/2026/06/02/20/05/00870e76956794bd8e79f85b03050e5747f0ed5e.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/ares-do-horto/pau-brasil')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/02/20/05/00870e76956794bd8e79f85b03050e5747f0ed5e.jpg', 'Ares do Horto - Pau Brasil - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/02/20/05/ce237c3609c55d33c1f36f433badbba4dd7be9be.jpg', 'Ares do Horto - Pau Brasil - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/02/20/05/81060f7ea9b66740a5d3ae5b7b2a565e0080a542.jpg', 'Ares do Horto - Pau Brasil - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/06/02/20/17/7524f3ec595330cc3d23ed13de2d5cbd1547702e.jpg', 'Planta ilustrativa - Ares do Horto - Pau Brasil', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/06/02/20/17/1f5debff8ee2e6f4672a88deb9505884f97a4402.jpg', 'Planta ilustrativa - Ares do Horto - Pau Brasil', 1)) as v(tipo, url, legenda, ordem);

-- Duetto São Domingos
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-duetto-sao-domingos', 'Duetto São Domingos', 'Plano&Plano', 'Empreendimento Plano&Plano em Parque São Domingos. Lançamento. Opções de 1 e 2 dormitório(s).', 'Rua Frederico Jacobi, 117 - Parque São Domingos', 'Parque São Domingos', 'São Paulo', 'SP', 'zona_norte',
     221552, '{1,2,3,4}'::int[], '{1,2}'::int[], 26.53, 35.99, false, 'lancamento', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Pet Agility','Piscina','Playground','Portaria','Quadra de Volei','Churrasqueira','Coworking','Delivery']::text[], 'https://www.youtube.com/watch?v=NemQTb5g3_g', 'https://www.planoeplano.com.br/estatico/2026/09/14/11/15/6ef9567b56b496a6f29b7ec6c2d88ce38cd49c7a.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/duetto-sao-domingos')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/09/14/11/15/6ef9567b56b496a6f29b7ec6c2d88ce38cd49c7a.jpg', 'Duetto São Domingos - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/09/14/11/15/7e302d7bffe15aee5ef6eed1bca158601c61b0b3.jpg', 'Duetto São Domingos - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/09/14/11/15/3238ad7001875166c277f58bb839c8f5d8a88e23.jpg', 'Duetto São Domingos - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/09/14/12/05/b764453fab853c82e524c984f33ba7232ef2d1e5.jpg', 'Planta ilustrativa - Duetto São Domingos', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/09/14/12/05/5d86b3a2445a4a55e46f24d5b1f4c4a075470041.jpg', 'Planta ilustrativa - Duetto São Domingos', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Praça Pirituba
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-plano-praca-pirituba-flora', 'Plano&Praça Pirituba', 'Plano&Plano', 'Empreendimento Plano&Plano em Pirituba. Lançamento. Opções de 2 dormitório(s).', 'Av. Cabo Adão Pereira, 648 - Pirituba', 'Pirituba', 'São Paulo', 'SP', 'zona_norte',
     278454, '{3,4}'::int[], '{2}'::int[], null, null, false, 'lancamento', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Piscina','Playground','Quadra','Praça Convívio','Churrasqueira','Coworking','Mini Mercado']::text[], null, 'https://www.planoeplano.com.br/estatico/2026/09/14/12/32/3e7fc4ab1c7a565c3f39b77dcec2898122398abf.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/plano-praca-pirituba/flora')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/09/14/12/32/3e7fc4ab1c7a565c3f39b77dcec2898122398abf.jpg', 'Plano&Praça Pirituba - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/09/14/12/32/4ed7e9141d565d51a30990c364e830e87b07142f.jpg', 'Plano&Praça Pirituba - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/09/14/12/32/085287aa9305b788badf354838cf2dff0e8d24c9.jpg', 'Plano&Praça Pirituba - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/06/02/16/14/50d1ef4a3df806f0ddee5efabf723bfdc1e902a2.jpg', 'Planta ilustrativa - Plano&Praça Pirituba', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/06/02/16/14/cada68b8a72e9f9a87936e7323ec702ea507876b.jpg', 'Planta ilustrativa - Plano&Praça Pirituba', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Bosque do Carmo - Pinheiro
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-plano-bosque-do-carmo-pinheiro', 'Plano&Bosque do Carmo - Pinheiro', 'Plano&Plano', 'Empreendimento Plano&Plano em Pq. do Carmo. Lançamento. Opções de 2 dormitório(s).', 'Av. Afonso de Sampaio e Souza, 299 - Pq. do Carmo', 'Pq. do Carmo', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 32.32, 34.77, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Piscina','Cinema Infantil','Churrasqueira','Picnic','Playground','Praça do Fogo','Quadra']::text[], 'https://www.youtube.com/watch?v=YbhebNZrkos', 'https://www.planoeplano.com.br/estatico/2026/09/11/17/07/ee858c7c8c47ee6e3e35e484336f6233759b5fa3.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/plano-bosque-do-carmo/pinheiro')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/09/11/17/07/ee858c7c8c47ee6e3e35e484336f6233759b5fa3.jpg', 'Plano&Bosque do Carmo - Pinheiro - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/09/11/17/07/0f99a636c291a39df1efce0797f805fb1f00310a.jpg', 'Plano&Bosque do Carmo - Pinheiro - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/09/11/17/07/64c72e3613109a05fbe92f3dfcee5b1301a7a7c9.jpeg', 'Plano&Bosque do Carmo - Pinheiro - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/09/11/17/18/568aada5300bfe97fd0c6097714bae39522fb1c7.jpg', 'Planta ilustrativa - Plano&Bosque do Carmo - Pinheiro', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/09/11/17/18/04e84c37833e3562bf639e13594782ac0450bc42.jpg', 'Planta ilustrativa - Plano&Bosque do Carmo - Pinheiro', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Bosque do Carmo - Eucalipto
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-plano-bosque-do-carmo-eucalipto-2', 'Plano&Bosque do Carmo - Eucalipto', 'Plano&Plano', 'Empreendimento Plano&Plano em Pq. do Carmo. Em construção. Opções de 2 dormitório(s).', 'Av. Afonso Sampaio e Souza nº 315 - Pq. do Carmo', 'Pq. do Carmo', 'São Paulo', 'SP', 'zona_leste',
     246302, '{1,2,3,4}'::int[], '{2}'::int[], 32.32, 34.77, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Churrasqueira','Cinema infantil','Cinema adulto','Redário','Playground','Picnic','Piscina']::text[], 'https://www.youtube.com/watch?v=YbhebNZrkos', 'https://www.planoeplano.com.br/estatico/2025/09/12/17/18/6e34aec4898c6a25bb0620b329bcb6ddd8a02e2b.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/plano-bosque-do-carmo/eucalipto-2')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/12/17/18/6e34aec4898c6a25bb0620b329bcb6ddd8a02e2b.jpg', 'Plano&Bosque do Carmo - Eucalipto - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/12/17/18/c9c83044b50572815f7a7c4cfcdc6cda9689fe32.jpg', 'Plano&Bosque do Carmo - Eucalipto - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/12/17/18/a07ef44fccfbd45571b6b6725f9a80d7c841b396.jpg', 'Plano&Bosque do Carmo - Eucalipto - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/09/12/17/20/9e3eac4003bbe92162eadf49d1919392434e13b4.jpg', 'Planta ilustrativa - Plano&Bosque do Carmo - Eucalipto', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/09/12/17/20/c5871919f9b7d0b84bacd2f8d037c1128522ded6.jpg', 'Planta ilustrativa - Plano&Bosque do Carmo - Eucalipto', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Bosque do Carmo - Palmeira
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-plano-bosque-do-carmo-palmeira-2', 'Plano&Bosque do Carmo - Palmeira', 'Plano&Plano', 'Empreendimento Plano&Plano em Pq. do Carmo. Lançamento. Opções de 2 dormitório(s).', 'Av. Afonso Sampaio e Souza nº 315 - Pq. do Carmo', 'Pq. do Carmo', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 32.32, 34.77, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Piscina','Churrasqueira','Cinema adulto','Cinema infantil','Playground','Coworking','Bem estar']::text[], 'https://www.youtube.com/watch?v=YbhebNZrkos', 'https://www.planoeplano.com.br/estatico/2025/09/12/17/26/ec6cff13f2f331463fbe0d66c82c40e120ea26cf.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/plano-bosque-do-carmo/palmeira-2')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/12/17/26/ec6cff13f2f331463fbe0d66c82c40e120ea26cf.jpg', 'Plano&Bosque do Carmo - Palmeira - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/12/17/26/1d4711a3f309501ee30a2b749ff675f8f783f959.jpg', 'Plano&Bosque do Carmo - Palmeira - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/12/17/26/cb6ca0053c7420ca6308f24d0b2b051c3cccb464.jpg', 'Plano&Bosque do Carmo - Palmeira - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/02/11/10/28/b1c3955c92cfdcbcff29b4ddc8be717ae611a502.jpg', 'Planta ilustrativa - Plano&Bosque do Carmo - Palmeira', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/02/11/10/28/b6f6cb417c64db06690848be1b4fd1ea722f4749.jpg', 'Planta ilustrativa - Plano&Bosque do Carmo - Palmeira', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Bosque do Carmo - Embaúba
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-plano-bosque-do-carmo-embauba', 'Plano&Bosque do Carmo - Embaúba', 'Plano&Plano', 'Empreendimento Plano&Plano em Pq. do Carmo. Lançamento. Opções de 2 dormitório(s).', 'Av. Afonso de Sampaio e Sousa, 299 - Pq. do Carmo', 'Pq. do Carmo', 'São Paulo', 'SP', 'zona_leste',
     244594, '{1,2,3,4}'::int[], '{2}'::int[], 32.32, 34.77, false, 'lancamento', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Piscina','Playground','Picnic','Cinema Infantil','Praça do Fogo','Churrasqueira','Quadra']::text[], 'https://www.youtube.com/watch?v=YbhebNZrkos', 'https://www.planoeplano.com.br/estatico/2026/06/02/11/48/5000ff924370c8348679cf35789abf051a3a43c7.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/plano-bosque-do-carmo/embauba')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/02/11/48/5000ff924370c8348679cf35789abf051a3a43c7.jpg', 'Plano&Bosque do Carmo - Embaúba - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/02/11/48/79bd28e4893b232e233099194a805262d7ff1764.jpg', 'Plano&Bosque do Carmo - Embaúba - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/02/11/48/025b1a1de20088ff1658e5ff1ded9af7c364c2a0.jpg', 'Plano&Bosque do Carmo - Embaúba - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/06/02/12/11/466fdbe35eceadc56aefe5ca1711f841cdb8c137.jpg', 'Planta ilustrativa - Plano&Bosque do Carmo - Embaúba', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/06/02/12/11/75653e88f718cb508f066e6fcd95e2825cbc518e.jpg', 'Planta ilustrativa - Plano&Bosque do Carmo - Embaúba', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Bosque do Carmo - Seringueira
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-plano-bosque-do-carmo-seringueira', 'Plano&Bosque do Carmo - Seringueira', 'Plano&Plano', 'Empreendimento Plano&Plano em Pq. do Carmo. Lançamento. Opções de 2 dormitório(s).', 'Av. Afonso de Sampaio e Sousa, 299 - Pq. do Carmo', 'Pq. do Carmo', 'São Paulo', 'SP', 'zona_leste',
     260418, '{1,2,3,4}'::int[], '{2}'::int[], 32.32, 34.77, false, 'lancamento', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Piscina','Cinema Adulto','Cinema Infantil','Redário','Playground','Picnic','Praça do fogo']::text[], 'https://www.youtube.com/watch?v=YbhebNZrkos', 'https://www.planoeplano.com.br/estatico/2025/10/17/16/45/d0eab58105a1f9e3ea087f9e2ef99bf40906d57a.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/plano-bosque-do-carmo/seringueira')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/10/17/16/45/d0eab58105a1f9e3ea087f9e2ef99bf40906d57a.jpg', 'Plano&Bosque do Carmo - Seringueira - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/10/17/16/45/163af44cd6bfd3cdf2c9c0fc0d14ba25c594ac9b.jpg', 'Plano&Bosque do Carmo - Seringueira - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/10/17/16/45/12d5cdd40fe957fc06c7fca345a241bc20e76571.jpg', 'Plano&Bosque do Carmo - Seringueira - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/10/20/16/54/d3e0d44b644eacc778a8f4cafbc9fb09277f5983.jpg', 'Planta ilustrativa - Plano&Bosque do Carmo - Seringueira', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/10/20/16/54/38bdabe7b38eac35341c77c445ea831ad2ccd84b.jpg', 'Planta ilustrativa - Plano&Bosque do Carmo - Seringueira', 1)) as v(tipo, url, legenda, ordem);

-- Jardim das Origens - Aruá
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-jardim-das-origens-arua', 'Jardim das Origens - Aruá', 'Plano&Plano', 'Empreendimento Plano&Plano em São Mateus. Lançamento. Opções de 2 dormitório(s).', 'R. Aguarico, S/N - São Mateus', 'São Mateus', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], null, null, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Piscina','Fitness']::text[], null, 'https://www.planoeplano.com.br/estatico/2026/10/06/15/22/b98fe4990be0dfc04ab54ae986cb4f2c6f609330.jpeg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/jardim-das-origens/arua')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/10/06/15/22/b98fe4990be0dfc04ab54ae986cb4f2c6f609330.jpeg', 'Jardim das Origens - Aruá - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/10/06/15/23/bac80ba443f684364dbe925cb085e35d033fdf41.jpg', 'Jardim das Origens - Aruá - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/10/06/15/24/aba2a9483b4d926b5967d0ef463877dd2e08433d.jpg', 'Jardim das Origens - Aruá - perspectiva ilustrada', 2)) as v(tipo, url, legenda, ordem);

-- Jardim das Origens - Mairá
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-jardim-das-origens-maira', 'Jardim das Origens - Mairá', 'Plano&Plano', 'Empreendimento Plano&Plano em São Mateus. Lançamento. Opções de 2 dormitório(s).', 'Rua Ayrton Rodrigues Leite, 97 - São Mateus', 'São Mateus', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], null, null, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', '{}'::text[], null, 'https://www.planoeplano.com.br/estatico/2026/10/30/18/18/08ec3752810692f4944268d8481f5bec161cda9b.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/jardim-das-origens/maira')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/10/30/18/18/08ec3752810692f4944268d8481f5bec161cda9b.png', 'Jardim das Origens - Mairá - perspectiva ilustrada', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/10/30/18/18/27299660441edc0a4b924bbe583561dcb60cd92f.png', 'Planta ilustrativa - Jardim das Origens - Mairá', 0)) as v(tipo, url, legenda, ordem);

-- Plano&Raízes das Mercês
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-romao-puiggari-marques-de-lages', 'Plano&Raízes das Mercês', 'Plano&Plano', 'Empreendimento Plano&Plano em Sacomã. Em construção. Opções de 1 e 2 dormitório(s).', 'Rua Romão Puiggari, 1025 - Sacomã', 'Sacomã', 'São Paulo', 'SP', 'zona_sul',
     228056, '{1,2,3,4}'::int[], '{1,2}'::int[], null, null, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Portaria','Churrasqueira','Mini quadra','Petplace','Playground']::text[], 'https://www.youtube.com/watch?v=6gIZt3NF4_0', 'https://www.planoeplano.com.br/estatico/2026/02/21/13/15/81c8ea5ac579ac971a593ae9d564af0d559a239a.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/romao-puiggari/marques-de-lages')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/02/21/13/15/81c8ea5ac579ac971a593ae9d564af0d559a239a.jpg', 'Plano&Raízes das Mercês - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/02/21/13/15/7577a4676e87049d4a4fff1372ff4eb1fac1fb2e.jpg', 'Plano&Raízes das Mercês - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/02/21/13/14/7ab73254ea2711c963821e21c15038b94adf0a59.jpg', 'Plano&Raízes das Mercês - perspectiva ilustrada', 2)) as v(tipo, url, legenda, ordem);

-- Mundo Park - Sólis
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-mundopark-solis', 'Mundo Park - Sólis', 'Plano&Plano', 'Empreendimento Plano&Plano em Campo Grande. Em construção. Opções de 1 e 2 dormitório(s).', 'Avenida Nossa Senhora do Sabará, 4780 - Campo Grande', 'Campo Grande', 'São Paulo', 'SP', 'zona_sul',
     262365, '{1,2,3,4}'::int[], '{1,2}'::int[], null, null, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Piscina','Cine','Praça do fogo','Ateliê','Beauty Place','Brinquedoteca','Coworking']::text[], 'https://www.youtube.com/watch?v=ucaA3YUqn0Y', 'https://www.planoeplano.com.br/estatico/2026/02/11/15/07/eec6ecdcb34d09b805e38547e6a695b9bd11e035.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/mundopark/solis')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/02/11/15/07/eec6ecdcb34d09b805e38547e6a695b9bd11e035.jpg', 'Mundo Park - Sólis - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/02/11/15/07/2ff9e02d73750773886198a9864aeea4be54426e.jpg', 'Mundo Park - Sólis - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/02/11/15/07/b7bed013926a7374f2bad25d97a2151eb663e664.jpg', 'Mundo Park - Sólis - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/02/11/15/10/790b37232a93b8bb761820978455a5e82fd07765.png', 'Planta ilustrativa - Mundo Park - Sólis', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/02/11/15/10/48c75310d28f8a0c659ef69ee72d3556f06bef92.png', 'Planta ilustrativa - Mundo Park - Sólis', 1)) as v(tipo, url, legenda, ordem);

-- Mundo Park - Alvorada
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-mundopark-alvorada', 'Mundo Park - Alvorada', 'Plano&Plano', 'Empreendimento Plano&Plano em Campo Grande. Em construção. Opções de 2 dormitório(s).', 'Av. Nossa Sra. do Sabará, 4780 - Campo Grande', 'Campo Grande', 'São Paulo', 'SP', 'zona_sul',
     251501, '{1,2,3,4}'::int[], '{2}'::int[], null, null, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Piscina','Voo Lazer','Quadra','Redário','Bicicletário','Playground','Churrasqueira']::text[], 'https://www.youtube.com/watch?v=ucaA3YUqn0Y', 'https://www.planoeplano.com.br/estatico/2025/03/18/16/06/a4004f34f0a728f0193bad623a781edb9e579103.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/mundopark/alvorada')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/03/18/16/06/a4004f34f0a728f0193bad623a781edb9e579103.jpg', 'Mundo Park - Alvorada - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/03/18/16/06/dbf82957c3253e67a6aef455a351548f747d7ba3.jpg', 'Mundo Park - Alvorada - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/03/18/16/06/b239e02dc4d3ca966249258fd7e93f5cc40b4317.jpg', 'Mundo Park - Alvorada - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/03/18/16/17/d986d5bd60a0753184358b1efe99777fc4e37bb0.jpg', 'Planta ilustrativa - Mundo Park - Alvorada', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/03/18/16/17/92265cb8f7565eb5fa56527f35554c8f14dd599c.jpg', 'Planta ilustrativa - Mundo Park - Alvorada', 1)) as v(tipo, url, legenda, ordem);

-- Mundo Park - Aurora
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-mundopark-aurora', 'Mundo Park - Aurora', 'Plano&Plano', 'Empreendimento Plano&Plano em Campo Grande. Em construção. Opções de 2 dormitório(s).', 'Av. Nossa Sra. do Sabará, 4780 - Campo Grande', 'Campo Grande', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{2}'::int[], null, null, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Piscina','Ateliê','Coworking','Salão de jogos','Espaço influencer','Espaço camarote','Beauty place']::text[], 'https://www.youtube.com/watch?v=ucaA3YUqn0Y', 'https://www.planoeplano.com.br/estatico/2025/06/09/09/26/3bb102b9e3ba2416b0d3dbd4718ffa0c66d33f4d.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/mundopark/aurora')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/06/09/09/26/3bb102b9e3ba2416b0d3dbd4718ffa0c66d33f4d.jpg', 'Mundo Park - Aurora - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/06/09/09/26/c76f555dcc0bddf4e1c239294ca1bdc99d0ebff2.jpg', 'Mundo Park - Aurora - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/06/09/09/26/2ac4cf2641aea3fc093c82b40f15d2e66e5003f9.jpg', 'Mundo Park - Aurora - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/06/09/09/34/06961eaf63ecc68acc4d1e4810b8be669286ef2b.png', 'Planta ilustrativa - Mundo Park - Aurora', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/06/09/09/34/157bed8f240798daddd8ad235aa787e158d21181.png', 'Planta ilustrativa - Mundo Park - Aurora', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Mais Butantã
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-eliseu-de-almeida', 'Plano&Mais Butantã', 'Plano&Plano', 'Empreendimento Plano&Plano em Butantã. Em construção. Opções de 1 e 2 dormitório(s).', 'Av. Eliseu de Almeida 1830 - Butantã', 'Butantã', 'São Paulo', 'SP', 'zona_oeste',
     219381, '{1,2,3,4}'::int[], '{1,2}'::int[], 27.38, 34.78, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Piscina','Petplace','Cinema','Playground','Praça Fogo','Quadra','Redário']::text[], 'https://www.youtube.com/watch?v=v7kpirGJn6c', 'https://www.planoeplano.com.br/estatico/2025/12/22/14/25/88a118ac9db527a3ccd5c17b3307a0455db66f67.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/eliseu-de-almeida')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/12/22/14/25/88a118ac9db527a3ccd5c17b3307a0455db66f67.jpg', 'Plano&Mais Butantã - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/12/22/14/25/58114d39572d32910ee411af33e57dab11596cbe.jpg', 'Plano&Mais Butantã - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/12/22/14/25/160fd92de87a53b2c60c9644c02a99fa9335cf6f.jpg', 'Plano&Mais Butantã - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/12/22/15/30/a325ff3dbb7d29d8f5e1bb21f527171ad65e1a6e.jpg', 'Planta ilustrativa - Plano&Mais Butantã', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/12/22/15/31/085e0d04e82bca3f35de00f43357e1cfd8b3de62.jpg', 'Planta ilustrativa - Plano&Mais Butantã', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Park Santo Amaro
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planopark-santo-amaro', 'Plano&Park Santo Amaro', 'Plano&Plano', 'Empreendimento Plano&Plano em Santo Amaro. Em construção. Opções de 1 e 2 dormitório(s).', 'Av. Guido Caloi, 1062 - Santo Amaro', 'Santo Amaro', 'São Paulo', 'SP', 'zona_sul',
     244097, '{1,2,3,4}'::int[], '{1,2}'::int[], null, null, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Portaria','Churrasqueira','Playground','Lounge Lareira','Praça','Praça Food Bike','Quadra']::text[], 'https://www.youtube.com/watch?v=8Qeky1BWGZQ', 'https://www.planoeplano.com.br/estatico/2026/02/02/11/04/4f68c9bdf7b1c8ec8ecfcc5a76256d0b47993f83.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planopark-santo-amaro')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/02/02/11/04/4f68c9bdf7b1c8ec8ecfcc5a76256d0b47993f83.jpg', 'Plano&Park Santo Amaro - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/02/02/11/04/5afe1c6877636323c95ae98e39f83e238c7d60c0.jpg', 'Plano&Park Santo Amaro - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/02/02/11/04/ee52cd1e3a00559f4d53c59f582e86e7bdcb9fad.jpg', 'Plano&Park Santo Amaro - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/02/02/11/23/814e9593be16d9e4cefc18fee77c3b43515b12a4.jpg', 'Planta ilustrativa - Plano&Park Santo Amaro', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/02/02/11/23/02c3b53c03df483ff9bac4951d10fdca05728ab0.jpg', 'Planta ilustrativa - Plano&Park Santo Amaro', 1)) as v(tipo, url, legenda, ordem);

-- Visconde de Parnaíba
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-visconde-de-parnaiba', 'Visconde de Parnaíba', 'Plano&Plano', 'Empreendimento Plano&Plano em Belém. Lançamento.', 'Rua Visconde de Parnaíba, 2737 - Belém', 'Belém', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{}'::int[], null, null, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', '{}'::text[], null, null, false, false, 'https://www.comprarseuap.com.br/akali/imoveis/visconde-de-parnaiba')
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
select 1 from d;

-- Oriz by Plano&Plano - Oriz Residencial
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-oriz-by-planoplano-residencial', 'Oriz by Plano&Plano - Oriz Residencial', 'Plano&Plano', 'Empreendimento Plano&Plano em Campo Belo. Imóvel pronto para morar. Opções de 1 e 2 dormitório(s).', 'Rua Dom Manuel, 35 - Campo Belo', 'Campo Belo', 'São Paulo', 'SP', 'zona_sul',
     392595, '{3,4}'::int[], '{1,2}'::int[], 28.04, 42, false, 'pronto', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Fitness','Lobby e Coworking']::text[], 'https://www.youtube.com/watch?v=2sVUXU2ar3U', 'https://www.planoeplano.com.br/estatico/2026/07/28/14/50/919bc463d44312200797fcc847aa1a5c5673157c.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/oriz-by-planoplano/residencial')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/07/28/14/50/919bc463d44312200797fcc847aa1a5c5673157c.png', 'Oriz by Plano&Plano - Oriz Residencial - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/07/28/14/50/2ee356735683f3bae2f41b163e516713d608e8aa.png', 'Oriz by Plano&Plano - Oriz Residencial - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/07/28/14/50/b65ead09319b73ae5b14d2931704fd8db58254f2.png', 'Oriz by Plano&Plano - Oriz Residencial - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/07/20/23/49/331c3e0112585e787e9b8d9197fa4516490c41b1.png', 'Planta ilustrativa - Oriz by Plano&Plano - Oriz Residencial', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/12/19/13/47/1452b104c5a95c5ab47350d9e451a5d00ba5ef61.jpg', 'Planta ilustrativa - Oriz by Plano&Plano - Oriz Residencial', 1)) as v(tipo, url, legenda, ordem);

-- Oriz by Plano&Plano - Oriz Studios
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-oriz-by-planoplano-studios', 'Oriz by Plano&Plano - Oriz Studios', 'Plano&Plano', 'Empreendimento Plano&Plano em Campo Belo. Imóvel pronto para morar. Opções de 1 dormitório(s).', 'Rua Dom Manuel, 35 - Campo Belo', 'Campo Belo', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{1}'::int[], 22.1, 33.85, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Piscina','Fitness','Lobby e Coworking']::text[], 'https://www.youtube.com/watch?v=inRJDEYecVQ', 'https://www.planoeplano.com.br/estatico/2026/07/28/14/50/fd5baf0075ce80dfe521b087ebde8f19e15c1d37.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/oriz-by-planoplano/studios')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/07/28/14/50/fd5baf0075ce80dfe521b087ebde8f19e15c1d37.png', 'Oriz by Plano&Plano - Oriz Studios - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/07/28/14/50/588dff933c201f42ea6f2d8261ea81747e04b4e4.png', 'Oriz by Plano&Plano - Oriz Studios - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/07/28/14/50/22fd5483de16bd285b999b37ddb2ec1c97907a08.png', 'Oriz by Plano&Plano - Oriz Studios - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/07/20/23/52/d5d72c10dc79096a915caa9d34a2a75a7af2be99.png', 'Planta ilustrativa - Oriz by Plano&Plano - Oriz Studios', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/07/20/23/52/c9ef75b07cec5504fe16d832c0b72717b5ec829b.png', 'Planta ilustrativa - Oriz by Plano&Plano - Oriz Studios', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Jaçanã
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planojacana', 'Plano&Jaçanã', 'Plano&Plano', 'Empreendimento Plano&Plano em Jaçanã. Em construção. Opções de 2 dormitório(s).', 'Av. Luís Stamatis, 1020 - Jaçanã', 'Jaçanã', 'São Paulo', 'SP', 'zona_norte',
     269026, '{1,2,3,4}'::int[], '{2}'::int[], 34.02, 35.37, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Cinema Adulto','Petplace','Praça do fogo','Churrasqueira','Feirinha','Cinema infantil','Playground']::text[], 'https://www.youtube.com/watch?v=xtWJhM78t1M', 'https://www.planoeplano.com.br/estatico/2025/09/08/18/48/cf4780cd588a33e904c0f9e48b75fe4d815d8b17.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planojacana')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/08/18/48/cf4780cd588a33e904c0f9e48b75fe4d815d8b17.jpg', 'Plano&Jaçanã - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/08/18/48/92dec3f48d17503e3f2c40ec09be2a7b3410ae44.jpg', 'Plano&Jaçanã - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/08/18/48/21ea65a51a5ff1cee6fbc90f65d17fde1bd44b4c.jpg', 'Plano&Jaçanã - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/09/09/09/38/15146d01a6898809c76c330cf0a1307139a5fe9b.jpg', 'Planta ilustrativa - Plano&Jaçanã', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/09/09/09/38/35072eccc292b63fb7901901c624ed083cbed507.jpg', 'Planta ilustrativa - Plano&Jaçanã', 1)) as v(tipo, url, legenda, ordem);

-- Oaz Club Santo Amaro
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-oazclub-santoamaro', 'Oaz Club Santo Amaro', 'Plano&Plano', 'Empreendimento Plano&Plano em Santo Amaro. Lançamento. Opções de 1 e 2 dormitório(s).', 'Av. Guido Caloi, 1002 - Santo Amaro', 'Santo Amaro', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{1,2}'::int[], 32.64, 36.2, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Espaço Pet','Feirinha','Piscina','Playground','Portaria','Praça da Lareira','Atelie','Bem estar']::text[], null, 'https://www.planoeplano.com.br/estatico/2026/04/01/18/06/5eb5d5f69f74dc4872b3efa1c6c9f9d82df12a7a.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/oazclub-santoamaro')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/04/01/18/06/5eb5d5f69f74dc4872b3efa1c6c9f9d82df12a7a.jpg', 'Oaz Club Santo Amaro - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/04/01/18/06/45efaa56b1e669885e4b5f2f7bb247e5d96f9a0c.jpg', 'Oaz Club Santo Amaro - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/04/01/18/06/2b1f282828db1a9c1803b2c7849a4843d4dd048e.jpg', 'Oaz Club Santo Amaro - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/04/01/18/24/1939e8d13d71de38c17f4ca59a136f17ce162952.jpg', 'Planta ilustrativa - Oaz Club Santo Amaro', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/04/01/18/24/dc9e84bb5be0a6acd1ef5ddfdded25a7e8172864.jpg', 'Planta ilustrativa - Oaz Club Santo Amaro', 1)) as v(tipo, url, legenda, ordem);

-- Centro&Santa Cecília
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-centroe-santacecilia', 'Centro&Santa Cecília', 'Plano&Plano', 'Empreendimento Plano&Plano em Campos Elíseos. Em construção. Opções de 1 e 2 dormitório(s).', 'Rua Conselheiro Nébias, 348 - Campos Elíseos', 'Campos Elíseos', 'São Paulo', 'SP', 'centro',
     312164, '{3,4}'::int[], '{1,2}'::int[], 24.16, 35.47, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Lounge Rooftop','Pet Place','Portaria','Churrasqueira Rooftop','Churrasqueira','Playground','Redário']::text[], 'https://www.youtube.com/watch?v=usPUF3oTdNs', 'https://www.planoeplano.com.br/estatico/2025/09/29/12/01/101871d752ba3806f00ad0688a68fbe353218567.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/centroe-santacecilia')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/29/12/01/101871d752ba3806f00ad0688a68fbe353218567.jpg', 'Centro&Santa Cecília - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/29/12/01/eae5e416e24e528573632a54401c8ad5b13c4eb9.jpg', 'Centro&Santa Cecília - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/29/12/01/81d832d6e61128809a3d4cd5c51b500247a671cc.jpg', 'Centro&Santa Cecília - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/09/29/12/22/60581c8e0356a6c18f4a7fdaff67fa98110b16be.png', 'Planta ilustrativa - Centro&Santa Cecília', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/09/29/12/22/9c507ef97899aeb8078d0f0c651fc6f0f8624280.png', 'Planta ilustrativa - Centro&Santa Cecília', 1)) as v(tipo, url, legenda, ordem);

-- Centro&Barão de Campinas
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-centroe-baraodecampinas', 'Centro&Barão de Campinas', 'Plano&Plano', 'Empreendimento Plano&Plano em Campos Elíseos. Em construção. Opções de 1 e 2 dormitório(s).', 'Rua Barão de Campinas, 305 - Santa Cecília - Campos Elíseos', 'Campos Elíseos', 'São Paulo', 'SP', 'centro',
     339562, '{3,4}'::int[], '{1,2}'::int[], 24.41, 32.09, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Lazer','Praça','Churrasqueira','Playground','Fitness','Lavanderia','Brinquedoteca']::text[], 'https://www.youtube.com/watch?v=Pp2U2JS9sfk', 'https://www.planoeplano.com.br/estatico/2025/09/29/13/00/6f71044f6ec014ba68042fc0c23dd54cc967ab5a.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/centroe-baraodecampinas')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/29/13/00/6f71044f6ec014ba68042fc0c23dd54cc967ab5a.jpg', 'Centro&Barão de Campinas - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/29/13/00/af9335452442a7ed760c20afa6afaff3c0d1bac0.jpg', 'Centro&Barão de Campinas - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/29/13/00/234417ede8983605679813b7a9526e01a71d966d.jpg', 'Centro&Barão de Campinas - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/09/26/18/08/63d1d4684dd632c54ae5b238332175d1f19c4874.png', 'Planta ilustrativa - Centro&Barão de Campinas', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/09/26/18/08/f0c95e83c5f84a8db8d9c2608c2cf60c87be6c7c.png', 'Planta ilustrativa - Centro&Barão de Campinas', 1)) as v(tipo, url, legenda, ordem);

-- Centro&Campos Elíseos
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-centrocampos-eliseos', 'Centro&Campos Elíseos', 'Plano&Plano', 'Empreendimento Plano&Plano em Campos Elíseos. Lançamento. Opções de 2 dormitório(s).', 'Av. Duque de Caxias, nº 864 - Campos Elíseos', 'Campos Elíseos', 'São Paulo', 'SP', 'centro',
     null, '{}'::int[], '{2}'::int[], null, null, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', '{}'::text[], null, null, false, false, 'https://www.comprarseuap.com.br/akali/imoveis/centrocampos-eliseos')
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
select 1 from d;

-- Meu Plano&Itaquera - Ipê
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-meu-plano-itaquera-ipe-4', 'Meu Plano&Itaquera - Ipê', 'Plano&Plano', 'Empreendimento Plano&Plano em Itaquera. Em construção. Opções de 2 dormitório(s).', 'Rua Ioneji Matsubayashi, 1065 - Próx. Rua Zenichi Sato - Itaquera', 'Itaquera', 'São Paulo', 'SP', 'zona_leste',
     230908, '{1,2,3,4}'::int[], '{2}'::int[], 31.68, 34.34, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Churrasqueira','Influencer','Delivery','Festas Infantil','Espaço Animal','Jogos','Salão de festas','Mini Mercado']::text[], 'https://www.youtube.com/watch?v=5D0Lz_xd0eo', 'https://www.planoeplano.com.br/estatico/2025/08/27/11/20/48536588309241df3f35ab0008c1434445e39b53.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/meu-plano-itaquera/ipe-4')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/08/27/11/20/48536588309241df3f35ab0008c1434445e39b53.jpg', 'Meu Plano&Itaquera - Ipê - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/12/18/25/4799992818ab0453e271b22bd563bf2f16d85026.jpg', 'Meu Plano&Itaquera - Ipê - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/12/18/25/9052bbc98c6796b741de7999d0609b8c0e64f547.jpg', 'Meu Plano&Itaquera - Ipê - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/08/27/15/33/ec620b6c03a6fb4560df01598a68c8bd6870f863.jpg', 'Planta ilustrativa - Meu Plano&Itaquera - Ipê', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/08/27/15/33/1128a8744ee6fed858d9e5c5d3b1b98d690513ac.jpg', 'Planta ilustrativa - Meu Plano&Itaquera - Ipê', 1)) as v(tipo, url, legenda, ordem);

-- Meu Plano&Itaquera - Amoreira
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-meu-plano-itaquera-amoreira', 'Meu Plano&Itaquera - Amoreira', 'Plano&Plano', 'Empreendimento Plano&Plano em Itaquera. Em construção. Opções de 2 dormitório(s).', 'Rua Ioneji Matsubayashi, 985 - Itaquera', 'Itaquera', 'São Paulo', 'SP', 'zona_leste',
     246339, '{1,2,3,4}'::int[], '{2}'::int[], 31.68, 34.34, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Churrasqueira','Brinquedoteca','Salão de festas']::text[], 'https://www.youtube.com/watch?v=5D0Lz_xd0eo', 'https://www.planoeplano.com.br/estatico/2025/08/27/11/08/95c75d91c79abeeaba9acfbe7d84da4c85fd3afc.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/meu-plano-itaquera/amoreira')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/08/27/11/08/95c75d91c79abeeaba9acfbe7d84da4c85fd3afc.jpg', 'Meu Plano&Itaquera - Amoreira - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/08/27/11/11/ec400eea5fe339b29882511ce30b156be2a99b90.jpg', 'Meu Plano&Itaquera - Amoreira - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/08/27/11/11/0f7a3331da24bfbe8778eb58cb72cb627f10a14a.jpg', 'Meu Plano&Itaquera - Amoreira - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/08/27/15/23/3f8c77a44a955d7b506b9ce84a7c53a79ffd710c.jpg', 'Planta ilustrativa - Meu Plano&Itaquera - Amoreira', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/08/27/15/23/0861fdf8c1ff870d16a105875d680e62194af420.jpg', 'Planta ilustrativa - Meu Plano&Itaquera - Amoreira', 1)) as v(tipo, url, legenda, ordem);

-- UNNI Brás
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-unni-bras', 'UNNI Brás', 'Plano&Plano', 'Empreendimento Plano&Plano em Brás. Em construção. Opções de 1 e 2 dormitório(s).', 'R. Alegria - Brás', 'Brás', 'São Paulo', 'SP', 'centro',
     326824, '{3,4}'::int[], '{1,2}'::int[], null, null, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Piscina Adulto','Churrasqueira','Espaço Pet','Playground','Rooftop']::text[], 'https://www.youtube.com/watch?v=uvgh6iZvbTs', 'https://www.planoeplano.com.br/estatico/2025/03/13/18/29/cec6d4feadff7779f399ee5b5dd2838361a625de.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/unni-bras')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/03/13/18/29/cec6d4feadff7779f399ee5b5dd2838361a625de.jpg', 'UNNI Brás - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/03/13/18/29/154546ee47886712d10594353df38d627022573b.jpg', 'UNNI Brás - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/03/13/18/29/0c2e877d0b2154df5d3fb36048913e424a0a4987.jpg', 'UNNI Brás - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/03/13/18/59/72682555f3fef48ba9ae3d3ba9235e5cbffb14af.jpg', 'Planta ilustrativa - UNNI Brás', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/03/13/18/59/f9100896e3b0e4ea0b6f762b040eeeda9fce998a.jpg', 'Planta ilustrativa - UNNI Brás', 1)) as v(tipo, url, legenda, ordem);

-- Start Joy
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-start-joy', 'Start Joy', 'Plano&Plano', 'Empreendimento Plano&Plano em Centro, São Bernardo do Campo. Em construção. Opções de 1 e 2 dormitório(s).', 'Rua Ruy Barbosa, 395 - São Bernardo do Campo', 'Centro', 'São Bernardo do Campo', 'SP', 'grande_sp',
     359974, '{3,4}'::int[], '{1,2}'::int[], 42.15, 54.07, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Piscina','Quadra','Playground','Pergolado','Churrasqueira']::text[], 'https://www.youtube.com/watch?v=_LkABdkxICk', 'https://www.planoeplano.com.br/estatico/2025/02/07/18/40/9a2351f44a50af199157fa72afac844b5806ad92.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/start-joy')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/02/07/18/40/9a2351f44a50af199157fa72afac844b5806ad92.jpg', 'Start Joy - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/02/07/18/44/05384425031640ba481c852908857b6b2fcc4e1a.jpg', 'Start Joy - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/02/07/18/44/4fdeb2bea30276040415bf9970fb9407010bac0b.jpg', 'Start Joy - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/12/11/14/46/14264344d71403ee0064d5aa8e46e95b97ac95a2.png', 'Planta ilustrativa - Start Joy', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/12/11/14/46/c2e3efd6e4dd8d72a7fb5a94d83367daa10e74b5.png', 'Planta ilustrativa - Start Joy', 1)) as v(tipo, url, legenda, ordem);

-- UNNI Mansões
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-unni-mansoes', 'UNNI Mansões', 'Plano&Plano', 'Empreendimento Plano&Plano em Mansões Santo Antônio, Campinas. Em construção. Opções de 2 dormitório(s).', 'Rua Hermantino Coelho, 336 - Mansões Santo Antônio, Campinas', 'Mansões Santo Antônio', 'Campinas', 'SP', 'interior',
     null, '{}'::int[], '{2}'::int[], null, null, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Piscina','Piscina Infantil','Churrasqueira','Fitness Externo','Pet Place','Praça Luau','Playground','Quadra']::text[], 'https://www.youtube.com/watch?v=r3ZIcSsMJWE', 'https://www.planoeplano.com.br/estatico/2025/02/04/12/12/17b1154b8133ef922b8623e473a365272137ae65.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/unni-mansoes')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/02/04/12/12/17b1154b8133ef922b8623e473a365272137ae65.jpg', 'UNNI Mansões - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/02/04/12/12/a3755216e973f7c33d595f46ad94d0ebe0a4dcda.jpg', 'UNNI Mansões - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/02/04/12/13/03da7c09267563ad3f7f1c053ac31b7bae752d3d.jpg', 'UNNI Mansões - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/02/04/14/08/84791ecd90a1483d9dd85acfe1f5443f2233e68e.jpg', 'Planta ilustrativa - UNNI Mansões', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/02/04/14/08/6bfba6d8dc90bd57d77254e55fe1dd1d3c2bd56e.jpg', 'Planta ilustrativa - UNNI Mansões', 1)) as v(tipo, url, legenda, ordem);

-- Viz by Plano&Plano
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-viz-by-planoplano', 'Viz by Plano&Plano', 'Plano&Plano', 'Empreendimento Plano&Plano em Santo Amaro. Imóvel pronto para morar. Opções de 1 e 2 dormitório(s).', 'Avenida Mário Lopes Leão, 08 - Santo Amaro', 'Santo Amaro', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{1,2}'::int[], 29.94, 36.87, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Piscina','Fitness']::text[], 'https://www.youtube.com/watch?v=cDZirHtxN8k', 'https://www.planoeplano.com.br/estatico/2026/07/28/15/06/a055aa3ac8a4883022d43ce1b1dad7ad3b194251.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/viz-by-planoplano')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/07/28/15/06/a055aa3ac8a4883022d43ce1b1dad7ad3b194251.png', 'Viz by Plano&Plano - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/07/28/15/06/da00800a766dff0b5797dae030b4fd862bfe484f.png', 'Viz by Plano&Plano - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/07/28/15/06/962a14455da0c8d1930b972be01537f4d3076e5e.png', 'Viz by Plano&Plano - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/08/23/17/14/23b8b2f610934d57f022e25c85bfd3bb6e2ead44.jpg', 'Planta ilustrativa - Viz by Plano&Plano', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/08/23/17/14/f666fc91fd05014719b359ee69b1aa6cd3ad2728.jpg', 'Planta ilustrativa - Viz by Plano&Plano', 1)) as v(tipo, url, legenda, ordem);

-- Unni by Plano&Plano - Harmoni
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-unni-by-planoplano-harmoni', 'Unni by Plano&Plano - Harmoni', 'Plano&Plano', 'Empreendimento Plano&Plano em Bairro do Limão. Em construção. Opções de 2 e 3 dormitório(s).', 'Rua Mateus Mascarenhas, 424 - Bairro do Limão', 'Bairro do Limão', 'São Paulo', 'SP', 'zona_norte',
     426479, '{4}'::int[], '{2,3}'::int[], 47.2, 60.52, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Portaria','Espaço Pet','Fire Place','Ginástica Externa','Playground','Quadra','Delivery']::text[], 'https://www.youtube.com/watch?v=rwFpVzxQHPE', 'https://www.planoeplano.com.br/estatico/2023/12/13/15/03/1183371f818b86f1c967ade7baac71be58395be0.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/unni-by-planoplano/harmoni')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/12/13/15/03/1183371f818b86f1c967ade7baac71be58395be0.jpg', 'Unni by Plano&Plano - Harmoni - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/10/16/14/30/aca7c8c9481ae99fd0c4658227ed9178c2f7a070.jpg', 'Unni by Plano&Plano - Harmoni - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/12/13/15/03/6b072cb2203a01da672546f44a91ab819213bfdb.jpg', 'Unni by Plano&Plano - Harmoni - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/10/17/11/15/cfbc7012c68ac1eee9a6692e7b3b2166b81e3e62.jpg', 'Planta ilustrativa - Unni by Plano&Plano - Harmoni', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/10/17/11/15/3eb27d703cdb8c9a8374f1a069ae600e79b2e697.jpg', 'Planta ilustrativa - Unni by Plano&Plano - Harmoni', 1)) as v(tipo, url, legenda, ordem);

-- Unni by Plano&Plano - Felicitá
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-unni-by-planoplano-felicita', 'Unni by Plano&Plano - Felicitá', 'Plano&Plano', 'Empreendimento Plano&Plano em Bairro do Limão. Lançamento. Opções de 2 e 3 dormitório(s).', 'Rua Coronel Mário de Azevedo, 174 - Bairro do Limão', 'Bairro do Limão', 'São Paulo', 'SP', 'zona_norte',
     542086, '{4}'::int[], '{2,3}'::int[], 44.63, 59.05, false, 'lancamento', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Portaria','Fire Place','Espaço Piquenique','Quadra Esportiva','Playground','Redário','Ginástica Externa']::text[], 'https://www.youtube.com/watch?v=rwFpVzxQHPE', 'https://www.planoeplano.com.br/estatico/2023/12/13/14/44/baeceeca6c1ecc994462c699dd695c062d34cadb.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/unni-by-planoplano/felicita')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/12/13/14/44/baeceeca6c1ecc994462c699dd695c062d34cadb.jpg', 'Unni by Plano&Plano - Felicitá - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/12/13/14/44/0f17833aed566c755315e16ba9fe3f614f9f0142.jpg', 'Unni by Plano&Plano - Felicitá - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/12/13/14/45/f5c94684d4ef0467185029eb7060160f5017de3e.jpg', 'Unni by Plano&Plano - Felicitá - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/10/17/11/11/6065d1bd79adcdedb1d50f2df9e73326430e7916.jpg', 'Planta ilustrativa - Unni by Plano&Plano - Felicitá', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/10/17/11/11/759a5b40004bbe81b21e12f6fba5d2a0d1609c80.jpg', 'Planta ilustrativa - Unni by Plano&Plano - Felicitá', 1)) as v(tipo, url, legenda, ordem);

-- Vila Boulevard Mooca
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-vila-boulevard-mooca', 'Vila Boulevard Mooca', 'Plano&Plano', 'Empreendimento Plano&Plano em Mooca. Em construção. Opções de 1 e 2 dormitório(s).', 'Rua dos Trilhos, 134 - Mooca', 'Mooca', 'São Paulo', 'SP', 'zona_leste',
     255233, '{1,2,3,4}'::int[], '{1,2}'::int[], 25, 37, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Churrasqueira','Lounge lareira','Piscina adulto','Voo piscinas','Pet place','Playground','Redário','Espaço gourmet']::text[], 'https://www.youtube.com/watch?v=LpvUpPofARI', 'https://www.planoeplano.com.br/estatico/2025/05/16/10/40/81853d8b4a12a55527ba55e3c01c7dedcb2cbc8d.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/vila-boulevard-mooca')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/05/16/10/40/81853d8b4a12a55527ba55e3c01c7dedcb2cbc8d.png', 'Vila Boulevard Mooca - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/05/16/10/40/fda81e08ce8f0777e7cea70355eb1425e9843f5a.png', 'Vila Boulevard Mooca - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/05/16/10/40/f7d9817762857b2765ffea0f91a8bf20d123c7c5.png', 'Vila Boulevard Mooca - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/05/16/10/53/2f943123a5ab74d162d8569ab10114428557b5ea.jpg', 'Planta ilustrativa - Vila Boulevard Mooca', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/05/16/10/53/a1a8ac6804c744aa3a7a5f0439c8d8ffe5ede43f.jpg', 'Planta ilustrativa - Vila Boulevard Mooca', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Vila Leopoldina - Sebastião Bach
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planoe-vilaleopoldina-sebastiao-bach', 'Plano&Vila Leopoldina - Sebastião Bach', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Leopoldina. Lançamento. Opções de 1 e 2 dormitório(s).', 'Rua Carlos Weber, 184 - Vila Leopoldina', 'Vila Leopoldina', 'São Paulo', 'SP', 'zona_oeste',
     237709, '{1,2,3,4}'::int[], '{1,2}'::int[], 26.99, 35.23, false, 'lancamento', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Piscina Adulto','Piscina Infantil','Rooftop','Churrasqueira','Playground','Área Externa','Quadra']::text[], 'https://www.youtube.com/watch?v=-HDSdSMERTc', 'https://www.planoeplano.com.br/estatico/2026/02/12/15/07/cd68fdadbe0c63a30529a559f5050201dfcf70fc.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planoe-vilaleopoldina/sebastiao-bach')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/02/12/15/07/cd68fdadbe0c63a30529a559f5050201dfcf70fc.jpg', 'Plano&Vila Leopoldina - Sebastião Bach - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/02/12/15/07/3da01abe164b8714baa2589f40b211bb51164263.jpg', 'Plano&Vila Leopoldina - Sebastião Bach - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/02/12/15/07/2fdb8b19cac0990a3178c8729e65a429680901b0.jpg', 'Plano&Vila Leopoldina - Sebastião Bach - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/08/21/15/55/5bcb769978d58f937decb4ffa16a73d843e1df86.png', 'Planta ilustrativa - Plano&Vila Leopoldina - Sebastião Bach', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/08/21/15/55/523aef80584dedf6f818e4be73fa1fc4fd932ff9.png', 'Planta ilustrativa - Plano&Vila Leopoldina - Sebastião Bach', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Vila Leopoldina - Carlos Weber
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planoe-vilaleopoldina-carlos-weber', 'Plano&Vila Leopoldina - Carlos Weber', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Leopoldina. Em construção. Opções de 1 e 2 dormitório(s).', 'Rua Carlos Weber, S/N - Vila Leopoldina', 'Vila Leopoldina', 'São Paulo', 'SP', 'zona_oeste',
     244414, '{1,2,3,4}'::int[], '{1,2}'::int[], 32.31, 35.23, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Brinquedoteca','Mini mercado','Fitness','Coworking','Lavanderia','Churrasqueira','Salão de festas']::text[], 'https://www.youtube.com/watch?v=-HDSdSMERTc', 'https://www.planoeplano.com.br/estatico/2025/09/10/11/39/ef5510e2bda533f220d1a54bbcc56f1c4adfb7e7.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planoe-vilaleopoldina/carlos-weber')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/10/11/39/ef5510e2bda533f220d1a54bbcc56f1c4adfb7e7.png', 'Plano&Vila Leopoldina - Carlos Weber - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/10/11/39/5d0e2dc1423f78a8be9bf954d7abb2985f427695.png', 'Plano&Vila Leopoldina - Carlos Weber - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/09/10/11/39/9a9cee3aa0125f076a240b69935f5952ac3634cc.png', 'Plano&Vila Leopoldina - Carlos Weber - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/11/14/12/18/0dcf56d70bc5713f9fad722256544edee7bd8a35.jpg', 'Planta ilustrativa - Plano&Vila Leopoldina - Carlos Weber', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/10/20/15/33/7ebb0cecd98b8afc14609bc50c43181f33b3596a.jpg', 'Planta ilustrativa - Plano&Vila Leopoldina - Carlos Weber', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Alto Cantareira
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planoalto-cantareira', 'Plano&Alto Cantareira', 'Plano&Plano', 'Empreendimento Plano&Plano em Jaraguá. Lançamento. Opções de 2 dormitório(s).', 'Rua Tuneiras do Oeste, 420 - Jaraguá', 'Jaraguá', 'São Paulo', 'SP', 'zona_norte',
     null, '{}'::int[], '{2}'::int[], 32.37, 34.84, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Piscina','Churrasqueira','Mini Quadra','Playground','Brinquedoteca','Bem Estar','Mini Mercado']::text[], 'https://www.youtube.com/watch?v=-tDPr3gxAyw', 'https://www.planoeplano.com.br/estatico/2024/12/12/14/59/09643f136a50be997479ee87e5b8c0fe1ab738c6.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planoalto-cantareira')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/12/12/14/59/09643f136a50be997479ee87e5b8c0fe1ab738c6.png', 'Plano&Alto Cantareira - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/12/12/14/59/e535504bd7f50cee10c91a202a167ac14cf492dc.png', 'Plano&Alto Cantareira - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/12/12/15/00/c1ff5f444350e49ddcec521224de7c5c1cda8a5d.png', 'Plano&Alto Cantareira - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/12/12/15/25/c187fb772929fb8815ca73afcaf0815c0ccbf0f8.png', 'Planta ilustrativa - Plano&Alto Cantareira', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/12/12/15/25/838e436789bb2418b8237aa23c0cb453c7060af3.png', 'Planta ilustrativa - Plano&Alto Cantareira', 1)) as v(tipo, url, legenda, ordem);

-- NID Alphaville
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-nid-alphaville', 'NID Alphaville', 'Plano&Plano', 'Empreendimento Plano&Plano em Alphaville, Barueri. Em construção. Opções de 2 dormitório(s).', 'Av. Sylvio Honório Álvares Penteado, 206 - Alphaville, Barueri', 'Alphaville', 'Barueri', 'SP', 'grande_sp',
     826463, '{}'::int[], '{2}'::int[], 75, 76, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Casa de campo externa','Acqua boulevard','Playground','Beach tênis','Churrasqueira','Piscina com bangalô','Piscina']::text[], 'https://www.youtube.com/watch?v=DoGywI4DD9s', 'https://www.planoeplano.com.br/estatico/2025/07/18/09/35/9bc46236779d75c78706f14881ed5f0bffedcce2.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/nid-alphaville')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/07/18/09/35/9bc46236779d75c78706f14881ed5f0bffedcce2.jpg', 'NID Alphaville - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/07/17/13/53/6ec585acb1708a571b46a3e58fc821e88d34db19.png', 'NID Alphaville - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/07/17/13/53/161682298c2416cc7d3d2424f354a49397fc266c.png', 'NID Alphaville - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/12/09/10/32/e6c29bebba3c4f43be2756b45374225a6542d62a.png', 'Planta ilustrativa - NID Alphaville', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/12/08/17/45/fb446193eaab938ab12ede82b29936939a8607f5.jpg', 'Planta ilustrativa - NID Alphaville', 1)) as v(tipo, url, legenda, ordem);

-- Portal Pacaembu - Vila Matarazzo
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-portal-pacaembu-vila-matarazzo', 'Portal Pacaembu - Vila Matarazzo', 'Plano&Plano', 'Empreendimento Plano&Plano em Barra Funda. Em construção. Opções de 2 dormitório(s).', 'Rua dos Americanos, 615 - Barra Funda', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     309383, '{3,4}'::int[], '{2}'::int[], 32.59, 35, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Playground','Churrasqueira','Bicicletário','Espaço Pet','Coworking','Sala de Ginástica','Brinquedoteca','Salão de Festas']::text[], 'https://www.youtube.com/watch?v=82gSipq73TE', 'https://www.planoeplano.com.br/estatico/2024/05/20/15/17/1318f9a6eabb8d3de5478d6fc76b74f6302da8f7.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/portal-pacaembu/vila-matarazzo')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/20/15/17/1318f9a6eabb8d3de5478d6fc76b74f6302da8f7.png', 'Portal Pacaembu - Vila Matarazzo - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/20/15/17/7beec79c0e957e357d98df03574c2660a9dcf892.png', 'Portal Pacaembu - Vila Matarazzo - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/20/15/17/ac37a8f70499c99531f3a7733654ce281e08dd8d.png', 'Portal Pacaembu - Vila Matarazzo - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/06/21/18/46/2b66c50ec3e0028bf98063414f55927d4f2ede9f.png', 'Planta ilustrativa - Portal Pacaembu - Vila Matarazzo', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/06/21/18/46/a6dc5252d4b8edb1a9f9304d7472655ddf4d3df3.png', 'Planta ilustrativa - Portal Pacaembu - Vila Matarazzo', 1)) as v(tipo, url, legenda, ordem);

-- Portal Pacaembu - Vila Sumaré
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-portal-pacaembu-vila-sumare', 'Portal Pacaembu - Vila Sumaré', 'Plano&Plano', 'Empreendimento Plano&Plano em Barra Funda. Em construção. Opções de 2 dormitório(s).', 'Rua dos Americanos, 615 - Barra Funda', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     304335, '{3,4}'::int[], '{2}'::int[], 32.59, 35, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Playground','Churrasqueira','Bicicletário','Espaço Pet','Coworking','Sala de Ginástica','Brinquedoteca','Salão de Festas']::text[], 'https://www.youtube.com/watch?v=82gSipq73TE', 'https://www.planoeplano.com.br/estatico/2024/05/20/14/38/a61619fb9bddd3cddf58e90a2e8bac9084e7fddd.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/portal-pacaembu/vila-sumare')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/20/14/38/a61619fb9bddd3cddf58e90a2e8bac9084e7fddd.png', 'Portal Pacaembu - Vila Sumaré - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/20/14/38/48905b44f93438faf60905c5f6437caa4039d0bc.png', 'Portal Pacaembu - Vila Sumaré - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/20/14/39/74aa1ef23755946624857325aa1cc2a1c497a147.png', 'Portal Pacaembu - Vila Sumaré - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/06/21/18/47/f7ee9060542afe024ad498a40027b41817551330.png', 'Planta ilustrativa - Portal Pacaembu - Vila Sumaré', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/06/21/18/47/733f2a17f55d5aee0f28d9776b017f2be14ebb0b.png', 'Planta ilustrativa - Portal Pacaembu - Vila Sumaré', 1)) as v(tipo, url, legenda, ordem);

-- Portal Pacaembu - Vila Pompéia
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-portal-pacaembu-vila-pompeia', 'Portal Pacaembu - Vila Pompéia', 'Plano&Plano', 'Empreendimento Plano&Plano em Barra Funda. Em construção. Opções de 2 dormitório(s).', 'Rua James Holland, 500 - Barra Funda', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     320340, '{3,4}'::int[], '{2}'::int[], 32.59, 35, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Playground','Churrasqueira','Bicicletário','Espaço Pet','Coworking','Sala de Ginástica','Brinquedoteca','Salão de Festas']::text[], 'https://www.youtube.com/watch?v=82gSipq73TE', 'https://www.planoeplano.com.br/estatico/2024/05/20/15/47/1d959f7b5d30a3359bfcc2528b9e9e170c0a9f55.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/portal-pacaembu/vila-pompeia')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/20/15/47/1d959f7b5d30a3359bfcc2528b9e9e170c0a9f55.png', 'Portal Pacaembu - Vila Pompéia - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/20/15/47/b829087035dd7c3cd9b6f82673bf697c7cad36c8.png', 'Portal Pacaembu - Vila Pompéia - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/20/15/47/87a32b4d923cf9c933df8015478177dfcc9c97b0.png', 'Portal Pacaembu - Vila Pompéia - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/06/21/18/46/2822c2a6d8eaf4f8ca6761a4181615dd529ef0f2.png', 'Planta ilustrativa - Portal Pacaembu - Vila Pompéia', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/06/21/18/46/674f50c1dbde2983fbc876a7d39336987e2df7cc.png', 'Planta ilustrativa - Portal Pacaembu - Vila Pompéia', 1)) as v(tipo, url, legenda, ordem);

-- Portal Pacaembu - Vila Antártica
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-portal-pacaembu-vila-antartica', 'Portal Pacaembu - Vila Antártica', 'Plano&Plano', 'Empreendimento Plano&Plano em Barra Funda. Em construção. Opções de 2 dormitório(s).', 'Rua Solimões x Rua dos Americanos - Barra Funda', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     null, '{}'::int[], '{2}'::int[], 32.59, 32.93, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Playground','Churrasqueira','Bicicletário','Espaço Pet','Coworking','Sala de Ginástica','Brinquedoteca','Salão de Festas']::text[], 'https://www.youtube.com/watch?v=XhJiJDigPeI', 'https://www.planoeplano.com.br/estatico/2024/02/23/13/42/97be6721ce31d882d14bba9d5dedbc64d7209622.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/portal-pacaembu/vila-antartica')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/23/13/42/97be6721ce31d882d14bba9d5dedbc64d7209622.png', 'Portal Pacaembu - Vila Antártica - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/23/13/43/9f2dade7eab23b4bdaf1336c4d7b375c16e8d428.png', 'Portal Pacaembu - Vila Antártica - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/23/13/43/d481f11ada57a127fa830cb5dd52cb24927ee843.png', 'Portal Pacaembu - Vila Antártica - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/02/23/13/50/94729d85d4b2420b12195100e76cd546b4fdb42e.png', 'Planta ilustrativa - Portal Pacaembu - Vila Antártica', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/02/23/13/50/102d914be78eb942ac21bda9a79148a013eb665c.png', 'Planta ilustrativa - Portal Pacaembu - Vila Antártica', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Mais Penha
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planomais-penha', 'Plano&Mais Penha', 'Plano&Plano', 'Empreendimento Plano&Plano em Penha. Lançamento. Opções de 1 e 2 dormitório(s).', 'Rua Tiquiá, 112 - Penha', 'Penha', 'São Paulo', 'SP', 'zona_leste',
     285715, '{3,4}'::int[], '{1,2}'::int[], 23.91, 35.01, false, 'lancamento', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Piquenique','Churrasqueira','Playground','Sala de Ginástica','Coworking','Salão de Festas','Brinquedoteca']::text[], 'https://www.youtube.com/watch?v=sG8q_AvkUAw', 'https://www.planoeplano.com.br/estatico/2025/08/08/14/15/04bcba414ed86c02590e5fbcae46609e4222f77a.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planomais-penha')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/08/08/14/15/04bcba414ed86c02590e5fbcae46609e4222f77a.jpg', 'Plano&Mais Penha - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/08/08/14/15/e74e42aecb577cdcae4b507e66282ac7592a11e0.jpg', 'Plano&Mais Penha - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/08/08/14/15/40cbad8dc0513dde1a4b0528ac3a1b2bd97f3d6a.jpg', 'Plano&Mais Penha - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/08/14/17/01/7c8686f762d1f441215a3c1b473e822b57916296.jpg', 'Planta ilustrativa - Plano&Mais Penha', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/08/14/17/01/1beb667b5e0f7db8b2b3d6b50c81af39ee1db5a6.jpg', 'Planta ilustrativa - Plano&Mais Penha', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Vila Cambuci - Buriti
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planovila-cambuci-vila-cambuci-buriti', 'Plano&Vila Cambuci - Buriti', 'Plano&Plano', 'Empreendimento Plano&Plano em Cambuci. Lançamento. Opções de 1 e 2 dormitório(s).', 'Rua José Bento, 320 - Cambuci', 'Cambuci', 'São Paulo', 'SP', 'centro',
     null, '{}'::int[], '{1,2}'::int[], null, null, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Piscina','Churrasqueira','Playground','Miniquadra','Sala de Ginástica','Pet Care','Salão de festas']::text[], 'https://www.youtube.com/watch?v=Lf-DJvN-Zgg', 'https://www.planoeplano.com.br/estatico/2024/05/10/18/02/058b106e4013be644356ed22e7f984bb26f2bfab.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planovila-cambuci/vila-cambuci-buriti')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/10/18/02/058b106e4013be644356ed22e7f984bb26f2bfab.png', 'Plano&Vila Cambuci - Buriti - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/10/18/02/a7e5b3c292ac0345c21d5f5cbf50ac87d9bd7037.png', 'Plano&Vila Cambuci - Buriti - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/10/18/02/4f578610b12e31bebeea01ef9cd0cf160bbe297b.png', 'Plano&Vila Cambuci - Buriti - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/07/29/16/28/5fa7898ffff7b3256adf47b8a329e268868c0f1f.png', 'Planta ilustrativa - Plano&Vila Cambuci - Buriti', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/07/29/16/28/58455062320374edcf2abb8195f96faf8f0a8ff2.png', 'Planta ilustrativa - Plano&Vila Cambuci - Buriti', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Vila Cambuci - Inajá
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planovila-cambuci-vila-cambuci-inaja', 'Plano&Vila Cambuci - Inajá', 'Plano&Plano', 'Empreendimento Plano&Plano em Cambuci. Lançamento. Opções de 1 e 2 dormitório(s).', 'Rua José Bento, 290 - Cambuci', 'Cambuci', 'São Paulo', 'SP', 'centro',
     null, '{}'::int[], '{1,2}'::int[], 26.87, 35.22, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Piscina','Churrasqueira','Playground','Miniquadra','Brinquedoteca','Sala de Ginástica','Pet Care']::text[], 'https://www.youtube.com/watch?v=Lf-DJvN-Zgg', 'https://www.planoeplano.com.br/estatico/2024/05/10/18/01/1a65289e48595d667eed4c00915a6968d70bd1d7.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planovila-cambuci/vila-cambuci-inaja')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/10/18/01/1a65289e48595d667eed4c00915a6968d70bd1d7.png', 'Plano&Vila Cambuci - Inajá - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/10/18/01/c206e3380aab81e40cc62a34b3180c209b86467f.png', 'Plano&Vila Cambuci - Inajá - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/10/18/01/8bc6feacecb0f0d38b2d3b93662403cf2817a179.png', 'Plano&Vila Cambuci - Inajá - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/05/20/18/19/5d746ac201695e651a7dc36da05381fb23ec46d2.png', 'Planta ilustrativa - Plano&Vila Cambuci - Inajá', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/05/20/18/19/82060a693cddbbb9f439f18861560ac9ddfe16b5.png', 'Planta ilustrativa - Plano&Vila Cambuci - Inajá', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Vila Cambuci - Cambuí
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planovila-cambuci-vila-cambuci-cambui', 'Plano&Vila Cambuci - Cambuí', 'Plano&Plano', 'Empreendimento Plano&Plano em Cambuci. Lançamento. Opções de 1 e 2 dormitório(s).', 'Rua Dona Ana Neri, 1211 - Cambuci', 'Cambuci', 'São Paulo', 'SP', 'centro',
     null, '{}'::int[], '{1,2}'::int[], 26.87, 35.22, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Piscina','Churrasqueira','Playground','Miniquadra','Brinquedoteca','Sala de Ginástica','Salão de Festas']::text[], 'https://www.youtube.com/watch?v=Lf-DJvN-Zgg', 'https://www.planoeplano.com.br/estatico/2024/05/10/18/01/6e71978eb630cc61fa7f2a86a5746c73c6395bc0.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planovila-cambuci/vila-cambuci-cambui')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/10/18/01/6e71978eb630cc61fa7f2a86a5746c73c6395bc0.png', 'Plano&Vila Cambuci - Cambuí - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/10/18/01/1507ba6586c4da7d86b85967e8c9b4407f29f465.png', 'Plano&Vila Cambuci - Cambuí - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/10/18/01/e4d4cfa68b7932a707d8ac5d17ff58bd3f153917.png', 'Plano&Vila Cambuci - Cambuí - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/07/29/16/30/ec143b8f46802c33d4575f34d66bd0768c858716.png', 'Planta ilustrativa - Plano&Vila Cambuci - Cambuí', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/07/29/16/30/c21a99973fd13d9330bece21e3ca53a72b27d4e1.png', 'Planta ilustrativa - Plano&Vila Cambuci - Cambuí', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Vila Cambuci - Ingá
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planovila-cambuci-vila-cambuci-inga', 'Plano&Vila Cambuci - Ingá', 'Plano&Plano', 'Empreendimento Plano&Plano em Cambuci. Em construção. Opções de 1 e 2 dormitório(s).', 'Rua Dona Ana Neri, 1271 - Cambuci', 'Cambuci', 'São Paulo', 'SP', 'centro',
     null, '{}'::int[], '{1,2}'::int[], 26.87, 35.22, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Piscina','Churrasqueira','Playground','Miniquadra','Pet Care','Brinquedoteca','Sala de Ginástica']::text[], null, 'https://www.planoeplano.com.br/estatico/2024/05/10/18/02/4446b7cf6798215261398d779644cbe6b9ebb2c8.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planovila-cambuci/vila-cambuci-inga')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/10/18/02/4446b7cf6798215261398d779644cbe6b9ebb2c8.png', 'Plano&Vila Cambuci - Ingá - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/10/18/02/00b4ada4badf9ea5d470f5c6cb09e5d4668cd767.png', 'Plano&Vila Cambuci - Ingá - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/10/18/02/7a7d7a992e2a7e7a3d3312a4144e7248e0890d57.png', 'Plano&Vila Cambuci - Ingá - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/07/29/16/31/d8b68d33793fb422ef04d7ec1d9e71f03bff6679.png', 'Planta ilustrativa - Plano&Vila Cambuci - Ingá', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/07/29/16/31/db2595b231b7a42346f13a06cbd9a0e4543deed7.png', 'Planta ilustrativa - Plano&Vila Cambuci - Ingá', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Vila Cambuci - Araçá
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planovila-cambuci-vila-cambuci-araca', 'Plano&Vila Cambuci - Araçá', 'Plano&Plano', 'Empreendimento Plano&Plano em Cambuci. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua José Bento, 410 - Cambuci', 'Cambuci', 'São Paulo', 'SP', 'centro',
     null, '{}'::int[], '{2}'::int[], 32.49, 32.49, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Estacionamento','Área externa','Brinquedoteca','Churrasqueira','Fitness']::text[], 'https://www.youtube.com/watch?v=kKcjEISjhKI', 'https://www.planoeplano.com.br/estatico/2023/11/29/17/55/11add5711ece6fd30a69b12274ec96fc6d0ba77c.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planovila-cambuci/vila-cambuci-araca')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/11/29/17/55/11add5711ece6fd30a69b12274ec96fc6d0ba77c.jpg', 'Plano&Vila Cambuci - Araçá - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/11/29/17/55/df8f1062da465d188db92df49652f8250c0a687f.jpg', 'Plano&Vila Cambuci - Araçá - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/11/29/17/56/8399e451a9c3fa56f76300e1b96017baab38f1ee.jpg', 'Plano&Vila Cambuci - Araçá - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2021/11/05/10/32/efca0344ff68966a885292d760feebf59af67b3f.jpg', 'Planta ilustrativa - Plano&Vila Cambuci - Araçá', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2021/11/05/10/31/d8b2538ebeb62cc7909e3ad6a0a44671abaa182e.jpg', 'Planta ilustrativa - Plano&Vila Cambuci - Araçá', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Vila Cambuci - Pitanga
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planovila-cambuci-vila-cambuci-pitanga', 'Plano&Vila Cambuci - Pitanga', 'Plano&Plano', 'Empreendimento Plano&Plano em Cambuci. Em construção. Opções de 2 dormitório(s).', 'Rua José Bento, 370 - Cambuci', 'Cambuci', 'São Paulo', 'SP', 'centro',
     null, '{}'::int[], '{2}'::int[], 32.2, 32.2, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Bicicletário','Playground','Churrasqueira','Brinquedoteca','Salão de festas','Fitness']::text[], 'https://www.youtube.com/watch?v=DOe3m_Q7Qlo', 'https://www.planoeplano.com.br/estatico/2024/01/05/10/35/e7976f35442dd6e2166648279f9f23890117dc6b.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planovila-cambuci/vila-cambuci-pitanga')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/01/05/10/35/e7976f35442dd6e2166648279f9f23890117dc6b.jpg', 'Plano&Vila Cambuci - Pitanga - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/01/05/10/35/027c70b68bcece165277d752650b426922d7ef40.jpg', 'Plano&Vila Cambuci - Pitanga - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/01/05/10/35/ac19047bbc271976760a773d99a5ce7929e95ad5.jpg', 'Plano&Vila Cambuci - Pitanga - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2021/11/05/11/42/829084b15f432f07034514dc4acfec5da17f4de6.jpg', 'Planta ilustrativa - Plano&Vila Cambuci - Pitanga', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2021/11/05/11/42/fe157d647a374081ebb6c5c5194e5db071eb607a.jpg', 'Planta ilustrativa - Plano&Vila Cambuci - Pitanga', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Estação Mooca - Residencial
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planoestacao-mooca-residencial-2', 'Plano&Estação Mooca - Residencial', 'Plano&Plano', 'Empreendimento Plano&Plano em Mooca. Lançamento. Opções de 1 e 2 dormitório(s).', 'Avenida Presidente Soares Brandão, 361 - Mooca', 'Mooca', 'São Paulo', 'SP', 'zona_leste',
     220012, '{1,2,3,4}'::int[], '{1,2}'::int[], 26.95, 36.07, false, 'lancamento', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Bicicletário','Churrasqueira','Sala de Ginástica','Pet Care','Brinquedoteca','Lavanderia','Salão de Jogos']::text[], 'https://www.youtube.com/watch?v=Ct_Ko-NAxxw', 'https://www.planoeplano.com.br/estatico/2025/03/07/14/52/15705f4bfd00a237596af262469a69f302d6b57e.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planoestacao-mooca/residencial-2')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/03/07/14/52/15705f4bfd00a237596af262469a69f302d6b57e.jpg', 'Plano&Estação Mooca - Residencial - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/03/07/14/52/ebfd0f9afcc61cdea6f14622a5a802e2ba917a40.jpg', 'Plano&Estação Mooca - Residencial - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/03/07/14/52/81d7e1c6bf2e9ad754e931a9bc7b831ddb1e372e.jpg', 'Plano&Estação Mooca - Residencial - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/03/07/14/58/2a3c9129a0a0aed0e357e7f36562e68b11e83b17.jpg', 'Planta ilustrativa - Plano&Estação Mooca - Residencial', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/03/07/14/58/0ec8f828b43b0014f2bef5f1ea06539ed02a9384.jpg', 'Planta ilustrativa - Plano&Estação Mooca - Residencial', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Reserva da Mooca
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planoreserva-da-mooca', 'Plano&Reserva da Mooca', 'Plano&Plano', 'Empreendimento Plano&Plano em Mooca. Em construção. Opções de 1 dormitório(s).', 'Rua Leocádia Cintra, 45 - Mooca', 'Mooca', 'São Paulo', 'SP', 'zona_leste',
     306521, '{3,4}'::int[], '{1}'::int[], 29.35, 37.98, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Piscina','Praça da fogueira Rooftop','Lazer Rooftop','Sport Bar Rooftop','Churrasqueira Rooftop','Coworking','Delivery']::text[], 'https://www.youtube.com/watch?v=TTb3TDXT0p4', 'https://www.planoeplano.com.br/estatico/2024/06/03/17/44/145796bf28df71ab5b8e261aa7fc4126059c6ea1.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planoreserva-da-mooca')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/06/03/17/44/145796bf28df71ab5b8e261aa7fc4126059c6ea1.jpg', 'Plano&Reserva da Mooca - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/06/03/17/44/6b026d5e31d9e7bc5d3e8114150a4390ce583b4e.jpg', 'Plano&Reserva da Mooca - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/06/03/17/44/a2383e20336b0c7d16b27605983c56a2c8929c99.jpg', 'Plano&Reserva da Mooca - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/06/28/15/25/75fc29e9d12d0b10db296e9ca53fd43db9fa74ce.png', 'Planta ilustrativa - Plano&Reserva da Mooca', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/06/28/15/25/aedec09b9c11b091ecf57cd904ff4210f2dc8c64.png', 'Planta ilustrativa - Plano&Reserva da Mooca', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Mais Interlagos - Reserva
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-plano-maisinterlagos', 'Plano&Mais Interlagos - Reserva', 'Plano&Plano', 'Empreendimento Plano&Plano em Jardim Marajoara. Em construção. Opções de 1 e 2 dormitório(s).', 'Rua Francisco Felippe Agosti, 97 - Jardim Marajoara', 'Jardim Marajoara', 'São Paulo', 'SP', 'zona_sul',
     255090, '{1,2,3,4}'::int[], '{1,2}'::int[], 26.87, 27.27, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Churrasqueira','Espaço influencer','Sala de ginástica','Salão de festas','Espaço bem estar','Sala de jogos','Sala de massagem']::text[], 'https://www.youtube.com/watch?v=-Mue9zu3X9Y', 'https://www.planoeplano.com.br/estatico/2025/08/11/11/51/327d01f7624e3b580a48d90bb394ab82e41917a6.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/plano-maisinterlagos')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/08/11/11/51/327d01f7624e3b580a48d90bb394ab82e41917a6.jpg', 'Plano&Mais Interlagos - Reserva - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/08/11/11/47/3722eee902a871afd1c38c95cb20f2438787d7d8.jpg', 'Plano&Mais Interlagos - Reserva - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/08/11/11/50/50307fd16b9bbc0ddf975990db2bffd105d679cd.jpg', 'Plano&Mais Interlagos - Reserva - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/02/24/12/22/4afef8b79c631e5d412253c266ba270a770e528b.jpg', 'Planta ilustrativa - Plano&Mais Interlagos - Reserva', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/02/24/12/22/a34472f6cad29ebcd3d8db5d8cd1333087a245b8.jpg', 'Planta ilustrativa - Plano&Mais Interlagos - Reserva', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Mais Interlagos - Refúgio
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planomais-interlagos-refugio', 'Plano&Mais Interlagos - Refúgio', 'Plano&Plano', 'Empreendimento Plano&Plano em Jardim Marajoara. Em construção. Opções de 2 dormitório(s).', 'Rua Francisco Felippe Agosti - Jardim Marajoara', 'Jardim Marajoara', 'São Paulo', 'SP', 'zona_sul',
     252103, '{1,2,3,4}'::int[], '{2}'::int[], 32.76, 34.3, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Portaria','Playground','Churrasqueira','Fitness','Atelier','Brinquedoteca','Coworking']::text[], 'https://www.youtube.com/watch?v=ogGoMDlboxo', 'https://www.planoeplano.com.br/estatico/2025/08/11/09/57/0279299cc770dd40bf47ecf177ecee9b0f010087.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planomais-interlagos-refugio')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/08/11/09/57/0279299cc770dd40bf47ecf177ecee9b0f010087.jpg', 'Plano&Mais Interlagos - Refúgio - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/08/11/10/53/3315d999b3cdf6cffb0e18ecaf5d7b150f285970.jpg', 'Plano&Mais Interlagos - Refúgio - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/08/11/10/55/d72e0ad96886e67613f56966bea73b72154b1072.jpg', 'Plano&Mais Interlagos - Refúgio - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/08/11/11/13/714a81f0b694652f4f3fb0e5d1ce2a185b33299c.jpg', 'Planta ilustrativa - Plano&Mais Interlagos - Refúgio', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/08/11/11/13/679150c7076416bb16d14142ca805fa9a0019f78.jpg', 'Planta ilustrativa - Plano&Mais Interlagos - Refúgio', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Alto Morumbi
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-plano-altomorumbi', 'Plano&Alto Morumbi', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Andrade. Em construção. Opções de 1 e 2 dormitório(s).', 'Rua Alexandre Benois, 17 - Vila Andrade', 'Vila Andrade', 'São Paulo', 'SP', 'zona_sul',
     255552, '{1,2,3,4}'::int[], '{1,2}'::int[], 26.75, 34.73, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Piscina','Cinema','Playground','Quadra','Pet place','Redário']::text[], 'https://www.youtube.com/watch?v=40NPlGKEUZw', 'https://www.planoeplano.com.br/estatico/2025/10/02/17/54/2119e56208b9e0454cd554cc05489fa1b7d8d541.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/plano-altomorumbi')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/10/02/17/54/2119e56208b9e0454cd554cc05489fa1b7d8d541.png', 'Plano&Alto Morumbi - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/10/02/17/54/a250aee73792d2b887c4dc3a41cd05091855a8da.png', 'Plano&Alto Morumbi - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/10/02/17/54/487f68cab2eb3cb513074cdfd9e62d6328ca3d51.png', 'Plano&Alto Morumbi - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/10/21/14/15/d7e87b0f6fa9604028cd7ce9dd76066764bb1dd8.jpg', 'Planta ilustrativa - Plano&Alto Morumbi', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/10/21/14/15/5247af8adb2958565eebfea96a7947e95d1a7b65.jpg', 'Planta ilustrativa - Plano&Alto Morumbi', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Vila Ema
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planovila-ema', 'Plano&Vila Ema', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Ema. Em construção. Opções de 1 e 2 dormitório(s).', 'Av. Vila Ema, 4015 - Vila Ema', 'Vila Ema', 'São Paulo', 'SP', 'zona_leste',
     245334, '{1,2,3,4}'::int[], '{1,2}'::int[], 27.03, 38.83, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Portaria','Quadra','Churrasqueira','Redário','Playground','Praça']::text[], 'https://www.youtube.com/watch?v=DxmOVEPGt3U', 'https://www.planoeplano.com.br/estatico/2025/03/07/16/46/44b4089ce4bbf6a82adcc6501108db7e60bfe2d7.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planovila-ema')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/03/07/16/46/44b4089ce4bbf6a82adcc6501108db7e60bfe2d7.jpg', 'Plano&Vila Ema - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/03/07/16/46/708799ad19d74896e01faf828a2810fd55a5b068.jpg', 'Plano&Vila Ema - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/03/07/16/46/9a43ca06857dedb19b0b1004fcb83d512f8c2bb7.jpg', 'Plano&Vila Ema - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/07/04/19/01/b9714f20ba5689c7059bd4154f891cb34b618034.jpg', 'Planta ilustrativa - Plano&Vila Ema', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/07/04/19/01/b9588a1a04e4fe333d0b8ae2cc9170adc2c3ffb2.jpg', 'Planta ilustrativa - Plano&Vila Ema', 1)) as v(tipo, url, legenda, ordem);

-- Meu Plano&Parque do Carmo - Ipê
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-meu-planoparquedocarmo-ipe', 'Meu Plano&Parque do Carmo - Ipê', 'Plano&Plano', 'Empreendimento Plano&Plano em Itaquera. Em construção. Opções de 2 dormitório(s).', 'Rua Itália Giusti, S/N - Itaquera', 'Itaquera', 'São Paulo', 'SP', 'zona_leste',
     239985, '{1,2,3,4}'::int[], '{2}'::int[], 31.78, 32.19, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Churrasqueira','Mini Quadra','Horta','Playground','Food Bike','Bicicletário','Espaço Influencer']::text[], 'https://www.youtube.com/watch?v=yK8MiE_Ewic', 'https://www.planoeplano.com.br/estatico/2024/12/05/15/36/5a5ad47807c53658425e33796342f5b68cade787.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/meu-planoparquedocarmo/ipe')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/12/05/15/36/5a5ad47807c53658425e33796342f5b68cade787.jpg', 'Meu Plano&Parque do Carmo - Ipê - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/12/05/15/36/3ca7ce7090d1351745d10abdbc8abb010315ad1a.jpg', 'Meu Plano&Parque do Carmo - Ipê - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/12/05/15/37/b5b108def2b7f8833653eb6d5513d0bf617f7876.jpg', 'Meu Plano&Parque do Carmo - Ipê - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/12/05/15/50/1ccdd68faf047d24a638bfd90c4e4b218c1a7085.png', 'Planta ilustrativa - Meu Plano&Parque do Carmo - Ipê', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/12/05/15/50/333a5affc683f45cce8a9ab308629b3a89951cfd.png', 'Planta ilustrativa - Meu Plano&Parque do Carmo - Ipê', 1)) as v(tipo, url, legenda, ordem);

-- Meu Plano&Parque do Carmo - Jacarandá
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-meu-planoparquedocarmo-jacaranda', 'Meu Plano&Parque do Carmo - Jacarandá', 'Plano&Plano', 'Empreendimento Plano&Plano em Itaquera. Em construção. Opções de 2 dormitório(s).', 'Rua Itália Giusti, S/N - Itaquera', 'Itaquera', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], null, null, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Piscina','Churrasqueira','Coworking','Sala de Jogos','Mini Quadra','Sala Funcional','Espaço Influencer','Playground']::text[], 'https://www.youtube.com/watch?v=yK8MiE_Ewic', 'https://www.planoeplano.com.br/estatico/2024/09/27/17/40/63dd4846a910b5e9f59c1dcefbb51f623afe5a93.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/meu-planoparquedocarmo/jacaranda')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/09/27/17/40/63dd4846a910b5e9f59c1dcefbb51f623afe5a93.jpg', 'Meu Plano&Parque do Carmo - Jacarandá - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/09/27/17/40/7707bbf191968a58f9d375324968238cdd66a8d0.jpg', 'Meu Plano&Parque do Carmo - Jacarandá - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/09/27/17/40/2246f7e5a623bdb841cbafd941e6a357576a8e11.jpg', 'Meu Plano&Parque do Carmo - Jacarandá - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/09/27/14/35/9c942eb8809041e37c0754c33493dbe140863ca1.png', 'Planta ilustrativa - Meu Plano&Parque do Carmo - Jacarandá', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/09/27/14/35/b9353a372d0c64288e19f449e662206aad924289.png', 'Planta ilustrativa - Meu Plano&Parque do Carmo - Jacarandá', 1)) as v(tipo, url, legenda, ordem);

-- Meu Plano&Parque do Carmo - Figueira
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-meu-planoparquedocarmo-figueira', 'Meu Plano&Parque do Carmo - Figueira', 'Plano&Plano', 'Empreendimento Plano&Plano em Itaquera. Em construção. Opções de 2 dormitório(s).', 'Rua Itália Giusti, S/N - Itaquera', 'Itaquera', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 31.78, 32.19, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Piscina','Churrasqueira','Mini Quadra','Horta','Playground','Food Bike','Bicicletário','Espaço Influencer']::text[], 'https://www.youtube.com/watch?v=yK8MiE_Ewic', 'https://www.planoeplano.com.br/estatico/2024/12/05/18/53/68d092aabddec2ec3e4ee1c3af0b84a783f8c3aa.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/meu-planoparquedocarmo/figueira')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/12/05/18/53/68d092aabddec2ec3e4ee1c3af0b84a783f8c3aa.jpg', 'Meu Plano&Parque do Carmo - Figueira - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/12/05/18/53/dde8108dc947a891b701083c0043896006d75671.jpg', 'Meu Plano&Parque do Carmo - Figueira - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/12/05/18/53/2298caa2c62b36b8cc054744194d77dc926cb7b0.jpg', 'Meu Plano&Parque do Carmo - Figueira - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/12/05/18/58/9424db495b4cab6b83844943857ef0b72e88c6b3.png', 'Planta ilustrativa - Meu Plano&Parque do Carmo - Figueira', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/12/05/18/58/69783167866523a8bfad38ab29e8951cf75d072c.png', 'Planta ilustrativa - Meu Plano&Parque do Carmo - Figueira', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Mais Belém
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planomais-belem-2', 'Plano&Mais Belém', 'Plano&Plano', 'Empreendimento Plano&Plano em Belém. Em construção. Opções de 1 e 2 dormitório(s).', 'Rua Joaquim Carlos, 580 - Belém', 'Belém', 'São Paulo', 'SP', 'zona_leste',
     224561, '{1,2,3,4}'::int[], '{1,2}'::int[], null, null, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Piscina','Miniquadra','Playground','Churrasqueira','Salão Bem Estar','Lavanderia','Salão de Festas']::text[], 'https://www.youtube.com/watch?v=KCZuaXex3Ic', 'https://www.planoeplano.com.br/estatico/2024/06/18/18/26/e567c08a6c7f688f181e7b3cabb0f2033219244f.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planomais-belem-2')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/06/18/18/26/e567c08a6c7f688f181e7b3cabb0f2033219244f.png', 'Plano&Mais Belém - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/06/18/18/28/8d2bf6b71a06ea4fdd838fcebdfb5317e01a3a86.png', 'Plano&Mais Belém - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/06/18/18/29/5d87e3d534e647d19f1d7e210b0f4db61ab8ef95.png', 'Plano&Mais Belém - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/06/18/18/38/d507c5f019fc2afe51060f7c6b69383306f1a83a.png', 'Planta ilustrativa - Plano&Mais Belém', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/06/18/18/38/fc769406c08aa452cfb0383af1f4f9e5bee2c6d5.png', 'Planta ilustrativa - Plano&Mais Belém', 1)) as v(tipo, url, legenda, ordem);

-- Meu Plano&São Miguel
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-meu-planosaomiguel', 'Meu Plano&São Miguel', 'Plano&Plano', 'Empreendimento Plano&Plano em São Miguel. Em construção. Opções de 2 dormitório(s).', 'Rua Minúcio Felix, 154 - São Miguel', 'São Miguel', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], null, null, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Piscina','Rooftop','Churrasqueira','Playground','Fitness','Delivery','Salão de festas','Petcare']::text[], 'https://www.youtube.com/watch?v=NgLbJfEGlTo', 'https://www.planoeplano.com.br/estatico/2024/11/21/18/40/060fb9131af1441ffe564563b48c87e0fb04ffdf.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/meu-planosaomiguel')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/11/21/18/40/060fb9131af1441ffe564563b48c87e0fb04ffdf.png', 'Meu Plano&São Miguel - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/11/21/18/40/9b7681d78ac632ebc15f1664ffd3b489d090b19f.png', 'Meu Plano&São Miguel - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/11/21/18/40/dd42a56df7622673258abedeffd3ebb946c73072.png', 'Meu Plano&São Miguel - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/11/21/18/40/2183cf47d57a2f1c87243bb106643827a4ab045f.png', 'Planta ilustrativa - Meu Plano&São Miguel', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/11/21/18/40/4ced6742829857dbd4a7ca8ae3fb4014b021d355.png', 'Planta ilustrativa - Meu Plano&São Miguel', 1)) as v(tipo, url, legenda, ordem);

-- Meu Plano&José Bonifácio
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-meu-plano-josebonifacio', 'Meu Plano&José Bonifácio', 'Plano&Plano', 'Empreendimento Plano&Plano em José Bonifácio. Em construção. Opções de 2 dormitório(s).', 'Av. José Pinheiro Borges, 6499 x Rua Valentim Lemos - José Bonifácio', 'José Bonifácio', 'São Paulo', 'SP', 'zona_leste',
     235517, '{1,2,3,4}'::int[], '{2}'::int[], 31.64, 34, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Portaria','Churrasqueira','Playground','Mini Quadra','Delivery','Salão de Festas','Pet Care']::text[], 'https://www.youtube.com/watch?v=iMAOI6Jtgm0', 'https://www.planoeplano.com.br/estatico/2024/08/20/11/46/5134d4f3bc06279028a793ced341462931ea604c.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/meu-plano-josebonifacio')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/08/20/11/46/5134d4f3bc06279028a793ced341462931ea604c.png', 'Meu Plano&José Bonifácio - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/08/20/11/46/d11f1a0bb517aae9a4e2421ab318308231d3a064.png', 'Meu Plano&José Bonifácio - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/08/20/11/46/934fbb1e6670868bd9469ab7dc8bcdb40ef6ec14.png', 'Meu Plano&José Bonifácio - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/10/16/15/31/12c9d8f4c60515e5199f733c9446706a258b2686.png', 'Planta ilustrativa - Meu Plano&José Bonifácio', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/10/16/15/31/b7c59e807caf926cc5ee99cb23bdb8dc41104048.png', 'Planta ilustrativa - Meu Plano&José Bonifácio', 1)) as v(tipo, url, legenda, ordem);

-- Plano&São Miguel
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planosao-miguel', 'Plano&São Miguel', 'Plano&Plano', 'Empreendimento Plano&Plano em São Miguel. Em construção. Opções de 2 dormitório(s).', 'Rua dos Cálamos, 480 - São Miguel', 'São Miguel', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 31.66, 34.58, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Piscina','Portaria','Churrasqueira','Coworking','Brinquedoteca','Espaço Influencer','Delivery','Salão de festas']::text[], 'https://www.youtube.com/watch?v=6dwtfM3yXNg', 'https://www.planoeplano.com.br/estatico/2024/05/14/13/47/6cdd6be7af46920d1146807936d57f94153e74a6.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planosao-miguel')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/14/13/47/6cdd6be7af46920d1146807936d57f94153e74a6.jpg', 'Plano&São Miguel - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/14/13/47/f53aff5a67942ea03fc74863c239963d7874ebb8.jpg', 'Plano&São Miguel - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/05/14/13/47/26b016bd097f87b0b4bedaa2c15869218b390bec.jpg', 'Plano&São Miguel - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/05/14/13/49/255aa774da3acf319e03e91063150ec8dc2bc865.jpg', 'Planta ilustrativa - Plano&São Miguel', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/05/14/13/49/411349984d9cbaa6638acffe42318d29adec5556.jpg', 'Planta ilustrativa - Plano&São Miguel', 1)) as v(tipo, url, legenda, ordem);

-- Artur Mota
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-artur-mota', 'Artur Mota', 'Plano&Plano', 'Empreendimento Plano&Plano em Belenzinho. Lançamento.', 'Rua Artur Mota - Belenzinho', 'Belenzinho', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{}'::int[], null, null, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', '{}'::text[], null, null, false, false, 'https://www.comprarseuap.com.br/akali/imoveis/artur-mota')
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
select 1 from d;

-- Mais Vila Andrade
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-mais-vila-andrade', 'Mais Vila Andrade', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Andrade. Em construção. Opções de 2 dormitório(s).', 'Rua Carvalho de Freitas, S/N - Vila Andrade', 'Vila Andrade', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{2}'::int[], 31.63, 32.02, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Piscina','Rooftop','Mini Quadra','Playground','Churrasqueira','Espaço Influencer','Pet Care']::text[], 'https://www.youtube.com/watch?v=A5P4rNTEx0o', 'https://www.planoeplano.com.br/estatico/2024/02/28/13/44/4502071480e239c385cde371fa1140e0c79ec059.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/mais-vila-andrade')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/28/13/44/4502071480e239c385cde371fa1140e0c79ec059.png', 'Mais Vila Andrade - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/28/13/45/e2deb36bfd5944358c42f6f83792e6e474a59565.png', 'Mais Vila Andrade - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/28/13/46/0c138f96ba4acf03cd96ecdaeed732c9dd9a5eee.png', 'Mais Vila Andrade - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/03/20/15/09/14bbd83b543566af48e25730d2ac8880dc921995.png', 'Planta ilustrativa - Mais Vila Andrade', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/03/20/15/09/05b6095952e738f9993ed4863cd4162929a21477.png', 'Planta ilustrativa - Mais Vila Andrade', 1)) as v(tipo, url, legenda, ordem);

-- Sphera Panamby - Park
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-sphera-panamby-park', 'Sphera Panamby - Park', 'Plano&Plano', 'Empreendimento Plano&Plano em Panamby. Em construção. Opções de 2 e 3 dormitório(s).', 'Avenida Giovanni Gronchi, 7020 - Panamby', 'Panamby', 'São Paulo', 'SP', 'zona_sul',
     363073, '{3,4}'::int[], '{2,3}'::int[], 33.98, 66.93, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Churrasqueira','Terraço','Pet place','Playground','Redário luau','Bar','Fitness']::text[], 'https://www.youtube.com/watch?v=cBpSCBRBsYw', 'https://www.planoeplano.com.br/estatico/2023/10/10/14/48/c57af95512179433b19db9ffc4f8ef4e7ac982b5.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/sphera-panamby/park')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/10/10/14/48/c57af95512179433b19db9ffc4f8ef4e7ac982b5.jpg', 'Sphera Panamby - Park - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/10/10/14/48/74f4f2298fbbdc2269b9a5191f1c10b11cc3afc1.jpg', 'Sphera Panamby - Park - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/10/20/18/09/0a58ea17c7a865a6d0ec8c8736f3635d7d19d8a0.jpg', 'Sphera Panamby - Park - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/10/10/14/52/f07834ab6f3af0ba96e0ba72400c0586cfe5b6c3.jpg', 'Planta ilustrativa - Sphera Panamby - Park', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/10/10/14/52/6fb0140ca1deebea1426f66783ff3906ab956bdc.jpg', 'Planta ilustrativa - Sphera Panamby - Park', 1)) as v(tipo, url, legenda, ordem);

-- Sphera Panamby - Club
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-sphera-panamby-club', 'Sphera Panamby - Club', 'Plano&Plano', 'Empreendimento Plano&Plano em Panamby. Em construção. Opções de 2 e 3 dormitório(s).', 'Avenida Giovanni Gronchi, 7020 - Panamby', 'Panamby', 'São Paulo', 'SP', 'zona_sul',
     504306, '{4}'::int[], '{2,3}'::int[], 33.98, 66.93, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Churrasqueira','Terraço','Living','Playground','Redário Luau','Bar','Brinquedoteca']::text[], 'https://www.youtube.com/watch?v=cBpSCBRBsYw', 'https://www.planoeplano.com.br/estatico/2023/10/10/15/16/8a7000715fb6ecd628840de0c905d8c66ac9b012.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/sphera-panamby/club')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/10/10/15/16/8a7000715fb6ecd628840de0c905d8c66ac9b012.jpg', 'Sphera Panamby - Club - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/10/10/15/17/cf4085160be5580864673fe0347180c4932399a1.jpg', 'Sphera Panamby - Club - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/10/20/18/23/db362e1fa223899dee85a4bc3d106b67fcfffecf.jpg', 'Sphera Panamby - Club - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/10/10/15/19/7af5c90b2aad81d4ab5073a229fb6f93ccc7e63c.jpg', 'Planta ilustrativa - Sphera Panamby - Club', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/10/10/15/19/13b39ee94e75525676f0f214bc66f60ba9cfb8dc.jpg', 'Planta ilustrativa - Sphera Panamby - Club', 1)) as v(tipo, url, legenda, ordem);

-- Sphera Panamby - Urban
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-sphera-panamby-urban', 'Sphera Panamby - Urban', 'Plano&Plano', 'Empreendimento Plano&Plano em Panamby. Em construção. Opções de 2 e 3 dormitório(s).', 'Avenida Giovanni Gronchi, 7020 - Panamby', 'Panamby', 'São Paulo', 'SP', 'zona_sul',
     524483, '{4}'::int[], '{2,3}'::int[], 33.98, 66.93, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Portaria','Playground','Churrasqueira','Pet Place','Redário Luau','Pet Care','Coworking']::text[], 'https://www.youtube.com/watch?v=HSQmS2fn3wU', 'https://www.planoeplano.com.br/estatico/2024/02/22/18/01/187a2efd55526882c87db9ea55857a7357e946c2.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/sphera-panamby/urban')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/22/18/01/187a2efd55526882c87db9ea55857a7357e946c2.png', 'Sphera Panamby - Urban - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/22/18/01/9023710d009cf09ff061595cab87febe2d24aa7f.png', 'Sphera Panamby - Urban - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/22/18/02/a35820d296377bc7c860e72d7797125cea0094af.png', 'Sphera Panamby - Urban - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/04/15/13/31/0c3377ac5df9f3acab435989aaf2eff057023a28.png', 'Planta ilustrativa - Sphera Panamby - Urban', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/04/15/13/31/23495908d0687d8e0cf792cbaa3bfb4bdc9c9fd1.png', 'Planta ilustrativa - Sphera Panamby - Urban', 1)) as v(tipo, url, legenda, ordem);

-- Meu Plano&Interlagos - Campo Grande
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-meu-plano-interlagos-campo-grande', 'Meu Plano&Interlagos - Campo Grande', 'Plano&Plano', 'Empreendimento Plano&Plano em Interlagos. Em construção. Opções de 2 dormitório(s).', 'Rua Zike Tuma, 1037 - Interlagos', 'Interlagos', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{2}'::int[], 32.06, 34.09, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Piscina','Churrasqueira','Mini Quadra','Playground','Living','Brinquedoteca','Sala funcional']::text[], 'https://www.youtube.com/watch?v=t_O6UEBfDGw', 'https://www.planoeplano.com.br/estatico/2024/07/23/17/17/12ee562d88ea6d3a3cc461a7bce23a2e363a8b7a.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/meu-plano-interlagos/campo-grande')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/07/23/17/17/12ee562d88ea6d3a3cc461a7bce23a2e363a8b7a.jpg', 'Meu Plano&Interlagos - Campo Grande - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/07/23/17/17/25eab0309d938759da47e7e53921404ff29949a0.jpg', 'Meu Plano&Interlagos - Campo Grande - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/07/23/17/17/5159621aa6fad5a2150fd24d423bbcfafbf62913.jpg', 'Meu Plano&Interlagos - Campo Grande - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/07/25/18/16/785f5d3066307a101a3b685644725ad4e12ac250.png', 'Planta ilustrativa - Meu Plano&Interlagos - Campo Grande', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/07/25/18/16/dc4a0cb6ea622646c2c00052b4bc8b877e79bdba.png', 'Planta ilustrativa - Meu Plano&Interlagos - Campo Grande', 1)) as v(tipo, url, legenda, ordem);

-- Meu Plano&Interlagos - Fugulin
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-meu-plano-interlagos-fugulin', 'Meu Plano&Interlagos - Fugulin', 'Plano&Plano', 'Empreendimento Plano&Plano em Interlagos. Em construção. Opções de 2 dormitório(s).', 'Rua Zike Tuma, 1037 - Interlagos', 'Interlagos', 'São Paulo', 'SP', 'zona_sul',
     237979, '{1,2,3,4}'::int[], '{2}'::int[], 32.03, 34.73, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Churrasqueira','Piscina','Lazer descoberto','Playground','Salão de Festas','Sala Funcional']::text[], 'https://www.youtube.com/watch?v=5ih0ovzKSmk', 'https://www.planoeplano.com.br/estatico/2024/07/23/17/23/b153f3c2620e5563e674e2515a2ffd4274a954d7.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/meu-plano-interlagos/fugulin')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/07/23/17/23/b153f3c2620e5563e674e2515a2ffd4274a954d7.jpg', 'Meu Plano&Interlagos - Fugulin - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/07/23/17/23/31422af905a4c41975445ec6ca16a683a44d3d85.jpg', 'Meu Plano&Interlagos - Fugulin - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/07/23/17/23/f4335dc726acb7650978b6f332733e6f22a4eb82.jpg', 'Meu Plano&Interlagos - Fugulin - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/02/05/11/58/135d43c4f15ff1a741d73b7d79397d1667beaa95.jpg', 'Planta ilustrativa - Meu Plano&Interlagos - Fugulin', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2025/02/05/11/58/61a48a08e0960cafa94fdb999540429cd13efa08.jpg', 'Planta ilustrativa - Meu Plano&Interlagos - Fugulin', 1)) as v(tipo, url, legenda, ordem);

-- Meu Plano&Interlagos - Palmares
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-meu-plano-interlagos-palmares', 'Meu Plano&Interlagos - Palmares', 'Plano&Plano', 'Empreendimento Plano&Plano em Interlagos. Em construção. Opções de 2 dormitório(s).', 'Rua Zike Tuma, 1037 x Rua José Fugulin - Interlagos', 'Interlagos', 'São Paulo', 'SP', 'zona_sul',
     238783, '{1,2,3,4}'::int[], '{2}'::int[], 32.03, 34.31, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Piscina','Churrasqueira','Playground','Salão de festas','Living','Mini mercado']::text[], 'https://www.youtube.com/watch?v=t_O6UEBfDGw', 'https://www.planoeplano.com.br/estatico/2024/07/23/17/29/9d98dc2a43bf457ac7d99db70b2dbc510f3cb2e4.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/meu-plano-interlagos/palmares')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/07/23/17/29/9d98dc2a43bf457ac7d99db70b2dbc510f3cb2e4.jpg', 'Meu Plano&Interlagos - Palmares - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/07/23/17/29/43151ee5ca327b3f2b68adc7fa00ece6e877da14.jpg', 'Meu Plano&Interlagos - Palmares - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/07/23/17/29/113021d4cbc32590abfd97b34161654f6b6327e9.jpg', 'Meu Plano&Interlagos - Palmares - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/07/25/17/43/48863e3735f0ba6362a8f045f0db02a7185a7fc0.png', 'Planta ilustrativa - Meu Plano&Interlagos - Palmares', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/07/25/17/43/38dd899063f5911d5de9548cad33fd60f78f09b5.png', 'Planta ilustrativa - Meu Plano&Interlagos - Palmares', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Mais Mooca
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planomais-mooca', 'Plano&Mais Mooca', 'Plano&Plano', 'Empreendimento Plano&Plano em Mooca. Em construção. Opções de 1 dormitório(s).', 'Rua do Oratório, 3829 - Mooca', 'Mooca', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{1}'::int[], 26.31, 29.06, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Piscina','Churrasqueira','Rooftop','Lavanderia','Delivery','Salão de festas','Funcional','Living']::text[], 'https://www.youtube.com/watch?v=AaTzwux5jRY', 'https://www.planoeplano.com.br/estatico/2024/02/19/16/21/385a992233bb97c7a877691af60032018ca21d36.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planomais-mooca')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/19/16/21/385a992233bb97c7a877691af60032018ca21d36.jpg', 'Plano&Mais Mooca - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/19/16/21/8f9a6ffcdafa7c5f73e12b2075198e541babf383.jpg', 'Plano&Mais Mooca - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/19/16/21/cfb4a01585e0b79f3fa002ecb5b7cafcdbc62c97.jpg', 'Plano&Mais Mooca - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/02/23/16/54/ca4bed589af316723d4bea638ab7b7f801ad9c7a.jpg', 'Planta ilustrativa - Plano&Mais Mooca', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/02/23/16/54/d713f9ba9f485d56a132cfe03342566590f0424b.jpg', 'Planta ilustrativa - Plano&Mais Mooca', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Vista Cantareira
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planovista-cantareira', 'Plano&Vista Cantareira', 'Plano&Plano', 'Empreendimento Plano&Plano em Pirituba. Em construção. Opções de 2 dormitório(s).', 'Av. Raimundo Pereira de Magalhães, 11601 - Pirituba', 'Pirituba', 'São Paulo', 'SP', 'zona_norte',
     null, '{}'::int[], '{2}'::int[], 32.68, 34.4, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Piscina','Churrasqueira','Miniquadra','Playground','Salão de festas','Living','Mini Mercado']::text[], 'https://www.youtube.com/watch?v=r2xh78C7O_Q', 'https://www.planoeplano.com.br/estatico/2024/02/07/09/29/5a53d005d83fd0e2114f04cef0460079f823aa3f.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planovista-cantareira')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/07/09/29/5a53d005d83fd0e2114f04cef0460079f823aa3f.jpg', 'Plano&Vista Cantareira - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/07/09/29/fee7a70fa362a155fc898d3fb9ba71e2516bdce8.jpg', 'Plano&Vista Cantareira - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/07/09/29/259e0b98063ce8b6fef354b01b4b0bcaa03f4fef.jpg', 'Plano&Vista Cantareira - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/02/07/09/36/0114f9c58e2039810ba03eed3d280fe40156dc19.jpg', 'Planta ilustrativa - Plano&Vista Cantareira', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/02/07/09/36/b9f483e98c0461490cfc840433dc75b11cdce550.jpg', 'Planta ilustrativa - Plano&Vista Cantareira', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Mais Morumbi
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planomais-morumbi', 'Plano&Mais Morumbi', 'Plano&Plano', 'Empreendimento Plano&Plano em Morumbi. Imóvel pronto para morar. Opções de 1 e 2 dormitório(s).', 'Rua Leandro Teixeira, S/N - Morumbi', 'Morumbi', 'São Paulo', 'SP', 'zona_sul',
     255564, '{1,2,3,4}'::int[], '{1,2}'::int[], 26.81, 34.98, false, 'pronto', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Piscina','Rooftop','Churrasqueira','Quadra','Playground']::text[], 'https://www.youtube.com/watch?v=7IG_1ltJ1X0', 'https://www.planoeplano.com.br/estatico/2026/06/11/15/29/1582cf7fd461fbac10e3b463c131071ee96b1e2a.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planomais-morumbi')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/11/15/29/1582cf7fd461fbac10e3b463c131071ee96b1e2a.jpg', 'Plano&Mais Morumbi - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/11/15/29/d7ff2bfd93448b1ddd84ab774bf3c166e4de7ebe.jpg', 'Plano&Mais Morumbi - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/11/15/30/27986a0c64885ac16fc52863b1c0cc17b716cf70.jpg', 'Plano&Mais Morumbi - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/10/23/17/05/28419b5a4a59e54acd4a8a47487bb173500b7226.jpg', 'Planta ilustrativa - Plano&Mais Morumbi', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/10/23/17/14/46436d3533746048eb79405d8625db6282b79016.png', 'Planta ilustrativa - Plano&Mais Morumbi', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Parque Brás
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planoparque-bras', 'Plano&Parque Brás', 'Plano&Plano', 'Empreendimento Plano&Plano em Brás. Em construção. Opções de 1 dormitório(s).', 'Rua Domingos Paiva, 260 - Brás', 'Brás', 'São Paulo', 'SP', 'centro',
     null, '{}'::int[], '{1}'::int[], 26.82, 27.22, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Rooftop','Churrasqueira','Playground','Fitness Externo']::text[], 'https://www.youtube.com/watch?v=g8qxF1vDeDg', 'https://www.planoeplano.com.br/estatico/2026/06/23/13/03/748f032f5aaa61a3cf21ee59783612181145da09.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planoparque-bras')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/23/13/03/748f032f5aaa61a3cf21ee59783612181145da09.png', 'Plano&Parque Brás - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/23/13/03/60f3c56ec890dc9c6d56345c8dd7f32d93cd156a.png', 'Plano&Parque Brás - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/23/13/03/e962a221cea5dd9b981bd80daf874ff3c85d4787.png', 'Plano&Parque Brás - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/10/06/18/26/250e69cd4129659d49ec65a137cb95e369a89934.jpg', 'Planta ilustrativa - Plano&Parque Brás', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/10/06/18/26/436cc0e32166c3e547c542e5e8770f72c519d7b0.jpg', 'Planta ilustrativa - Plano&Parque Brás', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Nova Espraiada
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planonova-espraiada', 'Plano&Nova Espraiada', 'Plano&Plano', 'Empreendimento Plano&Plano em Campo Belo. Em construção. Opções de 1 dormitório(s).', 'Rua Gutemberg, 79 - Campo Belo', 'Campo Belo', 'São Paulo', 'SP', 'zona_sul',
     268244, '{1,2,3,4}'::int[], '{1}'::int[], 26.84, 27.08, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Rooftop','Playground','Churrasqueira','Lavanderia','Delivery','Coworking','Mini Mercado']::text[], 'https://www.youtube.com/watch?v=n8aV1SwLKOc', 'https://www.planoeplano.com.br/estatico/2024/06/26/15/18/3e6611b44d66c37b7d6b8efb616104bd90d8465d.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planonova-espraiada')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/06/26/15/18/3e6611b44d66c37b7d6b8efb616104bd90d8465d.png', 'Plano&Nova Espraiada - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/06/14/15/52/2e117a39c6220c4e64ddca583324f9db1b539208.png', 'Plano&Nova Espraiada - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/06/14/15/52/8307f8696f178d0bb91b13dc228022f70dbf3309.png', 'Plano&Nova Espraiada - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/04/23/09/35/30874e6de530262888f88824db695a46bd4eb69a.png', 'Planta ilustrativa - Plano&Nova Espraiada', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/04/23/09/35/cd850064d856fe3e5627e674a6f910696cc414ad.png', 'Planta ilustrativa - Plano&Nova Espraiada', 1)) as v(tipo, url, legenda, ordem);

-- Mistá by Plano&Plano - Ubiatans
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-mista-by-planoplano-ubiatans', 'Mistá by Plano&Plano - Ubiatans', 'Plano&Plano', 'Empreendimento Plano&Plano em Saúde. Em construção. Opções de 1 dormitório(s).', 'Alameda dos Ubiatans, 16 - Saúde', 'Saúde', 'São Paulo', 'SP', 'zona_sul',
     306920, '{3,4}'::int[], '{1}'::int[], null, null, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Portaria','Rooftop','Lounge','Pet Place','Coworking','Salão de festas','Fitness']::text[], 'https://www.youtube.com/watch?v=QMQDBHP0DWw', 'https://www.planoeplano.com.br/estatico/2023/08/22/11/10/d0e5f57455da0dc546a18b25abb9bb5b61ccfacf.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/mista-by-planoplano/ubiatans')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/08/22/11/10/d0e5f57455da0dc546a18b25abb9bb5b61ccfacf.jpg', 'Mistá by Plano&Plano - Ubiatans - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/08/22/11/10/2e45597f672b0d8b2cf056f1730c119f2d84732e.jpg', 'Mistá by Plano&Plano - Ubiatans - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/08/22/11/10/6858328f97ed913cf4e94d8b0955fe4d39f7bb4c.jpg', 'Mistá by Plano&Plano - Ubiatans - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/12/19/11/07/55ff706a6b34ad25a916465bbe324f22f3e09f0e.jpg', 'Planta ilustrativa - Mistá by Plano&Plano - Ubiatans', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/12/19/11/07/0616a8842e283106ba41d2e850250d0fa7c8bccb.jpg', 'Planta ilustrativa - Mistá by Plano&Plano - Ubiatans', 1)) as v(tipo, url, legenda, ordem);

-- Mistá by Plano&Plano - Tupinás
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-mista-by-planoplano-tupinas', 'Mistá by Plano&Plano - Tupinás', 'Plano&Plano', 'Empreendimento Plano&Plano em Saúde. Em construção. Opções de 1 dormitório(s).', 'Alameda dos Tupinás, 135 - Saúde', 'Saúde', 'São Paulo', 'SP', 'zona_sul',
     327022, '{3,4}'::int[], '{1}'::int[], 29.95, 29.96, false, 'em_obras', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Piscina','Portaria','Living','Salão de festas','Churrasqueira','Coworking','Delivery','Fitness']::text[], 'https://www.youtube.com/watch?v=QMQDBHP0DWw', 'https://www.planoeplano.com.br/estatico/2023/08/16/18/20/b532de0de804cd38bfc6ee96a3505eea72fd4f53.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/mista-by-planoplano/tupinas')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/08/16/18/20/b532de0de804cd38bfc6ee96a3505eea72fd4f53.jpg', 'Mistá by Plano&Plano - Tupinás - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/08/16/18/20/056eb362163fd76ed65a8837daee3eeb81fe90ca.jpg', 'Mistá by Plano&Plano - Tupinás - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/08/16/18/20/0e099b10612f2ff514c7aeb7b8ccf82d45fbc4b0.jpg', 'Mistá by Plano&Plano - Tupinás - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/08/16/18/26/d44e61784c766b8f0c106a2c0415d084820a4ec0.jpg', 'Planta ilustrativa - Mistá by Plano&Plano - Tupinás', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/08/16/18/26/351c40169b15668ec6bce2cea2a0e681233e1378.jpg', 'Planta ilustrativa - Mistá by Plano&Plano - Tupinás', 1)) as v(tipo, url, legenda, ordem);

-- MAPP Barra Funda - Água Branca
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-mapp-barra-funda-2-agua-branca', 'MAPP Barra Funda - Água Branca', 'Plano&Plano', 'Empreendimento Plano&Plano em Barra Funda. Imóvel pronto para morar. Opções de 1 e 2 dormitório(s).', 'Rua Achilles Orlando Curtolo, 186 - Barra Funda', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     null, '{}'::int[], '{1,2}'::int[], 26.69, 33.92, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Churrasqueira','Quadra de Areia','Playground','Fitness']::text[], 'https://www.youtube.com/watch?v=uaue-Aufvt8', 'https://www.planoeplano.com.br/estatico/2026/06/18/14/33/fb7975590f30805c32605a766674d26db732252b.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/mapp-barra-funda-2/agua-branca')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/18/14/33/fb7975590f30805c32605a766674d26db732252b.jpg', 'MAPP Barra Funda - Água Branca - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/18/14/33/e4214e125b8338422d15f1b92851baf8d8fad85e.jpg', 'MAPP Barra Funda - Água Branca - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/18/14/33/cb19b51bf00c4d912b59d2d8c03f93a209b0db8e.jpg', 'MAPP Barra Funda - Água Branca - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/03/21/11/33/de8da77e643036f1245eb073cc6282b014b21549.png', 'Planta ilustrativa - MAPP Barra Funda - Água Branca', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/03/21/11/33/2d5558f1a2cb7c3242ad924070c4034799fd5491.png', 'Planta ilustrativa - MAPP Barra Funda - Água Branca', 1)) as v(tipo, url, legenda, ordem);

-- MAPP Barra Funda - Perdizes
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-mapp-barra-funda-2-perdizes', 'MAPP Barra Funda - Perdizes', 'Plano&Plano', 'Empreendimento Plano&Plano em Barra Funda. Em construção. Opções de 1 e 2 dormitório(s).', 'Rua Achilles Orlando Curtolo, 156 - Barra Funda', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     null, '{}'::int[], '{1,2}'::int[], 26.69, 33.92, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Mini quadra de areia','Churrasqueira','Feirinha','Brinquedoteca','Mercadinho','Salão de festas infantil','Salão de festas adulto']::text[], 'https://www.youtube.com/watch?v=dindl143AYw', 'https://www.planoeplano.com.br/estatico/2023/02/14/16/12/c4986577a1966f20f17df1dce8ad4ee4335b2088.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/mapp-barra-funda-2/perdizes')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/02/14/16/12/c4986577a1966f20f17df1dce8ad4ee4335b2088.jpg', 'MAPP Barra Funda - Perdizes - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/01/13/14/07/6cb372227e7ea4a9395fd4315d58db3b84fae104.jpeg', 'MAPP Barra Funda - Perdizes - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/01/13/14/07/c12bfbcfde93382f2965da5e2f250255a0ebda5d.jpeg', 'MAPP Barra Funda - Perdizes - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/03/21/11/27/19cbf5ddba5e8252f4173ec9c5df16ecfd7bd3f3.png', 'Planta ilustrativa - MAPP Barra Funda - Perdizes', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/03/21/11/27/d281426549303e4ed3f530ffea635d9fc0e84061.png', 'Planta ilustrativa - MAPP Barra Funda - Perdizes', 1)) as v(tipo, url, legenda, ordem);

-- MAPP Barra Funda - Memorial
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-mapp-barra-funda-2-memorial', 'MAPP Barra Funda - Memorial', 'Plano&Plano', 'Empreendimento Plano&Plano em Barra Funda. Em construção. Opções de 1 e 2 dormitório(s).', 'Av. Marquês de São Vicente, 995 - Barra Funda', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     null, '{}'::int[], '{1,2}'::int[], 24.64, 33.92, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Feirinha','Playground','Coworking','Mercadinho','Salão de festas','Churrasqueira']::text[], 'https://www.youtube.com/watch?v=pMZL3a7Spac', 'https://www.planoeplano.com.br/estatico/2023/09/15/10/58/eae4f2363e944cb923149bf3fd678f1ea22e9876.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/mapp-barra-funda-2/memorial')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/09/15/10/58/eae4f2363e944cb923149bf3fd678f1ea22e9876.jpg', 'MAPP Barra Funda - Memorial - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/09/01/09/55/6a2972ed6f6ddadd0b46c73b2574c9c9508fb9f6.jpeg', 'MAPP Barra Funda - Memorial - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/09/01/09/55/dfc026b3d1a3c6f9e539f76dc99a448031845973.jpg', 'MAPP Barra Funda - Memorial - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/09/01/10/07/99be167455cef5c8f91cb9a1cb26d1299701a904.png', 'Planta ilustrativa - MAPP Barra Funda - Memorial', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/09/01/10/07/ac96b401713710ace45fe313840a0192a400dbbb.png', 'Planta ilustrativa - MAPP Barra Funda - Memorial', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Guaianases - Estaleirador
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planoguaianases-estaleirador', 'Plano&Guaianases - Estaleirador', 'Plano&Plano', 'Empreendimento Plano&Plano em Guaianases. Em construção. Opções de 2 dormitório(s).', 'Rua Estaleirador, 159 - Guaianases', 'Guaianases', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 31.2, 33.98, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Churrasqueira','Feirinha','Salão de festas','Living','Playground','Quadra','Brinquedoteca']::text[], 'https://www.youtube.com/watch?v=GjFus1RVmbg', 'https://www.planoeplano.com.br/estatico/2023/08/21/15/58/d793fe8de7e47edd115ed6e4d66bc665cb73cf8d.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planoguaianases/estaleirador')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/08/21/15/58/d793fe8de7e47edd115ed6e4d66bc665cb73cf8d.jpg', 'Plano&Guaianases - Estaleirador - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/05/15/17/26/a0d3a7c32e7edb6c7adc4b05f9f0e3e79c997162.jpg', 'Plano&Guaianases - Estaleirador - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/05/15/17/26/e9b26479d40e78902e7bf85d6a20a5aec98302a0.jpg', 'Plano&Guaianases - Estaleirador - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/05/15/17/27/1f216c85ec559e14ab2e5a2863498dadd9e35a7e.jpg', 'Planta ilustrativa - Plano&Guaianases - Estaleirador', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/05/15/17/27/43e6bfdbc235d7bd796dc05af83fff70971d5d38.jpg', 'Planta ilustrativa - Plano&Guaianases - Estaleirador', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Guaianases - Estrada de Poá
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planoguaianases-estrada-de-poa', 'Plano&Guaianases - Estrada de Poá', 'Plano&Plano', 'Empreendimento Plano&Plano em Guaianases. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Estrada de Poá x Rua Estaleirador S/N - Guaianases', 'Guaianases', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 32.56, 32.56, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Bicicletário','Churrasqueira','Feirinha','Playground','Living','Brinquedoteca','Salão de festas']::text[], 'https://www.youtube.com/watch?v=GjFus1RVmbg', 'https://www.planoeplano.com.br/estatico/2023/05/09/16/51/460995ef317a422dd79bdcb40f70c875d6a6fae6.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planoguaianases/estrada-de-poa')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/05/09/16/51/460995ef317a422dd79bdcb40f70c875d6a6fae6.png', 'Plano&Guaianases - Estrada de Poá - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/05/09/16/51/e9b942636c0a87e391b88096382e3c5c8387072e.png', 'Plano&Guaianases - Estrada de Poá - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/05/09/16/51/b0c5d099f1bbc0d9efde81aba9ebf71916e33361.png', 'Plano&Guaianases - Estrada de Poá - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/05/17/14/41/6299063063fb823e6b9e363755d5e6a3389d4e73.jpg', 'Planta ilustrativa - Plano&Guaianases - Estrada de Poá', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/06/01/10/27/591c6a604585148c668e6f6303928e85af42c684.jpg', 'Planta ilustrativa - Plano&Guaianases - Estrada de Poá', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Mais Itaquera - Marabá
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planomais-itaquera-2-maraba', 'Plano&Mais Itaquera - Marabá', 'Plano&Plano', 'Empreendimento Plano&Plano em Itaquera. Em construção. Opções de 2 dormitório(s).', 'Rua São Félix do Piauí, 755 - Itaquera', 'Itaquera', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 31.16, 32.11, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Churrasqueira','Playground','Bicicletário','Fitness','Salão de Festas']::text[], 'https://www.youtube.com/watch?v=tzXye_-UNeE', 'https://www.planoeplano.com.br/estatico/2026/06/18/15/16/a9d0b25a8a709729459ed5486521443cfb2515c1.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planomais-itaquera-2/maraba')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/18/15/16/a9d0b25a8a709729459ed5486521443cfb2515c1.jpg', 'Plano&Mais Itaquera - Marabá - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/18/15/16/ad58859f850bfc073d27276acfa651e74a4cbe98.jpg', 'Plano&Mais Itaquera - Marabá - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/06/18/15/16/589dc66872127e6e16146c7677ed00624ba2416a.jpg', 'Plano&Mais Itaquera - Marabá - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/03/20/15/27/acd4e76233909a8ac9941b5690f51d94bc658a6f.jpg', 'Planta ilustrativa - Plano&Mais Itaquera - Marabá', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/03/20/15/27/f5f9b6d063cbcaf246ef2958732ab1848f555429.jpg', 'Planta ilustrativa - Plano&Mais Itaquera - Marabá', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Mais Itaquera - Itamaracá
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planomais-itaquera-2-itamaraca', 'Plano&Mais Itaquera - Itamaracá', 'Plano&Plano', 'Empreendimento Plano&Plano em Itaquera. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua Lagoa do Campelo, 461 - Itaquera', 'Itaquera', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 31.62, 34.46, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Piscina','Pet Care','Mini Mercado','Living','Sala funcional','Playground','Salão de festas','Coworking']::text[], 'https://www.youtube.com/watch?v=tzXye_-UNeE', 'https://www.planoeplano.com.br/estatico/2023/05/25/15/57/b09a1421c6ecb8a5793b7dacd637bb1d44ff287e.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planomais-itaquera-2/itamaraca')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/05/25/15/57/b09a1421c6ecb8a5793b7dacd637bb1d44ff287e.jpg', 'Plano&Mais Itaquera - Itamaracá - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/05/25/15/57/a1f37fcb3e383681255be1b0efbfbc61f9d95341.jpg', 'Plano&Mais Itaquera - Itamaracá - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/05/25/15/57/f032e5166b24bd71fe52ad08d1d4fc9f540731a8.jpg', 'Plano&Mais Itaquera - Itamaracá - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/05/25/15/59/cc0c336c8000c43fced3d8b3417c171ab8672103.jpg', 'Planta ilustrativa - Plano&Mais Itaquera - Itamaracá', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/05/25/15/59/0541f09c6eeee1c9771b417714fa51176711fadc.jpg', 'Planta ilustrativa - Plano&Mais Itaquera - Itamaracá', 1)) as v(tipo, url, legenda, ordem);

-- Portal Barra Funda - Vila Tiradentes
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-portal-barra-funda-vila-tiradentes', 'Portal Barra Funda - Vila Tiradentes', 'Plano&Plano', 'Empreendimento Plano&Plano em Barra Funda. Imóvel pronto para morar. Opções de 1 e 2 dormitório(s).', 'Av. Rudge, 305 - Barra Funda', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     null, '{}'::int[], '{1,2}'::int[], 27.61, 37.53, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Fitness Externo','Brinquedoteca','Churrasqueira','Playground','Pet Care','Fitness','Salão de festas']::text[], 'https://www.youtube.com/watch?v=dze0y8-yqMg', 'https://www.planoeplano.com.br/estatico/2024/02/28/17/12/7f3f3aed4c0abf746b60913eccc0cc1b88a8c9eb.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/portal-barra-funda/vila-tiradentes')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/28/17/12/7f3f3aed4c0abf746b60913eccc0cc1b88a8c9eb.png', 'Portal Barra Funda - Vila Tiradentes - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/28/17/19/85f450b3e2ee7522a1f8dac991b4303d9ec2a116.png', 'Portal Barra Funda - Vila Tiradentes - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/28/17/19/5ffbff741ad7328cd85fd07dc0cf924ebb269a4b.png', 'Portal Barra Funda - Vila Tiradentes - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/05/20/17/52/995bd38d1e8cc2985ae994663ba43cd25e508b2b.jpg', 'Planta ilustrativa - Portal Barra Funda - Vila Tiradentes', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/05/20/17/52/07d126814a1690c589efda9c459279b8e4b3e71a.jpg', 'Planta ilustrativa - Portal Barra Funda - Vila Tiradentes', 1)) as v(tipo, url, legenda, ordem);

-- Portal Barra Funda - Vila Pacaembu
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-portal-barra-funda-vila-pacaembu', 'Portal Barra Funda - Vila Pacaembu', 'Plano&Plano', 'Empreendimento Plano&Plano em Barra Funda. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua do Bosque, 130 - Barra Funda', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     null, '{}'::int[], '{2}'::int[], 34.52, 34.52, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Pet care','Portaria','Churrasqueira','Playground','Salão de festas','Bicicletário','Brinquedoteca']::text[], 'https://www.youtube.com/watch?v=EIRXdbwjb2o', 'https://www.planoeplano.com.br/estatico/2023/02/16/15/12/6868f0cfd9560df560ba44e960534ded5e30657e.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/portal-barra-funda/vila-pacaembu')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/02/16/15/12/6868f0cfd9560df560ba44e960534ded5e30657e.jpg', 'Portal Barra Funda - Vila Pacaembu - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/02/16/15/12/f0baaa3e201657f9c8ace68c1749a39fb42f0364.jpg', 'Portal Barra Funda - Vila Pacaembu - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/02/16/15/12/e8ef91abaeae058586cbed15e3600438eede4823.jpg', 'Portal Barra Funda - Vila Pacaembu - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/11/11/19/53/3791d82fdcab1f2f021a15c98992b1d2ac4aa2f3.jpg', 'Planta ilustrativa - Portal Barra Funda - Vila Pacaembu', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/11/11/19/53/f647454d28a686d4518ead43b79135d9baddb40d.jpg', 'Planta ilustrativa - Portal Barra Funda - Vila Pacaembu', 1)) as v(tipo, url, legenda, ordem);

-- Portal Barra Funda - Vila Rudge
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-portal-barra-funda-vila-rudge', 'Portal Barra Funda - Vila Rudge', 'Plano&Plano', 'Empreendimento Plano&Plano em Barra Funda. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua do Bosque, 136 - Barra Funda', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     null, '{}'::int[], '{2}'::int[], 34.52, 34.52, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Brinquedoteca','Fitness','Petcare','Salão de festas','Churrasqueira','Estacionamento','Bicicletário']::text[], 'https://www.youtube.com/watch?v=fwx-eLHMUgU', 'https://www.planoeplano.com.br/estatico/2023/06/02/17/14/9a9c9fa6f59ab5f8d1a63400253ee593a0abd183.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/portal-barra-funda/vila-rudge')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/06/02/17/14/9a9c9fa6f59ab5f8d1a63400253ee593a0abd183.jpg', 'Portal Barra Funda - Vila Rudge - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/06/02/17/14/a28c7d444d7b661b320b111172f3edd9345ce266.jpg', 'Portal Barra Funda - Vila Rudge - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/06/02/17/14/9bf8557f24a4717742bbda55431a3a342d8bc918.jpg', 'Portal Barra Funda - Vila Rudge - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2021/05/25/15/50/6e92181325f7a48161968918b6c343447c54169c.jpg', 'Planta ilustrativa - Portal Barra Funda - Vila Rudge', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2021/05/25/15/50/42c355599ac57ad56a58c7a1f13a05d2e007aea8.jpg', 'Planta ilustrativa - Portal Barra Funda - Vila Rudge', 1)) as v(tipo, url, legenda, ordem);

-- Portal Barra Funda - Vila Marquês
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-portal-barra-funda-vila-marques', 'Portal Barra Funda - Vila Marquês', 'Plano&Plano', 'Empreendimento Plano&Plano em Barra Funda. Imóvel pronto para morar. Opções de 1 e 2 dormitório(s).', 'Avenida Rudge, 485 - Barra Funda', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     null, '{}'::int[], '{1,2}'::int[], 27.61, 37.53, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Brinquedoteca','Bicicletário','Churrasqueira','Salão de festas','Playground','Fitness externo','Pet Care']::text[], 'https://www.youtube.com/watch?v=lKpvg4sfe_E', 'https://www.planoeplano.com.br/estatico/2022/07/29/15/42/4e3b38a440c7d601c96d66c7da37c012aaa565e6.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/portal-barra-funda/vila_marques')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2022/07/29/15/42/4e3b38a440c7d601c96d66c7da37c012aaa565e6.jpg', 'Portal Barra Funda - Vila Marquês - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2022/07/29/15/42/ebe8d195397f7b7b680fc4c90a8b1917a81a9d8f.jpg', 'Portal Barra Funda - Vila Marquês - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2022/07/29/15/42/3fea5ce9df792ddc59111c32b87d5ba471d5c98a.jpg', 'Portal Barra Funda - Vila Marquês - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/07/21/16/46/18a6aa01c18c0c7b3dfb90d4a1c0d2f408192f99.jpg', 'Planta ilustrativa - Portal Barra Funda - Vila Marquês', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/07/21/16/46/62b179c56eb7e1b39bc20cf79479a36802e5c682.jpg', 'Planta ilustrativa - Portal Barra Funda - Vila Marquês', 1)) as v(tipo, url, legenda, ordem);

-- Portal Barra Funda - Vila Rio Branco
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-portal-barra-funda-vila-rio-branco', 'Portal Barra Funda - Vila Rio Branco', 'Plano&Plano', 'Empreendimento Plano&Plano em Barra Funda. Imóvel pronto para morar. Opções de 1 e 2 dormitório(s).', 'Avenida Rudge, 417 - Barra Funda', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     null, '{}'::int[], '{1,2}'::int[], 27.61, 34.52, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Brinquedoteca','Área Externa','Churrasqueira','Fitness','Bicicletário','Salão de festas']::text[], null, 'https://www.planoeplano.com.br/estatico/2025/11/21/12/21/d6cd1a5f07f89c5aa589a4fb58460736d0da7126.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/portal-barra-funda/vila-rio-branco')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/11/21/12/21/d6cd1a5f07f89c5aa589a4fb58460736d0da7126.png', 'Portal Barra Funda - Vila Rio Branco - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/11/21/12/21/ba743a01b9fcf61dc0102281aa2dd0fd082aafb8.png', 'Portal Barra Funda - Vila Rio Branco - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/11/21/12/21/1c3925bbae2b81a79aec9e0e8c40345f382b09a8.png', 'Portal Barra Funda - Vila Rio Branco - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/05/31/14/36/83a9d90b5ae45073b9f4f3afbb908b0970f26a49.jpeg', 'Planta ilustrativa - Portal Barra Funda - Vila Rio Branco', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/05/31/14/36/d649c4f505f1d8f185beae9e1fa7a3df7073c53e.jpg', 'Planta ilustrativa - Portal Barra Funda - Vila Rio Branco', 1)) as v(tipo, url, legenda, ordem);

-- Portal Vista da Represa - Vila Atlântica
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-portal-vista-da-represa-planovila-atlantica', 'Portal Vista da Represa - Vila Atlântica', 'Plano&Plano', 'Empreendimento Plano&Plano em Guarapiranga. Imóvel pronto para morar. Opções de 1 dormitório(s).', 'Rua Nora Ney, 80 - Guarapiranga', 'Guarapiranga', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{1}'::int[], 27.61, 37.53, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Bicicletário','Playground','Salão de festas','Sala de ginástica','Lavanderia']::text[], 'https://www.youtube.com/watch?v=SaICh7x2vNk', 'https://www.planoeplano.com.br/estatico/2024/06/03/14/12/5724002503e1d0667c2454f452f2cd4e38d19168.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/portal-vista-da-represa/planovila-atlantica')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/06/03/14/12/5724002503e1d0667c2454f452f2cd4e38d19168.png', 'Portal Vista da Represa - Vila Atlântica - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/06/03/14/12/fddd91fe75f90711d10694d0beae9586329f201a.png', 'Portal Vista da Represa - Vila Atlântica - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/06/03/14/13/c4d369aca92164990f48c7ab1ee66754f937e7bc.png', 'Portal Vista da Represa - Vila Atlântica - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/03/03/16/02/7111bcc6f17fd0c8711b93e1d6a3d919beca9084.jpg', 'Planta ilustrativa - Portal Vista da Represa - Vila Atlântica', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/03/03/16/02/732212a37642f415b437d400750d7b48482a4a03.jpg', 'Planta ilustrativa - Portal Vista da Represa - Vila Atlântica', 1)) as v(tipo, url, legenda, ordem);

-- Portal Vista da Represa - Vila Guarapiranga
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-portal-vista-da-represa-planoguarapiranga', 'Portal Vista da Represa - Vila Guarapiranga', 'Plano&Plano', 'Empreendimento Plano&Plano em Guarapiranga. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua Nora Ney, 120 - Guarapiranga', 'Guarapiranga', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{2}'::int[], 32.29, 34.8, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Bicicletário','Churrasqueira','Playground','Estacionamento','Salão de festas']::text[], 'https://www.youtube.com/watch?v=Eo8Ek-HRirA', 'https://www.planoeplano.com.br/estatico/2024/06/10/18/31/e853b026c2fd98644ce94030fa58aee5c78028c1.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/portal-vista-da-represa/planoguarapiranga')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/06/10/18/31/e853b026c2fd98644ce94030fa58aee5c78028c1.jpg', 'Portal Vista da Represa - Vila Guarapiranga - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/06/10/18/32/d86e8f85f3afe3cddabebab5f72ce1c06cbeef4c.jpg', 'Portal Vista da Represa - Vila Guarapiranga - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/06/10/18/32/8ed90723b0cbcdab9ea534faa042674f0c94e423.jpg', 'Portal Vista da Represa - Vila Guarapiranga - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/03/24/10/45/8ae86aa115225d88f5cfdccc8f712012903bcde3.jpg', 'Planta ilustrativa - Portal Vista da Represa - Vila Guarapiranga', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/03/24/10/45/1a1d0b646388b6eceedd2f94c9e78421cd7f76f9.jpg', 'Planta ilustrativa - Portal Vista da Represa - Vila Guarapiranga', 1)) as v(tipo, url, legenda, ordem);

-- Portal Vista da Represa - Vila Rio Bonito
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-portal-vista-da-represa-vila-rio-bonito', 'Portal Vista da Represa - Vila Rio Bonito', 'Plano&Plano', 'Empreendimento Plano&Plano em Guarapiranga. Em construção. Opções de 2 dormitório(s).', 'Rua José Rafaeli, S/N - Guarapiranga', 'Guarapiranga', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{2}'::int[], 32.46, 43.85, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Fitness','Living','Pet Care','Salão de festas','Brinquedoteca','Coworking','Churrasqueira','Playground']::text[], 'https://www.youtube.com/watch?v=9QBIUwBdTnw', 'https://www.planoeplano.com.br/estatico/2023/04/24/17/25/b2aac9890b8976ac11d7391adaf58641146ea86e.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/portal-vista-da-represa/vila-rio-bonito')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/04/24/17/25/b2aac9890b8976ac11d7391adaf58641146ea86e.jpg', 'Portal Vista da Represa - Vila Rio Bonito - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/04/24/17/25/5c43960dba40adb59993f9811da39e78df6e8745.jpg', 'Portal Vista da Represa - Vila Rio Bonito - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/04/24/17/25/6ed426bbb093054cf7b987b8b53a538e099c3e3c.jpg', 'Portal Vista da Represa - Vila Rio Bonito - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/05/15/17/18/f0c7977b8d2c364ce6d3cf60a822f3867b692dc3.jpg', 'Planta ilustrativa - Portal Vista da Represa - Vila Rio Bonito', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/05/15/17/18/e138b6a62ee05bfd848bdcde3fb68d6b91cd5f31.jpg', 'Planta ilustrativa - Portal Vista da Represa - Vila Rio Bonito', 1)) as v(tipo, url, legenda, ordem);

-- Portal Vila Prudente - Vila Falconi
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-portal-vila-prudente-vila-falconi', 'Portal Vila Prudente - Vila Falconi', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Prudente. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Avenida Luiz Inácio Anhaia Mello, 3949 - Vila Prudente', 'Vila Prudente', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 32.55, 34.73, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Churrasqueira','Bicicletário','Playground','Estacionamento','Sala de Ginástica']::text[], 'https://www.youtube.com/watch?v=jYbJAJITVgA', 'https://www.planoeplano.com.br/estatico/2024/07/30/14/24/c96f198a4f85ba861eba1359a6ae0037a8eef76c.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/portal-vila-prudente/vila-falconi')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/07/30/14/24/c96f198a4f85ba861eba1359a6ae0037a8eef76c.png', 'Portal Vila Prudente - Vila Falconi - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/07/30/14/24/dac8bbb2e678b7f83ac79e5ff07debd21834d363.png', 'Portal Vila Prudente - Vila Falconi - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/07/30/14/25/b8c12d8029320d9c024defdfe7216b4439bcb789.png', 'Portal Vila Prudente - Vila Falconi - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/07/20/09/58/38971f1364459b663bdeed6974a90435bdd34612.jpg', 'Planta ilustrativa - Portal Vila Prudente - Vila Falconi', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/07/20/09/58/7ce85643603407fc1af06557069f377da132994e.jpg', 'Planta ilustrativa - Portal Vila Prudente - Vila Falconi', 1)) as v(tipo, url, legenda, ordem);

-- Portal Vila Prudente - Vila Sapopemba
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-portal-vila-prudente-vila-sapopemba', 'Portal Vila Prudente - Vila Sapopemba', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Prudente. Imóvel pronto para morar. Opções de 1 dormitório(s).', 'Av. Vila Ema, 2208 - Vila Prudente', 'Vila Prudente', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{1}'::int[], 27.61, 37.06, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Playground','Churrasqueira','Pet place','Bicicletário','Rooftop']::text[], 'https://www.youtube.com/watch?v=fVYkxgYBiCk', 'https://www.planoeplano.com.br/estatico/2023/12/20/10/43/a22d9cabb067fae072d53b7c9222c86d90a925a5.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/portal-vila-prudente/vila-sapopemba')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/12/20/10/43/a22d9cabb067fae072d53b7c9222c86d90a925a5.jpg', 'Portal Vila Prudente - Vila Sapopemba - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/12/20/10/43/f473ef5aabeef17a23ae1522832e7631ab03a210.jpg', 'Portal Vila Prudente - Vila Sapopemba - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/12/20/10/43/a4a32b8cf1087bcf0c186f4cc1030bfca9ced652.jpg', 'Portal Vila Prudente - Vila Sapopemba - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2021/10/27/13/25/815f333090a25c6d474bd35a8533037c246b2055.jpg', 'Planta ilustrativa - Portal Vila Prudente - Vila Sapopemba', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2021/10/27/13/25/03d90797047a8ba9cc1a3589cb7f62d6537d33bf.jpg', 'Planta ilustrativa - Portal Vila Prudente - Vila Sapopemba', 1)) as v(tipo, url, legenda, ordem);

-- Portal Vila Prudente - Vila Oratório
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-portal-vila-prudente-vila-oratorio', 'Portal Vila Prudente - Vila Oratório', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Prudente. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Avenida Vila Ema, 2258 - Vila Prudente', 'Vila Prudente', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 32.75, 34.73, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Fitness Externo','Pet Land','Playground','Churrasqueira','Fitness']::text[], 'https://www.youtube.com/watch?v=fVYkxgYBiCk', 'https://www.planoeplano.com.br/estatico/2024/04/29/18/02/334879278bdbb44a14d52b474217f1f1230bd669.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/portal-vila-prudente/vila-oratorio')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/04/29/18/02/334879278bdbb44a14d52b474217f1f1230bd669.jpg', 'Portal Vila Prudente - Vila Oratório - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/04/29/18/02/d2039b9c5be94327f4d26f6e05d568df39d7a6fd.jpg', 'Portal Vila Prudente - Vila Oratório - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/04/29/18/03/fde5c4df47ee33cd1f7c84a9244c4ad09f67ae48.jpg', 'Portal Vila Prudente - Vila Oratório - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2021/10/27/10/51/f6cec9b743e095bca62d461a43e4c41c96b57c72.jpg', 'Planta ilustrativa - Portal Vila Prudente - Vila Oratório', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/02/07/15/16/20a12197af6e9455b12f16fb8c1d01f3f6bb77b1.png', 'Planta ilustrativa - Portal Vila Prudente - Vila Oratório', 1)) as v(tipo, url, legenda, ordem);

-- Portal Vila Prudente - Vila Anhaia Mello
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-portal-vila-prudente-vila-anhaia-mello', 'Portal Vila Prudente - Vila Anhaia Mello', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Prudente. Imóvel pronto para morar. Opções de 1 dormitório(s).', 'Avenida Vila Ema, 2180 - Vila Prudente', 'Vila Prudente', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{1}'::int[], 26.14, 32.56, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Rooftop','Salão de festas','Churrasqueira','Fitness externo']::text[], 'https://www.youtube.com/watch?v=rTQI3g9YzHE', 'https://www.planoeplano.com.br/estatico/2023/01/26/12/14/e4ac25d455b225607b45f5bd1dc011fa1ece4ef4.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/portal-vila-prudente/vila-anhaia-mello')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/01/26/12/14/e4ac25d455b225607b45f5bd1dc011fa1ece4ef4.jpg', 'Portal Vila Prudente - Vila Anhaia Mello - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/01/26/12/14/70c3e36dc8ab05dd5a2d589afec6d31c7f427e47.jpg', 'Portal Vila Prudente - Vila Anhaia Mello - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/01/26/12/14/ceb9242c04fceb077efdc5533542f773e62ff3e2.jpg', 'Portal Vila Prudente - Vila Anhaia Mello - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/09/11/10/52/51f45d3c50a669de37130d7e711c9ae0fdeafb50.jpg', 'Planta ilustrativa - Portal Vila Prudente - Vila Anhaia Mello', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/09/11/10/52/86befe3f4873b9bcba8c176bab881fd3c82e4f1a.jpg', 'Planta ilustrativa - Portal Vila Prudente - Vila Anhaia Mello', 1)) as v(tipo, url, legenda, ordem);

-- Portal Vila Prudente - Vila Ema
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-portal-vila-prudente-vila-ema', 'Portal Vila Prudente - Vila Ema', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Ema. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Avenida Vila Ema, 2180 - Vila Ema', 'Vila Ema', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 32.39, 32.39, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Área externa','Brinquedoteca','Churrasqueira','Fitness','Pet care','Pet place','Salão de festas']::text[], 'https://www.youtube.com/watch?v=GtgmQQK-O1I', 'https://www.planoeplano.com.br/estatico/2023/04/03/17/52/7526b858e3863abde05352fc25d6139a2728f859.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/portal-vila-prudente/vila-ema')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/04/03/17/52/7526b858e3863abde05352fc25d6139a2728f859.jpg', 'Portal Vila Prudente - Vila Ema - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/04/03/17/52/1987f510546b667dfc7572ae8fcc5bf731e63682.jpg', 'Portal Vila Prudente - Vila Ema - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/04/03/17/52/aab356abc47bc4bef5cd79bb8ab392f7710136a2.jpg', 'Portal Vila Prudente - Vila Ema - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/07/22/15/19/21428c46503ec23e1f947a85799d31d14b4d08ca.jpg', 'Planta ilustrativa - Portal Vila Prudente - Vila Ema', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/07/22/15/19/860d0449a0dae229d537e85bf657f98ecc3b1183.jpg', 'Planta ilustrativa - Portal Vila Prudente - Vila Ema', 1)) as v(tipo, url, legenda, ordem);

-- Portal Vila Prudente - Vila Zelina
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-portal-vila-prudente-vila-zelina', 'Portal Vila Prudente - Vila Zelina', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Prudente. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Avenida Professor Luiz Ignácio Anhaia Mello, 4001 - Vila Prudente', 'Vila Prudente', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 32.39, 42.53, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Brinquedoteca','Fitness','Churrasqueira','Bicicletário','Salão de festas','Ginástica','Pet care']::text[], 'https://www.youtube.com/watch?v=Sn9xWWkcfZ4', 'https://www.planoeplano.com.br/estatico/2025/06/18/14/07/dd4ea6ac5fd694fe3527dac59d87416e97a420d6.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/portal-vila-prudente/vila-zelina')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/06/18/14/07/dd4ea6ac5fd694fe3527dac59d87416e97a420d6.jpg', 'Portal Vila Prudente - Vila Zelina - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/06/18/14/07/68584d15692e0ca1ede378c1e44c9da2d8062cdd.jpg', 'Portal Vila Prudente - Vila Zelina - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/06/18/14/07/2d49c2b079f8781cebb7dd85b40eea9c7050e038.jpg', 'Portal Vila Prudente - Vila Zelina - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/03/24/18/05/f622b35a466ce25c72ef4e935db5bf53a83114a7.png', 'Planta ilustrativa - Portal Vila Prudente - Vila Zelina', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/03/24/18/05/1504be815a2f2abf247c09bd83220f1caf512e1e.png', 'Planta ilustrativa - Portal Vila Prudente - Vila Zelina', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Curuçá - Curuçá II
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planocuruca-curuca-ii', 'Plano&Curuçá - Curuçá II', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Curuçá. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua Osório Franco Vilhena, 917 - Vila Curuçá', 'Vila Curuçá', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 32.75, 32.75, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Brinquedoteca','Churrasqueira','Bicicletário','Fitness']::text[], 'https://www.youtube.com/watch?v=-Eu_rNqaMVs', 'https://www.planoeplano.com.br/estatico/2025/06/18/13/18/251a7b0407b0d5855459137227ca7c57fefc01d4.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planocuruca/curuca-ii')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/06/18/13/18/251a7b0407b0d5855459137227ca7c57fefc01d4.jpg', 'Plano&Curuçá - Curuçá II - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/06/18/13/18/0ab5e65b96c69852601f2a90b2dd4753578a20f0.jpg', 'Plano&Curuçá - Curuçá II - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/06/18/13/18/af6dbb8c9521840d19eef506398e2b07c8a0dd3f.jpg', 'Plano&Curuçá - Curuçá II - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/09/05/18/35/6785a670a9e30376cebd1b82c202e77f92144a6e.jpg', 'Planta ilustrativa - Plano&Curuçá - Curuçá II', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/09/12/14/27/c8961755927c66b72015eef9c578aed0a6f5f11b.png', 'Planta ilustrativa - Plano&Curuçá - Curuçá II', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Curuçá - Curuçá I
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planocuruca-curuca-i', 'Plano&Curuçá - Curuçá I', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Curuçá. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua Osório Franco Vilhena, 893 - Vila Curuçá', 'Vila Curuçá', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 32, 32, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Churrasqueira','Bicicletário','Playground','Salão de festas','Fitness']::text[], 'https://www.youtube.com/watch?v=hHdckNpaT4g', 'https://www.planoeplano.com.br/estatico/2022/12/15/11/01/0cccd3227192d83e33e424c551f45beca7cb91ed.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planocuruca/curuca-i')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2022/12/15/11/01/0cccd3227192d83e33e424c551f45beca7cb91ed.jpg', 'Plano&Curuçá - Curuçá I - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2022/12/15/11/01/8c5df0ba6ca4fb8c25da0dbb2848a31969c34e11.jpg', 'Plano&Curuçá - Curuçá I - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2022/12/15/11/01/43d4751454ef5f75ec9284cdfeb527ccb15e056a.jpg', 'Plano&Curuçá - Curuçá I - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/09/14/18/47/ade2d5ef90c99e4296d85aec7f5305bc966ca412.jpg', 'Planta ilustrativa - Plano&Curuçá - Curuçá I', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/09/14/18/47/7d51e64f956990437a0d0228da24f618dd78302d.jpg', 'Planta ilustrativa - Plano&Curuçá - Curuçá I', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Parque Nabuco - Sabiá
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planoparque-nabuco-sabia', 'Plano&Parque Nabuco - Sabiá', 'Plano&Plano', 'Empreendimento Plano&Plano em Cupecê. Imóvel pronto para morar. Opções de 1 e 2 dormitório(s).', 'Rua Manuel Alves de Siqueira, 51 - Cupecê', 'Cupecê', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{1,2}'::int[], 26.76, 33.93, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Piscina','Delivery','Mini mercado','Pet Care','Salão de festas','Lavanderia','Playground','Quadra']::text[], 'https://www.youtube.com/watch?v=LiR8lZMTBs0', 'https://www.planoeplano.com.br/estatico/2023/02/13/15/30/ab63f4496264c9afb61b47478fdb9255b5070ea9.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planoparque-nabuco/sabia')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/02/13/15/30/ab63f4496264c9afb61b47478fdb9255b5070ea9.jpg', 'Plano&Parque Nabuco - Sabiá - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/02/13/15/30/5aac13e369ec11b42e1144a9fc902c62b00f63ed.jpg', 'Plano&Parque Nabuco - Sabiá - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/02/13/15/30/3fcccb0f16643003a58d4862dfd691ad144ebd81.jpg', 'Plano&Parque Nabuco - Sabiá - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/02/16/15/56/34f129156a22c5b356dc5d528f1fc234262861fa.jpg', 'Planta ilustrativa - Plano&Parque Nabuco - Sabiá', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2023/02/16/15/56/887b5b64c9596f2e90ced7a9c94251842c2e688e.jpg', 'Planta ilustrativa - Plano&Parque Nabuco - Sabiá', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Parque Nabuco - Canário
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planoparque-nabuco-canario', 'Plano&Parque Nabuco - Canário', 'Plano&Plano', 'Empreendimento Plano&Plano em Cupecê. Imóvel pronto para morar. Opções de 1 e 2 dormitório(s).', 'Rua Manoel Soares de Oliveira, 51 - Cupecê', 'Cupecê', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{1,2}'::int[], 26.14, 32.56, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Playground','Churrasqueira','Bicicletário','Brinquedoteca','Fitness','Ginástica']::text[], 'https://www.youtube.com/watch?v=2CAXx7IHhJs', 'https://www.planoeplano.com.br/estatico/2023/10/06/10/40/18bc18d8e04b054056889264cf61d9a4a00dd186.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planoparque-nabuco/canario')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/10/06/10/40/18bc18d8e04b054056889264cf61d9a4a00dd186.jpg', 'Plano&Parque Nabuco - Canário - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/10/06/10/40/05909e7eacaf84eff338c66886374ccd44b28cf0.jpg', 'Plano&Parque Nabuco - Canário - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/10/06/10/40/527a3b96ca7e103275b288bcb13dce30b9a2d777.jpg', 'Plano&Parque Nabuco - Canário - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/12/18/18/15/9f3c4310b1cc52b3cdeca594ecefdcca85e7b0cd.jpg', 'Planta ilustrativa - Plano&Parque Nabuco - Canário', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/12/18/18/15/e50d373c4ecd230bcbaa2299cdbaea68802c8bc3.jpg', 'Planta ilustrativa - Plano&Parque Nabuco - Canário', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Novo Mundo - Conquista
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planonovo-mundo-conquista', 'Plano&Novo Mundo - Conquista', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Maria. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua da Baracela, 457 - Vila Maria', 'Vila Maria', 'São Paulo', 'SP', 'zona_norte',
     235517, '{1,2,3,4}'::int[], '{2}'::int[], 32.38, 32.76, false, 'pronto', true,
     'Valor "a partir de" informado pela Plano&Plano em 03/11/2026, sujeito a alteração e disponibilidade.', array['Portaria','Área Externa','Mini Quadra','Churrasqueira','Bicicletário','Fitness','Espaço Beleza']::text[], 'https://www.youtube.com/watch?v=X6fSYQWFbDo', 'https://www.planoeplano.com.br/estatico/2025/04/16/17/55/3ec7880e7bf85c533582e334e9c4eb983e50b779.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planonovo-mundo/conquista')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/04/16/17/55/3ec7880e7bf85c533582e334e9c4eb983e50b779.png', 'Plano&Novo Mundo - Conquista - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/04/16/17/55/566d55e8ae8a88bfba1434e75637278ab95ae1dd.jpg', 'Plano&Novo Mundo - Conquista - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/04/16/17/55/3c560887d9f4f918210653965c4a3a7876af1c0f.jpg', 'Plano&Novo Mundo - Conquista - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/06/27/16/56/e2016d562034a82bb0a3f026f6950ee788886dce.jpg', 'Planta ilustrativa - Plano&Novo Mundo - Conquista', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/01/16/09/59/6541eef88b0937e4fea9f90bf54c51e20431f37c.png', 'Planta ilustrativa - Plano&Novo Mundo - Conquista', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Novo Mundo - Vitória
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planonovo-mundo-vitoria', 'Plano&Novo Mundo - Vitória', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Maria. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua da Baracela, 461 - Vila Maria', 'Vila Maria', 'São Paulo', 'SP', 'zona_norte',
     null, '{}'::int[], '{2}'::int[], 32.38, 32.76, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Área externa','Estacionamento','Churrasqueira','Bicicletário']::text[], 'https://www.youtube.com/watch?v=R9Iis4Cix6Q', 'https://www.planoeplano.com.br/estatico/2025/06/18/14/10/46005e144ea36286ec01e1584b69b6a501540914.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planonovo-mundo/vitoria')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/06/18/14/10/46005e144ea36286ec01e1584b69b6a501540914.jpg', 'Plano&Novo Mundo - Vitória - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/06/18/14/10/54a41a7c539cbadbcd16e3156231266c3eeca15b.jpg', 'Plano&Novo Mundo - Vitória - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/06/18/14/10/3fc4ec66feafae59cb746b23a03a1798059ffb0d.jpg', 'Plano&Novo Mundo - Vitória - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/06/27/18/20/a0475fd5c012c8e837e3196b24a025a014279687.jpg', 'Planta ilustrativa - Plano&Novo Mundo - Vitória', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/01/16/10/46/a8fac267a12e777d1e91d7bc7025dd8349f069ef.png', 'Planta ilustrativa - Plano&Novo Mundo - Vitória', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Novo Mundo - Realização
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planonovo-mundo-realizacao', 'Plano&Novo Mundo - Realização', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Maria. Em construção. Opções de 2 dormitório(s).', 'Rua da Baracela, 465 - Vila Maria', 'Vila Maria', 'São Paulo', 'SP', 'zona_norte',
     null, '{}'::int[], '{2}'::int[], 32.38, 32.76, false, 'em_obras', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Brinquedoteca','Coworking','Cinesky','Churrasqueira','Espaço delivery','Playground','Espaço ginástica','Fitness interno']::text[], 'https://www.youtube.com/watch?v=5tg9jedMniw', 'https://www.planoeplano.com.br/estatico/2022/06/27/18/41/bccb7fb2146d07d3aa01e4ee1482449bfce77dac.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planonovo-mundo/realizacao')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2022/06/27/18/41/bccb7fb2146d07d3aa01e4ee1482449bfce77dac.jpg', 'Plano&Novo Mundo - Realização - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2022/06/27/18/41/666554b1ac456e350d01add7031d96c0b305c5bd.jpg', 'Plano&Novo Mundo - Realização - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2022/06/27/18/41/8db7ef099cc29be90079d56b25075adb7fa16d0e.jpg', 'Plano&Novo Mundo - Realização - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/06/27/18/41/ac6fb3492ec41fda4c65d39d9c80cc34f45d674c.jpg', 'Planta ilustrativa - Plano&Novo Mundo - Realização', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/01/16/11/02/cbf020ac2831050e11f1cd2cb64b7b4ba2694c0f.png', 'Planta ilustrativa - Plano&Novo Mundo - Realização', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Vista do Carmo - I
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planovista-do-carmo-planovista-do-carmo-i', 'Plano&Vista do Carmo - I', 'Plano&Plano', 'Empreendimento Plano&Plano em José Bonifácio. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua Tomoichi Shimizu, 181 - José Bonifácio', 'José Bonifácio', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 32.39, 32.39, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Brinquedoteca','Pet care','Churrasqueira','Bicicletário','Fitness']::text[], 'https://www.youtube.com/watch?v=Ie4FVC5eQ4I', 'https://www.planoeplano.com.br/estatico/2025/06/18/13/34/d1c29056b9facca9acfc6c3d3a03d0f089905b17.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planovista-do-carmo/planovista-do-carmo-i')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/06/18/13/34/d1c29056b9facca9acfc6c3d3a03d0f089905b17.jpg', 'Plano&Vista do Carmo - I - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/06/18/13/34/7b307297c4b4e9e1e7d2c1949458aa8bcacff072.jpg', 'Plano&Vista do Carmo - I - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/06/18/13/34/7285555be420f67176c4bc8831229f69c94e2dd2.jpg', 'Plano&Vista do Carmo - I - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/11/29/14/30/edf9f7aeaabe16d880cdac506324cd19690f93c6.jpg', 'Planta ilustrativa - Plano&Vista do Carmo - I', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/11/29/14/30/dcd8aff716375a6972d52257de64b488e40d9eef.jpg', 'Planta ilustrativa - Plano&Vista do Carmo - I', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Vista do Carmo - II
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planovista-do-carmo-planovista-do-carmo-ii', 'Plano&Vista do Carmo - II', 'Plano&Plano', 'Empreendimento Plano&Plano em José Bonifácio. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua Tomoichi Shimizu, 181 - José Bonifácio', 'José Bonifácio', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 32.39, 32.39, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Brinquedoteca','Coworking','Fitness','Pet Care','Churrasqueira']::text[], 'https://www.youtube.com/watch?v=hHdckNpaT4g', 'https://www.planoeplano.com.br/estatico/2023/05/09/11/07/5a92b40ee588fbc1480afe092d8378ab6475d5d4.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planovista-do-carmo/planovista-do-carmo-ii')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/05/09/11/07/5a92b40ee588fbc1480afe092d8378ab6475d5d4.jpg', 'Plano&Vista do Carmo - II - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/05/09/11/07/09653a1b59dce013cc6c231777571b4949c5e6f7.jpg', 'Plano&Vista do Carmo - II - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/05/09/11/07/9926b6cefc659eb3d37d52ede1523d45020e1156.jpg', 'Plano&Vista do Carmo - II - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/10/22/11/49/9aeccc12af134c5629ecd81661ba7665b5c53672.jpg', 'Planta ilustrativa - Plano&Vista do Carmo - II', 0)) as v(tipo, url, legenda, ordem);

-- Plano&Reserva Barra Funda
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planoreserva-barra-funda-2', 'Plano&Reserva Barra Funda', 'Plano&Plano', 'Empreendimento Plano&Plano em Barra Funda. Imóvel pronto para morar. Opções de 1 e 2 dormitório(s).', 'Rua Rubens Porta Nova, 166 - Barra Funda', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     null, '{}'::int[], '{1,2}'::int[], 24.3, 44.75, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Área externa','Portaria','Piscina','Churrasqueira','Bicicletário','Mini Quadra','Playground','Delivery']::text[], 'https://www.youtube.com/watch?v=vgWLX0IZyxk', 'https://www.planoeplano.com.br/estatico/2025/04/15/18/33/2c183177279886bd408d0e32597380a34fe95953.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planoreserva-barra-funda-2')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/04/15/18/33/2c183177279886bd408d0e32597380a34fe95953.jpg', 'Plano&Reserva Barra Funda - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/04/15/18/34/fa844ef78059a8e5240fa849e0fdf09f0279f2c6.jpg', 'Plano&Reserva Barra Funda - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/04/15/18/34/2f1e7c06c08d6c87613598b7d3af2e485d44ec49.jpg', 'Plano&Reserva Barra Funda - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/09/13/16/23/cd15070f5c148173b406de052c506d5b306a6286.jpg', 'Planta ilustrativa - Plano&Reserva Barra Funda', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/09/13/16/23/6727cbee8fe9d9c98d5f626d3c4b2164cdf022a1.jpg', 'Planta ilustrativa - Plano&Reserva Barra Funda', 1)) as v(tipo, url, legenda, ordem);

-- Mapp Rio Branco
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-rio-branco', 'Mapp Rio Branco', 'Plano&Plano', 'Empreendimento Plano&Plano em República. Imóvel pronto para morar. Opções de 1 e 2 dormitório(s).', 'Avenida Rio Branco, 82 - República', 'República', 'São Paulo', 'SP', 'centro',
     null, '{}'::int[], '{1,2}'::int[], 26, 36, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Área Externa','Piscina']::text[], 'https://www.youtube.com/watch?v=u3zN644tzPY', 'https://www.planoeplano.com.br/estatico/2025/03/19/16/45/2793516235f6b7292b800ffbdbb2685f3b72e4d4.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/rio-branco')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/03/19/16/45/2793516235f6b7292b800ffbdbb2685f3b72e4d4.jpg', 'Mapp Rio Branco - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/03/19/16/45/f71c71a3a4eb83d647b5b1ccaafe96321072b893.jpg', 'Mapp Rio Branco - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/03/19/16/45/76eedda3701f748653bff250ed6c8700be94cb04.jpg', 'Mapp Rio Branco - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/09/05/10/45/689e406b05fc13b5c6b2d908786a1e78308109c5.png', 'Planta ilustrativa - Mapp Rio Branco', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/09/05/10/45/f4af65f7c0579e773af2b524fcef5acfe86cb402.png', 'Planta ilustrativa - Mapp Rio Branco', 1)) as v(tipo, url, legenda, ordem);

-- Chácara Santo Antônio
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-chacara-santo-antonio', 'Chácara Santo Antônio', 'Plano&Plano', 'Empreendimento Plano&Plano em Chácara Santo Antônio. Lançamento.', 'R. São Sebastião, 576 - Chácara Santo Antônio', 'Chácara Santo Antônio', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{}'::int[], null, null, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', '{}'::text[], null, null, false, false, 'https://www.comprarseuap.com.br/akali/imoveis/chacara-santo-antonio')
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
select 1 from d;

-- Plano&Vila Ré
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planovila-re', 'Plano&Vila Ré', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Ré. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua dos Continentes, 24 - Vila Ré', 'Vila Ré', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 32.21, 33.25, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Bicicletário','Churrasqueira','Mini quadra de areia','Playground','Fitness']::text[], 'https://www.youtube.com/watch?v=1fz1641sLW8', 'https://www.planoeplano.com.br/estatico/2025/01/20/16/21/499ae62282103ec731d86ec8b9c341963a8c1919.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planovila-re')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/01/20/16/21/499ae62282103ec731d86ec8b9c341963a8c1919.png', 'Plano&Vila Ré - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/01/20/16/21/c81f8916bbdcad5e10d4696e302fa9152199466e.png', 'Plano&Vila Ré - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/01/20/16/21/38ebefe1b428f9961a239cbf959b19bb7842f4ce.png', 'Plano&Vila Ré - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/07/18/14/52/64d708552c2b1e78cd3b2556d3d57cd38b3d8884.jpg', 'Planta ilustrativa - Plano&Vila Ré', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/07/18/14/52/e9d83686ec827c9a4603934f8516b74debbe2dac.jpg', 'Planta ilustrativa - Plano&Vila Ré', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Estação Piqueri - II
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planoestacaopiqueri-planoestacao-piqueri-ii', 'Plano&Estação Piqueri - II', 'Plano&Plano', 'Empreendimento Plano&Plano em Piqueri. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua José Peres Campelo, 2 - Piqueri', 'Piqueri', 'São Paulo', 'SP', 'zona_norte',
     null, '{}'::int[], '{2}'::int[], 32.59, 32.59, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Bicicletário','Mini quadra de areia','Área externa','Churrasqueira','Playground']::text[], 'https://www.youtube.com/watch?v=hI_K804kZDI', 'https://www.planoeplano.com.br/estatico/2024/02/28/15/48/dd1469caf0193cab3cc28bc603b9fef01fd8a55f.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planoestacaopiqueri/planoestacao-piqueri-ii')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/28/15/48/dd1469caf0193cab3cc28bc603b9fef01fd8a55f.png', 'Plano&Estação Piqueri - II - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/28/15/51/28da854c5518a017b39224dc91f167ba13abe75d.png', 'Plano&Estação Piqueri - II - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2024/02/28/15/48/cc1fca4c1d1156fe70bad03afe98d224babe7ae7.png', 'Plano&Estação Piqueri - II - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/07/20/14/04/3c0a369c24787b67fc16b8ea239bfb51f123af08.jpg', 'Planta ilustrativa - Plano&Estação Piqueri - II', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2024/01/10/17/04/ff1002e57134cc4642fe8aea19416ccab96ef64f.png', 'Planta ilustrativa - Plano&Estação Piqueri - II', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Estação Piqueri - I
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planoestacaopiqueri-planopiqueri-i', 'Plano&Estação Piqueri - I', 'Plano&Plano', 'Empreendimento Plano&Plano em Piqueri. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua José Peres Campelo, 14 - Piqueri', 'Piqueri', 'São Paulo', 'SP', 'zona_norte',
     null, '{}'::int[], '{2}'::int[], 32, 32, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Salão de festas','Hall de entrada','Estacionamento','Bicicletário','Fitness','Pet care']::text[], 'https://www.youtube.com/watch?v=WnkApDdZCwA', 'https://www.planoeplano.com.br/estatico/2023/01/30/15/07/fa3129288bfbb43102b731cd71ecd44246b50f0c.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planoestacaopiqueri/planopiqueri-i')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/01/30/15/07/fa3129288bfbb43102b731cd71ecd44246b50f0c.jpg', 'Plano&Estação Piqueri - I - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/01/30/15/07/99f024ff4c0a875c4e809e9141ad4bfb4553630d.jpg', 'Plano&Estação Piqueri - I - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/01/30/15/07/1adf91991b2180d3bce4418f152b578d6d4b0413.jpg', 'Plano&Estação Piqueri - I - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/08/21/19/24/218f995247c959af4944d524326c60206f7e0bbb.jpg', 'Planta ilustrativa - Plano&Estação Piqueri - I', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/08/21/19/24/a37497c4c8decfe7308337c61b756ec7b0819f66.jpg', 'Planta ilustrativa - Plano&Estação Piqueri - I', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Butantã - Edvard Carmilo II
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planobutanta-edvard-carmilo-ii', 'Plano&Butantã - Edvard Carmilo II', 'Plano&Plano', 'Empreendimento Plano&Plano em Jardim Celeste. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua Edvard Carmilo, 520 - Jardim Celeste', 'Jardim Celeste', 'São Paulo', 'SP', 'zona_oeste',
     null, '{}'::int[], '{2}'::int[], 32.39, 32.39, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Bicicletário','Churrasqueira','Playground','Brinquedoteca','Fitness','Mini Quadra de Areia','Pet Shop']::text[], null, 'https://www.planoeplano.com.br/estatico/2025/01/17/16/58/6e1cc025bf27165d7890b7849feeed7819cde9fd.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planobutanta/edvard-carmilo-ii')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2025/01/17/16/58/6e1cc025bf27165d7890b7849feeed7819cde9fd.png', 'Plano&Butantã - Edvard Carmilo II - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/01/17/16/58/76b5aea180d0b3adb4b16b2f62546568447cf9c2.png', 'Plano&Butantã - Edvard Carmilo II - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2025/01/17/16/58/f9c9354a0c057e944c832e0fd7657b3a3e9d84e0.png', 'Plano&Butantã - Edvard Carmilo II - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/05/30/16/53/ba46222fffd073b30a310efe0349a3b0c4f77c98.png', 'Planta ilustrativa - Plano&Butantã - Edvard Carmilo II', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2022/06/01/11/04/5b2b451c6cfeff308747052505cc8df54e5d5f2f.jpg', 'Planta ilustrativa - Plano&Butantã - Edvard Carmilo II', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Butantã - Edvard Carmilo III
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planobutanta-edvard-carmilo-iii', 'Plano&Butantã - Edvard Carmilo III', 'Plano&Plano', 'Empreendimento Plano&Plano em Jardim Celeste. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua Edvard Carmilo, 560 - Jardim Celeste', 'Jardim Celeste', 'São Paulo', 'SP', 'zona_oeste',
     null, '{}'::int[], '{2}'::int[], 32, 32, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Salão de Festas','Pet Care','Churrasqueira','Fitness']::text[], 'https://www.youtube.com/watch?v=hHdckNpaT4g', 'https://www.planoeplano.com.br/estatico/2023/04/06/15/32/2448ddbbbf5266436065053cbba15ea7b25a4086.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planobutanta/edvard-carmilo-iii')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/04/06/15/32/2448ddbbbf5266436065053cbba15ea7b25a4086.jpg', 'Plano&Butantã - Edvard Carmilo III - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/04/06/15/32/d6700a7ad41ea82b32f4a49b2b2d136283eda2ee.jpg', 'Plano&Butantã - Edvard Carmilo III - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/04/06/15/32/434209e7fa2eb7ccf7cf9c6d492408bf92736630.jpg', 'Plano&Butantã - Edvard Carmilo III - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/11/23/20/00/adf790562d075c6a088a615d714c6728a2aac8a6.jpg', 'Planta ilustrativa - Plano&Butantã - Edvard Carmilo III', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/11/23/20/00/3882022b5d0cce0c56ae358af7e13f3d1d5e172f.jpg', 'Planta ilustrativa - Plano&Butantã - Edvard Carmilo III', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Butantã - Manuel Dias
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planobutanta-manuel-dias', 'Plano&Butantã - Manuel Dias', 'Plano&Plano', 'Empreendimento Plano&Plano em Jardim Celeste. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'R. Manuel Dias de Oliveira, 59 - Jardim Celeste', 'Jardim Celeste', 'São Paulo', 'SP', 'zona_oeste',
     null, '{}'::int[], '{2}'::int[], 40, 41, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Hall de Entrada','Fitness','Salão de Festas']::text[], 'https://www.youtube.com/watch?v=FWON1i6DeWA', 'https://www.planoeplano.com.br/estatico/2021/05/07/20/25/4a469735d772bea0e62b1b6787236a1ce116f1af.png', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planobutanta/manuel-dias')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2021/05/07/20/25/4a469735d772bea0e62b1b6787236a1ce116f1af.png', 'Plano&Butantã - Manuel Dias - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2021/05/07/20/25/1609f3901ac57bcd6314afe4ab3f1dbd3fa074c8.png', 'Plano&Butantã - Manuel Dias - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2021/05/07/20/25/25f171bed244a0ed0e54b50b9791d8031d45650c.png', 'Plano&Butantã - Manuel Dias - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2018/08/03/17/58/5c57ba0f0b39eafe8d0318143098d7c88f136ec6.jpg', 'Planta ilustrativa - Plano&Butantã - Manuel Dias', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2018/08/03/17/58/888c1ee9361197b205b5f6fa463c5fbabb27b0b3.jpg', 'Planta ilustrativa - Plano&Butantã - Manuel Dias', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Butantã - Edvard Carmilo I
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planobutanta-edvard-camilo-i', 'Plano&Butantã - Edvard Carmilo I', 'Plano&Plano', 'Empreendimento Plano&Plano em Jardim Celeste. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua Edvard de Carmilo, 760 - Jardim Celeste', 'Jardim Celeste', 'São Paulo', 'SP', 'zona_oeste',
     null, '{}'::int[], '{2}'::int[], 40, 41, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Churrasqueira']::text[], 'https://www.youtube.com/watch?v=FWON1i6DeWA', 'https://www.planoeplano.com.br/estatico/2021/12/14/09/38/c95bee934f818b31722d28782ce9c532db39ad17.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planobutanta/edvard-camilo-i')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2021/12/14/09/38/c95bee934f818b31722d28782ce9c532db39ad17.jpg', 'Plano&Butantã - Edvard Carmilo I - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2021/12/14/09/38/fd0975b3687e5fde6367ddc66cee3aa3eeb744d6.jpg', 'Plano&Butantã - Edvard Carmilo I - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2021/12/14/09/38/22fc079af65f29b8c8cf5c794d602a9de611e1c5.jpg', 'Plano&Butantã - Edvard Carmilo I - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2019/07/24/18/21/5662e7ebebcd38eb92a2823349519994d048405d.jpg', 'Planta ilustrativa - Plano&Butantã - Edvard Carmilo I', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2019/07/24/18/21/2647ed1eae0bf94813bb7d8732f8dac12b5f8185.jpg', 'Planta ilustrativa - Plano&Butantã - Edvard Carmilo I', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Estação Santo Amaro
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planoestacao-santo-amaro', 'Plano&Estação Santo Amaro', 'Plano&Plano', 'Empreendimento Plano&Plano em Santo Amaro. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua Ferreira Viana, 715 - Santo Amaro', 'Santo Amaro', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{2}'::int[], 32.18, 32.18, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Churrasqueira','Bicicletário','Brinquedoteca','Ginástica','Fitness','Pet care']::text[], 'https://www.youtube.com/watch?v=WKBhCapUqnU', 'https://www.planoeplano.com.br/estatico/2023/10/06/11/18/11b5c0917ff7755d04ac57f90171635656633da3.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planoestacao-santo-amaro')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/10/06/11/18/11b5c0917ff7755d04ac57f90171635656633da3.jpg', 'Plano&Estação Santo Amaro - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/10/06/11/18/6a63af3cb6b2173873a7a59b1b4ca7537dba1066.jpg', 'Plano&Estação Santo Amaro - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/10/06/11/18/639dd1f105e73430e9dfb995e28b38dbb3fe46c6.jpg', 'Plano&Estação Santo Amaro - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2021/04/30/12/34/67c7a2a3d250792ea0ad06ef4ac659172dbe017a.png', 'Planta ilustrativa - Plano&Estação Santo Amaro', 0)) as v(tipo, url, legenda, ordem);

-- Plano&Curuçá III
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planocuruca-iii', 'Plano&Curuçá III', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Curuçá. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua Osório Franco Vilhena, 1260 - Vila Curuçá', 'Vila Curuçá', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 32, 32, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Churrasqueira','Fitness','Salão de festas','Brinquedoteca']::text[], 'https://www.youtube.com/watch?v=hOiQTHpsGiM', 'https://www.planoeplano.com.br/estatico/2023/01/24/14/56/a6a69507bd2c3e8e22324fbafbe1911664475400.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planocuruca-iii')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/01/24/14/56/a6a69507bd2c3e8e22324fbafbe1911664475400.jpg', 'Plano&Curuçá III - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/01/24/14/56/e69b09deeef772f5448fac46759109d5edfd5b11.jpg', 'Plano&Curuçá III - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/01/24/14/56/903efecb668f72af20188a8083841622cae0b146.jpg', 'Plano&Curuçá III - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/09/15/15/31/f70fe23aa7c606caa0a88c6347695f5cea1d7a9f.jpg', 'Planta ilustrativa - Plano&Curuçá III', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/09/15/15/31/36c131c8c9060e0d574215793cfcfc84edf8db39.jpg', 'Planta ilustrativa - Plano&Curuçá III', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Mooca - Praça Lion I
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planomooca-planomooca-praca-lion-i', 'Plano&Mooca - Praça Lion I', 'Plano&Plano', 'Empreendimento Plano&Plano em Mooca. Imóvel pronto para morar. Opções de 1 dormitório(s).', 'Praça Alberto Lion, 270 - Mooca', 'Mooca', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{1}'::int[], 27.71, 37.66, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Hall','Salão de Festas']::text[], 'https://www.youtube.com/watch?v=fLZUek37-Y4', 'https://www.planoeplano.com.br/estatico/2021/12/15/09/35/bdd301f0bef349c26e16c9e36408a827bcb50cfc.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planomooca/planomooca-praca-lion-i')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2021/12/15/09/35/bdd301f0bef349c26e16c9e36408a827bcb50cfc.jpg', 'Plano&Mooca - Praça Lion I - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2021/12/15/09/35/3eff8833ae46833b6db0fb60cd2f65515b9b9cbb.jpg', 'Plano&Mooca - Praça Lion I - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2021/12/15/09/35/824fcbcab9131fc993b0e96b22c61c479034f0a4.jpg', 'Plano&Mooca - Praça Lion I - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2019/09/10/17/19/c5428de7619350f8f06f655dda4c214b980b6abf.jpg', 'Planta ilustrativa - Plano&Mooca - Praça Lion I', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2019/09/10/17/19/1fe376aefe17f6af03461e840679cd4a946bb8ab.jpg', 'Planta ilustrativa - Plano&Mooca - Praça Lion I', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Mooca - Praça Lion II
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planomooca-planomooca-praca-lion-ii', 'Plano&Mooca - Praça Lion II', 'Plano&Plano', 'Empreendimento Plano&Plano em Mooca. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Praça Alberto Lion, 304 - Mooca', 'Mooca', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 34.86, 34.86, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Churrasqueira','Bicicletário']::text[], 'https://www.youtube.com/watch?v=fLZUek37-Y4', 'https://www.planoeplano.com.br/estatico/2022/04/12/15/18/a5a9258d1eb4fbee3d575281518411b07c3c2078.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planomooca/planomooca-praca-lion-ii')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2022/04/12/15/18/a5a9258d1eb4fbee3d575281518411b07c3c2078.jpg', 'Plano&Mooca - Praça Lion II - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2022/04/12/14/57/6ba52ac39396553efcf17cdbf24a3b6e7cd9be32.jpg', 'Plano&Mooca - Praça Lion II - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2022/04/12/14/57/2fa135827e8896acbf4bcb96fe1dbb9d0c22653c.jpg', 'Plano&Mooca - Praça Lion II - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2019/09/10/18/00/1495ce9eb436a350785b4fdd9163d2230823d552.jpg', 'Planta ilustrativa - Plano&Mooca - Praça Lion II', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2019/09/10/18/00/c6efe5f1aef8548807dff2f22160f388e8f90154.jpg', 'Planta ilustrativa - Plano&Mooca - Praça Lion II', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Mooca - Praça Lion III
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planomooca-planomooca-praca-lion-iii', 'Plano&Mooca - Praça Lion III', 'Plano&Plano', 'Empreendimento Plano&Plano em Mooca. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Praça Alberto Lion, 350 - Mooca', 'Mooca', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{2}'::int[], 34.86, 34.86, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Salão de festas','Churrasqueira','Brinquedoteca','Bicicletário','Pet Care']::text[], 'https://www.youtube.com/watch?v=fLZUek37-Y4', 'https://www.planoeplano.com.br/estatico/2023/03/29/17/48/94451cdb8ee4c298cf8b3eba3fbc097e6ce19f86.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planomooca/planomooca-praca-lion-iii')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2023/03/29/17/48/94451cdb8ee4c298cf8b3eba3fbc097e6ce19f86.jpg', 'Plano&Mooca - Praça Lion III - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/03/29/17/48/bc2e28f78d0078788c767ac2ee3c67137c932afc.jpg', 'Plano&Mooca - Praça Lion III - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2023/03/29/17/48/726127e8df5e3cba78b901665568c2ec5e767afd.png', 'Plano&Mooca - Praça Lion III - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/07/02/19/02/1b7c574c6de95e5ca92e869cad1aed973ac93275.jpg', 'Planta ilustrativa - Plano&Mooca - Praça Lion III', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/07/02/19/02/c2db14295d886c067594f924329fc4a439456ff0.jpg', 'Planta ilustrativa - Plano&Mooca - Praça Lion III', 1)) as v(tipo, url, legenda, ordem);

-- Plano&Reserva Vila Andrade
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-planoreserva-vila-andrade', 'Plano&Reserva Vila Andrade', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila das Belezas. Imóvel pronto para morar. Opções de 1 dormitório(s).', 'Rua Coronel Luiz Schimidt, 59 - Vila das Belezas', 'Vila das Belezas', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{1}'::int[], 27.57, 37.06, false, 'pronto', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Portaria','Rooftop','Playground','Pet care','Fitness']::text[], 'https://www.youtube.com/watch?v=mM3_LE0twX0', 'https://www.planoeplano.com.br/estatico/2022/11/04/15/01/1522aadf344db715cbd6b114c5026bb58150cb32.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/planoreserva-vila-andrade')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2022/11/04/15/01/1522aadf344db715cbd6b114c5026bb58150cb32.jpg', 'Plano&Reserva Vila Andrade - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2022/11/04/15/01/794442b83f7eff7dd2a4e34fdb833d86874b0360.jpg', 'Plano&Reserva Vila Andrade - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2022/11/04/15/01/ea315dc6c8c6e09e94a3e9288e56c4a01d1eaf02.jpg', 'Plano&Reserva Vila Andrade - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/10/06/16/41/9546e904c16aaa7a28a93fd9efa3facf42b02dc0.jpg', 'Planta ilustrativa - Plano&Reserva Vila Andrade', 0),
          ('planta', 'https://www.planoeplano.com.br/estatico/2020/10/06/16/41/6553d9304bb0d747f091f34036f38de40b1faf04.jpg', 'Planta ilustrativa - Plano&Reserva Vila Andrade', 1)) as v(tipo, url, legenda, ordem);

-- Laguna
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-laguna-2', 'Laguna', 'Plano&Plano', 'Empreendimento Plano&Plano em Chácara Santo Antônio. Lançamento.', 'Rua Laguna, nº 625 - Chácara Santo Antônio', 'Chácara Santo Antônio', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{}'::int[], null, null, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', '{}'::text[], null, null, false, false, 'https://www.comprarseuap.com.br/akali/imoveis/laguna-2')
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
select 1 from d;

-- Mogeiro
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-mogeiro', 'Mogeiro', 'Plano&Plano', 'Empreendimento Plano&Plano em Perus. Lançamento.', 'Rua Mogeiro - Perus', 'Perus', 'São Paulo', 'SP', 'zona_norte',
     null, '{}'::int[], '{}'::int[], null, null, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', '{}'::text[], null, null, false, false, 'https://www.comprarseuap.com.br/akali/imoveis/mogeiro')
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
select 1 from d;

-- Polo Paulista
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, disponivel, condicoes_comerciais, diferenciais, video_url, capa_url,
     ativo, is_demo, fonte_url)
  values
    ('pp-polo-paulista', 'Polo Paulista', 'Plano&Plano', 'Empreendimento Plano&Plano em Bela Vista. Lançamento. Opções de 1 dormitório(s).', 'Rua Carlos Sampaio, 14 - Bela Vista', 'Bela Vista', 'São Paulo', 'SP', 'centro',
     null, '{}'::int[], '{1}'::int[], null, null, false, 'lancamento', true,
     'Preço sob consulta. Informações da Plano&Plano em 03/11/2026; confirme a tabela vigente com o corretor.', array['Piscina','Spa Yoga','Lobby','Pet Place','Churrasqueira']::text[], null, 'https://www.planoeplano.com.br/estatico/2026/10/28/16/06/2ff03b63b1c9bc4fbee87a3c40cb7cafc68e02a2.jpg', true, false, 'https://www.comprarseuap.com.br/akali/imoveis/polo-paulista')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://www.planoeplano.com.br/estatico/2026/10/28/16/06/2ff03b63b1c9bc4fbee87a3c40cb7cafc68e02a2.jpg', 'Polo Paulista - perspectiva ilustrada', 0),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/10/28/16/06/f8a61ee2874fe1374e77e7b078e65908692a083f.jpg', 'Polo Paulista - perspectiva ilustrada', 1),
          ('foto', 'https://www.planoeplano.com.br/estatico/2026/10/28/16/06/96e3709bfb7c3d2c627b4c1939d69e13d267cb96.jpg', 'Polo Paulista - perspectiva ilustrada', 2),
          ('planta', 'https://www.planoeplano.com.br/estatico/2026/10/28/16/14/df6303c86de5282a301190debab6d07c84cd150a.png', 'Planta ilustrativa - Polo Paulista', 0)) as v(tipo, url, legenda, ordem);

commit;

-- Resumo: 133 empreendimentos/fases • 52 com preço • 81 sob consulta • 6 importados como inativos (sem fotos/tipologia)
