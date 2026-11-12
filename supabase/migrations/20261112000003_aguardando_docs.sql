-- Etiqueta "Aguardando documentos": o cliente prometeu enviar os documentos e ainda não enviou (null = não está aguardando).
alter table public.leads add column if not exists aguardando_docs_em timestamptz;
select 'ok' as resultado;
