-- Gerado por scripts/gerar-import-cury.py em 2026-11-04 a partir de https://www.guerato.com.br/
-- Empreendimentos Cury com estoque. Pode rodar de novo para atualizar.
begin;
-- Urban Vila Guilherme
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-urban-vila-guilherme', 'Urban Vila Guilherme', 'Cury', 'Empreendimento Cury em Vila Guilherme, São Paulo. Lançamento. Plantas de 32 a 53 m² com 2 dormitório(s). Entrega prevista: abr/2030. Categorias de uso: HIS2 - 81,5%, R2V - 18,5%.', 'R. Amadeu, 207 - Vila Guilherme, São Paulo - SP', 'Vila Guilherme', 'São Paulo', 'SP', 'zona_norte',
     248959, '{1,2,3,4}'::int[], '{2}'::int[],
     32, 53, true, 'lancamento', 'abr/2030', true, 946,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 02/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persina de enrolar (dormitórios R2V) – apenas unidades de 46m²','Infra para ar condicionado (dormitórios R2V) – apenas unidades de 46m²','Bancada em granito (Banheiros e Cozinhas R2V) – apenas unidades de 46m²']::text[], 'https://static.wixstatic.com/media/1d445c_98a4330ce28c42fa806e609200084130~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-norte/urban-vila-guilherme')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_97be1bc99b50458aa3d4d2a4934160f0~mv2.jpg', 'Urban Vila Guilherme - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_98a4330ce28c42fa806e609200084130~mv2.jpg', 'Urban Vila Guilherme - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_e8a16123f5874c24aed11ceb37cccb5c~mv2.jpg', 'Urban Vila Guilherme - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_9003e7a8b5ad474e9d1c0446ea7084de~mv2.jpg', 'Urban Vila Guilherme - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_45258b95d6594d83a7f5cae8a3349cab~mv2.jpg', 'Urban Vila Guilherme - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_384052403c13490bace8b4ecd35b21fe~mv2.jpg', 'Urban Vila Guilherme - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_7fab8a02816842f8b96528a9426d3a4f~mv2.jpg', 'Urban Vila Guilherme - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_10b26cff7b9446e28c0a01404e03b368~mv2.jpg', 'Urban Vila Guilherme - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_423bb09001d3459587f726154f343a6f~mv2.jpg', 'Urban Vila Guilherme - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_4dbe4cbd50cb4384a37657652b650d9d~mv2.jpg', 'Urban Vila Guilherme - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_6bfdb0f1e8344e0a900a2fd61ea5c1f9~mv2.jpg', 'Urban Vila Guilherme - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_774e762e112c4a8599cc76eb59563d13~mv2.jpg', 'Urban Vila Guilherme - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- 360º Park View
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-360-park-view', '360º Park View', 'Cury', 'Empreendimento Cury em City América, São Paulo. Em construção. Plantas de 37 a 46 m² com 2 dormitório(s). Entrega prevista: jan/2028. Categorias de uso: HIS2 - 81,5%, R2V - 18,5%.', 'Av. do Anastácio, 740 - City América, São Paulo - SP', 'City América', 'São Paulo', 'SP', 'zona_norte',
     259121, '{1,2,3,4}'::int[], '{2}'::int[],
     37, 46, true, 'em_obras', 'jan/2028', true, 105,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persina de enrolar (dormitórios R2V) – apenas unidades de 46m²','Infra para ar condicionado (dormitórios R2V) – apenas unidades de 46m²','Bancada em granito (Banheiros e Cozinhas R2V) – apenas unidades de 46m²']::text[], 'https://static.wixstatic.com/media/1d445c_26387a8bdb8541e68708d7dd9ed2fe03~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-norte/360-park-view')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_ebbfa87cff5c45c59cbab8da515caee7~mv2.jpg', '360º Park View - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1825b7f78cee4b4399e6b006d2e070cb~mv2.jpg', '360º Park View - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_174a98d7f9a3464ebd9cb236788a94e1~mv2.jpg', '360º Park View - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_e1c7c9e66cd4430d95a178a94f0cb998~mv2.jpg', '360º Park View - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_26387a8bdb8541e68708d7dd9ed2fe03~mv2.jpg', '360º Park View - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_ee39761e039444d6a0175466aec8d0b2~mv2.jpg', '360º Park View - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_26fc23497d194b83b90827cba95994cf~mv2.jpg', '360º Park View - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_6b057022eacb48cda2bf766e12156810~mv2.jpg', '360º Park View - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1ca4d847d77749618c2e075c3a55a2ae~mv2.jpg', '360º Park View - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_984e25829f56448680b332e6e667ca69~mv2.jpg', '360º Park View - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_242cebbc38b147f7983c7669b56dd8d7~mv2.jpg', '360º Park View - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_cb8ab346a1ec4f76b2cce747e204ec94~mv2.jpg', '360º Park View - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Urban Vila Maria II
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-urban-vila-maria-2', 'Urban Vila Maria II', 'Cury', 'Empreendimento Cury em Vila Maria, São Paulo. Em construção. Plantas de 23 a 44 m² com 1 e 2 dormitório(s). Entrega prevista: abr/2027. Categorias de uso: HIS2 - 83%, HMP - 17%, R2V - 100% (Torre 3).', 'R. João Veloso Filho, 1414 - Vila Guilherme, São Paulo - SP', 'Vila Maria', 'São Paulo', 'SP', 'zona_norte',
     199072, '{1,2,3,4}'::int[], '{1,2}'::int[],
     23, 44, true, 'em_obras', 'abr/2027', true, 6,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persina de enrolar (dormitórios R2V) – apenas unidades de 44m²','Infra para ar condicionado (dormitórios R2V) – apenas unidades de 44m²','Bancada em granito (Banheiros e Cozinhas R2V) – apenas unidades de 44m²']::text[], 'https://static.wixstatic.com/media/1d445c_66a7870590a341dab674ab26cc0e134e~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-norte/urban-vila-maria-2')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_31fabdd9a2ca4df7809a517f67648d0c~mv2.jpg', 'Urban Vila Maria II - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1bb2599abb414568956fa5b317d9de25~mv2.jpg', 'Urban Vila Maria II - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_7343b7f88596499886035b458d71517c~mv2.jpg', 'Urban Vila Maria II - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_96f12d5923394b8d974107dda23fd0ab~mv2.jpg', 'Urban Vila Maria II - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_f04a6f851cbc4734a5cebb7326fd15bd~mv2.jpg', 'Urban Vila Maria II - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_ff13976864e846c38c32e20a272eaac4~mv2.jpg', 'Urban Vila Maria II - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_ee1aca1becdd449fb24461bc1f301eaa~mv2.jpg', 'Urban Vila Maria II - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_18e348d50b694ac49222b6b536b87d63~mv2.jpg', 'Urban Vila Maria II - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_32b040dee3d64625a89ea24b541ed7c7~mv2.jpg', 'Urban Vila Maria II - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_993050e75f7d4df6adf4ab3712b20576~mv2.jpg', 'Urban Vila Maria II - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_0c2d1fdf4f4b48098048b74d1f406142~mv2.jpg', 'Urban Vila Maria II - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_6b2c9723668b454c94f817dabb5839ed~mv2.jpg', 'Urban Vila Maria II - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Dez Limão
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-dez-limao', 'Dez Limão', 'Cury', 'Empreendimento Cury em Bairro do Limão, São Paulo. Pronto para morar. Plantas de 34 a 44 m² com 2 dormitório(s). Categorias de uso: HIS2 - 80%, R2V - 20%.', 'Rua Rocha Lima, 411 - Vila Diva, São Paulo - SP', 'Bairro do Limão', 'São Paulo', 'SP', 'zona_norte',
     262695, '{1,2,3,4}'::int[], '{2}'::int[],
     34, 44, true, 'pronto', 'jun/2026', true, 2,
     'Valor "a partir de" da tabela Cury (validade 03/09/2026 a 01/10/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos quartos','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persina de enrolar (dormitórios R2V)','Infra para ar condicionada (dormitórios R2V)','Bancadas em granito (Banheiros e Cozinha R2V)','Aquecedor de Passagem a gás (Unidades de Ponta)']::text[], 'https://static.wixstatic.com/media/1d445c_11d4d6bf8457456a8477220c62935b21~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-norte/dez-limao')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_1f95e7383f0f4ff4a15cfde46f4301cb~mv2.jpg', 'Dez Limão - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_6c3fb8883da646ca9fceff5f60077220~mv2.jpg', 'Dez Limão - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_7ef189c2a2ff42a5910e5a27eac935a9~mv2.jpg', 'Dez Limão - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_11b4495365ab4ff9a1bba110c07c2dbe~mv2.jpg', 'Dez Limão - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_c9c7f2343cb34378822f0b85dc686dfa~mv2.jpg', 'Dez Limão - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_46eb1dd0da4f4fee857a152903f03c43~mv2.jpg', 'Dez Limão - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_295648ce409748a2aa42d42906165949~mv2.jpg', 'Dez Limão - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_146152d68f3e4bec8324a0fb88e9a5b1~mv2.jpg', 'Dez Limão - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_712dae3419094546865799c2e024b761~mv2.jpg', 'Dez Limão - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_678beb7606db48f58ea8da56ef25ee35~mv2.jpg', 'Dez Limão - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_f400318bb58c48ed820510803b323b47~mv2.jpg', 'Dez Limão - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_4b68675350ea41d58bbb49edbcaa1c51~mv2.jpg', 'Dez Limão - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Marco Freguesia
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-marco-freguesia', 'Marco Freguesia', 'Cury', 'Empreendimento Cury em Freguesia do Ó, São Paulo. Em construção. Plantas de 32 a 38 m² com 2 dormitório(s). Entrega prevista: mar/2029.', 'Rua Enéias Luís Carlos Barbanti, 322 - Freguesia do Ó, São Paulo - SP', 'Freguesia do Ó', 'São Paulo', 'SP', 'zona_norte',
     274363, '{1,2,3,4}'::int[], '{2}'::int[],
     32, 38, false, 'em_obras', 'mar/2029', true, 381,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos quartos','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras']::text[], 'https://static.wixstatic.com/media/1d445c_099a408716d8485ba42551d8cb5be1dd~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-norte/marco-freguesia')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_099a408716d8485ba42551d8cb5be1dd~mv2.jpg', 'Marco Freguesia - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_65b074268755404596efca6786ab0db4~mv2.jpg', 'Marco Freguesia - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_b70ec8a50db345f5b70a5f7204f5a045~mv2.jpg', 'Marco Freguesia - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_fad01b1172784637ab42182f116aef37~mv2.jpg', 'Marco Freguesia - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_f4f0647b39664c53a6b8b4bd16014a85~mv2.jpg', 'Marco Freguesia - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_77994df76c454414a6fa90c90073c4c5~mv2.jpg', 'Marco Freguesia - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_bc4273fa4e3a4874b2d94c1a4d3efdb9~mv2.jpg', 'Marco Freguesia - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_ffe06fceabea4020ab63df97204d67c7~mv2.jpg', 'Marco Freguesia - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_fcbb47b3aa7040daa29e77795cc78d74~mv2.jpg', 'Marco Freguesia - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_5e00098299ba40198d8f3ab7a892e252~mv2.jpg', 'Marco Freguesia - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_fead62177c484630aa2c071183662257~mv2.jpg', 'Marco Freguesia - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_d2ba80971a1540fabb33accbb6adfe5d~mv2.jpg', 'Marco Freguesia - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Alto São Domingos
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-alto-sao-domingos', 'Alto São Domingos', 'Cury', 'Empreendimento Cury em Pirituba, São Paulo. Em construção. Plantas de 34 a 45 m² com 2 dormitório(s). Entrega prevista: nov/2027. Categorias de uso: HIS2 - 80%, R2V - 20%.', 'Avenida Mutinga, 1150 - Vila Pirituba, São Paulo - SP', 'Pirituba', 'São Paulo', 'SP', 'zona_norte',
     266081, '{1,2,3,4}'::int[], '{2}'::int[],
     34, 45, true, 'em_obras', 'nov/2027', true, 9,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 02/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persina de enrolar (dormitórios R2V) – apenas unidades de 44m²','Infra para ar condicionado (dormitórios R2V) – apenas unidades de 44m²','Bancada em granito (Banheiros e Cozinhas R2V) – apenas unidades de 44m²']::text[], 'https://static.wixstatic.com/media/1d445c_3a827935a63a443388613a68dc5e5aff~mv2.jpeg', true, false, 'https://www.guerato.com.br/zona-norte/alto-sao-domingos')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_ab075658bce74b2ca7448861c448247c~mv2.jpeg', 'Alto São Domingos - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_8ea32bf373944bed897c1df72d4b6945~mv2.jpg', 'Alto São Domingos - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_89021769a5b84b85a518a0ef598d3eab~mv2.jpg', 'Alto São Domingos - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_b9335103afc8466f9ba1bb6eb33ccf8f~mv2.jpg', 'Alto São Domingos - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_7ef890c72f2c480f8ac2ac6b9b278662~mv2.jpg', 'Alto São Domingos - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a4577d0c18c94df289e64f614a692b12~mv2.jpg', 'Alto São Domingos - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_805a7c7fae21433ebcb02986fd0623bf~mv2.jpg', 'Alto São Domingos - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_fe6b17757fc14aa1ac7339f04d76a206~mv2.jpg', 'Alto São Domingos - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_184a8b2c46fb4328b45eb220d0551f9b~mv2.jpg', 'Alto São Domingos - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_03ae0aa4d48744979019e8a2b101703a~mv2.jpg', 'Alto São Domingos - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_5f4857feba684e3bbb1fe45d8c968437~mv2.jpg', 'Alto São Domingos - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_3d5692e099e44697981406e09ad5099d~mv2.jpg', 'Alto São Domingos - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Urban Vila Maria
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-urban-vila-maria', 'Urban Vila Maria', 'Cury', 'Empreendimento Cury em Vila Maria, São Paulo. Pronto para morar. Plantas de 34 a 44 m² com 2 dormitório(s). Categorias de uso: HIS2 - 40%, HMP - 20%, R2V - 40%.', 'R. João Veloso Filho, 1414 - Vila Guilherme, São Paulo - SP', 'Vila Maria', 'São Paulo', 'SP', 'zona_norte',
     199072, '{1,2,3,4}'::int[], '{2}'::int[],
     34, 44, true, 'pronto', 'jun/2026', true, 4,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 02/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persina de enrolar (dormitórios R2V)','Infra para ar condicionado (dormitórios R2V)','Bancada em granito (Banheiros e Cozinhas R2V)','Aquecedor de passagem a gás (unidades residenciais de ponta)']::text[], 'https://static.wixstatic.com/media/1d445c_3e1c1ff6f14c4dfd93c03cbd049ab1d2~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-norte/urban-vila-maria')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_9dab9ef0d9b34b4a85fe60904007ee4c~mv2.jpg', 'Urban Vila Maria - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_8a18dc5eb59646268a6b335a41ab94b1~mv2.jpg', 'Urban Vila Maria - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_04f332b1e1e4488c871ef11d81609977~mv2.jpg', 'Urban Vila Maria - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_7f845481bcef4abb81b0fedc1ae261d8~mv2.jpg', 'Urban Vila Maria - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_13d7a514a7314fe58e21a40e3bc7c4ca~mv2.jpg', 'Urban Vila Maria - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_09e0e1d91ded45dab4c9f26362321d96~mv2.jpg', 'Urban Vila Maria - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_8132c31c9b0a409a8710c3e349e82e6b~mv2.jpg', 'Urban Vila Maria - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_889209373add4725819f97230450df24~mv2.jpg', 'Urban Vila Maria - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_3aba73ebf6b24546ad3a441dfc96e201~mv2.jpg', 'Urban Vila Maria - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_63b8e61233184bd3b2f78887b20e29df~mv2.jpg', 'Urban Vila Maria - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_23030e966ce74fdc85fc83fea8d8da3e~mv2.jpg', 'Urban Vila Maria - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_2acadc58b5e046fbbe08b1f08aad0d5e~mv2.jpg', 'Urban Vila Maria - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Lyne Santo Amaro
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-lyne-santo-amaro', 'Lyne Santo Amaro', 'Cury', 'Empreendimento Cury em Santo Amaro, São Paulo. Lançamento. Plantas de 26 a 53 m² com 1 e 2 dormitório(s). Categorias de uso: HIS2 - 83%, R2V - 17%.', 'R. Amador Bueno - Santo Amaro, São Paulo - SP', 'Santo Amaro', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{1,2}'::int[],
     26, 53, true, 'lancamento', null, true, 352,
     'Preço sob consulta. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persina de enrolar (dormitórios R2V) – apenas unidades de 53m²','Infra para ar condicionado (dormitórios R2V) – apenas unidades de 53m²','Bancada em granito (Banheiros e Cozinhas R2V) – apenas unidades de 53m²']::text[], null, true, false, 'https://www.guerato.com.br/zona-sul/lyne-santo-amaro')
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
select 1 from d;
-- Cidade Parque Guarapiranga - Atlântica
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-cidade-parque-guarapiranga', 'Cidade Parque Guarapiranga - Atlântica', 'Cury', 'Empreendimento Cury em Rio Bonito, São Paulo. Lançamento. Plantas de 27 a 49 m² com 1 e 2 dormitório(s). Entrega prevista: mar/2030. Categorias de uso: HIS2 - 80%, R2V - 20%.', 'R. Olívia Guedes Penteado - Socorro, São Paulo - SP', 'Rio Bonito', 'São Paulo', 'SP', 'zona_sul',
     240660, '{1,2,3,4}'::int[], '{1,2}'::int[],
     27, 49, true, 'lancamento', 'mar/2030', true, 850,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persina de enrolar (dormitórios R2V) – apenas unidades de 49m²','Infra para ar condicionado (dormitórios R2V) – apenas unidades de 49m²','Bancada em granito (Banheiros e Cozinhas R2V) – apenas unidades de 49m²']::text[], 'https://static.wixstatic.com/media/1d445c_b0964084952647cd9279122ce3ba3a4a~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-sul/cidade-parque-guarapiranga')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_e0aeb0829a54458fb7eba148b8bb623b~mv2.jpg', 'Cidade Parque Guarapiranga - Atlântica - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_b0964084952647cd9279122ce3ba3a4a~mv2.jpg', 'Cidade Parque Guarapiranga - Atlântica - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_e11b0de6e3d144a4bfdb74aec4395e7b~mv2.jpg', 'Cidade Parque Guarapiranga - Atlântica - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_143573694898478b8e881e652bbbd4d7~mv2.jpg', 'Cidade Parque Guarapiranga - Atlântica - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a7a2d82dd666498ab7ced7328fb573e5~mv2.jpg', 'Cidade Parque Guarapiranga - Atlântica - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_b3fcb0d746864ffcbef14dce6bff09e7~mv2.jpg', 'Cidade Parque Guarapiranga - Atlântica - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_fe5d18ab9edd4a968b02997ef6fadc18~mv2.jpg', 'Cidade Parque Guarapiranga - Atlântica - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_56d29536fa654cee84868a1b3e3c69c3~mv2.jpg', 'Cidade Parque Guarapiranga - Atlântica - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_b2abee3f1926471980365b51ad7159b6~mv2.jpg', 'Cidade Parque Guarapiranga - Atlântica - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_49908d25ff514671969d83fdf76aa6e1~mv2.jpg', 'Cidade Parque Guarapiranga - Atlântica - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_8b852963d8884a47a4a8a69d650aeed8~mv2.jpg', 'Cidade Parque Guarapiranga - Atlântica - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_429ef5bef5854424a83c6f4239fb28f9~mv2.jpg', 'Cidade Parque Guarapiranga - Atlântica - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Parque das Nações - Cond. Granja Julieta
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-parque-das-nacoes-condominio-granja-julieta', 'Parque das Nações - Cond. Granja Julieta', 'Cury', 'Empreendimento Cury em Rio Bonito, São Paulo. Lançamento. Plantas de 26 a 54 m² com 1 e 2 dormitório(s). Entrega prevista: nov/2029. Categorias de uso: HIS1 - 14%, HIS2 - 72%, R2V - 14%.', 'R. Luiz Seráphico Júnior, 326 - Jardim Caravelas, São Paulo - SP', 'Rio Bonito', 'São Paulo', 'SP', 'zona_sul',
     262149, '{1,2,3,4}'::int[], '{1,2}'::int[],
     26, 54, true, 'lancamento', 'nov/2029', true, 414,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persina de enrolar (dormitórios R2V) – apenas unidades de 53m² e 54m²','Infra para ar condicionado (dormitórios R2V) – apenas unidades de 53m² e 54m²','Bancada em granito (Banheiros e Cozinhas R2V) – apenas unidades de 53m² e 54m²']::text[], 'https://static.wixstatic.com/media/1d445c_9e1bf87f4ea848a0b8bfb421cd1ca0ed~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-sul/parque-das-nacoes-condominio-granja-julieta')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_c53df78508c74956831c6c21066ec703~mv2.jpg', 'Parque das Nações - Cond. Granja Julieta - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_0dc5bd1c878843c9848b5f8a2ba222bc~mv2.jpg', 'Parque das Nações - Cond. Granja Julieta - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_e0754e1002654117b6ceda4a0aef7204~mv2.jpg', 'Parque das Nações - Cond. Granja Julieta - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_e5f2098b14be4500ac41a6bb083d87af~mv2.jpg', 'Parque das Nações - Cond. Granja Julieta - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_c91cee3afbe94fbfa125b6692102fd18~mv2.jpg', 'Parque das Nações - Cond. Granja Julieta - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_df90094eb6594f0ea2f6c01e14c18f97~mv2.jpg', 'Parque das Nações - Cond. Granja Julieta - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a5fb45507eb049e783290b5b26cc5457~mv2.jpg', 'Parque das Nações - Cond. Granja Julieta - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1f8a7dd4255d4df19f19dee514b3f2ed~mv2.jpg', 'Parque das Nações - Cond. Granja Julieta - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_51bec64dba904e738bcc69fe5d6e03aa~mv2.jpg', 'Parque das Nações - Cond. Granja Julieta - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_f4de0a103e2c44ed9d367f40cb5424f7~mv2.jpg', 'Parque das Nações - Cond. Granja Julieta - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_3732a3653f9e4f1c9b6f72e991e031eb~mv2.jpg', 'Parque das Nações - Cond. Granja Julieta - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_9e1bf87f4ea848a0b8bfb421cd1ca0ed~mv2.jpg', 'Parque das Nações - Cond. Granja Julieta - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Parque das Nações - Cond. Laguna
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-parque-das-nacoes-cond-laguna', 'Parque das Nações - Cond. Laguna', 'Cury', 'Empreendimento Cury em Chácara Sto Antonio, São Paulo. Em construção. Plantas de 26 a 54 m² com 1 e 2 dormitório(s). Entrega prevista: fev/2029. Categorias de uso: HIS1 - 17%, HIS2 - 69%, R2V - 14%.', 'R. Luiz Seráphico Júnior, 326 - Jardim Caravelas, São Paulo - SP', 'Chácara Sto Antonio', 'São Paulo', 'SP', 'zona_sul',
     262149, '{1,2,3,4}'::int[], '{1,2}'::int[],
     26, 54, true, 'em_obras', 'fev/2029', true, 210,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persina de enrolar (dormitórios R2V) – apenas unidades de 53m² e 54m²','Infra para ar condicionado (dormitórios R2V) – apenas unidades de 53m² e 54m²','Bancada em granito (Banheiros e Cozinhas R2V) – apenas unidades de 53m² e 54m²']::text[], 'https://static.wixstatic.com/media/1d445c_92c5233aacc24685a312779e0fface15~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-sul/parque-das-nacoes-cond-laguna')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_5e2af950a515416ca3af02522b826ad9~mv2.jpg', 'Parque das Nações - Cond. Laguna - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_f95482ead9aa46e88d62da038bd4ce0f~mv2.jpg', 'Parque das Nações - Cond. Laguna - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_b6f7bce0fbf14e65ac7c914d67ffc5ab~mv2.jpg', 'Parque das Nações - Cond. Laguna - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_158cbd863c5146a392fa8f18b0a59314~mv2.jpg', 'Parque das Nações - Cond. Laguna - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_aaddfd5b30c04695b86b9baf403587d9~mv2.jpg', 'Parque das Nações - Cond. Laguna - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a9c3aa756c194485bd8e5984c99d0bed~mv2.jpg', 'Parque das Nações - Cond. Laguna - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1d91b24415234224947b0405b5ca3b61~mv2.jpg', 'Parque das Nações - Cond. Laguna - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_2cf7af856b4b47cc9437df4bdf444ee6~mv2.jpg', 'Parque das Nações - Cond. Laguna - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_92c5233aacc24685a312779e0fface15~mv2.jpg', 'Parque das Nações - Cond. Laguna - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_2a43fc25617b4644b0ae81154f5d60ec~mv2.jpg', 'Parque das Nações - Cond. Laguna - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_891107c632ee497595f392de6d16c269~mv2.jpg', 'Parque das Nações - Cond. Laguna - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_154fc3a01ecc4bd2a28222dfb8f4a336~mv2.jpg', 'Parque das Nações - Cond. Laguna - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Alto Chácara Santo Antônio
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-alto-chacara-santo-antonio', 'Alto Chácara Santo Antônio', 'Cury', 'Empreendimento Cury em Chácara Sto Antonio, São Paulo. Em construção. Plantas de 33 a 53 m² com 2 dormitório(s). Entrega prevista: dez/2028. Categorias de uso: HIS1 - 15%, HIS2 - 71%, R2V - 14%.', 'Av. Cecília Lottenberg, 127 - Chácara Santo Antônio (Zona Sul), São Paulo - SP', 'Chácara Sto Antonio', 'São Paulo', 'SP', 'zona_sul',
     276102, '{3,4}'::int[], '{2}'::int[],
     33, 53, true, 'em_obras', 'dez/2028', true, 18,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persina de enrolar (dormitórios R2V) – apenas unidades de 52m²','Infra para ar condicionado (dormitórios R2V) – apenas unidades de 53m²','Bancada em granito (Banheiros e Cozinhas R2V) – apenas unidades de 53m²']::text[], 'https://static.wixstatic.com/media/1d445c_bcb936750bc948ee92be5db3e55573c0~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-sul/alto-chacara-santo-antonio')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_bcb936750bc948ee92be5db3e55573c0~mv2.jpg', 'Alto Chácara Santo Antônio - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_6a76f9ab0c4b4773b7262b6150b93278~mv2.jpg', 'Alto Chácara Santo Antônio - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_14bab943356f421b828b09696f9aafa2~mv2.jpg', 'Alto Chácara Santo Antônio - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_7a51f934a3a945f59c42de7b0664dfdc~mv2.jpg', 'Alto Chácara Santo Antônio - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_8256d4f2031745a5bf41d038f94f4756~mv2.jpg', 'Alto Chácara Santo Antônio - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_619c3ebf12f944969a65fca1b3f5e068~mv2.jpg', 'Alto Chácara Santo Antônio - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_545e74f2cff94d86908684fd23c637e4~mv2.jpg', 'Alto Chácara Santo Antônio - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_98745f0a2598478c8f8aa19c2ae9d8af~mv2.jpg', 'Alto Chácara Santo Antônio - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_51e68f016d3a4f1aad5ad6c4b2e7c540~mv2.jpg', 'Alto Chácara Santo Antônio - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_2347e408345a4f4e918d8ae2c52356c6~mv2.jpg', 'Alto Chácara Santo Antônio - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1553a8e13318488b8449ceeda6ac9e52~mv2.jpg', 'Alto Chácara Santo Antônio - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_58e2a750ae164252b4ce8e7623f331cd~mv2.jpg', 'Alto Chácara Santo Antônio - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Lyke Campo Limpo
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-like-campo-limpo', 'Lyke Campo Limpo', 'Cury', 'Empreendimento Cury em Campo Limpo, São Paulo. Em construção. Plantas de 33 a 46 m² com 2 dormitório(s). Entrega prevista: abr/2028.', 'Estrada do Campo Limpo, 288 - Vila Prel, São Paulo - SP', 'Campo Limpo', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{2}'::int[],
     33, 46, true, 'em_obras', 'abr/2028', true, 16,
     'Preço sob consulta. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada']::text[], 'https://static.wixstatic.com/media/1d445c_8ffe8985871e4a7cb89a85fe1503a76f~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-sul/like-campo-limpo')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_7911a7ea4c274e9dbcb6be122aa8661b~mv2.jpg', 'Lyke Campo Limpo - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_2c9c93638ee14293ad2072db7430b6bc~mv2.jpg', 'Lyke Campo Limpo - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_5ae10ab797b84b95a205581823b4abe5~mv2.jpg', 'Lyke Campo Limpo - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_505c24f90351499c811b0171f45f1b69~mv2.jpg', 'Lyke Campo Limpo - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_b07a507d027040c79bdfee1a43efa39a~mv2.jpg', 'Lyke Campo Limpo - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1f75492a7e7b44e59d03a275361c6cb2~mv2.jpg', 'Lyke Campo Limpo - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_35d9e720fb174ceda093292dff38a9d7~mv2.jpg', 'Lyke Campo Limpo - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_13f4946a5a294fa7b8b6a99891695525~mv2.jpg', 'Lyke Campo Limpo - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_9c8eede64b554d05b756014238ea4e4a~mv2.jpg', 'Lyke Campo Limpo - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_b8dcaea6094e4f8da752989009fb7438~mv2.jpg', 'Lyke Campo Limpo - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_26221df5bcf84d2b81e6adeb43d7b2d1~mv2.jpg', 'Lyke Campo Limpo - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_21d74830764843c0991da79b3ec1269a~mv2.jpg', 'Lyke Campo Limpo - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- WL Boa Vista
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-wl-boa-vista', 'WL Boa Vista', 'Cury', 'Empreendimento Cury em Jurubatuba, São Paulo. Lançamento. Plantas de 32 a 46 m² com 2 dormitório(s). Entrega prevista: mar/2030. Categorias de uso: HIS1 - 20%, HIS2 - 67%, R2V - 13%.', 'R. Dr. Ferreira Lopes, 97 - Vila Campo Grande, São Paulo - SP', 'Jurubatuba', 'São Paulo', 'SP', 'zona_sul',
     247450, '{1,2,3,4}'::int[], '{2}'::int[],
     32, 46, true, 'lancamento', 'mar/2030', true, 422,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persina de enrolar (dormitórios R2V) – apenas unidades de 46m²','Infra para ar condicionado (dormitórios R2V) – apenas unidades de 46m²','Bancada em granito (Banheiros e Cozinhas R2V) – apenas unidades de 46m²']::text[], 'https://static.wixstatic.com/media/1d445c_07df3a28b2c243cf97b7b52b77bb67a9~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-sul/wl-boa-vista')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_8749216f6b344b0790b42fb91bbb5c04~mv2.jpg', 'WL Boa Vista - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_0613be418d1449f5990fb642e651bf3e~mv2.jpg', 'WL Boa Vista - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_47fd49d90d2441a2936718331c1e0f22~mv2.jpg', 'WL Boa Vista - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_07df3a28b2c243cf97b7b52b77bb67a9~mv2.jpg', 'WL Boa Vista - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_9293eaba77af4375a74cf70d1834d5f8~mv2.jpg', 'WL Boa Vista - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_490e224c5bb9489b82cc32b9d1398174~mv2.jpg', 'WL Boa Vista - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_9aa8af4c122d401d890959276fce99f5~mv2.jpg', 'WL Boa Vista - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_f2c97013f73643f080a44369b6dd8800~mv2.jpg', 'WL Boa Vista - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_c00a4b7ae5f44b4cb681a3175e8cd0cc~mv2.jpg', 'WL Boa Vista - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_b366fb6b09074d0086e569f7b7f26155~mv2.jpg', 'WL Boa Vista - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_ab374f351279480cbd713f935999f5b1~mv2.jpg', 'WL Boa Vista - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_50dc685ad6414fa4b7adb20d6c795fc0~mv2.jpg', 'WL Boa Vista - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Alto Granja Julieta
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-alto-granja-julieta', 'Alto Granja Julieta', 'Cury', 'Empreendimento Cury em Chácara Sto Antonio, São Paulo. Lançamento. Plantas de 33 a 53 m² com 2 dormitório(s). Entrega prevista: jan/2030. Categorias de uso: HIS1 - 16%, HIS2 - 70%, R2V - 14%.', 'Av. Cecília Lottenberg, 117 - Chácara Santo Antônio (Zona Sul), São Paulo - SP', 'Chácara Sto Antonio', 'São Paulo', 'SP', 'zona_sul',
     276000, '{3,4}'::int[], '{2}'::int[],
     33, 53, true, 'lancamento', 'jan/2030', true, 239,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persina de enrolar (dormitórios R2V) – apenas unidades de 53m²','Infra para ar condicionado (dormitórios R2V) – apenas unidades de 53m²','Bancada em granito (Banheiros e Cozinhas R2V) – apenas unidades de 53m²']::text[], 'https://static.wixstatic.com/media/1d445c_809c6aa59660494b9066c2d0b9b944f9~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-sul/alto-granja-julieta')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_4434b5a97cae443aa43a0fe543e7ec7b~mv2.jpg', 'Alto Granja Julieta - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_c00c4a3fa80b449d9ecba7af35f9334c~mv2.jpg', 'Alto Granja Julieta - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_d883a822148d4bd7900f7bcb4bf44f1c~mv2.jpg', 'Alto Granja Julieta - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_bff9d25eac3f40e799cb2b2cbec037b9~mv2.jpg', 'Alto Granja Julieta - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_dabb286bffc24987be9f7e097d37fab1~mv2.jpg', 'Alto Granja Julieta - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_78ae41d9d7a8478bada3dc1dabe24d9c~mv2.jpg', 'Alto Granja Julieta - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_9d339e6a40c74e63b78b6547073e3821~mv2.jpg', 'Alto Granja Julieta - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_fbbed717bed146938d1dbe5504a024b1~mv2.jpg', 'Alto Granja Julieta - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_28da921bfa944f7f9592ebbc9b7a1bb6~mv2.jpg', 'Alto Granja Julieta - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1fef74d550ae4145a5ca5f05dee64784~mv2.jpg', 'Alto Granja Julieta - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1734a49632b24e78bde470b4a0972c02~mv2.jpg', 'Alto Granja Julieta - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_2f55de9c522e4e88a9eb2197941e83d5~mv2.jpg', 'Alto Granja Julieta - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Praça Santo Antonio
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-chacara-santo-antonio', 'Praça Santo Antonio', 'Cury', 'Empreendimento Cury em Santo Amaro, São Paulo. Lançamento. Plantas de 34 a 45 m² com 2 dormitório(s). Entrega prevista: mai/2029. Categorias de uso: HIS2 - 80%, R2V - 20%.', 'R. Bragança Paulista, 845 - Vila Cruzeiro, São Paulo - SP', 'Santo Amaro', 'São Paulo', 'SP', 'zona_sul',
     269269, '{1,2,3,4}'::int[], '{2}'::int[],
     34, 45, true, 'lancamento', 'mai/2029', true, 94,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persina de enrolar (dormitórios R2V) – apenas unidades de 45m²','Infra para ar condicionado (dormitórios R2V) – apenas unidades de 45m²','Bancada em granito (Banheiros e Cozinhas R2V) – apenas unidades de 45m²']::text[], 'https://static.wixstatic.com/media/1d445c_92454269d668484b88d5ff91118f739b~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-sul/chacara-santo-antonio')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_821cfe3e53f247dc83ed50339fc1e993~mv2.jpg', 'Praça Santo Antonio - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_92454269d668484b88d5ff91118f739b~mv2.jpg', 'Praça Santo Antonio - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_87a5cc8a262f44549b9ea55b31cfd528~mv2.jpg', 'Praça Santo Antonio - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_7e0fe1259c5d4a96a06fd160db6136c3~mv2.jpg', 'Praça Santo Antonio - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1f6899c4ae134fcf95425397dba9fb8c~mv2.jpg', 'Praça Santo Antonio - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_4ddc328e2827473b9ee5d649dc5201c3~mv2.jpg', 'Praça Santo Antonio - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_ed4566e0e8eb4eecb9e6cc8cb16f90e5~mv2.jpg', 'Praça Santo Antonio - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1e02b0d411594ea6bacdac41d2f52d66~mv2.jpg', 'Praça Santo Antonio - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_15c00ddddb044d7ba4793ec0b856b222~mv2.jpg', 'Praça Santo Antonio - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_2aef7aee13b8458d9e8a25af839a6e1a~mv2.jpg', 'Praça Santo Antonio - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_34e894df7d8e40478b1012e1df2bd0e2~mv2.jpg', 'Praça Santo Antonio - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_3054b8551a4146289911046cc200f50b~mv2.jpg', 'Praça Santo Antonio - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Neo Sacomã
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-neo-sacoma', 'Neo Sacomã', 'Cury', 'Empreendimento Cury em Sacomã, São Paulo. Em construção. Plantas de 35 a 44 m² com 2 dormitório(s). Entrega prevista: ago/2028. Categorias de uso: HIS2 - 80%, R2V - 20%.', 'Rua Bogaert, 64 - Vila Vermelha, São Paulo - SP', 'Sacomã', 'São Paulo', 'SP', 'zona_sul',
     260476, '{1,2,3,4}'::int[], '{2}'::int[],
     35, 44, false, 'em_obras', 'ago/2028', true, 1,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras']::text[], 'https://static.wixstatic.com/media/1d445c_79889990f35746269f02fd8afcd6c101~mv2.png', true, false, 'https://www.guerato.com.br/zona-sul/neo-sacoma')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_e4f767825b6f4923aea8a2da5fdc8280~mv2.png', 'Neo Sacomã - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_79889990f35746269f02fd8afcd6c101~mv2.png', 'Neo Sacomã - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_55868a4ee7cc454e828c9b2034950903~mv2.png', 'Neo Sacomã - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_72f84a4b48324f92892aa1deb4758a34~mv2.png', 'Neo Sacomã - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a2eb1fa3e1724c7cbb1fe94d5a73acdf~mv2.png', 'Neo Sacomã - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_26032625d10a4dffacb400de3513c83a~mv2.png', 'Neo Sacomã - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_ada2504737ac479c9dc6d95f1238d070~mv2.png', 'Neo Sacomã - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_20cbd991fb7b4ceab31687a5080a0f5c~mv2.png', 'Neo Sacomã - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_3dab21bc09b540768abfa6b1639b9b15~mv2.png', 'Neo Sacomã - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_bedda7dddfa044b49e19d3377fe7f67b~mv2.png', 'Neo Sacomã - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_db881f7b6cd2413ba529cbb9790bac3a~mv2.png', 'Neo Sacomã - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_39b455084085466482a70f42d17059d0~mv2.png', 'Neo Sacomã - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- The One Granja Julieta
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-the-one-granja-julieta', 'The One Granja Julieta', 'Cury', 'Empreendimento Cury em Chácara Sto Antonio, São Paulo. Em construção. Plantas de 32 a 52 m² com 2 dormitório(s). Entrega prevista: abr/2028. Categorias de uso: HIS1 - 28%, HIS2 - 59%, R2V - 13%.', 'Rua Alexandre Dumas, 2051 - Chácara Santo Antônio (Zona Sul), São Paulo - SP', 'Chácara Sto Antonio', 'São Paulo', 'SP', 'zona_sul',
     null, '{}'::int[], '{2}'::int[],
     32, 52, true, 'em_obras', 'abr/2028', true, 8,
     'Preço sob consulta. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persina de enrolar (dormitórios R2V) – apenas unidades de 52m²','Infra para ar condicionado (dormitórios R2V) – apenas unidades de 52m²','Bancada em granito (Banheiros e Cozinhas R2V) – apenas unidades de 52m²']::text[], 'https://static.wixstatic.com/media/1d445c_a999f3a0627f4972a734366da8de02ad~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-sul/the-one-granja-julieta')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_398d67b752d940d0beaa1c77cf467317~mv2.jpg', 'The One Granja Julieta - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_3160c2e6e9c44fe590843d98ea2318dc~mv2.jpg', 'The One Granja Julieta - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_368aa35dacd345a291f49295187ffb50~mv2.jpg', 'The One Granja Julieta - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_81c628064f9c42c2bd7f495e4eba69aa~mv2.jpg', 'The One Granja Julieta - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_d6f95fe6baa145488e69341c1ed428c6~mv2.jpg', 'The One Granja Julieta - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_21fd47dab1094a0d955ab9be6fff4157~mv2.jpg', 'The One Granja Julieta - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_c952d67ff8d9422a88731051b1eb513a~mv2.jpg', 'The One Granja Julieta - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_53245e6586fd47fbbc766a11d64641d1~mv2.jpg', 'The One Granja Julieta - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_69a0f1be59ff4f9f804380ca0f04d37f~mv2.jpg', 'The One Granja Julieta - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_e05c7b3121cc409787cea96270073f7f~mv2.jpg', 'The One Granja Julieta - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_012ed3c275c64b76aa08880ef792d34a~mv2.jpg', 'The One Granja Julieta - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_9f6896f158114aee92e3ee19e9399b62~mv2.jpg', 'The One Granja Julieta - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Novo Mundo Carrão Guilherme Giorgi
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-novo-mundo-carrao-guilherme-giogi', 'Novo Mundo Carrão Guilherme Giorgi', 'Cury', 'Empreendimento Cury em Vila Carrão, São Paulo. Lançamento. Plantas de 28 a 52 m² com 1 e 2 dormitório(s). Categorias de uso: HIS1 - 25%, HIS2 - 62%, R2V - 13%.', 'Av. Guilherme Giorgi, São Paulo - SP', 'Vila Carrão', 'São Paulo', 'SP', 'zona_leste',
     null, '{}'::int[], '{1,2}'::int[],
     28, 52, true, 'lancamento', null, true, 624,
     'Preço sob consulta. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persiana de enrolar e Infra para ar condicionado (dormitórios das unidades R2V – apenas unidades de 52m²)','Bancadas em granito banheiros e cozinha (unidades R2V – apenas unidades de 52m²)']::text[], null, true, false, 'https://www.guerato.com.br/zona-leste/novo-mundo-carrao-guilherme-giogi')
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
select 1 from d;
-- Novo Mundo Carrão
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-novo-mundo-carrao', 'Novo Mundo Carrão', 'Cury', 'Empreendimento Cury em Vila Carrão, São Paulo. Lançamento. Plantas de 28 a 52 m² com 1 e 2 dormitório(s). Entrega prevista: jul/2029. Categorias de uso: HIS1 - 25%, HIS2 - 62%, R2V - 13%.', 'R. Lutécia, São Paulo - SP', 'Vila Carrão', 'São Paulo', 'SP', 'zona_leste',
     266081, '{1,2,3,4}'::int[], '{1,2}'::int[],
     28, 52, true, 'lancamento', 'jul/2029', true, 14,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persiana de enrolar e Infra para ar condicionado (dormitórios das unidades R2V – apenas unidades de 52m²)','Bancadas em granito banheiros e cozinha (unidades R2V – apenas unidades de 52m²)']::text[], 'https://static.wixstatic.com/media/1d445c_974d841a215c4a91a2477d96d564a8a5~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-leste/novo-mundo-carrao')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_b8227a33f3b7497eb3d6e2d1447db75a~mv2.jpg', 'Novo Mundo Carrão - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_75d1f350758147a2a597982501afd6cb~mv2.jpg', 'Novo Mundo Carrão - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a60af82b025a41a4a4f6d51e463dabfb~mv2.jpg', 'Novo Mundo Carrão - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_d33ed04ef20c47918faa0be4deeca413~mv2.jpg', 'Novo Mundo Carrão - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_0c432ca882c344c9813fd1c0e5f34f36~mv2.jpg', 'Novo Mundo Carrão - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a2b8e1411cd242d6b958ab33660eb11a~mv2.jpg', 'Novo Mundo Carrão - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_c338e7f4bd584ece82f95c9f9342eede~mv2.jpg', 'Novo Mundo Carrão - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1477d192854c495eb077b4e895a72cf5~mv2.jpg', 'Novo Mundo Carrão - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a662a05a21c44c10a1ada50ff44d4c89~mv2.jpg', 'Novo Mundo Carrão - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_d4e74f49b2594bb18078da8ad4caab85~mv2.jpg', 'Novo Mundo Carrão - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_c13bc963183e47dc899fafc7e6e7c6ef~mv2.jpg', 'Novo Mundo Carrão - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_083327255e954c73931f19bd024fcd8d~mv2.jpg', 'Novo Mundo Carrão - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Supreme Anália Franco
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-supreme-analia-franco', 'Supreme Anália Franco', 'Cury', 'Empreendimento Cury em Anália Franco, São Paulo. Em construção. Plantas de 33 a 51 m² com 2 dormitório(s). Entrega prevista: fev/2028. Categorias de uso: HIS1 - 31%, HIS2 - 06%, HMP - 51%.', 'Rua Guapeva, 184 - Água Rasa, São Paulo - SP', 'Anália Franco', 'São Paulo', 'SP', 'zona_leste',
     276102, '{3,4}'::int[], '{2}'::int[],
     33, 51, true, 'em_obras', 'fev/2028', true, 19,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras']::text[], 'https://static.wixstatic.com/media/1d445c_705ad3d9c3254ff1953d707b4d3045bb~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-leste/supreme-analia-franco')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_705ad3d9c3254ff1953d707b4d3045bb~mv2.jpg', 'Supreme Anália Franco - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_041d8776e6a241fea93b333129d2bf78~mv2.jpg', 'Supreme Anália Franco - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_e9a2dc51ee66424789f7e6e6b3cff7aa~mv2.jpg', 'Supreme Anália Franco - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_20e3587cfa0f4fcbb33ada9388c5468a~mv2.jpg', 'Supreme Anália Franco - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a00d8d72da6448a99aad740dacbfaf8d~mv2.jpg', 'Supreme Anália Franco - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_57d61fec624444a9a15cb362c221109a~mv2.jpg', 'Supreme Anália Franco - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a7cd4272a6e843728aa7aaaabc09ed33~mv2.jpg', 'Supreme Anália Franco - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_8afbf66882e048f081285e3c1124b835~mv2.jpg', 'Supreme Anália Franco - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_004b6ad2092f475da02fdb46e3b264bb~mv2.jpg', 'Supreme Anália Franco - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_041e62db0c78453191ae1eed9b217e05~mv2.jpg', 'Supreme Anália Franco - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_9e6e9921047c4d9da99aed4d849d1050~mv2.jpg', 'Supreme Anália Franco - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_9ee994158a2248c4b4d58b7957f6fff3~mv2.jpg', 'Supreme Anália Franco - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Mérito Belenzinho
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-merito-belenzinho', 'Mérito Belenzinho', 'Cury', 'Empreendimento Cury em Belenzinho, São Paulo. Em construção. Plantas de 34 a 45 m² com 2 dormitório(s). Entrega prevista: set/2027. Categorias de uso: HIS1 - 43%, HIS2 - 28%, HMP - 16%.', 'Rua Marcos Arruda, 729 - Catumbi, São Paulo - SP', 'Belenzinho', 'São Paulo', 'SP', 'zona_leste',
     263281, '{1,2,3,4}'::int[], '{2}'::int[],
     34, 45, true, 'em_obras', 'set/2027', true, 6,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persiana de enrolar e Infra para ar condicionado (dormitórios das unidades R2V – (apenas unidades de 45m²)','Infra para ar condicionado - (apenas para unidades de 45m²)','Bancadas em granito banheiros e cozinha (unidades R2V – (apenas unidades de 44m²)']::text[], 'https://static.wixstatic.com/media/1d445c_415a2907af5c415ebadd17143b66c598~mv2.png', true, false, 'https://www.guerato.com.br/zona-leste/merito-belenzinho')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_c8f11d329e374e54b905306e4da5ea9c~mv2.jpg', 'Mérito Belenzinho - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_507ab8e981d247e1baf9c8f6e11b8131~mv2.jpg', 'Mérito Belenzinho - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_c36aa1f3d1964a5187ced68df70f39d6~mv2.jpg', 'Mérito Belenzinho - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_3a6318091bd84cc4bc0e14a4195b6366~mv2.jpg', 'Mérito Belenzinho - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1e435b9a188e4d9b9dbe7f428f9e46c1~mv2.jpg', 'Mérito Belenzinho - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_dad3aafdc3d3439ca915e703cb9a03a1~mv2.jpg', 'Mérito Belenzinho - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_8c543a4aba6446c0b405e25375ae1033~mv2.jpg', 'Mérito Belenzinho - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_8194043aafcf43269268ba1081fe21bb~mv2.jpg', 'Mérito Belenzinho - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a87b21e59daa46efbee41dce38ac55bc~mv2.jpg', 'Mérito Belenzinho - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_486fea8625aa40bdbfef37afe5cbd1d5~mv2.jpg', 'Mérito Belenzinho - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_618889b9fb974baf96b537c70ac90f4a~mv2.jpg', 'Mérito Belenzinho - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_2358bd302abb4b9395acceabc45cc417~mv2.jpg', 'Mérito Belenzinho - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Cidade Mooca - Navona
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-cidade-mooca-navona', 'Cidade Mooca - Navona', 'Cury', 'Empreendimento Cury em Mooca, São Paulo. Em construção. Plantas de 34 a 45 m² com 2 dormitório(s). Entrega prevista: jun/2027. Categorias de uso: HIS1 - 60%, HIS2 - 20%, R2V - 20%.', 'Rua Serra de Paracaína - Cambuci, São Paulo - SP', 'Mooca', 'São Paulo', 'SP', 'zona_leste',
     266081, '{1,2,3,4}'::int[], '{2}'::int[],
     34, 45, true, 'em_obras', 'jun/2027', true, 1,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 02/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persiana de enrolar e Infra para ar condicionado (dormitórios das unidades R2V – (apenas unidades de 44m²)','Bancadas em granito banheiros e cozinha (unidades R2V – (apenas unidades de 44m²)','Aquecedor de passagem a gás. -(penas para unidade de ponta)']::text[], 'https://static.wixstatic.com/media/1d445c_a888f3b3b81f408daaefeda97195a3f7~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-leste/cidade-mooca-navona')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_e0ea347b98ff4a4bbf46640cdd867ef1~mv2.jpg', 'Cidade Mooca - Navona - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_4c83a2c39ee241408106b038f4fc1295~mv2.jpg', 'Cidade Mooca - Navona - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_8305088858df4bc185d7c9f0dddf6121~mv2.jpg', 'Cidade Mooca - Navona - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_5b5c988ddf054bbbae8d8b18e34f3244~mv2.jpg', 'Cidade Mooca - Navona - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1e158a7055da4a62a5d5cc9789bffca3~mv2.jpg', 'Cidade Mooca - Navona - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_64b8891229ed461db22227e16b555751~mv2.jpg', 'Cidade Mooca - Navona - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_2776bec468bc43bfb5ee86d3d4253f83~mv2.jpg', 'Cidade Mooca - Navona - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_9fd9bf77b6a74635a45145c4499cc13f~mv2.jpg', 'Cidade Mooca - Navona - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_22b23ad8d6ec4b8d8f976626e5dc8b04~mv2.jpg', 'Cidade Mooca - Navona - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_bc1e9d3a2222462aa4974862e8a132da~mv2.jpg', 'Cidade Mooca - Navona - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_5706f05807a1494b860a984862675029~mv2.jpg', 'Cidade Mooca - Navona - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_aae5eb6ca345421887118cd8edf7f0bc~mv2.jpg', 'Cidade Mooca - Navona - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Novo Mundo Carrão II
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-novo-mundo-carrao-2', 'Novo Mundo Carrão II', 'Cury', 'Empreendimento Cury em Vila Carrão, São Paulo. Lançamento. Plantas de 28 a 52 m² com 1 e 2 dormitório(s). Entrega prevista: out/2029. Categorias de uso: HIS1 - 25%, HIS2 - 62%, R2V - 13%.', 'R. Lutécia, São Paulo - SP', 'Vila Carrão', 'São Paulo', 'SP', 'zona_leste',
     260759, '{1,2,3,4}'::int[], '{1,2}'::int[],
     28, 52, true, 'lancamento', 'out/2029', true, 46,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persiana de enrolar e Infra para ar condicionado (dormitórios das unidades R2V – apenas unidades de 52m²)','Bancadas em granito banheiros e cozinha (unidades R2V – apenas unidades de 52m²)']::text[], 'https://static.wixstatic.com/media/1d445c_a02c26cf0d1c46379ab9317d77eb6bed~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-leste/novo-mundo-carrao-2')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_a02c26cf0d1c46379ab9317d77eb6bed~mv2.jpg', 'Novo Mundo Carrão II - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_29831441f1a548b99b6aa3e07cbd756a~mv2.jpg', 'Novo Mundo Carrão II - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_d3d7b188ae8041e79f1eddd820f2c8e0~mv2.jpg', 'Novo Mundo Carrão II - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_eb4e8d6bbf7040129e8a3795c3d5776c~mv2.jpg', 'Novo Mundo Carrão II - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_72f8727b15104773be92f61d7ee57056~mv2.jpg', 'Novo Mundo Carrão II - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_c5cc3f2c7963404ead4aef81341b40be~mv2.jpg', 'Novo Mundo Carrão II - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_7ee0926a6c37495f974c6ae8c6c04778~mv2.jpg', 'Novo Mundo Carrão II - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_02e76657528d474a895bee76f59639ab~mv2.jpg', 'Novo Mundo Carrão II - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1a1dfd31b9264d8e8fb08914f1bc9990~mv2.jpg', 'Novo Mundo Carrão II - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_4c13a2e3b38b48aebe940fc28a8cd277~mv2.jpg', 'Novo Mundo Carrão II - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_2c3f22987ce34d83aa6192c7d2d79e7f~mv2.jpg', 'Novo Mundo Carrão II - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_6bb8ae1bfda7427fbb0414d61ca67396~mv2.jpg', 'Novo Mundo Carrão II - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Modern Mooca
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-modern-mooca', 'Modern Mooca', 'Cury', 'Empreendimento Cury em Mooca, São Paulo. Em construção. Plantas de 37 a 58 m² com 2 dormitório(s). Entrega prevista: jun/2028.', 'Rua Dona Ana Neri, 815 - Mooca, São Paulo - SP', 'Mooca', 'São Paulo', 'SP', 'zona_leste',
     271187, '{1,2,3,4}'::int[], '{2}'::int[],
     37, 58, true, 'em_obras', 'jun/2028', true, 17,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras']::text[], 'https://static.wixstatic.com/media/1d445c_58e39942ad79436ea787d3b6849639f0~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-leste/modern-mooca')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_2c116d70dbea42eaa832cae13ccb3ae9~mv2.jpg', 'Modern Mooca - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_35b2315ea3c34186a181d31ae27f2986~mv2.jpg', 'Modern Mooca - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_b82d5c58a71546cb8dd6b4dbbfaa8d83~mv2.jpg', 'Modern Mooca - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_0d8bb240575745e7b17e62fb48d3ea92~mv2.jpg', 'Modern Mooca - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_337d68c7feef42dab6544fe5592c9ee9~mv2.jpg', 'Modern Mooca - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_818860e8eae14d2d81e736276db0fe17~mv2.jpg', 'Modern Mooca - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_4777cdf9a5fa4af882bb4853600cc7c0~mv2.jpg', 'Modern Mooca - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_0912f1d9736241219cccf973fce34974~mv2.jpg', 'Modern Mooca - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_908e0849f9984585961cb3f5653f0125~mv2.jpg', 'Modern Mooca - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_3c30f552147f4d2c8b1598585c843cbb~mv2.jpg', 'Modern Mooca - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_e91ade03024c47fbafe0eeda369213a9~mv2.jpg', 'Modern Mooca - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_f6620aa1707b4bfba7e2e93cf6c728cf~mv2.jpg', 'Modern Mooca - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Cidade Mooca - Duomo
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-cidade-mooca-duomo', 'Cidade Mooca - Duomo', 'Cury', 'Empreendimento Cury em Mooca, São Paulo. Em construção. Plantas de 34 a 45 m² com 2 dormitório(s). Entrega prevista: fev/2027. Categorias de uso: HIS1 - 60,73%, HIS2 - 19,44%, R2V - 19,83%.', 'Rua Serra de Paracaína - Cambuci, São Paulo - SP', 'Mooca', 'São Paulo', 'SP', 'zona_leste',
     255770, '{1,2,3,4}'::int[], '{2}'::int[],
     34, 45, true, 'em_obras', 'fev/2027', true, 2,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 02/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persiana de enrolar e Infra para ar condicionado (dormitórios das unidades R2V – apenas unidades de 44m²)','Bancadas em granito banheiros e cozinha (unidades R2V – apenas unidades de 44m²)','Aquecedor de passagem a gás']::text[], 'https://static.wixstatic.com/media/1d445c_f76bbc624c7c4a5eb17be9cbdcdebd57~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-leste/cidade-mooca-duomo')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_301d3e332e5043daa34dede74b7195d7~mv2.jpg', 'Cidade Mooca - Duomo - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_e3406900af8544828acf8d97158460bd~mv2.jpg', 'Cidade Mooca - Duomo - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_0a02d66766d746fda90421f91c57ed4e~mv2.jpg', 'Cidade Mooca - Duomo - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_621f22ac322b405498b03c041c2cb0fa~mv2.jpg', 'Cidade Mooca - Duomo - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_ed9f2d522218442bb132b34bdd6db326~mv2.jpg', 'Cidade Mooca - Duomo - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_742e5e4b559a4cb494a29a6fc5626aa6~mv2.jpg', 'Cidade Mooca - Duomo - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_7f31be8a5bda4bf5a3a9e72607cf6b28~mv2.jpg', 'Cidade Mooca - Duomo - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_b3c3537aedbb4af092d49635e5751251~mv2.jpg', 'Cidade Mooca - Duomo - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_07c80638743844d7b9c4b949fb765316~mv2.jpg', 'Cidade Mooca - Duomo - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_30e55404ebdc458c90497a3f349f763a~mv2.jpg', 'Cidade Mooca - Duomo - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_ff66536ad6e04bb88e30bb3fee263912~mv2.jpg', 'Cidade Mooca - Duomo - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_fa1e21cbabba4c159e99e55e85fffa2e~mv2.jpg', 'Cidade Mooca - Duomo - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Atmosfera Jaguaré II
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-atmosfera-jaguare-2', 'Atmosfera Jaguaré II', 'Cury', 'Empreendimento Cury em Jaguaré, São Paulo. Lançamento. Plantas de 24 a 39 m² com 1 e 2 dormitório(s). Categorias de uso: HIS2 - 100%.', 'R. Santo Eurilo, São Paulo - SP', 'Jaguaré', 'São Paulo', 'SP', 'zona_oeste',
     null, '{}'::int[], '{1,2}'::int[],
     24, 39, false, 'lancamento', null, true, 162,
     'Preço sob consulta. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras']::text[], null, true, false, 'https://www.guerato.com.br/zona-oeste/atmosfera-jaguare-2')
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
select 1 from d;
-- Bosque da Barra
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-bosque-da-barra', 'Bosque da Barra', 'Cury', 'Empreendimento Cury em Barra Funda, São Paulo. Lançamento. Plantas de 32 a 46 m² com 2 dormitório(s). Entrega prevista: set/2029. Categorias de uso: HIS1 - 44%, HIS2 - 28%, HMP - 16%.', 'R. Cônego Vicente Miguel Marino, 134 - Barra Funda, São Paulo - SP', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     241846, '{1,2,3,4}'::int[], '{2}'::int[],
     32, 46, true, 'lancamento', 'set/2029', true, 226,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persianas de enrolar nas unidades com suíte – apenas unidades de 46m²','Infra para ar condicionado nas unidades com suíte – apenas unidades de 46m²','Banca em Granito na cozinha e banheiro para as unidades com supite – apenas unidades de 46m²']::text[], 'https://static.wixstatic.com/media/1d445c_11d3761d9d594d9897cd469b7e6d7978~mv2.png', true, false, 'https://www.guerato.com.br/zona-oeste/bosque-da-barra')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_11d3761d9d594d9897cd469b7e6d7978~mv2.png', 'Bosque da Barra - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_9cccba6fd0184c6e82a6d20d4288d430~mv2.png', 'Bosque da Barra - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_dcbc3e3ac52045098576a7d9389d9e4f~mv2.png', 'Bosque da Barra - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_9273f7f805c1497cba627ccb05963c3c~mv2.png', 'Bosque da Barra - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_84c6090e76c34d75b7699f21d5d2c216~mv2.png', 'Bosque da Barra - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_594d46c925b448bda4499268c3952c30~mv2.png', 'Bosque da Barra - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_ab9266f4bc8b462e8a51bbb48a36e272~mv2.png', 'Bosque da Barra - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_21b2e46381b94c78b0052a781e2fdc72~mv2.png', 'Bosque da Barra - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_34af1845cf9145e091f2048f62a4ee6a~mv2.png', 'Bosque da Barra - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_7a7595bf603b41adb49713f5aec09caa~mv2.png', 'Bosque da Barra - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_509f21cc3cae4cb28e815fd1221a1843~mv2.png', 'Bosque da Barra - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_5f8432fc21bd48828b7f87f76a502dc2~mv2.png', 'Bosque da Barra - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Nova Leopoldina - Cond. Art
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-nova-leopoldina-condominio-art', 'Nova Leopoldina - Cond. Art', 'Cury', 'Empreendimento Cury em Vila Leopoldina, São Paulo. Lançamento. Plantas de 37 a 42 m² com 2 dormitório(s). Entrega prevista: mai/2029. Categorias de uso: HIS2 - 81%, R2V - 19%.', 'Rua Othão, 135 - Vila Leopoldina, São Paulo - SP', 'Vila Leopoldina', 'São Paulo', 'SP', 'zona_oeste',
     282800, '{3,4}'::int[], '{2}'::int[],
     37, 42, false, 'lancamento', 'mai/2029', true, 284,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras']::text[], 'https://static.wixstatic.com/media/1d445c_46b282254ecb41589f1e5fdda75a5ef5~mv2.png', true, false, 'https://www.guerato.com.br/zona-oeste/nova-leopoldina-condominio-art')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_e640011b60a34470ae4e6b6bc9d49732~mv2.png', 'Nova Leopoldina - Cond. Art - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_46b282254ecb41589f1e5fdda75a5ef5~mv2.png', 'Nova Leopoldina - Cond. Art - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_f0123e2abf784ad8ac128ee9652f2b58~mv2.png', 'Nova Leopoldina - Cond. Art - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_2ee69c50777c4c398834a91af5432fd1~mv2.png', 'Nova Leopoldina - Cond. Art - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_54319eac386c4c70a46f3ee1bfec97c4~mv2.png', 'Nova Leopoldina - Cond. Art - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_454e2c29f9494dc98f5fb8ce4a1a94bc~mv2.png', 'Nova Leopoldina - Cond. Art - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_de42ea4b4c814767ae02283e60104c59~mv2.png', 'Nova Leopoldina - Cond. Art - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_247839b10fb54af8a9f78918553e8eef~mv2.png', 'Nova Leopoldina - Cond. Art - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_429fac6e28f44806800b82a354849f88~mv2.png', 'Nova Leopoldina - Cond. Art - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_99c187ffe457412786ae18f6253ce4c3~mv2.png', 'Nova Leopoldina - Cond. Art - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_3113704e273f47e19531f97cf2246a35~mv2.png', 'Nova Leopoldina - Cond. Art - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_230b17b3eb4b4165bfcd196c163bdfa6~mv2.png', 'Nova Leopoldina - Cond. Art - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Lyne Água Branca
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-lyne-agua-branca', 'Lyne Água Branca', 'Cury', 'Empreendimento Cury em Água Branca, São Paulo. Lançamento. Plantas de 37 a 47 m² com 2 dormitório(s). Entrega prevista: dez/2029. Categorias de uso: HIS2 - 81%, R2V - 19%.', 'R. Comendador Sousa, 176 - Água Branca, São Paulo - SP', 'Água Branca', 'São Paulo', 'SP', 'zona_oeste',
     285830, '{3,4}'::int[], '{2}'::int[],
     37, 47, true, 'lancamento', 'dez/2029', true, 244,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras']::text[], 'https://static.wixstatic.com/media/1d445c_14bab6099a014b12a30a22e970cdd974~mv2.png', true, false, 'https://www.guerato.com.br/zona-oeste/lyne-agua-branca')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_c642d819d82044e88954633404e291be~mv2.png', 'Lyne Água Branca - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_94cc95e0038f440fbd5353f9fb369ea3~mv2.png', 'Lyne Água Branca - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a41f1bf4ee954580aa11cf5132409199~mv2.png', 'Lyne Água Branca - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_841a079839a040288cc03a268b74dff6~mv2.png', 'Lyne Água Branca - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_22d4441b99b6446c8292fa7b47c0eb01~mv2.png', 'Lyne Água Branca - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_efca6a56be494aadad9fb931299de4e1~mv2.png', 'Lyne Água Branca - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_4477086bf4f44ef9a0a002b9e7bcde5a~mv2.png', 'Lyne Água Branca - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_5d1b3ca688a3449691660c29864de4fc~mv2.png', 'Lyne Água Branca - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a6b809fe38b949f1903a847f3a18eab2~mv2.png', 'Lyne Água Branca - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_b8c9607dd828449dba3b44902167ab2e~mv2.png', 'Lyne Água Branca - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_14bab6099a014b12a30a22e970cdd974~mv2.png', 'Lyne Água Branca - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_e640e2d3a9144b8d80283988eadea123~mv2.png', 'Lyne Água Branca - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Supreme Vila Romana
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-supreme-vila-romana', 'Supreme Vila Romana', 'Cury', 'Empreendimento Cury em Vila Romana, São Paulo. Em construção. Plantas de 25 a 52 m² com 1 e 2 dormitório(s). Entrega prevista: jan/2029. Categorias de uso: HIS2 - 80%, R2V - 20%.', 'R. Clélia, 1030 - Barra Funda, São Paulo - SP', 'Vila Romana', 'São Paulo', 'SP', 'zona_oeste',
     269664, '{1,2,3,4}'::int[], '{1,2}'::int[],
     25, 52, true, 'em_obras', 'jan/2029', true, 46,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persianas de enrolar nas unidades com suíte – apenas unidades de 52m²','Infra para ar condicionado nas unidades com suíte – apenas unidades de 52m²','Banca em Granito na cozinha e banheiro para as unidades com supite – apenas unidades de 52m²']::text[], 'https://static.wixstatic.com/media/1d445c_e53f9aac41eb49d98de3ea6161cc1c36~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-oeste/supreme-vila-romana')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_6d244c7e937241769114e47bfa9fad8e~mv2.jpg', 'Supreme Vila Romana - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_2ac06a2e03984972946ef4d40ab730e4~mv2.jpg', 'Supreme Vila Romana - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_f73953cd1c4d48339bb5aa2bfd033613~mv2.jpg', 'Supreme Vila Romana - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_f826832793854a709e8511419080697e~mv2.jpg', 'Supreme Vila Romana - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_e53f9aac41eb49d98de3ea6161cc1c36~mv2.jpg', 'Supreme Vila Romana - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_03a2acfad1d84a2eba0d5c14863d0cc7~mv2.jpg', 'Supreme Vila Romana - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_63fe412f221b4f74b5dadad84f3d4a05~mv2.jpg', 'Supreme Vila Romana - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_65410199d4224e72a09c5e5f95c06635~mv2.jpg', 'Supreme Vila Romana - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_4f46b5f430fe48b9848863dc2c752a5b~mv2.jpg', 'Supreme Vila Romana - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_ea1a001ccf8c45b28f917db368ba31d2~mv2.jpg', 'Supreme Vila Romana - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_aa1dfc49d4444009b965819ef09bfedc~mv2.jpg', 'Supreme Vila Romana - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_d4429211d87b4f089021591329632b2e~mv2.jpg', 'Supreme Vila Romana - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Atmosfera
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-atmosfera', 'Atmosfera', 'Cury', 'Empreendimento Cury em Jaguaré, São Paulo. Em construção. Plantas de 24 a 39 m² com 1 e 2 dormitório(s). Entrega prevista: nov/2028. Categorias de uso: HIS2 - 100%.', 'R. Santo Eurilo, São Paulo - SP', 'Jaguaré', 'São Paulo', 'SP', 'zona_oeste',
     226308, '{1,2,3,4}'::int[], '{1,2}'::int[],
     24, 39, false, 'em_obras', 'nov/2028', true, 10,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras']::text[], 'https://static.wixstatic.com/media/1d445c_8a3dee2f3a9f455091a9275052828bfc~mv2.png', true, false, 'https://www.guerato.com.br/zona-oeste/atmosfera')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_19894165172547deb403daa0b4cbb8a2~mv2.png', 'Atmosfera - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_8c8309ec54c944fc9c051819a16385b3~mv2.png', 'Atmosfera - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a74bcb9813564522a8beff55cc3f3088~mv2.png', 'Atmosfera - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_8a3dee2f3a9f455091a9275052828bfc~mv2.png', 'Atmosfera - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_3b6b65bc8e974da18a87a724b403c20b~mv2.png', 'Atmosfera - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_fd3109e1c6a847d6a34ec76d2b49c774~mv2.png', 'Atmosfera - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_f55e127c90e74f9d98b49567eae1815d~mv2.png', 'Atmosfera - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_aa99ddede450481c86f2f85532ae238a~mv2.png', 'Atmosfera - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_8f6af24c8e7045deb6575d22ecc1e45c~mv2.png', 'Atmosfera - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_9380c4a3aab54dd4a9ff61f597a5a01b~mv2.png', 'Atmosfera - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_57126b82de004f528fbe91aedeba0640~mv2.png', 'Atmosfera - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_ddf8cf79064e449f8be0db82db5a7717~mv2.png', 'Atmosfera - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Parque das Perdizes
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-parque-das-perdizes', 'Parque das Perdizes', 'Cury', 'Empreendimento Cury em Barra Funda, São Paulo. Lançamento. Plantas de 25 a 52 m² com 1 e 2 dormitório(s). Categorias de uso: HIS2 - 83%, R2V - 17%.', 'Av. Thomas Edison - Barra Funda, São Paulo - SP', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     239000, '{1,2,3,4}'::int[], '{1,2}'::int[],
     25, 52, true, 'lancamento', null, true, 707,
     'Valor "a partir de" da tabela Cury (validade 06/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persianas de enrolar nas unidades com suíte – apenas unidades de 52m²','Infra para ar condicionado nas unidades com suíte – apenas unidades de 52m²','Banca em Granito na cozinha e banheiro para as unidades com supite – apenas unidades de 52m²']::text[], 'https://static.wixstatic.com/media/1d445c_78e01d54071f412f802a89f6366736ef~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-oeste/parque-das-perdizes')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_44395c64e3d8495d9ad77d17844f9ebd~mv2.jpg', 'Parque das Perdizes - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_55da6ac8667a445aa04ba2d6e903b84a~mv2.jpg', 'Parque das Perdizes - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_86d113254ea34354bb8cf08d61355cbe~mv2.jpg', 'Parque das Perdizes - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_597fb57ef42f47d3a99f29c5ac33823e~mv2.jpg', 'Parque das Perdizes - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_06cee6adbf574159a54d8d467d30b9c0~mv2.jpg', 'Parque das Perdizes - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_4cabe4f460624e84b0636f9754a716a0~mv2.jpg', 'Parque das Perdizes - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_8dc227ed9c0548afa75184bb16d6a186~mv2.jpg', 'Parque das Perdizes - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_bc26637fb3314a9cab36e98e567874f2~mv2.jpg', 'Parque das Perdizes - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_78e01d54071f412f802a89f6366736ef~mv2.jpg', 'Parque das Perdizes - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_06eab99696544d1ea8ca17df4bb34223~mv2.jpg', 'Parque das Perdizes - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1a688cf5c30a4a5aa6a304558647696d~mv2.jpg', 'Parque das Perdizes - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_dbcc6c144d6b4c4ab57f00ee7fbf8e5d~mv2.jpg', 'Parque das Perdizes - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Cidade Lapa - Perdizes
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-cidade-lapa-perdizes', 'Cidade Lapa - Perdizes', 'Cury', 'Empreendimento Cury em Lapa de Baixo, São Paulo. Lançamento. Plantas de 34 a 46 m² com 2 dormitório(s). Entrega prevista: set/2029. Categorias de uso: HIS2 - 77%, R2V - 23%.', 'Av. José Maria de Faria, 111 - Água Branca, São Paulo - SP', 'Lapa de Baixo', 'São Paulo', 'SP', 'zona_oeste',
     242862, '{1,2,3,4}'::int[], '{2}'::int[],
     34, 46, true, 'lancamento', 'set/2029', true, 149,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persianas de enrolar nas unidades com suíte – apenas unidades de 46m²','Infra para ar condicionado nas unidades com suíte – apenas unidades de 46m²','Banca em Granito na cozinha e banheiro para as unidades com supite – apenas unidades de 46m²']::text[], 'https://static.wixstatic.com/media/1d445c_5a1ef5e7f15d4ea2ae188277928fbab6~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-oeste/cidade-lapa-perdizes')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_39c7ecd85b654526b33b1caa24f1f5d1~mv2.jpg', 'Cidade Lapa - Perdizes - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_10217a426fcb435ea4c4ba7ef34660fd~mv2.jpg', 'Cidade Lapa - Perdizes - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_b5c3f1e4e1994d7ba1cf037fd070f636~mv2.jpg', 'Cidade Lapa - Perdizes - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_c8909cc2dd1e4d7fbe945decd9145bb9~mv2.jpg', 'Cidade Lapa - Perdizes - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_bfa37eb57e854d51b20dca1befd42a0c~mv2.jpg', 'Cidade Lapa - Perdizes - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_b5619286a7ee4603a3ed381961532ffd~mv2.jpg', 'Cidade Lapa - Perdizes - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_eef8d62f739641ea9b229ab53997dd05~mv2.jpg', 'Cidade Lapa - Perdizes - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_edba696036294fa595402f57cf5ff66f~mv2.jpg', 'Cidade Lapa - Perdizes - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_865266263705489297c1ab1915a95887~mv2.jpg', 'Cidade Lapa - Perdizes - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_97652c6c6b7b47ad8c4ea3b8c5466820~mv2.jpg', 'Cidade Lapa - Perdizes - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_c257090729dd48a6a3f95bfd464ad3c5~mv2.jpg', 'Cidade Lapa - Perdizes - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_d01bbbdce2644219b7f531565c50a631~mv2.jpg', 'Cidade Lapa - Perdizes - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Cidade Villa Lobos - Tenor
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-cidade-villa-lobos-condominio-tenor', 'Cidade Villa Lobos - Tenor', 'Cury', 'Empreendimento Cury em Jaguaré, São Paulo. Em construção. Plantas de 32 a 38 m² com 2 dormitório(s). Entrega prevista: abr/2029. Categorias de uso: HIS2 - 100%.', 'Av. Onófrio Milano - Jaguaré, São Paulo - SP', 'Jaguaré', 'São Paulo', 'SP', 'zona_oeste',
     257550, '{1,2,3,4}'::int[], '{2}'::int[],
     32, 38, false, 'em_obras', 'abr/2029', true, 190,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras']::text[], 'https://static.wixstatic.com/media/1d445c_1be99a55345a4e7b85f953b3b01da3d2~mv2.png', true, false, 'https://www.guerato.com.br/zona-oeste/cidade-villa-lobos-condominio-tenor')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_a19f9e181e204f458dbee3bf5df0dc6e~mv2.png', 'Cidade Villa Lobos - Tenor - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_17cdf66e70b14af5bc6df032c90a96c8~mv2.png', 'Cidade Villa Lobos - Tenor - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_25bffaa4cfeb4ed98ad60ee6a53f48a7~mv2.png', 'Cidade Villa Lobos - Tenor - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_2a2be0129e2f466697f181eaef0bfc1b~mv2.png', 'Cidade Villa Lobos - Tenor - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_22cee383f6674077bac851d2718cdb4d~mv2.png', 'Cidade Villa Lobos - Tenor - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_21fb52867ac24990a34dbc0897b5ad3a~mv2.png', 'Cidade Villa Lobos - Tenor - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_eb479f5d11994556a068d40767b72872~mv2.png', 'Cidade Villa Lobos - Tenor - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1be99a55345a4e7b85f953b3b01da3d2~mv2.png', 'Cidade Villa Lobos - Tenor - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_70e0b0263a334daca9da43a4a78a1b3a~mv2.png', 'Cidade Villa Lobos - Tenor - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_e2983162bb714eb5a195282d056bd1e2~mv2.png', 'Cidade Villa Lobos - Tenor - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_7db5d0da2f1f43cebf5ec9f337fbd1c8~mv2.png', 'Cidade Villa Lobos - Tenor - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_21a3c6a2129244f29f37c38ee2cf616f~mv2.png', 'Cidade Villa Lobos - Tenor - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Barra Funda 900
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-barra-funda-900', 'Barra Funda 900', 'Cury', 'Empreendimento Cury em Barra Funda, São Paulo. Em construção. Plantas de 32 a 41 m² com 2 dormitório(s). Entrega prevista: mar/2029. Categorias de uso: HIS1 - 60%, HIS2 - 20%, R2V - 20%.', 'R. Barra Funda, 900 - Barra Funda, São Paulo - SP', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     241846, '{1,2,3,4}'::int[], '{2}'::int[],
     32, 41, false, 'em_obras', 'mar/2029', true, 308,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras']::text[], 'https://static.wixstatic.com/media/1d445c_38fba7ffbfd742cca0b75fc9d9c3d14a~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-oeste/barra-funda-900')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_b98c510c8c7644bdadb9f5bd8fdf0c75~mv2.jpg', 'Barra Funda 900 - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_5b1fde7bbd1f4f11b0dd5f427fb3d0e2~mv2.jpg', 'Barra Funda 900 - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_0c60b034eff34050b10b596e3730c7af~mv2.jpg', 'Barra Funda 900 - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_f38e734d9de340f7b32f85d1694f95a1~mv2.jpg', 'Barra Funda 900 - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_6d0ac975556d49e78e790d5abaaeedb9~mv2.jpg', 'Barra Funda 900 - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_cce15c8be2494cdf88603478e825c472~mv2.jpg', 'Barra Funda 900 - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_628dec6f6e0846b88326b2866fa28433~mv2.jpg', 'Barra Funda 900 - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_0154e5fb46484d838b74922e574d7a2e~mv2.jpg', 'Barra Funda 900 - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_0fdfc93b17c84f52ace60351209c36a3~mv2.jpg', 'Barra Funda 900 - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_d1f681c8edab47248b716b8c0ce97141~mv2.jpg', 'Barra Funda 900 - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_47f64318e67746b59b6336c26ba3e42f~mv2.jpg', 'Barra Funda 900 - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_2bf4f9f6a95b4f4f9ac0e7d4b50a0366~mv2.jpg', 'Barra Funda 900 - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Mérito Lapa
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-merito-lapa', 'Mérito Lapa', 'Cury', 'Empreendimento Cury em Lapa, São Paulo. Em construção. Plantas de 32 a 38 m² com 2 dormitório(s). Entrega prevista: jan/2029. Categorias de uso: HIS2 - 80%, R2V - 20%.', 'R. Bartolomeu Paes - Vila Anastácio, São Paulo - SP', 'Lapa', 'São Paulo', 'SP', 'zona_oeste',
     255715, '{1,2,3,4}'::int[], '{2}'::int[],
     32, 38, false, 'em_obras', 'jan/2029', true, 326,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras']::text[], 'https://static.wixstatic.com/media/1d445c_074ae3c1df5c4f3db61f75c5c521a243~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-oeste/merito-lapa')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_074ae3c1df5c4f3db61f75c5c521a243~mv2.jpg', 'Mérito Lapa - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a85ee722fbf048a893c38d98a7a78783~mv2.jpg', 'Mérito Lapa - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1691196e869246599648ff23292cde34~mv2.jpg', 'Mérito Lapa - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_c8be1770c6af4e8c8790a08d427f3b4a~mv2.jpg', 'Mérito Lapa - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_e12f9460f3114d12b47e6b45da1332e3~mv2.jpg', 'Mérito Lapa - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a9ee90993ae94f87a9a084d5cd28ca68~mv2.jpg', 'Mérito Lapa - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_eef0f092dcac445db0ebb95b16f6b385~mv2.jpg', 'Mérito Lapa - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_3571a18291124ad28e93ebb6ec216838~mv2.jpg', 'Mérito Lapa - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_5bc04eb0dc9b4c3683c4480fe2803328~mv2.jpg', 'Mérito Lapa - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_67763df4eef64e34a19eb79407fe2940~mv2.jpg', 'Mérito Lapa - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_f6a4ec9c82a4473d9b497e4a09980f1b~mv2.jpg', 'Mérito Lapa - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_f4d61bddb0be4cd596ce3cc4c11d8e30~mv2.jpg', 'Mérito Lapa - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Barra Funda 930
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-barra-funda-930', 'Barra Funda 930', 'Cury', 'Empreendimento Cury em Barra Funda, São Paulo. Em construção. Plantas de 32 a 41 m² com 2 dormitório(s). Entrega prevista: out/2028. Categorias de uso: HIS1 - 60%, HIS2 - 20%, R2V - 20%.', 'R. Barra Funda, 930 - Barra Funda, São Paulo - SP', 'Barra Funda', 'São Paulo', 'SP', 'zona_oeste',
     241846, '{1,2,3,4}'::int[], '{2}'::int[],
     32, 41, true, 'em_obras', 'out/2028', true, 29,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras']::text[], 'https://static.wixstatic.com/media/1d445c_35e1a1eca2b646738559396fd750a564~mv2.jpg', true, false, 'https://www.guerato.com.br/zona-oeste/barra-funda-930')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_268ece7216ef46ea998c1f51f8c73eb2~mv2.jpg', 'Barra Funda 930 - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_820067fff8c8453da90759182dc95ef8~mv2.jpg', 'Barra Funda 930 - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_0a610544cbe445aeaee0fba85a896d1d~mv2.jpg', 'Barra Funda 930 - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_dfa2a23efc4d4b089b8b2adfe24583d2~mv2.jpg', 'Barra Funda 930 - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_617e765531424b0f92c39900f217c450~mv2.jpg', 'Barra Funda 930 - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_40f1164919664a8e9839490fb7516906~mv2.jpg', 'Barra Funda 930 - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_d91eb6d8e00046dfb96bd276b373a7fe~mv2.jpg', 'Barra Funda 930 - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_387986bc9134439bae7fa5007dbb19d1~mv2.jpg', 'Barra Funda 930 - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_35e1a1eca2b646738559396fd750a564~mv2.jpg', 'Barra Funda 930 - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_8df6fbe107534e549e28455bb052ecaf~mv2.jpg', 'Barra Funda 930 - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_626f21d0726b42cea1701b6913b67b46~mv2.jpg', 'Barra Funda 930 - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_f1d650b924374a90b4f9ec40261f3187~mv2.jpg', 'Barra Funda 930 - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Mérito Ipiranga
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-merito-ipiranga', 'Mérito Ipiranga', 'Cury', 'Empreendimento Cury em Ipiranga, São Paulo. Lançamento. Plantas de 26 a 46 m² com 1 e 2 dormitório(s). Entrega prevista: abr/2030. Categorias de uso: HIS2 - 82%, R2V - 18%.', 'R. Hipólito Soares, 176 - Ipiranga, São Paulo - SP', 'Ipiranga', 'São Paulo', 'SP', 'centro',
     229522, '{1,2,3,4}'::int[], '{1,2}'::int[],
     26, 46, true, 'lancamento', 'abr/2030', true, 453,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 02/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persianas de enrolar nas unidades com suíte – apenas unidades de 46m²','Infra para ar condicionado nas unidades com suíte – apenas unidades de 46m²','Banca em Granito na cozinha e banheiro para as unidades com supite – apenas unidades de 46m²']::text[], 'https://static.wixstatic.com/media/1d445c_6422ebf79cb14eae91e51d13357eea75~mv2.jpg', true, false, 'https://www.guerato.com.br/cury-centro/merito-ipiranga')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_d0b21be0b3474afaa9cc54a91f34ba41~mv2.jpg', 'Mérito Ipiranga - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_6db971c7946b42c39fde23c931eba9e9~mv2.jpg', 'Mérito Ipiranga - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_6422ebf79cb14eae91e51d13357eea75~mv2.jpg', 'Mérito Ipiranga - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_2cd6187b965b424587896a32edcfaaa3~mv2.jpg', 'Mérito Ipiranga - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_acaf716755cc4530a064de474cf99927~mv2.jpg', 'Mérito Ipiranga - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_bacb4333f6ad4732889c0053d87edd3d~mv2.jpg', 'Mérito Ipiranga - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_6cbf353a6b0e43378669e252ab0fc699~mv2.jpg', 'Mérito Ipiranga - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_8c7a7c51c5344c549ae4ace653352a92~mv2.jpg', 'Mérito Ipiranga - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a555efdfd456435f8f9bc67bfbf428cc~mv2.jpg', 'Mérito Ipiranga - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_7d38044efe10480ca86a22311f122173~mv2.jpg', 'Mérito Ipiranga - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_fdc2718d0bd54a05b0b5c1801b2f42ff~mv2.jpg', 'Mérito Ipiranga - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_c050ea4a8a2244cc9d2fdeae09b81084~mv2.jpg', 'Mérito Ipiranga - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Caminhos da Liberdade
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-caminhos-da-liberdade', 'Caminhos da Liberdade', 'Cury', 'Empreendimento Cury em Cambuci, São Paulo. Lançamento. Plantas de 32 a 53 m² com 2 dormitório(s). Entrega prevista: set/2029. Categorias de uso: HIS1 - 15%, HIS2 - 71%, R2V - 14%.', 'R. do Lavapés, 6 - Cambuci, São Paulo - SP', 'Cambuci', 'São Paulo', 'SP', 'centro',
     252858, '{1,2,3,4}'::int[], '{2}'::int[],
     32, 53, true, 'lancamento', 'set/2029', true, 279,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras','Persianas de enrolar nas unidades com suíte – apenas unidades de 53m²','Infra para ar condicionado nas unidades com suíte – apenas unidades de 53m²','Banca em Granito na cozinha e banheiro para as unidades com supite – apenas unidades de 53m²']::text[], 'https://static.wixstatic.com/media/1d445c_9c5369b8bcb24ccb82939e650d652d75~mv2.jpg', true, false, 'https://www.guerato.com.br/cury-centro/caminhos-da-liberdade')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_c67314a5e7ac4a43897918d4221e8e4e~mv2.jpg', 'Caminhos da Liberdade - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_00d472c53b0d4bd7a06ec220f023d25a~mv2.jpg', 'Caminhos da Liberdade - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_ad793038fea9465a90970d0a6b32862f~mv2.jpg', 'Caminhos da Liberdade - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_3152206315204717b3d84b93a0a7f043~mv2.jpg', 'Caminhos da Liberdade - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_1e6072b8e4834ee5927eb5628d514699~mv2.jpg', 'Caminhos da Liberdade - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_5e3e80a4d2b54955b40e0f07f4c240f7~mv2.jpg', 'Caminhos da Liberdade - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_e30ee5abb15c404b91dc5cc362d57414~mv2.jpg', 'Caminhos da Liberdade - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_3be7b9d4145e409c8316ced48babb01d~mv2.jpg', 'Caminhos da Liberdade - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_59cd50e1d0624f06b9e019f87198b0d8~mv2.jpg', 'Caminhos da Liberdade - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_d73160371d444bf1b3db78cb36ecb5ba~mv2.jpg', 'Caminhos da Liberdade - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_9c5369b8bcb24ccb82939e650d652d75~mv2.jpg', 'Caminhos da Liberdade - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_3c2af5d65bf342cb91c4eb369d4b3904~mv2.jpg', 'Caminhos da Liberdade - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Next Guarulhos
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-next-guarulhos', 'Next Guarulhos', 'Cury', 'Empreendimento Cury em Guarulhos, Guarulhos. Em construção. Plantas de 34 a 38 m² com 2 dormitório(s). Entrega prevista: abr/2029. Categorias de uso: HIS2 - 100%.', 'Rua Cláudio Sérgio Bere, 122 - Ponte Grande, Guarulhos - SP', 'Guarulhos', 'Guarulhos', 'SP', 'grande_sp',
     285571, '{3,4}'::int[], '{2}'::int[],
     34, 38, true, 'em_obras', 'abr/2029', true, 3,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos estúdios e dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras (banehiros e cozinha)']::text[], 'https://static.wixstatic.com/media/1d445c_7127abf2f9d34070a18e88f61f449801~mv2.jpg', true, false, 'https://www.guerato.com.br/guarulhos/next-guarulhos')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_4a3ffe33a1654931b3e0870c6976162e~mv2.jpg', 'Next Guarulhos - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_58b1a4a403cb4974a83726915210180a~mv2.jpg', 'Next Guarulhos - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_23274bfb8d6449c1a750714ac15553e2~mv2.jpg', 'Next Guarulhos - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_b4699aa4a5674202b5c601f42121dd68~mv2.jpg', 'Next Guarulhos - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_2f8a00fcc7914199917d5e9f8bbab6b2~mv2.jpg', 'Next Guarulhos - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_9d6e113759834511ac66f8f02c7a771e~mv2.jpg', 'Next Guarulhos - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a1059dc789654daaa1328c79d97ac6ad~mv2.jpg', 'Next Guarulhos - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_121ab739efb242bbae4527e07d12a4f7~mv2.jpg', 'Next Guarulhos - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_e8714a0f76f54db9ad5b52c64232fd1b~mv2.jpg', 'Next Guarulhos - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a0525cafe3c24fb19a9f8d100e67ffca~mv2.jpg', 'Next Guarulhos - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_f048f493387b417bbf5b6a58c6924e21~mv2.jpg', 'Next Guarulhos - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_7127abf2f9d34070a18e88f61f449801~mv2.jpg', 'Next Guarulhos - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
-- Mérito Guarulhos
with d as (
  insert into public.developments
    (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios,
     area_min, area_max, vagas, status_obra, previsao_entrega, disponivel, unidades_disponiveis, condicoes_comerciais,
     diferenciais, capa_url, ativo, is_demo, fonte_url)
  values
    ('cury-merito-guarulhos', 'Mérito Guarulhos', 'Cury', 'Empreendimento Cury em Guarulhos, Guarulhos. Em construção. Plantas de 34 a 38 m² com 2 dormitório(s). Entrega prevista: ago/2028. Categorias de uso: HIS2 - 100%.', 'Rua Cláudio Sérgio Bere, 122 - Ponte Grande, Guarulhos - SP', 'Guarulhos', 'Guarulhos', 'SP', 'grande_sp',
     281704, '{3,4}'::int[], '{2}'::int[],
     34, 38, true, 'em_obras', 'ago/2028', true, 3,
     'Valor "a partir de" da tabela Cury (validade 07/10/2026 a 01/11/2026), sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', array['Opções com terraço/sacada','Piso laminado nos estúdios e dormitórios','Duplo acionamento nos vasos sanitários','Arejadores nas torneiras (banehiros e cozinha)']::text[], 'https://static.wixstatic.com/media/1d445c_58aa832ab43b41d3a722bb429d5f610a~mv2.jpg', true, false, 'https://www.guerato.com.br/guarulhos/merito-guarulhos')
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
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, v.tipo, v.url, v.legenda, v.ordem from d,
  (values ('foto', 'https://static.wixstatic.com/media/1d445c_ee1ea6dffe0649989c82ac40bb7ec8af~mv2.jpg', 'Mérito Guarulhos - imagem ilustrativa', 0),
          ('foto', 'https://static.wixstatic.com/media/1d445c_2e540cfb52f84fec84c9e6a892182b82~mv2.jpg', 'Mérito Guarulhos - imagem ilustrativa', 1),
          ('foto', 'https://static.wixstatic.com/media/1d445c_2326c98447164c43ae45d38ee6b3bfed~mv2.jpg', 'Mérito Guarulhos - imagem ilustrativa', 2),
          ('foto', 'https://static.wixstatic.com/media/1d445c_545eddf8ec1443f79feb75d2f8d9eb6f~mv2.jpg', 'Mérito Guarulhos - imagem ilustrativa', 3),
          ('foto', 'https://static.wixstatic.com/media/1d445c_ecd9bd617c8d45ccb34fe42d9225dae8~mv2.jpg', 'Mérito Guarulhos - imagem ilustrativa', 4),
          ('foto', 'https://static.wixstatic.com/media/1d445c_a163268dcce541719a8ff055a900b45d~mv2.jpg', 'Mérito Guarulhos - imagem ilustrativa', 5),
          ('foto', 'https://static.wixstatic.com/media/1d445c_c0319893e9e94ad48f0c6c4ab0752c0e~mv2.jpg', 'Mérito Guarulhos - imagem ilustrativa', 6),
          ('foto', 'https://static.wixstatic.com/media/1d445c_58aa832ab43b41d3a722bb429d5f610a~mv2.jpg', 'Mérito Guarulhos - imagem ilustrativa', 7),
          ('foto', 'https://static.wixstatic.com/media/1d445c_108c521717d74999925f23c4e8a4db42~mv2.jpg', 'Mérito Guarulhos - imagem ilustrativa', 8),
          ('foto', 'https://static.wixstatic.com/media/1d445c_fe94664f1a864d2a88c30c2591becae9~mv2.jpg', 'Mérito Guarulhos - imagem ilustrativa', 9),
          ('foto', 'https://static.wixstatic.com/media/1d445c_97c6db4eda2449f680b7a82e94a517d5~mv2.jpg', 'Mérito Guarulhos - imagem ilustrativa', 10),
          ('foto', 'https://static.wixstatic.com/media/1d445c_b6ecf62d85f24856995b56b1dcdf85a6~mv2.jpg', 'Mérito Guarulhos - imagem ilustrativa', 11)) as v(tipo, url, legenda, ordem);
commit;
select nome, preco_min, status_obra, previsao_entrega, unidades_disponiveis from public.developments where construtora = 'Cury' order by preco_min nulls last;
