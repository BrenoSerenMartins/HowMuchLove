# Arquitetura do Sistema

## Padrão Arquitetural Global
O **HowMuchLove** utiliza uma arquitetura **Serverless / BaaS (Backend as a Service)** fortemente acoplada ao ecossistema do **Supabase**. O padrão principal é o de **Thick Client (Rich Client)**, onde o frontend React detém a maior parte da lógica de visualização, roteamento e estado de interação, comunicando-se diretamente com o banco de dados via chamadas de API (PostgREST) protegidas por **Row Level Security (RLS)**.

### Separação de Camadas
1. **Presentation Layer (Client-Side)**
   - **Framework**: React 18 (SPA) empacotado via Vite.
   - **Roteamento**: Customizado (via `useNavigate` e `NavigationProvider`), sem uso de React Router. Baseado na renderização condicional baseada na rota da URL no `App.tsx`.
   - **Estado Global**: Gerenciado via React Contexts (`AuthProvider`, `NavigationProvider`, `NotificationProvider`).
   
2. **Business Logic Layer (Edge / Client)**
   - Regras de negócio de UI (validações de formulário, animações, transições) vivem no frontend (Custom Hooks como `useAuth`, `useFormValidator`).
   - Regras de negócio críticas (processamento de pagamentos Stripe, limitação de features baseadas no plano) vivem em **Supabase Edge Functions** (`supabase/functions/process-payment`).

3. **Data Layer (Supabase)**
   - **Banco de Dados**: PostgreSQL com esquemas relacionais (`plans`, `users`, `stories` implicito via auth).
   - **Armazenamento**: Supabase Storage (bucket `story-images`) para uploads de fotos da galeria.
   - **Segurança (RLS)**: O acesso aos dados é restrito no nível do banco. O frontend faz chamadas diretas (ex: `saveStory`), e o Postgres decide o que permitir baseado no JWT da sessão.

## Fluxo de Requisição (Data Fetching)
1. **Client**: Usuário interage com a UI (ex: clica em "Salvar Cápsula").
2. **Hook**: O componente chama uma função do contexto (`useAuth().saveStory()`).
3. **API Client**: A função no contexto (`shared/lib/story-api` ou similar) usa o Supabase SDK para mutar os dados.
4. **Database (RLS)**: O PostgreSQL avalia o token JWT associado à requisição. Se o `auth.uid()` bater com o dono do registro, a operação de `INSERT/UPDATE` ou upload no Storage é permitida.
5. **Response**: Retorna ao Client, que atualiza o estado local e despacha uma notificação (`NotificationProvider`).

## Gerenciamento de Estado
- **Autenticação**: O `AuthProvider` mantém o usuário logado, estado de loading e as features do plano atual (`planFeatures`). Ele se hidrata a partir da sessão ativa do Supabase na montagem.
- **Navegação**: O roteamento é estritamente controlado no frontend. O `App.tsx` injeta o componente correto baseado no path atual. Há regras estritas de proteção de rota dentro do `useEffect` do `App.tsx` (redirecionando não autenticados que tentam acessar `/dashboard` para `/`).
- **Estado de Formulários**: Formulários utilizam uma abordagem *controlled* via o hook customizado `useFormValidator`, que aplica regras (`validateRequired`, `validateEmail`) e gere erros *inline*.

## Integração com Serviços de Terceiros
- **Pagamentos**: A aplicação depende de provedores como Stripe. O fluxo de checkout é *off-site*. O frontend chama uma Edge Function (`process-payment`), que cria uma sessão do Stripe Checkout. Ao finalizar, webhooks do Stripe alimentam o banco de dados via Edge Functions, e o usuário é redirecionado para as rotas `/payment-success` ou `/payment-failure`.
- **Hospedagem Frontend**: Cloudflare Pages. O comando de preview e deploy no `package.json` aciona o Wrangler cli. A configuração SPA está no `wrangler.jsonc` (assumindo single-page-application mode, direcionando 404s para `index.html`).

## Convenções Internas Arquiteturais
- **Feature-based Folders**: O código fonte principal é dividido por domínio (`auth`, `customer`, `marketing`, `story`).
- **Shared Kernel**: Código agnóstico de domínio fica em `/shared` (ex: `shared/ui`, `shared/lib`).
- **Lazy Loading**: Componentes de página ("Pages") são carregados preguiçosamente (React.lazy) no `App.tsx` para garantir Code Splitting, melhorando a métrica Time to Interactive da landing page.
