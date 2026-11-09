-- Clientes aprovados (crédito aprovado na Caixa) + oportunidades quando um imóvel passa a caber no bolso deles.

create table if not exists public.aprovados (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid references public.leads(id) on delete set null,
  nome            text not null check (char_length(nome) between 2 and 120),
  telefone        text not null check (telefone ~ '^\d{10,11}$'),
  data_analise    date,
  vencimento      date,
  tipo_renda      text,
  renda_familiar  numeric(12,2) not null default 0 check (renda_familiar >= 0),
  faixa           smallint,
  financiamento   numeric(12,2) not null default 0 check (financiamento >= 0),
  subsidio        numeric(12,2) not null default 0 check (subsidio >= 0),
  fgts            numeric(12,2) not null default 0 check (fgts >= 0),
  entrada         numeric(12,2) not null default 0 check (entrada >= 0),
  poder_compra    numeric(12,2) generated always as (financiamento + subsidio + fgts + entrada) stored,
  prazo_meses     int check (prazo_meses is null or prazo_meses between 12 and 480),
  parcela_max     numeric(12,2),
  classificacao   text not null default 'morno' check (classificacao in ('quente','morno','frio')),
  regioes         text[] not null default '{}',
  dormitorios_min smallint check (dormitorios_min is null or dormitorios_min between 1 and 4),
  status          text not null default 'ativo' check (status in ('ativo','negociando','vendido','vencido','desistiu')),
  observacoes     text,
  aviso_vencimento_em date,          -- último aviso de vencimento enviado (para não repetir)
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists aprovados_poder_idx on public.aprovados (status, poder_compra);
create index if not exists aprovados_venc_idx on public.aprovados (vencimento) where status in ('ativo','negociando');
create index if not exists aprovados_lead_idx on public.aprovados (lead_id);

alter table public.aprovados enable row level security;
drop policy if exists aprovados_admin on public.aprovados;
create policy aprovados_admin on public.aprovados for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.aprovados_touch() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists aprovados_touch on public.aprovados;
create trigger aprovados_touch before update on public.aprovados for each row execute function public.aprovados_touch();

-- Oportunidades: preço baixou ou entrou em promoção, e há aprovados que passaram a caber
create table if not exists public.oportunidades (
  id             bigint generated always as identity primary key,
  development_id uuid not null references public.developments(id) on delete cascade,
  tipo           text not null check (tipo in ('preco_baixou','promocao')),
  preco_antes    numeric(12,2),
  preco_depois   numeric(12,2),
  aprovados      jsonb not null default '[]',   -- [{id, nome, poder_compra}]
  notificado_em  timestamptz,
  visto_em       timestamptz,
  created_at     timestamptz not null default now()
);
create index if not exists oportunidades_recentes_idx on public.oportunidades (created_at desc);
alter table public.oportunidades enable row level security;
drop policy if exists oportunidades_admin on public.oportunidades;
create policy oportunidades_admin on public.oportunidades for all using (public.is_admin()) with check (public.is_admin());

-- Dispara em QUALQUER mudança de preço/promoção (tabelão automático ou edição no painel)
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
       and a.poder_compra >= new.preco_min and a.poder_compra < old.preco_min;
  elsif new.oferta_destaque and not old.oferta_destaque then
    tipo_op := 'promocao';
    select coalesce(jsonb_agg(jsonb_build_object('id', a.id, 'nome', a.nome, 'poder_compra', a.poder_compra) order by a.poder_compra desc), '[]')
      into lista
      from public.aprovados a
     where a.status in ('ativo','negociando')
       and (a.vencimento is null or a.vencimento >= current_date)
       and a.poder_compra >= new.preco_min;
  else
    return new;
  end if;

  if jsonb_array_length(lista) > 0 then
    insert into public.oportunidades (development_id, tipo, preco_antes, preco_depois, aprovados)
    values (new.id, tipo_op, old.preco_min, new.preco_min, lista);
  end if;
  return new;
end $$;

drop trigger if exists detectar_oportunidade on public.developments;
create trigger detectar_oportunidade after update of preco_min, oferta_destaque on public.developments
  for each row execute function public.detectar_oportunidade();

-- Eventos do lead: registrar quando vira aprovado
alter table public.lead_events drop constraint if exists lead_events_tipo_check;
alter table public.lead_events add constraint lead_events_tipo_check check (tipo in
  ('simulacao_iniciada','simulacao_concluida','visualizou_empreendimento','escolheu_empreendimento',
   'clique_whatsapp','status_alterado','nota','mensagem_enviada','origem_alterada',
   'compromisso_agendado','compromisso_concluido','cadastro_manual','aprovado_registrado','oferta_enviada'));
