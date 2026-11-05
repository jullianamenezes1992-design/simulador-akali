-- Notificações no celular (Web Push) para o app instalável do painel.
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.admin_users(user_id) on delete cascade default auth.uid(),
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  aparelho    text,
  created_at  timestamptz not null default now(),
  last_ok_at  timestamptz
);
alter table public.push_subscriptions enable row level security;
drop policy if exists push_own on public.push_subscriptions;
create policy push_own on public.push_subscriptions
  for all using (user_id = auth.uid() and public.is_admin()) with check (user_id = auth.uid() and public.is_admin());

-- Chaves do Web Push (VAPID): geradas automaticamente pelo servidor na primeira vez que forem necessárias.
alter table public.notification_settings add column if not exists vapid_public text;
alter table public.notification_settings add column if not exists vapid_private text;
