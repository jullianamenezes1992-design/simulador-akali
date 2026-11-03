-- Testes de RLS e auditoria (executados com psql -v ON_ERROR_STOP=1)
\set QUIET on

-- Usuário administrador de teste
insert into auth.users values ('00000000-0000-0000-0000-00000000000a', 'admin@teste');
insert into auth.users values ('00000000-0000-0000-0000-00000000000b', 'intruso@teste');
insert into public.admin_users (user_id, nome, papel) values ('00000000-0000-0000-0000-00000000000a', 'Admin Teste', 'admin');

-- Lead criado pelo "servidor" (dono da tabela, como a service role)
insert into public.leads (nome, telefone, renda_principal, renda_total, consentimento_em, consentimento_versao)
values ('Cliente Teste', '11999999999', 3000, 3000, now(), '2026-11');
insert into public.lead_sensitive (lead_id, cpf_enc, cpf_hash)
select id, 'cifrado', 'hash' from public.leads limit 1;

do $$ begin
  assert (select codigo from public.leads limit 1) ~ '^AKL-[2-9A-HJ-NP-Z]{6}$', 'código da simulação fora do padrão';
end $$;

-- ===== Anônimo =====
set role anon;
do $$ begin
  assert (select count(*) from public.developments) = 7, 'anon deveria ver 7 empreendimentos ativos';
  assert (select count(*) from public.leads) = 0, 'anon NÃO pode ver leads';
  assert (select count(*) from public.simulation_params) = 1, 'anon vê apenas parâmetros ativos';
  assert (select count(*) from public.audit_log) = 0, 'anon não vê auditoria';
end $$;
do $$ begin
  begin
    perform * from public.lead_sensitive;
    raise exception 'anon conseguiu ler lead_sensitive';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.leads (nome, telefone, consentimento_em, consentimento_versao) values ('x','1',now(),'v');
    raise exception 'anon conseguiu inserir lead';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- Desativa um empreendimento: anon deixa de ver
update public.developments set ativo = false where slug = 'exemplo-residencial-sem-estoque';
set role anon;
do $$ begin
  assert (select count(*) from public.developments) = 6, 'inativo não deve aparecer ao público';
end $$;
reset role;

-- ===== Usuário autenticado que NÃO é admin =====
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
do $$ begin
  assert (select count(*) from public.leads) = 0, 'não-admin não pode ver leads';
  assert (select count(*) from public.developments) = 6, 'não-admin vê só ativos';
end $$;
do $$ begin
  update public.developments set nome = 'hack';
  assert not exists (select 1 from public.developments where nome = 'hack'), 'não-admin alterou empreendimento';
end $$;
reset role;

-- ===== Admin =====
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
do $$ begin
  assert (select count(*) from public.leads) = 1, 'admin deve ver leads';
  assert (select count(*) from public.developments) = 7, 'admin vê inclusive inativos';
end $$;
update public.leads set status = 'em_atendimento';
update public.developments set preco_min = 220000 where slug = 'exemplo-residencial-jardim-aurora';
insert into public.lead_notes (lead_id, autor_id, texto) select id, auth.uid(), 'Primeiro contato' from public.leads;
select public.registrar_auditoria('leads', (select id::text from public.leads limit 1), 'visualizou_cpf');
do $$ begin
  begin
    perform * from public.lead_sensitive;
    raise exception 'admin via API não deve ler lead_sensitive diretamente';
  exception when insufficient_privilege then null;
  end;
end $$;
do $$
declare r record;
begin
  select * into r from public.audit_log where tabela = 'leads' and acao = 'update' order by id desc limit 1;
  assert r.ator_id = '00000000-0000-0000-0000-00000000000a', 'auditoria deve registrar o ator';
  assert r.dados_novos = '{"status": "em_atendimento"}'::jsonb, 'auditoria deve guardar só o diff: ' || r.dados_novos::text;
  assert exists (select 1 from public.audit_log where acao = 'visualizou_cpf'), 'registro manual de auditoria';
  assert exists (select 1 from public.audit_log where tabela = 'developments' and acao = 'update'
                 and dados_antigos ->> 'preco_min' = '219000.00'), 'auditoria de empreendimento';
end $$;

-- Nova versão de parâmetros e ativação atômica
insert into public.simulation_params (versao, ativo, params) select 2, false, params from public.simulation_params where versao = 1;
select public.ativar_parametros((select id from public.simulation_params where versao = 2));
do $$ begin
  assert (select versao from public.simulation_params where ativo) = 2, 'versão 2 deveria estar ativa';
  assert (select count(*) from public.simulation_params where ativo) = 1, 'apenas uma versão ativa';
end $$;
reset role;

\echo 'OK: todos os testes de RLS/auditoria passaram'
