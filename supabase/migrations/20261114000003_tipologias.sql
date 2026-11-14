-- Tipos de unidade de cada empreendimento (a mais barata de cada tipo), para simular outra opção
-- além da unidade mais barata: [{"rotulo":"2 dorm. · 41 m² · com vaga","dorms":2,"area":41,"vaga":true,"preco":289000,"qtd":3}]
alter table public.developments add column if not exists tipologias jsonb not null default '[]'::jsonb;
select 'ok' as resultado;
