-- Perfis da corretora nas redes sociais (aparecem no rodapé do site).
alter table public.site_settings add column if not exists redes_sociais jsonb not null default '{}'::jsonb;
