-- Histórico: registra qual projeto foi simulado e enviado ao cliente
alter table public.lead_events drop constraint if exists lead_events_tipo_check;
alter table public.lead_events add constraint lead_events_tipo_check check (tipo in
  ('simulacao_iniciada','simulacao_concluida','visualizou_empreendimento','escolheu_empreendimento',
   'clique_whatsapp','status_alterado','nota','mensagem_enviada','origem_alterada',
   'compromisso_agendado','compromisso_concluido','cadastro_manual','aprovado_registrado','oferta_enviada','carteira_rebatida',
   'base_fria_reativado','simulacao_enviada'));

-- quem já recebeu a simulação hoje (antes deste registro): usa o projeto escolhido no cadastro
insert into public.lead_events (lead_id, tipo, development_id, dados, created_at)
select e.lead_id, 'simulacao_enviada', l.escolhido_id, jsonb_build_object('empreendimento', d.nome, 'como', 'whatsapp'), e.created_at
  from public.lead_events e
  join public.leads l on l.id = e.lead_id
  join public.developments d on d.id = l.escolhido_id
 where e.tipo = 'mensagem_enviada' and e.dados->>'status' = 'simulacao'
   and not exists (select 1 from public.lead_events x where x.lead_id = e.lead_id and x.tipo = 'simulacao_enviada');

select 'ok ' || count(*) as resultado from public.lead_events where tipo = 'simulacao_enviada';
