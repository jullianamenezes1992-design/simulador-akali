-- Integração com o CRM da equipe (do gerente): leads da campanha entram aqui e o que a corretora atualiza volta para lá.
create table if not exists public.integracao_equipe (
  id              smallint primary key default 1 check (id = 1),
  ativo           boolean not null default false,
  chave           text,          -- chave que o CRM da equipe usa para enviar leads (e que vai junto nos avisos de volta)
  url_retorno     text,          -- endereço do CRM da equipe que recebe as atualizações
  ultimo_recebido timestamptz,
  ultimo_envio    timestamptz,
  ultimo_erro     text,
  atualizado_em   timestamptz not null default now()
);
insert into public.integracao_equipe (id) values (1) on conflict do nothing;
alter table public.integracao_equipe enable row level security;
drop policy if exists integracao_equipe_admin on public.integracao_equipe;
create policy integracao_equipe_admin on public.integracao_equipe for all using (public.is_admin()) with check (public.is_admin());

-- id do lead no CRM da equipe
alter table public.leads add column if not exists equipe_id text;
create unique index if not exists leads_equipe_id_uq on public.leads (equipe_id) where equipe_id is not null;

-- fila de atualizações para enviar ao CRM da equipe
create table if not exists public.equipe_saida (
  id          bigserial primary key,
  lead_id     uuid not null references public.leads(id) on delete cascade,
  evento      text not null,            -- status | observacao
  dados       jsonb not null default '{}',
  criado_em   timestamptz not null default now(),
  enviado_em  timestamptz,
  tentativas  int not null default 0,
  erro        text
);
create index if not exists equipe_saida_pend_idx on public.equipe_saida (criado_em) where enviado_em is null;
alter table public.equipe_saida enable row level security;
drop policy if exists equipe_saida_admin on public.equipe_saida;
create policy equipe_saida_admin on public.equipe_saida for select using (public.is_admin());

-- mudanças de etapa de leads da equipe entram na fila (pega qualquer caminho de atualização)
create or replace function public.equipe_fila_status() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.equipe_id is not null and new.status is distinct from old.status then
    insert into public.equipe_saida (lead_id, evento, dados)
    values (new.id, 'status', jsonb_build_object('de', old.status, 'para', new.status));
  end if;
  return new;
end $$;
drop trigger if exists equipe_fila_status on public.leads;
create trigger equipe_fila_status after update of status on public.leads
  for each row execute function public.equipe_fila_status();

create or replace function public.equipe_fila_nota() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.leads l where l.id = new.lead_id and l.equipe_id is not null)
     and coalesce(new.texto, '') not like '📥 Veio do CRM da equipe%' then
    insert into public.equipe_saida (lead_id, evento, dados)
    values (new.lead_id, 'observacao', jsonb_build_object('texto', new.texto));
  end if;
  return new;
end $$;
drop trigger if exists equipe_fila_nota on public.lead_notes;
create trigger equipe_fila_nota after insert on public.lead_notes
  for each row execute function public.equipe_fila_nota();

select 'ok' as resultado;
