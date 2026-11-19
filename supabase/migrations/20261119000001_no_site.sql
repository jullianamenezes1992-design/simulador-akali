-- Empreendimento ativo no CRM pode ficar fora do site (ex.: Cury, desde que a corretora virou embaixadora Plano&Plano).
alter table public.developments add column if not exists no_site boolean not null default true;
update public.developments set no_site = false where construtora ilike '%cury%';

-- o público só vê o que está ativo E no site; a equipe vê tudo
drop policy if exists dev_select on public.developments;
create policy dev_select on public.developments for select
  using ((ativo and no_site) or public.is_admin());
drop policy if exists media_select on public.development_media;
create policy media_select on public.development_media for select
  using (public.is_admin() or exists (
    select 1 from public.developments d where d.id = development_id and d.ativo and d.no_site));

select count(*) filter (where not no_site) as fora_do_site, count(*) filter (where no_site and ativo) as no_site_ativos from public.developments;
