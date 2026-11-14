-- Oportunidades calculadas pelo CRM (dormitórios + categoria HIS/HMP/R2V da renda):
-- o gatilho do banco passa a cuidar só da promoção; "preço baixou" e "unidade nova"
-- são registrados pela atualização do tabelão / Cury.
alter table public.oportunidades add column if not exists descricao text;
alter table public.oportunidades drop constraint if exists oportunidades_tipo_check;
alter table public.oportunidades add constraint oportunidades_tipo_check
  check (tipo in ('preco_baixou','promocao','nova_unidade'));

create or replace function public.detectar_oportunidade() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  lista jsonb;
begin
  if not new.ativo or not coalesce(new.disponivel, true) or new.preco_min is null then return new; end if;
  if not (new.oferta_destaque and not old.oferta_destaque) then return new; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id', a.id, 'nome', a.nome, 'poder_compra', a.poder_compra) order by a.poder_compra desc), '[]')
    into lista from public.aprovados a
   where a.status in ('ativo','negociando') and (a.vencimento is null or a.vencimento >= current_date)
     and public.aprovado_limite(a.financiamento, a.subsidio + a.fgts + a.entrada, a.renda_familiar, new.preco_min, new.avaliacao_min, new.status_obra, new.meses_pos_chaves) >= new.preco_min;
  if jsonb_array_length(lista) > 0 then
    insert into public.oportunidades (development_id, tipo, preco_antes, preco_depois, aprovados)
    values (new.id, 'promocao', old.preco_min, new.preco_min, lista);
  end if;
  return new;
end $$;

select 'ok' as resultado;
