-- Parcelas da entrada após as chaves passam a ser de cada empreendimento (0 = não tem),
-- e a entrada parcelada dos aprovados fica limitada a 20% do preço.

alter table public.developments add column if not exists meses_pos_chaves smallint not null default 0
  check (meses_pos_chaves between 0 and 120);

-- Unni Harmoni e Unni Felicitá: 48x (informado pela corretora).
-- Demais: conforme o encarte "Acelera Plano" da Plano&Plano (06/11/2026), coluna Pós-chaves.
update public.developments d set meses_pos_chaves = v.meses
from (values
  ('%unni%harmoni%', 48), ('%unni%felicit%', 48),
  ('%leopoldina%carlos weber%', 24), ('%leopoldina%sebasti%bach%', 24),
  ('%start jardim clube%', 48), ('%oriz%', 24), ('%mais butant%', 24),
  ('%esta%o mooca%', 48), ('%vila boulevard mooca%', 48), ('%plano%vila ema%', 24),
  ('%mais bel%m%', 48), ('%praça pirituba%flora%', 24), ('%duetto s%o domingos%', 24),
  ('%ra%zes das merc%', 36)
) as v(padrao, meses)
where d.nome ilike v.padrao;
update public.developments set meses_pos_chaves = 48
 where nome ilike '%jaçan%' and nome not ilike '%caminhos%' and construtora ilike '%plano%';
-- o encarte é do Raízes das Mercês - Marquês de Lages; o Romão Puiggari fica sem pós-chaves
update public.developments set meses_pos_chaves = 0 where nome ilike '%romão puiggari%';

drop function if exists public.aprovado_limite(numeric, numeric, numeric, text);
create or replace function public.aprovado_limite(p_recursos numeric, p_renda numeric, p_preco numeric, p_status_obra text, p_meses_pos int)
returns numeric language sql stable set search_path = public as $$
  with ep as (
    select coalesce((params->'entrada_parcelada'->>'meses_lancamento')::numeric, 36) as m_lanc,
           coalesce((params->'entrada_parcelada'->>'meses_obras')::numeric, 24) as m_obras,
           coalesce((params->'entrada_parcelada'->>'comprometimento_pos')::numeric, 0.30) as c_pos
    from (select params from public.simulation_params where ativo limit 1) p
    union all select 36, 24, 0.30
    limit 1
  )
  select p_recursos + least(
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
      into lista
      from public.aprovados a
     where a.status in ('ativo','negociando')
       and (a.vencimento is null or a.vencimento >= current_date)
       and public.aprovado_limite(a.poder_compra, a.renda_familiar, new.preco_min, new.status_obra, new.meses_pos_chaves) >= new.preco_min
       and public.aprovado_limite(a.poder_compra, a.renda_familiar, old.preco_min, old.status_obra, old.meses_pos_chaves) < old.preco_min;
  elsif new.oferta_destaque and not old.oferta_destaque then
    tipo_op := 'promocao';
    select coalesce(jsonb_agg(jsonb_build_object('id', a.id, 'nome', a.nome, 'poder_compra', a.poder_compra) order by a.poder_compra desc), '[]')
      into lista
      from public.aprovados a
     where a.status in ('ativo','negociando')
       and (a.vencimento is null or a.vencimento >= current_date)
       and public.aprovado_limite(a.poder_compra, a.renda_familiar, new.preco_min, new.status_obra, new.meses_pos_chaves) >= new.preco_min;
  else
    return new;
  end if;

  if jsonb_array_length(lista) > 0 then
    insert into public.oportunidades (development_id, tipo, preco_antes, preco_depois, aprovados)
    values (new.id, tipo_op, old.preco_min, new.preco_min, lista);
  end if;
  return new;
end $$;

select nome, meses_pos_chaves from public.developments where meses_pos_chaves > 0 order by meses_pos_chaves desc, nome;
