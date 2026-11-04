-- Avisos de novos cadastros (e-mail via Resend e WhatsApp via CallMeBot).
-- Tabela separada de site_settings porque guarda chaves: só o papel "admin" lê e altera.
create table if not exists public.notification_settings (
  id                     int primary key default 1 check (id = 1),
  email_ativo            boolean not null default false,
  email_destino          text,
  resend_api_key         text,
  whatsapp_ativo         boolean not null default false,
  whatsapp_numero        text,
  callmebot_api_key      text,
  notificar_incompletas  boolean not null default true,
  updated_at             timestamptz not null default now()
);
insert into public.notification_settings (id) values (1) on conflict (id) do nothing;
alter table public.notification_settings enable row level security;
drop policy if exists notification_settings_admin on public.notification_settings;
create policy notification_settings_admin on public.notification_settings
  for all using (public.is_superadmin()) with check (public.is_superadmin());
