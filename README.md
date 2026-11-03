# Simulador Habitacional Akali

Plataforma de captação de clientes, pré-simulação do **Minha Casa, Minha Vida** e catálogo de empreendimentos em São Paulo, com painel administrativo, CRM simplificado e encaminhamento para o WhatsApp da corretora.

> Plataforma independente de corretora. Não usa marca da Caixa e não se apresenta como serviço oficial. Toda simulação é exibida como **estimativa sujeita à análise e aprovação do agente financeiro**.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage, RLS) · Zod · ExcelJS

---

## Funil

1. **Landing page** (`/`) — chamada, explicação do programa, benefícios editáveis, tabela de faixas lida dos parâmetros ativos, destaques, privacidade.
2. **Formulário em 6 etapas** (`/simulacao`) — máscaras, validação por etapa, barra de progresso, rascunho salvo automaticamente no navegador (**sem o CPF**).
3. **Pré-simulação** — calculada no servidor com a versão ativa dos parâmetros.
4. **Resultado** (`/resultado/[token]`) — estimativa, pontos de atenção, **compatíveis primeiro** (com o motivo), depois todos os demais.
5. **Catálogo** (`/empreendimentos`) com filtros e **página individual automática** (`/empreendimentos/[slug]`).
6. **WhatsApp** — o servidor grava a escolha e o clique **antes** de redirecionar. A mensagem leva só nome, código da simulação (ex.: `AKL-7K3QXM`), empreendimento e pedido de atendimento.

## Painel (`/admin`)

| Área | O que faz |
|---|---|
| Visão geral | Totais, conversão simulação → WhatsApp, funil por etapa, mais escolhidos |
| Leads | Filtro por etapa, busca, período; exportação **Excel/CSV** (sem CPF) |
| Lead | Perfil completo, simulação, recomendados/visualizados/escolhido, UTMs, etapa, responsável, observações, histórico, CPF sob demanda (auditado), anonimização LGPD |
| Empreendimentos | Cadastro/edição, fotos, plantas e vídeos (Storage ou link), capa, ativar/desativar, ofertas, exclusão |
| Parâmetros | Faixas, taxas, tetos, subsídio, prazo, comprometimento etc. Cada alteração vira **nova versão**; teste rápido no próprio editor |
| Configurações | WhatsApp, IDs de GA4/Google Ads/Meta Pixel, textos da landing |
| Histórico | Auditoria automática de todas as alterações, exportações e visualizações de CPF |

Papéis: `admin` (tudo) e `corretor` (leads e empreendimentos).

---

## Implantação (passo a passo)

### 1. Supabase
1. Crie um projeto em <https://supabase.com> (região São Paulo, se disponível).
2. Em **SQL Editor**, execute **em ordem**:
   - `supabase/migrations/20261103000001_schema.sql` (tabelas, RLS, auditoria, bucket de mídias)
   - `supabase/migrations/20261103000002_seed.sql` (configurações, parâmetros v1 e **empreendimentos de exemplo**)
   - `supabase/migrations/20261103000003_preco_sob_consulta.sql` (preço sob consulta e região Interior)
   (Com a Supabase CLI: `supabase link` e `supabase db push`.)
3. Em **Authentication → Users → Add user**, crie seu usuário (marque *Auto Confirm*).
4. Edite e execute `supabase/criar_admin.sql` para liberar o acesso ao painel.
5. Em **Authentication → Providers → Email**, desative *Allow new users to sign up* (o painel não tem cadastro público).

### 2. Variáveis de ambiente
Copie `.env.example` para `.env.local` e preencha. Gere a chave do CPF com `openssl rand -base64 32` e **guarde-a em local seguro**.

### 3. Rodar localmente
```bash
npm install
npm run dev        # http://localhost:3000
```

### 4. Publicar (Vercel)
Importe o repositório na Vercel, cadastre as mesmas variáveis e publique. Depois, em Supabase → Authentication → URL Configuration, coloque o domínio do site em *Site URL*.

### 5. Importar o catálogo Plano&Plano
No SQL Editor, rode `supabase/migrations/20261103000003_preco_sob_consulta.sql` (se ainda não rodou) e depois
`supabase/import/plano-plano-2026-11-03.sql`. Ele:
- cadastra **133 empreendimentos/fases** (127 ativos; 6 "futuros lançamentos" sem fotos ficam inativos);
- usa as fotos, plantas e vídeos publicados pela Plano&Plano (links diretos para o site da construtora);
- deixa **"Sob consulta"** os 81 que não têm preço publicado — preencha no painel quando tiver a tabela;
- sugere as faixas do MCMV pelo preço (até R$ 275 mil → F1 a F4; até R$ 400 mil → F3/F4; até R$ 600 mil → F4);
- marca vaga de garagem como "não" (a construtora não informa por unidade) — ajuste no painel;
- desativa os empreendimentos de EXEMPLO.

Pode rodar de novo sem duplicar: preços, fotos e textos são atualizados e quem você desativou continua desativado.
Para atualizar no futuro, gere um novo JSON e rode `node scripts/gerar-import-plano-plano.mjs <arquivo.json>`.

Empreendimentos comerciais (Inspire Business, Time Center Campinas, apartamentos comerciais do Estação Mooca) não foram importados.

### 6. Antes de divulgar
- [ ] Painel → **Configurações**: número do WhatsApp, CRECI, e-mail, encarregado de dados, IDs de rastreamento.
- [ ] Painel → **Empreendimentos**: confira os importados (preços "sob consulta", vagas e faixas). Os itens **[EXEMPLO]** já ficam desativados pela importação.
- [ ] Painel → **Parâmetros**: confira os valores com o correspondente Caixa (ver abaixo).
- [ ] Revise a **Política de Privacidade** (`src/app/(site)/privacidade/page.tsx`) com o jurídico.

---

## Parâmetros de simulação (versão 1)

Pesquisados em 03/11/2026. **Revise sempre que sair nova portaria.**

| Faixa | Renda bruta familiar | Teto do imóvel (SP capital) | Juros nominais a.a. | Subsídio |
|---|---|---|---|---|
| 1 | até R$ 3.200 | R$ 275.000 | 4,25% a 5,00% | até R$ 55.000 |
| 2 | R$ 3.200,01 a R$ 5.000 | R$ 275.000 | 4,75% a 7,00% | até R$ 55.000 |
| 3 | R$ 5.000,01 a R$ 9.600 | R$ 400.000 | 7,66% a 8,16% | não há |
| 4 | R$ 9.600,01 a R$ 13.000 | R$ 600.000 | 10,00% a 10,50% | não há |

- Faixas de renda: Portaria MCID nº 333/2026 (DOU 01/04/2026).
- Teto F1/F2 de R$ 275 mil para municípios com mais de 750 mil habitantes: Conselho Curador do FGTS (nov/2025).
- Taxas: divulgadas pela Caixa e reproduzidas na imprensa; variam por região, cotista FGTS e relacionamento.
- Demais: comprometimento de 30% da renda, prazo de 420 meses, idade máxima de 80 anos e 6 meses na quitação, FGTS só com 3 anos de trabalho.

**Pontos que você deve completar com o correspondente bancário:**
- `cota_financiamento_max` está **vazio** (não aplicado). Informe o percentual máximo financiável para refinar a estimativa.
- O subsídio é mostrado como **"até R$ 55 mil"** (teto), nunca como valor garantido. A capacidade é exibida em dois cenários: sem subsídio e com o subsídio máximo, se aprovado.
- A parcela não inclui seguros (MIP/DFI) e tarifas.

### Como o cálculo funciona (`src/lib/simulacao/engine.ts`)
1. Renda familiar = titular + composição → faixa.
2. Prazo = mínimo entre o prazo máximo e a idade do proponente **mais velho** até 80a6m.
3. Parcela máxima = renda × comprometimento.
4. Financiamento máximo pela 1ª parcela (SAC) ou parcela fixa (PRICE), com a maior taxa da faixa (conservador; configurável).
5. Valor do imóvel = financiamento + FGTS (se elegível) + entrada [+ subsídio no cenário otimista], limitado ao teto da faixa e à cota de financiamento, se definida.

### Motor de compatibilidade (`src/lib/simulacao/matching.ts`)
Pontuação de 0 a 100 com pesos ajustáveis: faixa atendida (25), preço × capacidade (20), região (15), entrada (10), dormitórios (10), disponibilidade (10), vaga (5), estágio da obra (5).
**Compatível** = enquadrado no programa + faixa atendida + preço dentro da capacidade + abaixo do teto + com unidades. Cada card mostra motivos e pontos de atenção.

---

## Segurança e LGPD

- **RLS em todas as tabelas.** O público só lê empreendimentos ativos, configurações e a versão ativa dos parâmetros. Leads, eventos, notas e auditoria: só equipe autenticada.
- **Leads são gravados pelo servidor** (`/api/simulacao`) após validação com Zod, honeypot anti-robô e limite de requisições.
- **CPF** cifrado com AES-256-GCM (chave fora do banco) em tabela separada `lead_sensitive`, **sem nenhuma política RLS** — inacessível pela API mesmo para admins; só o servidor decifra, e cada visualização fica registrada.
- O token do resultado é um UUID aleatório; a página não mostra CPF, telefone nem e-mail.
- **Consentimento** obrigatório (versão e data gravadas) e opt-in separado para marketing.
- **Cookies de rastreamento** só carregam após aceite no banner (com opção de recusar e de rever a escolha no rodapé).
- **Anonimização** de lead a pedido do titular (painel → lead → LGPD).
- **Auditoria** por gatilhos no banco: quem alterou, quando e o que mudou (diff).
- Exportações protegem contra injeção de fórmulas e não incluem CPF.

## Rastreamento

Configure os IDs no painel. Eventos enviados (GA4 / Meta):

| Evento | Quando | Meta Pixel | Google Ads |
|---|---|---|---|
| `simulation_start` | primeira interação no formulário | InitiateCheckout | — |
| `simulation_step` | cada etapa concluída | custom | — |
| `simulation_complete` | simulação enviada | Lead | conversão "simulação" |
| `view_development` | página do empreendimento | ViewContent | — |
| `whatsapp_click` | clique no WhatsApp | Contact | conversão "WhatsApp" |

UTMs, `gclid` e `fbclid` são capturados na primeira visita e gravados no lead, com a origem calculada (Google Ads, Meta Ads, orgânico, direto…).

## Testes

```bash
npm test          # motor de simulação e compatibilidade (vitest)
npm run test:db   # migrations + RLS + auditoria num Postgres temporário (requer PostgreSQL 16 local)
npm run lint && npm run typecheck
```

## Estrutura

```
src/
  app/(site)/          páginas públicas (landing, simulação, resultado, catálogo, privacidade)
  app/admin/           login, painel e server actions
  app/api/             simulação, WhatsApp, eventos, exportação
  components/          site, simulação, admin, rastreamento
  lib/simulacao/       motor de cálculo e compatibilidade (+ testes)
  lib/validation/      schemas Zod compartilhados cliente/servidor
  lib/supabase/        clientes (navegador, servidor, service role)
  proxy.ts             sessão e proteção do /admin
supabase/
  migrations/          esquema, RLS, auditoria, seed
  tests/               testes de RLS
```
