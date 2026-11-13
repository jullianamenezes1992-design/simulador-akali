-- Etapa "Arquivado": cliente sem possibilidade de compra. Sai de Leads, do Meu dia e da carteira.
alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check check (status in
  ('novo','em_atendimento','sem_resposta','simulacao','documentacao','analise_credito','serasa_bacen','aprovado','reprovado','visita','proposta','vendido','perdido','arquivado'));
select 'ok' as resultado;
