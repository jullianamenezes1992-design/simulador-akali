-- Números do Salesforce Plano&Plano (oportunidade, AR e AB) no cliente e no aprovado,
-- e o alerta de oportunidade passando a considerar a entrada parcelada com a construtora
-- (até 30% do preço, com parcela de até 30% da renda).

alter table public.leads add column if not exists oportunidade_sf text check (oportunidade_sf is null or char_length(oportunidade_sf) <= 40);
alter table public.leads add column if not exists ar_numero text check (ar_numero is null or char_length(ar_numero) <= 30);
alter table public.leads add column if not exists ab_numero text check (ab_numero is null or char_length(ab_numero) <= 30);
alter table public.aprovados add column if not exists oportunidade_sf text check (oportunidade_sf is null or char_length(oportunidade_sf) <= 40);
alter table public.aprovados add column if not exists ar_numero text check (ar_numero is null or char_length(ar_numero) <= 30);
alter table public.aprovados add column if not exists ab_numero text check (ab_numero is null or char_length(ab_numero) <= 30);
create index if not exists leads_oportunidade_sf_idx on public.leads (oportunidade_sf) where oportunidade_sf is not null;

-- Até quanto o aprovado compra neste empreendimento: recursos + entrada parcelada
-- (menor entre 30% do preço e 30% da renda × meses de obra [+ pós-chaves dos parâmetros]).
create or replace function public.aprovado_limite(p_recursos numeric, p_renda numeric, p_preco numeric, p_status_obra text)
returns numeric language sql stable set search_path = public as $$
  with ep as (
    select coalesce((params->'entrada_parcelada'->>'meses_lancamento')::numeric, 36) as m_lanc,
           coalesce((params->'entrada_parcelada'->>'meses_obras')::numeric, 24) as m_obras,
           coalesce((params->'entrada_parcelada'->>'meses_pos_chaves')::numeric, 0) as m_pos,
           coalesce((params->'entrada_parcelada'->>'comprometimento_pos')::numeric, 0.30) as c_pos
    from (select params from public.simulation_params where ativo limit 1) p
    union all select 36, 24, 0, 0.30
    limit 1
  )
  select p_recursos + least(
    p_preco * 0.30,
    coalesce(p_renda, 0) * 0.30 * (case p_status_obra when 'pronto' then 0 when 'lancamento' then ep.m_lanc else ep.m_obras end)
      + coalesce(p_renda, 0) * ep.c_pos * ep.m_pos)
  from ep
$$;

create or replace function public.detectar_oportunidade() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  lista jsonb;
  tipo_op text;
begin
  if not new.ativo or not coalesce(new.disponivel, true) or new.preco_min is null then return new; end if;

  if new.preco_min < old.preco_min then
    tipo_op := 'preco_baixou';
    -- só quem PASSOU a caber (antes não cabia, agora cabe)
    select coalesce(jsonb_agg(jsonb_build_object('id', a.id, 'nome', a.nome, 'poder_compra', a.poder_compra) order by a.poder_compra desc), '[]')
      into lista
      from public.aprovados a
     where a.status in ('ativo','negociando')
       and (a.vencimento is null or a.vencimento >= current_date)
       and public.aprovado_limite(a.poder_compra, a.renda_familiar, new.preco_min, new.status_obra) >= new.preco_min
       and public.aprovado_limite(a.poder_compra, a.renda_familiar, old.preco_min, old.status_obra) < old.preco_min;
  elsif new.oferta_destaque and not old.oferta_destaque then
    tipo_op := 'promocao';
    select coalesce(jsonb_agg(jsonb_build_object('id', a.id, 'nome', a.nome, 'poder_compra', a.poder_compra) order by a.poder_compra desc), '[]')
      into lista
      from public.aprovados a
     where a.status in ('ativo','negociando')
       and (a.vencimento is null or a.vencimento >= current_date)
       and public.aprovado_limite(a.poder_compra, a.renda_familiar, new.preco_min, new.status_obra) >= new.preco_min;
  else
    return new;
  end if;

  if jsonb_array_length(lista) > 0 then
    insert into public.oportunidades (development_id, tipo, preco_antes, preco_depois, aprovados)
    values (new.id, tipo_op, old.preco_min, new.preco_min, lista);
  end if;
  return new;
end $$;

select 'ok' as resultado,
  (select count(*) from public.aprovados a where exists (select 1 from public.developments d where d.ativo and d.preco_min is not null
     and public.aprovado_limite(a.poder_compra, a.renda_familiar, d.preco_min, d.status_obra) >= d.preco_min)) as aprovados_com_algum_projeto;
