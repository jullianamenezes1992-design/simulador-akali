-- Base Cury também guarda propostas sem aprovação (pendentes, reprovadas, sem análise)
-- e pode virar lead (não só aprovado).
alter table public.base_cury add column if not exists lead_id uuid references public.leads(id) on delete set null;
alter table public.base_cury drop constraint if exists base_cury_situacao_check;
alter table public.base_cury add constraint base_cury_situacao_check
  check (situacao in ('nova','chamado','aprovado','lead','descartado'));
select 'ok' as resultado;
