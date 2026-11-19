-- Fluxo de pagamento da Plano&Plano por empreendimento e tabela de venda,
-- coletado do simulador do portal de corretores (uso interno — só admin vê).
-- parcelas: [{tipo, qtd, inicio, max: [pct faixa0..3] | null, fixo: [R$ faixa0..3] | null, min}]
--   faixas de score: 0 = 0–499, 1 = 500–600, 2 = 601–799, 3 = 800–1000
--   max = limite da parcela como parte da renda (0.33 = 33%); fixo = limite em R$ que não depende da renda
create table if not exists public.plano_fluxos (
  id              uuid primary key default gen_random_uuid(),
  nome_plano      text not null,                 -- nome do empreendimento no portal da Plano
  development_id  uuid references public.developments(id) on delete set null,
  tabela          text not null,                 -- Associativa, Associativa IR Futuro, Direta...
  tabela_nome     text,                          -- nome completo ("Tabela de Novembro/2026 - Associativa")
  unidade_ref     text,
  valor_ref       numeric,
  vigencia_ini    date,
  vigencia_fim    date,
  parcelas        jsonb not null default '[]',
  coletado_em     timestamptz not null default now(),
  unique (nome_plano, tabela)
);
create index if not exists plano_fluxos_dev_idx on public.plano_fluxos (development_id);

alter table public.plano_fluxos enable row level security;
drop policy if exists plano_fluxos_admin on public.plano_fluxos;
create policy plano_fluxos_admin on public.plano_fluxos for all using (public.is_admin()) with check (public.is_admin());

-- score do cliente (o da Plano) e a tabela de venda preferida
alter table public.aprovados add column if not exists score smallint check (score is null or score between 0 and 1000);
alter table public.aprovados add column if not exists tabela_plano text not null default 'Associativa';
alter table public.leads add column if not exists score smallint check (score is null or score between 0 and 1000);

select 'ok' as resultado;

-- liga o nome do portal da Plano ao empreendimento do CRM (palavras do nome do CRM contidas no da Plano)
create or replace function public.plano_palavras(t text) returns text[] language sql immutable as $f$
  select coalesce(array_agg(distinct w), '{}') from regexp_split_to_table(translate(lower(replace(t,'&',' ')),'áàâãéêíóôõúüç','aaaaeeiooouuc'), '[^a-z0-9]+') w
  where w <> '' and w not in ('condominio','residencial','by','plano','e')
$f$;
-- (os dados vêm da coleta no simulador; depois de inserir:)
-- update public.plano_fluxos f set development_id = (select d.id from public.developments d
--   where d.construtora ilike '%plano%' and cardinality(public.plano_palavras(d.nome)) > 0
--     and public.plano_palavras(d.nome) <@ public.plano_palavras(f.nome_plano)
--   order by cardinality(public.plano_palavras(d.nome)) desc, d.ativo desc limit 1);
