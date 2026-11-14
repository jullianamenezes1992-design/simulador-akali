-- Atualização diária das tabelas Cury (junto com o tabelão da Plano&Plano)
alter table public.notification_settings add column if not exists ultimo_cury_em date;
alter table public.notification_settings add column if not exists ultimo_cury_resultado text;
select 'ok' as resultado;
