-- Financiamento limitado a 80% da AVALIAÇÃO da unidade (não do preço) e ato mínimo na assinatura.

alter table public.developments add column if not exists avaliacao_min numeric(12,2) check (avaliacao_min is null or avaliacao_min > 0);
alter table public.developments add column if not exists ato_minimo numeric(12,2) check (ato_minimo is null or ato_minimo >= 0);

drop function if exists public.aprovado_limite(numeric, numeric, numeric, text, int);
create or replace function public.aprovado_limite(p_fin numeric, p_outros numeric, p_renda numeric, p_preco numeric, p_aval numeric, p_status_obra text, p_meses_pos int)
returns numeric language sql stable set search_path = public as $$
  with ep as (
    select coalesce((params->'entrada_parcelada'->>'meses_lancamento')::numeric, 36) as m_lanc,
           coalesce((params->'entrada_parcelada'->>'meses_obras')::numeric, 24) as m_obras,
           coalesce((params->'entrada_parcelada'->>'comprometimento_pos')::numeric, 0.30) as c_pos
    from (select params from public.simulation_params where ativo limit 1) p
    union all select 36, 24, 0.30
    limit 1
  )
  select least(coalesce(p_fin, 0), case when p_aval > 0 then p_aval * 0.80 else coalesce(p_fin, 0) end)
    + coalesce(p_outros, 0)
    + least(
        p_preco * 0.20,
        coalesce(p_renda, 0) * 0.30 * (case p_status_obra when 'pronto' then 0 when 'lancamento' then ep.m_lanc else ep.m_obras end)
          + coalesce(p_renda, 0) * ep.c_pos * greatest(coalesce(p_meses_pos, 0), 0))
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
    select coalesce(jsonb_agg(jsonb_build_object('id', a.id, 'nome', a.nome, 'poder_compra', a.poder_compra) order by a.poder_compra desc), '[]')
      into lista from public.aprovados a
     where a.status in ('ativo','negociando') and (a.vencimento is null or a.vencimento >= current_date)
       and public.aprovado_limite(a.financiamento, a.subsidio + a.fgts + a.entrada, a.renda_familiar, new.preco_min, new.avaliacao_min, new.status_obra, new.meses_pos_chaves) >= new.preco_min
       and public.aprovado_limite(a.financiamento, a.subsidio + a.fgts + a.entrada, a.renda_familiar, old.preco_min, old.avaliacao_min, old.status_obra, old.meses_pos_chaves) < old.preco_min;
  elsif new.oferta_destaque and not old.oferta_destaque then
    tipo_op := 'promocao';
    select coalesce(jsonb_agg(jsonb_build_object('id', a.id, 'nome', a.nome, 'poder_compra', a.poder_compra) order by a.poder_compra desc), '[]')
      into lista from public.aprovados a
     where a.status in ('ativo','negociando') and (a.vencimento is null or a.vencimento >= current_date)
       and public.aprovado_limite(a.financiamento, a.subsidio + a.fgts + a.entrada, a.renda_familiar, new.preco_min, new.avaliacao_min, new.status_obra, new.meses_pos_chaves) >= new.preco_min;
  else
    return new;
  end if;
  if jsonb_array_length(lista) > 0 then
    insert into public.oportunidades (development_id, tipo, preco_antes, preco_depois, aprovados)
    values (new.id, tipo_op, old.preco_min, new.preco_min, lista);
  end if;
  return new;
end $$;

select 'ok' as resultado;
