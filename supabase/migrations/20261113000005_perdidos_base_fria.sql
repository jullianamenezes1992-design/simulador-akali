-- Perdidos do CRM vão para a Base fria (chamados pelo número da carteira).
-- Reprovados: reanálise na data marcada. Já compraram: indicação a cada 90 dias.

-- 1) a função de importação não deve tirar da fila quem é perdido no CRM
create or replace function public.base_fria_marcar_no_crm()
returns int
language sql
security invoker
set search_path = public
as $$
  with m as (
    update public.base_fria b
       set situacao = 'no_crm', lead_id = l.id
      from public.leads l
     where b.situacao = 'fila'
       and l.excluido_em is null
       and l.status <> 'perdido'
       and regexp_replace(l.telefone, '\D', '', 'g') = b.telefone
    returning 1
  )
  select count(*)::int from m;
$$;

-- 2) envia / tira um lead da Base fria conforme a etapa
create or replace function public.lead_base_fria_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'perdido' and (tg_op = 'INSERT' or old.status is distinct from 'perdido')
     and new.excluido_em is null and new.anonimizado_em is null and new.telefone ~ '^\d{10,11}$' then
    insert into public.base_fria (telefone, nome, email, bairro, origem, status_original, lead_id, prioridade, situacao, lote)
    values (new.telefone, new.nome, new.email, new.regiao_detalhe, new.origem, 'Perdido (CRM)', new.id, 60, 'fila', 'CRM - perdidos')
    on conflict (telefone) do update
      set lead_id = excluded.lead_id,
          prioridade = greatest(public.base_fria.prioridade, 60),
          status_original = 'Perdido (CRM)',
          situacao = case when public.base_fria.situacao in ('no_crm', 'virou_lead') then 'fila' else public.base_fria.situacao end,
          resolvido_em = case when public.base_fria.situacao in ('no_crm', 'virou_lead') then null else public.base_fria.resolvido_em end;
  elsif tg_op = 'UPDATE' and old.status = 'perdido' and new.status <> 'perdido' then
    update public.base_fria set situacao = 'no_crm'
     where lead_id = new.id and situacao in ('fila', 'chamado');
  end if;
  return new;
end;
$$;

drop trigger if exists leads_base_fria_sync on public.leads;
create trigger leads_base_fria_sync
  after insert or update of status on public.leads
  for each row execute function public.lead_base_fria_sync();

-- 3) os perdidos de hoje entram na Base fria
insert into public.base_fria (telefone, nome, email, bairro, origem, status_original, lead_id, prioridade, situacao, lote)
select l.telefone, l.nome, l.email, l.regiao_detalhe, l.origem, 'Perdido (CRM)', l.id, 60, 'fila', 'CRM - perdidos'
  from public.leads l
 where l.status = 'perdido' and l.excluido_em is null and l.anonimizado_em is null and l.telefone ~ '^\d{10,11}$'
on conflict (telefone) do update
  set lead_id = excluded.lead_id,
      prioridade = greatest(public.base_fria.prioridade, 60),
      status_original = 'Perdido (CRM)',
      situacao = case when public.base_fria.situacao in ('no_crm', 'virou_lead') then 'fila' else public.base_fria.situacao end;

-- 4) quem já comprou: indicação já pedida hoje para todos (próxima em 90 dias)
-- (sem mexer na data de "atualizado em")
alter table public.leads disable trigger leads_updated_at;
update public.leads set rebatido_em = now()
 where status = 'vendido' and excluido_em is null;
alter table public.leads enable trigger leads_updated_at;

select 'perdidos na base fria: ' || (select count(*) from public.base_fria where status_original = 'Perdido (CRM)')
    || ' / vendidos marcados: ' || (select count(*) from public.leads where status = 'vendido' and rebatido_em is not null)
    || ' / reprovados com reanalise: ' || (select count(*) from public.leads where status = 'reprovado' and reanalise_em is not null) as resultado;
