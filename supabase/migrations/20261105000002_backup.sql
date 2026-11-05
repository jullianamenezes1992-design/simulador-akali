-- Backup semanal: pasta privada no Storage (só o servidor acessa) e controle de data.
insert into storage.buckets (id, name, public) values ('backups', 'backups', false) on conflict (id) do nothing;
alter table public.notification_settings add column if not exists backup_semanal boolean not null default true;
alter table public.notification_settings add column if not exists ultimo_backup_em date;
