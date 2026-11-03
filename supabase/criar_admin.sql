-- Libera um usuário do Supabase Auth para acessar o painel.
-- 1) Crie o usuário em Authentication → Users → "Add user" (e-mail + senha, marque "Auto Confirm").
-- 2) Troque o e-mail abaixo e execute no SQL Editor.
--    papel 'admin'    = acesso total (parâmetros, configurações, exclusões, anonimização)
--    papel 'corretor' = leads e empreendimentos

insert into public.admin_users (user_id, nome, papel)
select id, 'Nome do Administrador', 'admin'
  from auth.users
 where email = 'seu-email@exemplo.com.br'
on conflict (user_id) do update set papel = excluded.papel, nome = excluded.nome;
