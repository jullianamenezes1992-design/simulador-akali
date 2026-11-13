-- "Meu dia": rotina diária da corretora (o que já foi feito em cada bloco) e o "rebater carteira".
create table if not exists public.rotina_dia (
  dia      date not null,
  item     text not null check (char_length(item) <= 40),
  feito_em timestamptz not null default now(),
  nota     text check (nota is null or char_length(nota) <= 500),
  primary key (dia, item)
);
alter table public.rotina_dia enable row level security;
drop policy if exists rotina_dia_admin on public.rotina_dia;
create policy rotina_dia_admin on public.rotina_dia for all using (public.is_admin()) with check (public.is_admin());

-- última vez que a corretora chamou o cliente antigo para reativar (rebater carteira)
alter table public.leads add column if not exists rebatido_em timestamptz;

alter table public.lead_events drop constraint if exists lead_events_tipo_check;
alter table public.lead_events add constraint lead_events_tipo_check check (tipo in
  ('simulacao_iniciada','simulacao_concluida','visualizou_empreendimento','escolheu_empreendimento',
   'clique_whatsapp','status_alterado','nota','mensagem_enviada','origem_alterada',
   'compromisso_agendado','compromisso_concluido','cadastro_manual','aprovado_registrado','oferta_enviada','carteira_rebatida'));

select 'ok' as resultado;
