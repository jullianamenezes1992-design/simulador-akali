-- Base fria: carteira antiga de contatos (planilha), separada dos leads.
-- Só vira lead quem responder. Chamada pelo número de WhatsApp da carteira.

create table if not exists public.base_fria (
  id               uuid primary key default gen_random_uuid(),
  telefone         text not null unique,          -- só dígitos, DDD + número (sem 55)
  nome             text not null,
  email            text,
  bairro           text,
  zona             text,
  renda_texto      text,
  prazo_compra     text,
  origem           text,
  campanhas        text,
  status_original  text,
  observacoes      text,
  ultima_entrada   timestamptz,
  primeira_entrada timestamptz,
  qtd_cadastros    int not null default 1,
  prioridade       int not null default 0,
  -- fila | chamado | numero_errado | nao_quer | virou_lead | comprou | no_crm
  situacao         text not null default 'fila'
                   check (situacao in ('fila','chamado','numero_errado','nao_quer','virou_lead','comprou','no_crm')),
  chamado_em       timestamptz,
  proxima_em       timestamptz,                    -- quando pode ser chamado de novo (sem resposta)
  tentativas       int not null default 0,
  resolvido_em     timestamptz,
  lead_id          uuid references public.leads(id) on delete set null,
  lote             text,                           -- nome do arquivo importado
  created_at       timestamptz not null default now()
);

create index if not exists base_fria_fila_idx on public.base_fria (situacao, prioridade desc, ultima_entrada desc nulls last);
create index if not exists base_fria_chamado_idx on public.base_fria (chamado_em desc) where chamado_em is not null;
create index if not exists base_fria_nome_idx on public.base_fria (lower(nome));

alter table public.base_fria enable row level security;
drop policy if exists base_fria_admin on public.base_fria;
create policy base_fria_admin on public.base_fria for all using (public.is_admin()) with check (public.is_admin());

-- Quantos contatos da base fria chamar por dia
alter table public.site_settings add column if not exists base_fria_dia int not null default 30
  check (base_fria_dia between 0 and 300);

-- Marca como "no_crm" quem já está nos leads (mesmo telefone), para não chamar duas vezes
create or replace function public.base_fria_marcar_no_crm()
returns int
language sql
security definer
set search_path = public
as $$
  with m as (
    update public.base_fria b
       set situacao = 'no_crm', lead_id = l.id
      from public.leads l
     where b.situacao = 'fila'
       and l.excluido_em is null
       and regexp_replace(l.telefone, '\D', '', 'g') = b.telefone
    returning 1
  )
  select count(*)::int from m;
$$;
revoke all on function public.base_fria_marcar_no_crm() from public, anon;
grant execute on function public.base_fria_marcar_no_crm() to authenticated;

-- Resumo para a tela (contagens por situação)
create or replace function public.base_fria_resumo()
returns table (situacao text, total bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select situacao, count(*) from public.base_fria group by situacao;
$$;

-- novos tipos de evento no histórico do lead
alter table public.lead_events drop constraint if exists lead_events_tipo_check;
alter table public.lead_events add constraint lead_events_tipo_check check (tipo in
  ('simulacao_iniciada','simulacao_concluida','visualizou_empreendimento','escolheu_empreendimento',
   'clique_whatsapp','status_alterado','nota','mensagem_enviada','origem_alterada',
   'compromisso_agendado','compromisso_concluido','cadastro_manual','aprovado_registrado','oferta_enviada','carteira_rebatida',
   'base_fria_reativado'));

select 'ok' as resultado;
