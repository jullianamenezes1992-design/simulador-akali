-- Abas "Montagem de pasta" (etapa Documentação) e "Reprovados": resultado da análise do Salesforce no cliente.
alter table public.leads add column if not exists ar_status text check (ar_status is null or char_length(ar_status) <= 60);
alter table public.leads add column if not exists parecer_reprovacao text check (parecer_reprovacao is null or char_length(parecer_reprovacao) <= 200);
alter table public.leads add column if not exists motivo_reprovacao text check (motivo_reprovacao is null or char_length(motivo_reprovacao) <= 2000);
alter table public.leads add column if not exists reprovado_em date;
alter table public.leads add column if not exists reanalise_em date;
alter table public.leads add column if not exists pendencias text check (pendencias is null or char_length(pendencias) <= 1000);
create index if not exists leads_status_idx on public.leads (status, created_at desc) where excluido_em is null;
select 'ok' as resultado;
