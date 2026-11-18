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
