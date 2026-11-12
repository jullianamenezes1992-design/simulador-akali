-- Clientes que já estão em "Clientes aprovados" saem da lista de Leads (a ficha continua existindo).

alter table public.leads add column if not exists em_aprovados boolean not null default false;
create index if not exists leads_em_aprovados_idx on public.leads (em_aprovados, created_at desc);

create or replace function public.sincronizar_lead_aprovado() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op in ('UPDATE','DELETE') and old.lead_id is not null then
    update public.leads l set em_aprovados = exists (select 1 from public.aprovados a where a.lead_id = old.lead_id)
     where l.id = old.lead_id;
  end if;
  if tg_op in ('INSERT','UPDATE') and new.lead_id is not null then
    update public.leads set em_aprovados = true where id = new.lead_id and not em_aprovados;
  end if;
  return null;
end $$;

drop trigger if exists sincronizar_lead_aprovado on public.aprovados;
create trigger sincronizar_lead_aprovado after insert or update of lead_id or delete on public.aprovados
  for each row execute function public.sincronizar_lead_aprovado();

update public.leads l set em_aprovados = true
 where exists (select 1 from public.aprovados a where a.lead_id = l.id) and not l.em_aprovados;

select count(*) filter (where em_aprovados) as em_aprovados, count(*) filter (where not em_aprovados) as continuam_em_leads
from public.leads where excluido_em is null;
