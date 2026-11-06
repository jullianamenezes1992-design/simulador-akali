-- Atualização automática diária dos empreendimentos Plano&Plano a partir do Tabelão On-line
-- (https://rummeniggelima.github.io/tabelao/, atualizado todo dia a partir do Espelho de Vendas).
alter table public.notification_settings add column if not exists tabelao_auto boolean not null default true;
alter table public.notification_settings add column if not exists ultimo_tabelao_em date;

create table if not exists public.tabelao_sync (
  id            bigint generated always as identity primary key,
  rodou_em      timestamptz not null default now(),
  origem        text not null default 'automatico',      -- automatico | manual
  ok            boolean not null,
  atualizados   int not null default 0,
  sem_mudanca   int not null default 0,
  esgotados     int not null default 0,
  dados_de      timestamptz,                               -- data dos dados no tabelão
  mudancas      jsonb not null default '[]',               -- [{nome, campo, de, para}]
  novos         jsonb not null default '[]',               -- no tabelão e fora do nosso site
  erro          text
);
create index if not exists tabelao_sync_rodou_idx on public.tabelao_sync (rodou_em desc);

alter table public.tabelao_sync enable row level security;
drop policy if exists tabelao_sync_admin on public.tabelao_sync;
create policy tabelao_sync_admin on public.tabelao_sync for select using (public.is_admin());
