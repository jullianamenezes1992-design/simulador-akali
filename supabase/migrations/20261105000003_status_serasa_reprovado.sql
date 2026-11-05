-- Novas etapas comerciais: "Serasa - Bacen" e "Reprovado"
alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check check (status in
  ('novo','em_atendimento','documentacao','analise_credito','serasa_bacen','aprovado','reprovado','visita','proposta','vendido','perdido'));
