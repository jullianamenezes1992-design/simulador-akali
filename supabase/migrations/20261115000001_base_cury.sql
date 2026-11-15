-- Base Cury: clientes com pasta na Cury (propostas do Salesforce da Cury redistribuídas
-- para a corretora). Fica separada dos leads/aprovados até ela decidir trabalhar o cliente.
create table if not exists public.base_cury (
  id               uuid primary key default gen_random_uuid(),
  chave            text not null unique,          -- telefone (só dígitos) ou nome, para juntar propostas do mesmo cliente
  nome             text not null,
  telefone         text,                          -- só dígitos, DDD + número
  email            text,
  participantes    jsonb not null default '[]',   -- [{nome, tipo}] (comprador, procurador...)
  propostas        jsonb not null default '[]',   -- [{pv, sf_id, empreendimento, etapa}]
  empreendimento   text,                          -- da proposta mais recente
  etapa            text,
  ab_numero        text,
  ab_status        text,
  ab_substatus     text,
  valor_aprovado   numeric,
  banco            text,
  validade         date,
  renda_total      numeric,
  rendas           jsonb not null default '[]',   -- renda de cada proponente
  parcela_max      numeric,
  fgts             numeric,
  primeiro_imovel  boolean,
  observacoes_sf   text,
  -- nova | chamado | aprovado (virou aprovado no CRM) | descartado
  situacao         text not null default 'nova'
                   check (situacao in ('nova','chamado','aprovado','descartado')),
  chamado_em       timestamptz,
  aprovado_id      uuid references public.aprovados(id) on delete set null,
  notas            text,
  importado_em     timestamptz not null default now(),
  atualizado_em    timestamptz not null default now()
);

create index if not exists base_cury_situacao_idx on public.base_cury (situacao, validade);
create index if not exists base_cury_nome_idx on public.base_cury (lower(nome));

alter table public.base_cury enable row level security;
drop policy if exists base_cury_admin on public.base_cury;
create policy base_cury_admin on public.base_cury for all using (public.is_admin()) with check (public.is_admin());

select 'ok' as resultado;
