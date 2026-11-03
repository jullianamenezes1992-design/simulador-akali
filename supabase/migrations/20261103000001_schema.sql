-- =====================================================================
-- SIMULADOR HABITACIONAL AKALI — Esquema principal
-- Banco: Supabase (PostgreSQL 15+)
-- Execute este arquivo no SQL Editor do Supabase (ou via `supabase db push`).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Funções utilitárias
-- ---------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Código curto e legível da simulação (ex.: AKL-7K3QXM), sem caracteres ambíguos.
create or replace function public.gerar_codigo_simulacao()
returns text language plpgsql volatile as $$
declare
  alfabeto constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  v_codigo text;
  i int;
begin
  loop
    v_codigo := 'AKL-';
    for i in 1..6 loop
      v_codigo := v_codigo || substr(alfabeto, 1 + floor(random() * length(alfabeto))::int, 1);
    end loop;
    exit when not exists (select 1 from public.leads l where l.codigo = v_codigo);
  end loop;
  return v_codigo;
end $$;

-- ---------------------------------------------------------------------
-- Usuários administrativos (vinculados ao Supabase Auth)
-- ---------------------------------------------------------------------

create table public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  nome       text not null,
  papel      text not null default 'admin' check (papel in ('admin', 'corretor')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create or replace function public.is_superadmin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid() and papel = 'admin');
$$;

-- ---------------------------------------------------------------------
-- Configurações do site (linha única)
-- ---------------------------------------------------------------------

create table public.site_settings (
  id                              smallint primary key default 1 check (id = 1),
  empresa_nome                    text not null default 'Akali Imóveis',
  creci                           text,
  whatsapp_numero                 text,           -- somente dígitos, com DDI: 5511999999999
  email_contato                   text,
  encarregado_dados               text,           -- encarregado (DPO) — LGPD
  ga4_id                          text,           -- G-XXXXXXX
  google_ads_id                   text,           -- AW-XXXXXXX
  google_ads_label_simulacao      text,           -- rótulo da conversão "simulação concluída"
  google_ads_label_whatsapp       text,           -- rótulo da conversão "clique no WhatsApp"
  meta_pixel_id                   text,
  landing_conteudo                jsonb not null default '{}'::jsonb,
  politica_versao                 text not null default '2026-11',
  updated_at                      timestamptz not null default now(),
  updated_by                      uuid
);

-- ---------------------------------------------------------------------
-- Parâmetros de simulação (versionados; apenas uma versão ativa)
-- ---------------------------------------------------------------------

create table public.simulation_params (
  id          uuid primary key default gen_random_uuid(),
  versao      int not null,
  ativo       boolean not null default false,
  descricao   text,
  params      jsonb not null,
  created_at  timestamptz not null default now(),
  created_by  uuid,
  unique (versao)
);

create unique index simulation_params_um_ativo on public.simulation_params (ativo) where ativo;

-- ---------------------------------------------------------------------
-- Empreendimentos
-- ---------------------------------------------------------------------

create table public.developments (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique,
  nome                  text not null,
  construtora           text,
  descricao             text,
  endereco              text,
  bairro                text,
  cidade                text not null default 'São Paulo',
  uf                    text not null default 'SP',
  regiao                text not null check (regiao in ('zona_norte','zona_sul','zona_leste','zona_oeste','centro','grande_sp')),
  latitude              numeric(9,6),
  longitude             numeric(9,6),
  preco_min             numeric(12,2) not null check (preco_min > 0),
  preco_max             numeric(12,2),
  faixas                int[] not null default '{}',     -- faixas do programa atendidas (1..4)
  renda_minima          numeric(12,2),                     -- renda mínima sugerida pela construtora (opcional)
  dormitorios           int[] not null default '{2}',
  area_min              numeric(7,2),
  area_max              numeric(7,2),
  vagas                 boolean not null default false,
  status_obra           text not null default 'lancamento' check (status_obra in ('lancamento','em_obras','pronto')),
  previsao_entrega      text,
  unidades_disponiveis  int,
  disponivel            boolean not null default true,
  condicoes_comerciais  text,
  diferenciais          text[] not null default '{}',
  oferta_destaque       boolean not null default false,
  oferta_texto          text,
  video_url             text,
  capa_url              text,
  ativo                 boolean not null default true,
  is_demo               boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint preco_max_valido check (preco_max is null or preco_max >= preco_min),
  constraint faixas_validas check (faixas <@ array[1,2,3,4])
);

create index developments_ativo_idx on public.developments (ativo, regiao, preco_min);

create trigger developments_updated_at before update on public.developments
  for each row execute function public.set_updated_at();

create table public.development_media (
  id              uuid primary key default gen_random_uuid(),
  development_id  uuid not null references public.developments(id) on delete cascade,
  tipo            text not null check (tipo in ('foto','planta','video')),
  url             text not null,
  storage_path    text,
  legenda         text,
  ordem           int not null default 0,
  created_at      timestamptz not null default now()
);

create index development_media_dev_idx on public.development_media (development_id, tipo, ordem);

-- ---------------------------------------------------------------------
-- Leads / simulações
-- ---------------------------------------------------------------------

create table public.leads (
  id                    uuid primary key default gen_random_uuid(),
  codigo                text not null unique default public.gerar_codigo_simulacao(),
  access_token          uuid not null unique default gen_random_uuid(),  -- acesso do cliente ao próprio resultado

  -- Dados pessoais
  nome                  text not null,
  email                 text,
  telefone              text not null,
  data_nascimento       date,
  estado_civil          text,
  cpf_final             text,          -- últimos 2 dígitos, para conferência (CPF completo fica em lead_sensitive)

  -- Renda e profissão
  profissao             text,
  tipo_renda            text,
  renda_principal       numeric(12,2) not null default 0,

  -- Composição familiar
  dependentes           int not null default 0,
  compor_renda          boolean not null default false,
  relacao_composicao    text,
  renda_composicao      numeric(12,2) not null default 0,
  idade_composicao      int,
  renda_total           numeric(12,2) not null default 0,

  -- FGTS e histórico
  fgts_saldo            numeric(12,2) not null default 0,
  fgts_tres_anos        boolean not null default false,
  possui_imovel         boolean not null default false,
  financiamento_ativo   boolean not null default false,
  ja_beneficiado        boolean not null default false,
  restricao_credito     text not null default 'nao_sei' check (restricao_credito in ('nao','sim','nao_sei')),

  -- Preferências
  regioes               text[] not null default '{}',
  dormitorios_min       int,
  precisa_vaga          boolean not null default false,
  preferencia_obra      text not null default 'indiferente',

  -- Entrada e prazo
  entrada_disponivel    numeric(12,2) not null default 0,
  prazo_compra          text,

  -- Resultado
  simulacao             jsonb,
  params_versao         int,
  recomendados          uuid[] not null default '{}',
  escolhido_id          uuid references public.developments(id) on delete set null,
  escolhido_em          timestamptz,

  -- Comercial
  status                text not null default 'novo' check (status in
                          ('novo','em_atendimento','documentacao','analise_credito','aprovado','visita','proposta','vendido','perdido')),
  responsavel_id        uuid references public.admin_users(user_id) on delete set null,

  -- Origem / campanha
  origem                text,
  utm_source            text,
  utm_medium            text,
  utm_campaign          text,
  utm_term              text,
  utm_content           text,
  gclid                 text,
  fbclid                text,
  landing_page          text,
  referrer              text,

  -- LGPD
  consentimento_em      timestamptz not null,
  consentimento_versao  text not null,
  aceita_marketing      boolean not null default false,
  anonimizado_em        timestamptz,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index leads_status_idx on public.leads (status, created_at desc);
create index leads_created_idx on public.leads (created_at desc);

create trigger leads_updated_at before update on public.leads
  for each row execute function public.set_updated_at();

-- Dados sensíveis separados: RLS ativo e NENHUMA política => inacessível via API
-- para anon/authenticated. Somente o servidor da aplicação (service role) lê/escreve,
-- e o CPF fica cifrado com AES-256-GCM usando CPF_ENCRYPTION_KEY (fora do banco).
create table public.lead_sensitive (
  lead_id     uuid primary key references public.leads(id) on delete cascade,
  cpf_enc     text not null,
  cpf_hash    text not null,
  created_at  timestamptz not null default now()
);

create index lead_sensitive_hash_idx on public.lead_sensitive (cpf_hash);

create table public.lead_events (
  id              bigint generated always as identity primary key,
  lead_id         uuid references public.leads(id) on delete cascade,
  development_id  uuid references public.developments(id) on delete set null,
  tipo            text not null check (tipo in
                    ('simulacao_concluida','visualizou_empreendimento','escolheu_empreendimento',
                     'clique_whatsapp','status_alterado','nota')),
  dados           jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index lead_events_lead_idx on public.lead_events (lead_id, created_at desc);
create index lead_events_tipo_idx on public.lead_events (tipo, created_at desc);

create table public.lead_notes (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads(id) on delete cascade,
  autor_id    uuid references public.admin_users(user_id) on delete set null,
  texto       text not null check (length(texto) between 1 and 4000),
  created_at  timestamptz not null default now()
);

create index lead_notes_lead_idx on public.lead_notes (lead_id, created_at desc);

-- ---------------------------------------------------------------------
-- Histórico de alterações (auditoria)
-- ---------------------------------------------------------------------

create table public.audit_log (
  id              bigint generated always as identity primary key,
  tabela          text not null,
  registro_id     text,
  acao            text not null,
  ator_id         uuid,
  dados_antigos   jsonb,
  dados_novos     jsonb,
  created_at      timestamptz not null default now()
);

create index audit_log_registro_idx on public.audit_log (tabela, registro_id, created_at desc);
create index audit_log_created_idx on public.audit_log (created_at desc);

create or replace function public.audit_trigger()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  antigos jsonb;
  novos   jsonb;
  -- campos que nunca devem ir para o log (dados sensíveis ou ruído)
  ocultos constant text[] := array['access_token','updated_at'];
  k text;
begin
  if tg_op in ('UPDATE','DELETE') then antigos := to_jsonb(old); end if;
  if tg_op in ('UPDATE','INSERT') then novos := to_jsonb(new); end if;

  foreach k in array ocultos loop
    antigos := antigos - k;
    novos := novos - k;
  end loop;

  -- Em UPDATE, guarda apenas os campos que mudaram
  if tg_op = 'UPDATE' then
    select coalesce(jsonb_object_agg(a.key, a.value), '{}'::jsonb)
      into antigos
      from jsonb_each(antigos) a
     where not (novos ? a.key and novos -> a.key = a.value);
    select coalesce(jsonb_object_agg(n.key, n.value), '{}'::jsonb)
      into novos
      from jsonb_each(novos) n
     where antigos ? n.key;
    if novos = '{}'::jsonb then
      return new;
    end if;
  end if;

  insert into public.audit_log (tabela, registro_id, acao, ator_id, dados_antigos, dados_novos)
  values (
    tg_table_name,
    coalesce((case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end) ->> 'id', null),
    lower(tg_op),
    auth.uid(),
    antigos,
    novos
  );

  return coalesce(new, old);
end $$;

create trigger audit_developments after insert or update or delete on public.developments
  for each row execute function public.audit_trigger();
create trigger audit_development_media after insert or delete on public.development_media
  for each row execute function public.audit_trigger();
create trigger audit_leads after update or delete on public.leads
  for each row execute function public.audit_trigger();
create trigger audit_simulation_params after insert or update or delete on public.simulation_params
  for each row execute function public.audit_trigger();
create trigger audit_site_settings after update on public.site_settings
  for each row execute function public.audit_trigger();
create trigger audit_admin_users after insert or update or delete on public.admin_users
  for each row execute function public.audit_trigger();

-- Registro manual de ações sensíveis (ex.: visualização de CPF, exportação)
create or replace function public.registrar_auditoria(p_tabela text, p_registro text, p_acao text, p_dados jsonb default null)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'acesso negado';
  end if;
  insert into public.audit_log (tabela, registro_id, acao, ator_id, dados_novos)
  values (p_tabela, p_registro, p_acao, auth.uid(), p_dados);
end $$;

-- Ativa uma versão de parâmetros (desativa as demais de forma atômica)
create or replace function public.ativar_parametros(p_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_superadmin() then
    raise exception 'acesso negado';
  end if;
  update public.simulation_params set ativo = false where ativo and id <> p_id;
  update public.simulation_params set ativo = true where id = p_id;
end $$;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table public.admin_users        enable row level security;
alter table public.site_settings      enable row level security;
alter table public.simulation_params  enable row level security;
alter table public.developments       enable row level security;
alter table public.development_media  enable row level security;
alter table public.leads              enable row level security;
alter table public.lead_sensitive     enable row level security;
alter table public.lead_events        enable row level security;
alter table public.lead_notes         enable row level security;
alter table public.audit_log          enable row level security;

-- admin_users: cada usuário vê o próprio registro; admins veem todos; só superadmin altera
create policy admin_users_select on public.admin_users for select
  using (user_id = auth.uid() or public.is_admin());
create policy admin_users_write on public.admin_users for all
  using (public.is_superadmin()) with check (public.is_superadmin());

-- site_settings: leitura pública (número do WhatsApp e IDs de rastreamento são públicos por natureza)
create policy site_settings_select on public.site_settings for select using (true);
create policy site_settings_update on public.site_settings for update
  using (public.is_superadmin()) with check (public.is_superadmin());

-- simulation_params: público lê apenas a versão ativa; admin lê tudo; superadmin altera
create policy params_select_publico on public.simulation_params for select
  using (ativo or public.is_admin());
create policy params_insert on public.simulation_params for insert
  with check (public.is_superadmin());
create policy params_update on public.simulation_params for update
  using (public.is_superadmin()) with check (public.is_superadmin());
create policy params_delete on public.simulation_params for delete
  using (public.is_superadmin() and not ativo);

-- developments: público vê ativos; equipe gerencia
create policy dev_select on public.developments for select
  using (ativo or public.is_admin());
create policy dev_insert on public.developments for insert with check (public.is_admin());
create policy dev_update on public.developments for update using (public.is_admin()) with check (public.is_admin());
create policy dev_delete on public.developments for delete using (public.is_superadmin());

create policy media_select on public.development_media for select
  using (public.is_admin() or exists (
    select 1 from public.developments d where d.id = development_id and d.ativo));
create policy media_insert on public.development_media for insert with check (public.is_admin());
create policy media_update on public.development_media for update using (public.is_admin()) with check (public.is_admin());
create policy media_delete on public.development_media for delete using (public.is_admin());

-- leads, eventos e notas: SOMENTE equipe autenticada.
-- O público nunca acessa essas tabelas diretamente: o cadastro é feito pelo servidor
-- (rota /api/simulacao) com validação e a chave de serviço.
create policy leads_select on public.leads for select using (public.is_admin());
create policy leads_update on public.leads for update using (public.is_admin()) with check (public.is_admin());
create policy leads_delete on public.leads for delete using (public.is_superadmin());

create policy events_select on public.lead_events for select using (public.is_admin());
create policy events_insert on public.lead_events for insert with check (public.is_admin());

create policy notes_select on public.lead_notes for select using (public.is_admin());
create policy notes_insert on public.lead_notes for insert
  with check (public.is_admin() and autor_id = auth.uid());
create policy notes_delete on public.lead_notes for delete
  using (autor_id = auth.uid() or public.is_superadmin());

-- audit_log: somente leitura para a equipe (inserção apenas via triggers/funções)
create policy audit_select on public.audit_log for select using (public.is_admin());

-- lead_sensitive: sem políticas de propósito (acesso negado a anon e authenticated).
revoke all on public.lead_sensitive from anon, authenticated;

-- ---------------------------------------------------------------------
-- Storage: bucket de mídias dos empreendimentos
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('empreendimentos', 'empreendimentos', true)
on conflict (id) do nothing;

create policy "midias leitura publica" on storage.objects for select
  using (bucket_id = 'empreendimentos');
create policy "midias upload equipe" on storage.objects for insert
  with check (bucket_id = 'empreendimentos' and public.is_admin());
create policy "midias update equipe" on storage.objects for update
  using (bucket_id = 'empreendimentos' and public.is_admin());
create policy "midias delete equipe" on storage.objects for delete
  using (bucket_id = 'empreendimentos' and public.is_admin());
