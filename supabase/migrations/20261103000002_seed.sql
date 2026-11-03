-- =====================================================================
-- DADOS INICIAIS
-- 1) Configurações do site
-- 2) Parâmetros de simulação v1 (regras do MCMV pesquisadas em 03/11/2026)
-- 3) Empreendimentos DEMONSTRATIVOS (is_demo = true, nome com "[EXEMPLO]")
--    -> desative ou exclua-os no painel antes de divulgar o site.
-- =====================================================================

insert into public.site_settings (id, empresa_nome, creci, whatsapp_numero, email_contato, encarregado_dados, landing_conteudo)
values (
  1,
  'Akali Imóveis',
  'CRECI-SP 00000-J (preencher)',
  '5511900000000',
  'contato@exemplo.com.br',
  'Nome do encarregado de dados (preencher) — privacidade@exemplo.com.br',
  $json${
    "hero_titulo": "Descubra quanto você pode financiar no Minha Casa, Minha Vida",
    "hero_subtitulo": "Faça uma pré-simulação gratuita em poucos minutos e veja os empreendimentos em São Paulo que combinam com o seu perfil.",
    "programa_texto": "O Minha Casa, Minha Vida é o programa habitacional do Governo Federal que facilita a compra do primeiro imóvel com juros reduzidos e, para as faixas de menor renda, subsídio no valor do imóvel. O enquadramento depende da renda bruta familiar, e o financiamento é analisado e aprovado pelo agente financeiro.",
    "beneficios": [
      {"titulo": "Juros abaixo do mercado", "texto": "Taxas reduzidas, definidas conforme a faixa de renda da família."},
      {"titulo": "Subsídio nas faixas 1 e 2", "texto": "Famílias de menor renda podem receber um desconto do governo no valor do imóvel, conforme análise."},
      {"titulo": "Uso do FGTS", "texto": "O saldo do FGTS pode compor a entrada, respeitadas as regras do fundo."},
      {"titulo": "Prazo longo", "texto": "Financiamento em até 35 anos, limitado pela idade dos compradores."}
    ],
    "aviso_rodape": "Esta é uma plataforma independente de uma corretora de imóveis. Não é um canal oficial da Caixa Econômica Federal nem do Governo Federal."
  }$json$::jsonb
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Parâmetros de simulação — versão 1
-- Fontes (consultadas em 03/11/2026):
--  * Faixas de renda: Portaria MCID nº 333, de 30/03/2026 (DOU 01/04/2026).
--  * Tetos de imóvel F1/F2 (R$ 275 mil em municípios > 750 mil hab., ex.: São Paulo capital):
--    Conselho Curador do FGTS, nov/2025, em vigor desde jan/2026.
--  * Tetos F3 (R$ 400 mil) e F4 (R$ 600 mil): atualização de abril/2026.
--  * Taxas nominais por faixa (Sudeste/não cotista): divulgadas pela Caixa e reproduzidas na imprensa (out/2026).
--  * Subsídio: até R$ 55 mil nas faixas 1 e 2 (valor efetivo depende de renda, localidade e análise).
-- REVISE estes valores no painel sempre que houver nova portaria ou resolução.
-- ---------------------------------------------------------------------

insert into public.simulation_params (versao, ativo, descricao, params)
values (
  1,
  true,
  'Regras MCMV 2026 — Portaria MCID 333/2026 — São Paulo (capital)',
  $json${
    "programa": "Minha Casa, Minha Vida — área urbana",
    "localidade": "São Paulo (capital) — município com mais de 750 mil habitantes",
    "data_referencia": "2026-11-03",
    "comprometimento_renda_max": 0.30,
    "prazo_max_meses": 420,
    "idade_min_anos": 18,
    "idade_max_quitacao_meses": 966,
    "sistema_amortizacao": "SAC",
    "taxa_referencia": "max",
    "cota_financiamento_max": null,
    "fgts_exige_3_anos": true,
    "faixas": [
      {"id": 1, "nome": "Faixa 1", "renda_min": 0,       "renda_max": 3200,  "juros_min": 4.25,  "juros_max": 5.00,  "teto_imovel": 275000, "subsidio_max": 55000},
      {"id": 2, "nome": "Faixa 2", "renda_min": 3200.01, "renda_max": 5000,  "juros_min": 4.75,  "juros_max": 7.00,  "teto_imovel": 275000, "subsidio_max": 55000},
      {"id": 3, "nome": "Faixa 3", "renda_min": 5000.01, "renda_max": 9600,  "juros_min": 7.66,  "juros_max": 8.16,  "teto_imovel": 400000, "subsidio_max": 0},
      {"id": 4, "nome": "Faixa 4 (Classe Média)", "renda_min": 9600.01, "renda_max": 13000, "juros_min": 10.00, "juros_max": 10.50, "teto_imovel": 600000, "subsidio_max": 0}
    ],
    "fontes": [
      {"descricao": "Portaria MCID nº 333/2026 — limites de renda", "url": "https://www.gov.br/cidades/pt-br/acesso-a-informacao/institucional/base-juridica/portarias/PORTARIAMCIDN333DE30DEMARODE2026.pdf"},
      {"descricao": "Agência Gov — Portaria atualiza limites de renda do MCMV (01/04/2026)", "url": "https://agenciagov.ebc.com.br/noticias/202604/portaria-atualiza-limites-renda-minha-casa-minha-vida"},
      {"descricao": "Conselho Curador do FGTS — teto F1/F2 até R$ 275 mil (11/2025)", "url": "https://istoedinheiro.com.br/conselho-curador-do-fgts-aumenta-valor-maximo-de-imovel-para-faixas-1-e-2-do-mcmv-a-r-275-mil"}
    ],
    "observacoes": "Taxas usadas na estimativa: limite superior de cada faixa (cenário conservador). A parcela calculada não inclui seguros obrigatórios (MIP/DFI) nem tarifas. 'cota_financiamento_max' = null significa que o percentual máximo financiado não está sendo aplicado — preencha com o valor informado pelo correspondente Caixa para refinar a estimativa. Idade máxima na quitação: 80 anos e 6 meses (966 meses), regra usual da Caixa — confirme com o correspondente."
  }$json$::jsonb
)
on conflict (versao) do nothing;

-- ---------------------------------------------------------------------
-- Empreendimentos DEMONSTRATIVOS — fictícios, apenas para teste do sistema
-- ---------------------------------------------------------------------

insert into public.developments
  (slug, nome, construtora, descricao, endereco, bairro, regiao, latitude, longitude,
   preco_min, preco_max, faixas, dormitorios, area_min, area_max, vagas, status_obra,
   previsao_entrega, unidades_disponiveis, disponivel, condicoes_comerciais, diferenciais,
   oferta_destaque, oferta_texto, capa_url, ativo, is_demo)
values
  ('exemplo-residencial-jardim-aurora', '[EXEMPLO] Residencial Jardim Aurora', 'Construtora Exemplo',
   'Empreendimento fictício criado para demonstração da plataforma. Condomínio com lazer completo próximo ao transporte público.',
   'Rua Exemplo, 100', 'Itaquera', 'zona_leste', -23.5410, -46.4570,
   219000, 249000, '{1,2}', '{2}', 38, 42, false, 'lancamento',
   'Dezembro/2028', 120, true,
   'Exemplo: entrada parcelada em até 60x durante a obra. (Dado fictício)',
   '{"Piscina","Churrasqueira","Playground","Bicicletário","Próximo ao metrô"}',
   true, 'Exemplo de oferta: condições especiais de lançamento', '/demo/fachada-1.svg', true, true),

  ('exemplo-condominio-vila-serena', '[EXEMPLO] Condomínio Vila Serena', 'Construtora Exemplo',
   'Empreendimento fictício para demonstração. Apartamentos de 1 e 2 dormitórios com varanda.',
   'Avenida Exemplo, 2500', 'Jaçanã', 'zona_norte', -23.4650, -46.5780,
   205000, 239000, '{1,2}', '{1,2}', 32, 41, false, 'em_obras',
   'Junho/2027', 48, true,
   'Exemplo: bônus de adimplência e documentação inclusa. (Dado fictício)',
   '{"Varanda","Salão de festas","Academia","Portaria 24h"}',
   false, null, '/demo/fachada-2.svg', true, true),

  ('exemplo-parque-das-palmeiras', '[EXEMPLO] Parque das Palmeiras', 'Construtora Exemplo',
   'Empreendimento fictício para demonstração. Unidades prontas para morar com vaga de garagem.',
   'Estrada Exemplo, 800', 'Campo Limpo', 'zona_sul', -23.6450, -46.7600,
   268000, 310000, '{2,3}', '{2}', 42, 48, true, 'pronto',
   'Pronto para morar', 15, true,
   'Exemplo: chaves na mão após aprovação do financiamento. (Dado fictício)',
   '{"Vaga de garagem","Pronto para morar","Área verde","Pet place"}',
   true, 'Exemplo: últimas unidades', '/demo/fachada-3.svg', true, true),

  ('exemplo-residencial-mirante-oeste', '[EXEMPLO] Residencial Mirante Oeste', 'Construtora Exemplo',
   'Empreendimento fictício para demonstração. Plantas de 2 e 3 dormitórios com suíte.',
   'Rua Exemplo, 45', 'Butantã', 'zona_oeste', -23.5710, -46.7080,
   345000, 398000, '{3}', '{2,3}', 48, 62, true, 'em_obras',
   'Março/2028', 60, true,
   'Exemplo: tabela direta com a construtora. (Dado fictício)',
   '{"Suíte","Vaga de garagem","Coworking","Piscina aquecida"}',
   false, null, '/demo/fachada-4.svg', true, true),

  ('exemplo-edificio-central-park', '[EXEMPLO] Edifício Central Park', 'Construtora Exemplo',
   'Empreendimento fictício para demonstração. Studios e 1 dormitório no centro expandido.',
   'Rua Exemplo, 300', 'Bela Vista', 'centro', -23.5580, -46.6450,
   255000, 270000, '{1,2,3}', '{1}', 26, 34, false, 'lancamento',
   'Agosto/2029', 200, true,
   'Exemplo: entrada facilitada. (Dado fictício)',
   '{"Lavanderia compartilhada","Rooftop","Próximo ao metrô","Fechadura digital"}',
   false, null, '/demo/fachada-5.svg', true, true),

  ('exemplo-reserva-classe-media', '[EXEMPLO] Reserva Ipiranga', 'Construtora Exemplo',
   'Empreendimento fictício para demonstração voltado à Faixa 4 (Classe Média).',
   'Avenida Exemplo, 1500', 'Ipiranga', 'zona_sul', -23.5890, -46.6070,
   480000, 590000, '{4}', '{2,3}', 58, 74, true, 'lancamento',
   'Outubro/2029', 80, true,
   'Exemplo: condições exclusivas para Faixa 4. (Dado fictício)',
   '{"2 vagas","Varanda gourmet","Piscina","Quadra"}',
   false, null, '/demo/fachada-6.svg', true, true),

  ('exemplo-residencial-sem-estoque', '[EXEMPLO] Residencial Bosque Verde', 'Construtora Exemplo',
   'Empreendimento fictício para demonstração — sem unidades disponíveis no momento.',
   'Rua Exemplo, 77', 'Guarulhos', 'grande_sp', -23.4540, -46.5330,
   230000, 250000, '{1,2}', '{2}', 40, 43, true, 'pronto',
   'Pronto para morar', 0, false,
   'Exemplo: aguarde novas unidades. (Dado fictício)',
   '{"Vaga de garagem","Playground"}',
   false, null, '/demo/fachada-2.svg', true, true)
on conflict (slug) do nothing;

-- Mídias de demonstração
insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, 'foto', d.capa_url, 'Fachada ilustrativa (exemplo)', 0
  from public.developments d where d.is_demo
on conflict do nothing;

insert into public.development_media (development_id, tipo, url, legenda, ordem)
select d.id, 'planta',
       case when 1 = any(d.dormitorios) and not (2 = any(d.dormitorios)) then '/demo/planta-1d.svg' else '/demo/planta-2d.svg' end,
       'Planta ilustrativa (exemplo)', 0
  from public.developments d where d.is_demo
on conflict do nothing;
