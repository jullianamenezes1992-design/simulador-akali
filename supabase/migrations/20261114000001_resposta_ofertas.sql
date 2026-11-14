-- Aprovados: quando o cliente respondeu às ofertas pela última vez.
-- 3 ofertas seguidas sem resposta => próxima oferta em 15 dias (senão, 7).
alter table public.aprovados add column if not exists ultima_resposta_em timestamptz;

create or replace function public.aprovados_touch() returns trigger language plpgsql as $$
begin
  if (to_jsonb(new) - array['updated_at','ultima_oferta_em','aviso_vencimento_em','ultima_resposta_em'])
     is distinct from (to_jsonb(old) - array['updated_at','ultima_oferta_em','aviso_vencimento_em','ultima_resposta_em']) then
    new.updated_at = now();
  end if;
  return new;
end $$;

-- não sabemos quem respondeu antes: começa todo mundo do zero (7 dias)
update public.aprovados set ultima_resposta_em = now() where ultima_resposta_em is null;

select 'ok' as resultado;
