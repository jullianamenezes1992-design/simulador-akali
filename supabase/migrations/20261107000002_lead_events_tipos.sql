-- Lista completa dos tipos de evento usados pelo sistema (alguns eram gravados sem estar na regra e eram recusados).
alter table public.lead_events drop constraint if exists lead_events_tipo_check;
alter table public.lead_events add constraint lead_events_tipo_check check (tipo in
  ('simulacao_iniciada','simulacao_concluida','visualizou_empreendimento','escolheu_empreendimento',
   'clique_whatsapp','status_alterado','nota','mensagem_enviada','origem_alterada',
   'compromisso_agendado','compromisso_concluido','cadastro_manual'));
