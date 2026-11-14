-- Avaliação da unidade por enquadramento (tabelas Cury): MCMV = faixa 1, MCMV3 = faixa 2,
-- MCMV4 = faixas 3 e 4, SBPE = renda acima do programa. Ex.: {"mcmv":275000,"mcmv3":309000,"mcmv4":309000,"sbpe":309000}
alter table public.developments add column if not exists avaliacoes jsonb not null default '{}'::jsonb;
select 'ok' as resultado;
