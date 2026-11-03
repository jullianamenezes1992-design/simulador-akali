-- =====================================================================
-- Ajustes para importar o catálogo da Plano&Plano
--  * preço "sob consulta" (preco_min pode ficar vazio)
--  * região "interior" (ex.: Campinas)
--  * link da página de origem do empreendimento
-- =====================================================================

alter table public.developments alter column preco_min drop not null;
alter table public.developments drop constraint if exists developments_preco_min_check;
alter table public.developments add constraint developments_preco_min_check
  check (preco_min is null or preco_min > 0);

alter table public.developments drop constraint if exists preco_max_valido;
alter table public.developments add constraint preco_max_valido
  check (preco_max is null or preco_min is null or preco_max >= preco_min);

alter table public.developments drop constraint if exists developments_regiao_check;
alter table public.developments add constraint developments_regiao_check
  check (regiao in ('zona_norte','zona_sul','zona_leste','zona_oeste','centro','grande_sp','interior'));

alter table public.developments add column if not exists fonte_url text;
