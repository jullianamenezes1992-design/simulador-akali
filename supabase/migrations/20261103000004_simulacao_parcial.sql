-- Simulações incompletas: o lead é salvo assim que o cliente conclui a 1ª etapa (nome e telefone).
alter table public.leads add column if not exists simulacao_completa boolean not null default true;
alter table public.leads add column if not exists etapa_parou int;
create index if not exists leads_incompletas_idx on public.leads (simulacao_completa, created_at desc);
