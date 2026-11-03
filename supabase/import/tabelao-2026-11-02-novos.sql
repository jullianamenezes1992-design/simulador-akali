-- Gerado por scripts/gerar-novos-tabelao.mjs (Tabelão Online de 02/11/2026)
begin;
insert into public.developments
  (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios, area_min, area_max,
   vagas, status_obra, previsao_entrega, disponivel, condicoes_comerciais, diferenciais, ativo, is_demo, fonte_url)
values
  ('tab-ares-do-horto-aroeira', 'Ares do Horto - Aroeira', 'Plano&Plano', 'Empreendimento Plano&Plano em Pirajussara, São Paulo. Lançamento. Opções de 2 e 3 dormitório(s).', 'Estrada do Campo Limpo, s/n - Pirajussara', 'Pirajussara', 'São Paulo', 'SP', 'zona_sul',
   295000, '{3,4}'::int[], '{2,3}'::int[], 32, 55,
   true, 'lancamento', 'dez/2029', true, 'Valor "a partir de" do tabelão Plano&Plano de 02/11/2026, sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', '{}'::text[], true, false, 'https://tabelao-online.web.app')
on conflict (slug) do update set preco_min = excluded.preco_min, faixas = excluded.faixas, status_obra = excluded.status_obra,
  previsao_entrega = excluded.previsao_entrega, condicoes_comerciais = excluded.condicoes_comerciais, ativo = true;
insert into public.developments
  (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios, area_min, area_max,
   vagas, status_obra, previsao_entrega, disponivel, condicoes_comerciais, diferenciais, ativo, is_demo, fonte_url)
values
  ('tab-inspire-maua-sonhos', 'Inspire Mauá Sonhos', 'Plano&Plano', 'Empreendimento Plano&Plano em Fazenda Capitão João, Mauá. Imóvel pronto para morar. Opções de 2 dormitório(s).', 'Rua Pedro Galvano, 8 - Fazenda Capitão João', 'Fazenda Capitão João', 'Mauá', 'SP', 'grande_sp',
   508000, '{4}'::int[], '{2}'::int[], 43, 43,
   true, 'pronto', 'nov/2018', true, 'Valor "a partir de" do tabelão Plano&Plano de 02/11/2026, sujeito a alteração e disponibilidade. Confirme a tabela vigente com o corretor.', '{}'::text[], true, false, 'https://tabelao-online.web.app')
on conflict (slug) do update set preco_min = excluded.preco_min, faixas = excluded.faixas, status_obra = excluded.status_obra,
  previsao_entrega = excluded.previsao_entrega, condicoes_comerciais = excluded.condicoes_comerciais, ativo = true;
insert into public.developments
  (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios, area_min, area_max,
   vagas, status_obra, previsao_entrega, disponivel, condicoes_comerciais, diferenciais, ativo, is_demo, fonte_url)
values
  ('tab-parque-pirituba-arbore', 'Parque Pirituba - Arbore', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Pereira Barreto, São Paulo. Lançamento.', 'Av. Cabo Adão Pereira, 648 - Vila Pereira Barreto', 'Vila Pereira Barreto', 'São Paulo', 'SP', 'zona_norte',
   null, '{}'::int[], '{}'::int[], null, null,
   false, 'lancamento', null, true, 'Valores em breve, conforme tabelão Plano&Plano de 02/11/2026. Consulte o corretor.', '{}'::text[], true, false, 'https://tabelao-online.web.app')
on conflict (slug) do update set preco_min = excluded.preco_min, faixas = excluded.faixas, status_obra = excluded.status_obra,
  previsao_entrega = excluded.previsao_entrega, condicoes_comerciais = excluded.condicoes_comerciais, ativo = true;
insert into public.developments
  (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios, area_min, area_max,
   vagas, status_obra, previsao_entrega, disponivel, condicoes_comerciais, diferenciais, ativo, is_demo, fonte_url)
values
  ('tab-penha-parque-gabriela-mistral', 'Penha Parque - Gabriela Mistral', 'Plano&Plano', 'Empreendimento Plano&Plano em Penha, São Paulo. Lançamento.', 'Av. Gabriela Mistral, 750 - Penha', 'Penha', 'São Paulo', 'SP', 'zona_leste',
   null, '{}'::int[], '{}'::int[], null, null,
   false, 'lancamento', null, true, 'Valores em breve, conforme tabelão Plano&Plano de 02/11/2026. Consulte o corretor.', '{}'::text[], true, false, 'https://tabelao-online.web.app')
on conflict (slug) do update set preco_min = excluded.preco_min, faixas = excluded.faixas, status_obra = excluded.status_obra,
  previsao_entrega = excluded.previsao_entrega, condicoes_comerciais = excluded.condicoes_comerciais, ativo = true;
insert into public.developments
  (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios, area_min, area_max,
   vagas, status_obra, previsao_entrega, disponivel, condicoes_comerciais, diferenciais, ativo, is_demo, fonte_url)
values
  ('tab-plano-vista-santo-amaro', 'Plano Vista Santo Amaro', 'Plano&Plano', 'Empreendimento Plano&Plano em Jardim São Luís, São Paulo. Lançamento.', 'Av. Guido Caloi, 1002 - Jardim São Luís', 'Jardim São Luís', 'São Paulo', 'SP', 'zona_sul',
   null, '{}'::int[], '{}'::int[], null, null,
   false, 'lancamento', null, true, 'Valores em breve, conforme tabelão Plano&Plano de 02/11/2026. Consulte o corretor.', '{}'::text[], true, false, 'https://tabelao-online.web.app')
on conflict (slug) do update set preco_min = excluded.preco_min, faixas = excluded.faixas, status_obra = excluded.status_obra,
  previsao_entrega = excluded.previsao_entrega, condicoes_comerciais = excluded.condicoes_comerciais, ativo = true;
insert into public.developments
  (slug, nome, construtora, descricao, endereco, bairro, cidade, uf, regiao, preco_min, faixas, dormitorios, area_min, area_max,
   vagas, status_obra, previsao_entrega, disponivel, condicoes_comerciais, diferenciais, ativo, is_demo, fonte_url)
values
  ('tab-raizes-das-merces-romao-puiggari', 'Raízes das Mercês - Romão Puiggari', 'Plano&Plano', 'Empreendimento Plano&Plano em Vila Moraes, São Paulo. Lançamento. Opções de 1 e 2 dormitório(s).', 'R. Romão Puiggari, 1025 e R. Marquês de Lages, 1056 - Vila Moraes', 'Vila Moraes', 'São Paulo', 'SP', 'zona_sul',
   null, '{}'::int[], '{1,2}'::int[], 27, 34,
   true, 'lancamento', null, true, 'Valores em breve, conforme tabelão Plano&Plano de 02/11/2026. Consulte o corretor.', '{}'::text[], true, false, 'https://tabelao-online.web.app')
on conflict (slug) do update set preco_min = excluded.preco_min, faixas = excluded.faixas, status_obra = excluded.status_obra,
  previsao_entrega = excluded.previsao_entrega, condicoes_comerciais = excluded.condicoes_comerciais, ativo = true;
update public.developments set ativo = false
where slug like 'pp-%' and slug not in ('pp-planoalto-cantareira', 'pp-plano-altomorumbi', 'pp-ares-do-horto-cajueiro', 'pp-ares-do-horto-ipe-amarelo', 'pp-ares-do-horto-pau-brasil', 'pp-centroe-baraodecampinas', 'pp-plano-bosque-do-carmo-embauba', 'pp-plano-bosque-do-carmo-eucalipto-2', 'pp-plano-bosque-do-carmo-seringueira', 'pp-vila-boulevard-mooca', 'pp-plano-caminhos-jacana', 'pp-centrocampos-eliseos', 'pp-duetto-sao-domingos', 'pp-plano-essencia-life', 'pp-plano-essencia-essencia-club', 'pp-planoestacao-mooca-residencial-2', 'pp-meu-plano-itaquera-amoreira', 'pp-meu-plano-itaquera-ipe-4', 'pp-planojacana', 'pp-jardim-das-origens-arua', 'pp-jardim-das-origens-maira', 'pp-planomais-barra-funda-marques-de-sao-vicente', 'pp-planomais-barra-funda-thomas-edison', 'pp-planomais-belem-2', 'pp-eliseu-de-almeida', 'pp-planomais-interlagos-refugio', 'pp-plano-maisinterlagos', 'pp-planomais-penha', 'pp-mista-by-planoplano-tupinas', 'pp-mista-by-planoplano-ubiatans', 'pp-mundopark-alvorada', 'pp-mundopark-aurora', 'pp-mundopark-solis', 'pp-nid-alphaville', 'pp-oriz-by-planoplano-residencial', 'pp-planopark-santo-amaro', 'pp-meu-planoparquedocarmo-ipe', 'pp-laguna-2', 'pp-mogeiro', 'pp-visconde-de-parnaiba', 'pp-polo-paulista', 'pp-plano-praca-pirituba-flora', 'pp-romao-puiggari-marques-de-lages', 'pp-planoreserva-da-mooca', 'pp-centroe-santacecilia', 'pp-sphera-panamby-club', 'pp-sphera-panamby-park', 'pp-sphera-panamby-urban', 'pp-start-joy', 'pp-gabriela-mistral-tikoa', 'pp-unni-bras', 'pp-unni-by-planoplano-felicita', 'pp-unni-by-planoplano-harmoni', 'pp-planovila-ema', 'pp-planoe-vilaleopoldina-carlos-weber', 'pp-planoe-vilaleopoldina-sebastiao-bach', 'pp-viz-by-planoplano');
commit;
select count(*) filter (where ativo) ativos, count(*) filter (where ativo and preco_min is not null) ativos_com_preco,
  count(*) filter (where not ativo) ocultos from public.developments where not is_demo;
