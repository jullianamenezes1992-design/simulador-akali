-- Mensagens prontas por etapa do atendimento (3 por etapa), com a etapa nova "Não respondeu".

alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check check (status in
  ('novo','em_atendimento','sem_resposta','documentacao','analise_credito','serasa_bacen','aprovado','reprovado','visita','proposta','vendido','perdido'));

alter table public.lead_events drop constraint if exists lead_events_tipo_check;
alter table public.lead_events add constraint lead_events_tipo_check check (tipo in
  ('simulacao_concluida','visualizou_empreendimento','escolheu_empreendimento',
   'clique_whatsapp','status_alterado','nota','mensagem_enviada'));

-- Textos editados pela corretora. Sem linha aqui = usa o texto padrão do sistema.
create table if not exists public.mensagens_prontas (
  status      text not null,
  ordem       smallint not null check (ordem between 1 and 3),
  titulo      text not null check (char_length(titulo) <= 80),
  texto       text not null check (char_length(texto) <= 2000),
  updated_at  timestamptz not null default now(),
  primary key (status, ordem)
);
alter table public.mensagens_prontas enable row level security;
drop policy if exists mensagens_prontas_ler on public.mensagens_prontas;
create policy mensagens_prontas_ler on public.mensagens_prontas for select using (public.is_admin());
drop policy if exists mensagens_prontas_editar on public.mensagens_prontas;
create policy mensagens_prontas_editar on public.mensagens_prontas for all using (public.is_superadmin()) with check (public.is_superadmin());
