-- Histórico de ofertas enviadas aos aprovados (qual projeto e quando), para não repetir a mesma oferta,
-- e "última atualização" do cadastro que não muda só porque uma oferta foi enviada.

create table if not exists public.ofertas_enviadas (
  id             bigint generated always as identity primary key,
  aprovado_id    uuid not null references public.aprovados(id) on delete cascade,
  development_id uuid references public.developments(id) on delete set null,
  dev_nome       text not null check (char_length(dev_nome) between 1 and 160),
  enviado_em     timestamptz not null default now()
);
create index if not exists ofertas_enviadas_aprovado_idx on public.ofertas_enviadas (aprovado_id, enviado_em desc);
alter table public.ofertas_enviadas enable row level security;
drop policy if exists ofertas_enviadas_admin on public.ofertas_enviadas;
create policy ofertas_enviadas_admin on public.ofertas_enviadas for all using (public.is_admin()) with check (public.is_admin());

alter table public.aprovados add column if not exists ultima_oferta_em timestamptz;

-- "Atualizado em" só muda quando o cadastro muda de verdade (não por oferta enviada nem aviso de vencimento)
create or replace function public.aprovados_touch() returns trigger language plpgsql as $$
begin
  if (to_jsonb(new) - array['updated_at','ultima_oferta_em','aviso_vencimento_em'])
     is distinct from (to_jsonb(old) - array['updated_at','ultima_oferta_em','aviso_vencimento_em']) then
    new.updated_at = now();
  end if;
  return new;
end $$;

-- Ofertas que já tinham sido enviadas (registradas no histórico do cliente)
insert into public.ofertas_enviadas (aprovado_id, development_id, dev_nome, enviado_em)
select a.id,
       (select d.id from public.developments d where d.nome = e.dados->>'empreendimento' limit 1),
       left(e.dados->>'empreendimento', 160), e.created_at
from public.lead_events e
join public.aprovados a on a.lead_id = e.lead_id
where e.tipo = 'oferta_enviada' and coalesce(e.dados->>'empreendimento', '') <> ''
  and not exists (select 1 from public.ofertas_enviadas o where o.aprovado_id = a.id and o.dev_nome = left(e.dados->>'empreendimento', 160) and o.enviado_em = e.created_at);

-- aprovados sem cliente vinculado: as ofertas ficaram anotadas nas observações ("dd/mm/aaaa: oferta enviada – Projeto")
insert into public.ofertas_enviadas (aprovado_id, development_id, dev_nome, enviado_em)
select a.id, (select d.id from public.developments d where d.nome = trim(m[2]) limit 1), left(trim(m[2]), 160),
       (to_date(m[1], 'DD/MM/YYYY') + time '15:00')::timestamptz
from public.aprovados a, regexp_matches(coalesce(a.observacoes, ''), '(\d{2}/\d{2}/\d{4}): oferta enviada – ([^\n]+)', 'g') m
where a.lead_id is null;

update public.aprovados a set ultima_oferta_em = o.ult
from (select aprovado_id, max(enviado_em) ult from public.ofertas_enviadas group by aprovado_id) o
where o.aprovado_id = a.id and a.ultima_oferta_em is distinct from o.ult;

select (select count(*) from public.ofertas_enviadas) as ofertas_registradas,
       (select count(*) from public.aprovados where ultima_oferta_em is not null) as aprovados_com_oferta;
