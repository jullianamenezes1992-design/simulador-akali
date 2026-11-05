-- Foto e nome da corretora exibidos no resultado da simulação
alter table public.site_settings add column if not exists corretora_nome text;
alter table public.site_settings add column if not exists corretora_foto_url text;
