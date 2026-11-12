-- Etapa "Simulação" no funil (a corretora escolhe um projeto e envia a simulação ao cliente).
alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check check (status in
  ('novo','em_atendimento','sem_resposta','simulacao','documentacao','analise_credito','serasa_bacen','aprovado','reprovado','visita','proposta','vendido','perdido'));
select 'ok' as resultado;
