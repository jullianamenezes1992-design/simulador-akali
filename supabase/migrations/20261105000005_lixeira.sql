-- Lixeira de clientes: excluir passa a mover para a lixeira (30 dias), com restauração.
alter table public.leads add column if not exists excluido_em timestamptz;
alter table public.leads add column if not exists excluido_por uuid;
create index if not exists leads_lixeira_idx on public.leads (excluido_em) where excluido_em is not null;

-- Clientes na lixeira somem de todas as telas do painel automaticamente
drop policy if exists leads_select on public.leads;
create policy leads_select on public.leads for select using (public.is_admin() and excluido_em is null);
drop policy if exists leads_update on public.leads;
create policy leads_update on public.leads for update using (public.is_admin() and excluido_em is null) with check (public.is_admin());

-- Compromissos de clientes na lixeira também somem (a subconsulta respeita a regra acima)
drop policy if exists lead_tasks_admin on public.lead_tasks;
create policy lead_tasks_admin on public.lead_tasks
  for all using (public.is_admin() and exists (select 1 from public.leads l where l.id = lead_id))
  with check (public.is_admin());

create or replace function public.lixeira_mover(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_superadmin() then raise exception 'Somente administradores.'; end if;
  update public.leads set excluido_em = now(), excluido_por = auth.uid() where id = p_id and excluido_em is null;
end $$;

create or replace function public.lixeira_restaurar(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_superadmin() then raise exception 'Somente administradores.'; end if;
  update public.leads set excluido_em = null, excluido_por = null where id = p_id;
end $$;

create or replace function public.lixeira_excluir(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_superadmin() then raise exception 'Somente administradores.'; end if;
  delete from public.leads where id = p_id and excluido_em is not null;
end $$;

create or replace function public.lixeira_listar()
returns table (id uuid, codigo text, nome text, telefone text, status text, origem text, created_at timestamptz, excluido_em timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_superadmin() then raise exception 'Somente administradores.'; end if;
  return query
    select l.id, l.codigo, l.nome, l.telefone, l.status, l.origem, l.created_at, l.excluido_em
      from public.leads l where l.excluido_em is not null order by l.excluido_em desc;
end $$;

revoke all on function public.lixeira_mover(uuid), public.lixeira_restaurar(uuid), public.lixeira_excluir(uuid), public.lixeira_listar() from public, anon;
grant execute on function public.lixeira_mover(uuid), public.lixeira_restaurar(uuid), public.lixeira_excluir(uuid), public.lixeira_listar() to authenticated;
