-- Agenda do CRM: compromissos e lembretes por cliente.
create table if not exists public.lead_tasks (
  id                  uuid primary key default gen_random_uuid(),
  lead_id             uuid not null references public.leads(id) on delete cascade,
  tipo                text not null check (tipo in ('ligacao','whatsapp','visita','reuniao','documentos','lembrete')),
  quando              timestamptz not null,
  descricao           text check (char_length(descricao) <= 1000),
  status              text not null default 'pendente' check (status in ('pendente','feito','cancelado')),
  lembrar_min         int check (lembrar_min is null or lembrar_min between 0 and 10080),
  lembrete_enviado_em timestamptz,
  criado_por          uuid references public.admin_users(user_id) on delete set null default auth.uid(),
  concluido_em        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists lead_tasks_status_quando_idx on public.lead_tasks (status, quando);
create index if not exists lead_tasks_lead_idx on public.lead_tasks (lead_id, quando);

alter table public.lead_tasks enable row level security;
drop policy if exists lead_tasks_admin on public.lead_tasks;
create policy lead_tasks_admin on public.lead_tasks
  for all using (public.is_admin()) with check (public.is_admin());

drop trigger if exists audit_lead_tasks on public.lead_tasks;
create trigger audit_lead_tasks after insert or update or delete on public.lead_tasks
  for each row execute function public.audit_trigger();

-- Opções de lembrete (junto com os avisos de cadastro)
alter table public.notification_settings add column if not exists lembretes_ativos boolean not null default true;
alter table public.notification_settings add column if not exists resumo_diario boolean not null default true;
alter table public.notification_settings add column if not exists resumo_hora int not null default 8 check (resumo_hora between 0 and 23);
alter table public.notification_settings add column if not exists ultimo_resumo_em date;
-- Senha interna que o agendador do banco usa para chamar o site (não sai do banco/servidor)
alter table public.notification_settings add column if not exists cron_token text not null default encode(extensions.gen_random_bytes(24), 'hex');

-- Agendador: a cada 5 minutos o banco chama o site para enviar lembretes e o resumo do dia
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

do $$
begin
  perform cron.unschedule('akali-lembretes') where exists (select 1 from cron.job where jobname = 'akali-lembretes');
end $$;

select cron.schedule(
  'akali-lembretes',
  '*/5 * * * *',
  $cron$
  select net.http_post(
    url := 'https://simulador-akali.vercel.app/api/cron/lembretes',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-token', (select cron_token from public.notification_settings where id = 1)
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 25000
  );
  $cron$
);
