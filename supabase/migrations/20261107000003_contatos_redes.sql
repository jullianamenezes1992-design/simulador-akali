-- Aba "Redes sociais": contatos que chegam pelo Instagram/TikTok etc. cadastrados à mão pela corretora,
-- no mesmo cadastro de clientes do CRM (assim têm agenda, mensagens prontas, etapas e histórico).
alter table public.leads add column if not exists cadastro_manual boolean not null default false;
alter table public.leads add column if not exists idade_informada int check (idade_informada is null or idade_informada between 16 and 100);
alter table public.leads add column if not exists regiao_detalhe text;
alter table public.leads add column if not exists conteudo_rede text;
alter table public.leads add column if not exists proximo_passo text;
alter table public.leads add column if not exists data_contato date;
create index if not exists leads_manual_idx on public.leads (cadastro_manual, created_at desc) where cadastro_manual;
