# Análise do Backend (BaaS via Supabase)

## Natureza Serverless
Não existe um repositório Node.js/Express tradicional para o backend. O **HowMuchLove** é uma aplicação construída sobre o conceito de Backend as a Service (BaaS) utilizando o ecossistema Supabase.

Isso significa que a lógica do "Backend" está pulverizada em três camadas distintas no ecossistema:
1. **Regras de Acesso e CRUD Simples:** Gerenciadas nativamente pela API PostgREST do Supabase e validadas através de Row Level Security (RLS) no PostgreSQL.
2. **Lógica de Autenticação:** Gerenciada pelo Supabase Auth (GoTrue), com fluxos de sessão (JWT) refletidos no SDK React.
3. **Lógicas Críticas ou Complexas:** Hospedadas em **Supabase Edge Functions** (Deno), atuando como microserviços orientados a eventos (ex: processamento de checkout de pagamentos).

## Estrutura do Backend (Repositório Local `supabase/`)
O código de infraestrutura está versionado dentro da pasta `/supabase`, permitindo que o ambiente seja espelhado localmente para desenvolvimento:
- `/supabase/migrations`: Arquivos `.sql` incrementais contendo a modelagem de dados, stored procedures e permissões (RLS).
- `/supabase/functions`: Contém o código TypeScript/Deno das Edge Functions isoladas (ex: `/process-payment`).
- `/supabase/seed.sql`: Scripts para inserção de dados falsos (mock) no ambiente de desenvolvimento local (como simulação de planos gratuitos e testes do Stripe).
- `/supabase/config.toml`: Configuração do ambiente local do Supabase CLI.

## Principais Responsabilidades do Backend

### 1. Manipulação do Objeto `Story` (A História)
- As requisições de persistência da história (salvar dados, texto, data e foto) não passam por um controlador lógico tradicional.
- A função `saveStory` no frontend envia o payload (via SDK).
- O backend atua apenas como uma porta de entrada segura para o Banco de Dados, negando acesso caso o ID do objeto não coincida com o do usuário autenticado no JWT (`auth.uid()`).

### 2. Tratamento Massivo de Arquivos (Storage)
- O backend hospeda o bucket Supabase Storage chamado `story-images`.
- A API do backend processa os envios de imagem e as vincula a registros no banco de dados. Não há processamento severo de imagem via worker no momento, delegando esse carregamento e exibição final à CDN nativa do Supabase.

### 3. Integrações via Edge Functions
As Edge Functions são o único local com acesso a "segredos de servidor" (ex: Chave Privada do Stripe). O fluxo ocorre da seguinte forma:
1. Frontend despacha um HTTP POST request assinado com JWT para a Edge Function de nome `process-payment`.
2. A Edge Function autentica a requisição, cruza com a tabela de `plans` para checar o preço.
3. Se for plano pago, a função age como Proxy, envia a intenção ao gateway Stripe e retorna a URL segura de redirecionamento do checkout para o frontend.

## Vantagens Desse Modelo para a Aplicação
- **Escalabilidade quase infinita:** Como toda a interação ocorre contra a API do Supabase construída em Rust/Elixir/Postgres, gargalos clássicos de event-loop do Node.js não se aplicam à manipulação dos CRUDs rotineiros de edição de histórias.
- **Menor Superfície de Manutenção:** Ao delegar autenticação de rotas e segurança de registro ao RLS, o código-fonte da aplicação encolhe massivamente, reduzindo as horas de manutenção em rotas/controllers.

## Pontos Sensíveis do Backend
O comportamento de "salvar estado sujo" é atômico. A função SQL `20260608000000_save_story_atomic.sql` sugere a existência de um *Stored Procedure* complexo ou um padrão de trigger no banco para gerenciar a transação quando o usuário envia dados de texto em paralelo com a ordenação das imagens. Se as regras de negócio em SQL (PL/pgSQL) crescerem, a testabilidade do backend ficará extremamente complexa.
