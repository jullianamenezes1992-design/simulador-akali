-- Unidade mais barata por número de dormitórios (preenchido pelo tabelão), para a pré-simulação dos aprovados.
alter table public.developments add column if not exists precos_por_dorm jsonb not null default '{}'::jsonb;
select 'ok' as resultado;
