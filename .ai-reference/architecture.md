# Arquitetura do Sistema

## Padrão Arquitetural

O projeto é uma **SPA (Single Page Application) com backend serverless**, sem servidor dedicado de aplicação:

- **Frontend**: React SPA puro (não Next.js, não SSR)
- **Backend**: Supabase (BaaS) + Edge Functions Deno
- **Banco de dados**: PostgreSQL gerenciado pelo Supabase
- **Deploy**: Cloudflare Workers (frontend estático) + Supabase Cloud (backend)

---

## Estrutura de Diretórios e Responsabilidades

```
HowMuchLove/
├── index.tsx                   # Entrypoint: monta o React root
├── App.tsx                     # Re-exporta app/App.tsx (alias de conveniência)
├── index.html                  # HTML shell, SEO meta tags, GA4, fontes Google
├── index.css                   # Design system global (Tailwind @layer + classes utilitárias)
├── types.ts                    # Tipos TypeScript globais compartilhados
├── tailwind.config.js          # Tokens de design (cores, tipografia, animações)
├── vite.config.ts              # Build config (alias @/, plugin-react, plugin-basic-ssl)
├── wrangler.jsonc              # Config Cloudflare Workers (deploy do dist/)
│
├── app/                        # CAMADA DE APLICAÇÃO (shell, providers, routing)
│   ├── App.tsx                 # Roteador principal + layout shell (Header, Footer, BottomNavBar)
│   ├── hooks/
│   │   ├── useAuth.ts          # Hook consumidor do AuthContext
│   │   ├── useNavigate.ts      # Hook consumidor do NavigationContext
│   │   └── useFormValidator.ts # Validação de formulários (auth)
│   └── providers/
│       ├── AuthProvider.tsx    # Context global de autenticação + save/load story
│       ├── NavigationProvider.tsx  # Context de routing (hash-based)
│       └── NotificationProvider.tsx # Context de toasts/notificações
│
├── auth/                       # MÓDULO DE AUTENTICAÇÃO
│   ├── login/Page.tsx          # Página de login
│   └── register/Page.tsx       # Página de registro
│
├── customer/                   # MÓDULO DO CLIENTE AUTENTICADO
│   ├── dashboard/
│   │   ├── Page.tsx            # Painel principal (editor + preview + ações)
│   │   └── components/         # DashboardHero, DashboardSummary, DashboardActions, QRCodeModal
│   ├── settings/
│   │   ├── Page.tsx            # Configurações (perfil, assinatura, segurança)
│   │   └── components/         # SettingsSidebar, SettingsSection, SettingsProfileCard
│   └── billing/
│       ├── success/Page.tsx    # Retorno de checkout com sucesso
│       ├── failure/Page.tsx    # Retorno de checkout cancelado
│       └── pending/Page.tsx    # Retorno de checkout pendente
│
├── marketing/                  # MÓDULO DE MARKETING (público)
│   └── landing/
│       ├── Page.tsx            # Landing page
│       └── sections/           # HeroSection, FeaturesSection, HowItWorksSection,
│                               # SocialProofSection, FAQSection, FinalCTASection
│
├── story/                      # MÓDULO DE HISTÓRIA PÚBLICA
│   └── public/Page.tsx         # Visualizador público da história (sem auth)
│
├── shared/                     # CAMADA COMPARTILHADA (reutilizável entre módulos)
│   ├── lib/                    # Utilitários e integrações
│   │   ├── supabase.ts         # Cliente Supabase (singleton)
│   │   ├── plans.ts            # Lógica de planos e capabilities
│   │   ├── pricing.ts          # Fetch de planos via Edge Function
│   │   ├── story-api.ts        # API pública de histórias (get + verify password)
│   │   ├── storage.ts          # Normalização de URLs do Supabase Storage
│   │   ├── errors.ts           # Extração e formatação de erros
│   │   ├── ui-copy.ts          # Todos os textos da UI (centralizado)
│   │   └── validators.ts       # Validadores de campo
│   ├── ui/                     # Componentes UI reutilizáveis
│   │   ├── Header.tsx          # Header responsivo (logo, nav, auth actions)
│   │   ├── Footer.tsx          # Footer simples
│   │   ├── BottomNavBar.tsx    # Barra de navegação inferior (mobile)
│   │   ├── Toast.tsx           # Sistema de toasts
│   │   ├── ConfirmModal.tsx    # Modal de confirmação genérico
│   │   ├── LoadingSpinner.tsx  # Spinner de carregamento
│   │   ├── PageWrapper.tsx     # Wrapper de padding de página
│   │   ├── icons/              # Ícones SVG customizados
│   │   └── story-view/        # Componentes de visualização da história
│   │       ├── PublicStory.tsx         # Componente raiz da história pública
│   │       ├── StoryHero.tsx           # Seção hero com imagens e contador
│   │       ├── StoryMessage.tsx        # Seção de mensagem
│   │       ├── DurationCounter.tsx     # Contador de tempo em tempo real
│   │       ├── YouTubePlayer.tsx       # Player de YouTube embutido
│   │       ├── StoryFloatingControls.tsx # Controles flutuantes (mute, upgrade CTA)
│   │       ├── StoryWatermark.tsx      # Marca d'água para plano gratuito
│   │       └── story-layout.ts         # Lógica de layout responsivo
│   ├── story-editor/           # Editor da história
│   │   ├── CounterDemo.tsx     # Editor principal (formulário completo com accordion)
│   │   ├── StoryPreview.tsx    # Preview inline do editor
│   │   └── UpgradeToUnlock.tsx # CTA de upgrade para features bloqueadas
│   └── pricing/                # Componentes de precificação
│       ├── PricingSection.tsx  # Grid de planos
│       └── PlanCard.tsx        # Card individual de plano
│
├── supabase/                   # BACKEND SERVERLESS
│   ├── migrations/             # SQL de evolução do schema
│   ├── seed.sql                # Dados iniciais (planos + bucket)
│   └── functions/              # Edge Functions Deno
│       ├── _shared/            # Utilitários compartilhados entre funções
│       │   ├── cors.ts         # Headers CORS
│       │   ├── env.ts          # Leitura de variáveis de ambiente
│       │   ├── errors.ts       # Resposta de erro padronizada
│       │   ├── stripe.ts       # Cliente Stripe (requests + verificação webhook)
│       │   └── public-story.ts # Resolver de storyId para userId
│       ├── save-story/         # Salvar história (autenticado)
│       ├── get-public-story/   # Buscar história pública (sem auth)
│       ├── get-all-plans/      # Listar planos visíveis
│       ├── process-payment/    # Criar Stripe Checkout Session
│       ├── stripe-webhook/     # Processar eventos Stripe
│       └── verify-public-story-password/ # Verificar senha de história
│
└── styles/
    └── react-datepicker.css    # CSS do componente DatePicker
```

---

## Camadas e Responsabilidades

### 1. Camada de Aplicação (`app/`)
- **Responsabilidade**: bootstrapping, providers globais, roteamento, layout shell
- **Não contém**: lógica de negócio específica de módulo
- Providers envolvem toda a árvore na ordem: `NavigationProvider > AuthProvider > NotificationProvider`

### 2. Camada de Módulos (`auth/`, `customer/`, `marketing/`, `story/`)
- Cada módulo é uma feature vertical isolada
- Contém apenas `Page.tsx` e seus `components/` locais
- Não importam diretamente de outros módulos (apenas de `shared/` e `app/`)

### 3. Camada Compartilhada (`shared/`)
- **`shared/lib/`**: Pure utilities, sem JSX, sem estado React
- **`shared/ui/`**: Componentes React genéricos (sem lógica de negócio)
- **`shared/story-editor/`**: Editor da história (reutilizado no dashboard e como demo na landing)
- **`shared/pricing/`**: Componentes de precificação (reutilizados na landing e settings)

### 4. Camada de Backend (`supabase/functions/`)
- Edge Functions Deno completamente separadas do frontend
- Cada função é deployada individualmente pelo Supabase CLI
- `_shared/` contém utilitários comuns importados com caminho relativo

---

## Padrão de Routing

O sistema usa **Hash-based routing** (não React Router DOM):

```
window.location.hash = '#/dashboard'   → route = '/dashboard'
window.location.hash = '#/story/uuid' → route = '/story/uuid'
```

**Implementação**: `NavigationProvider` escuta o evento `hashchange` e atualiza o `route` no contexto. O `app/App.tsx` faz um `switch` no `route` para renderizar o componente correto.

**Rotas existentes**:
| Rota | Componente | Proteção |
|---|---|---|
| `/` | `HomePage` (landing) | Pública |
| `/login` | `LoginPage` | Somente para não-autenticados |
| `/register` | `RegisterPage` | Somente para não-autenticados |
| `/dashboard` | `DashboardPage` | Requer auth |
| `/settings` | `SettingsPage` | Requer auth |
| `/story/:id` | `StoryPage` | Pública |
| `/payment-success` | `PaymentSuccessPage` | Pública |
| `/payment-failure` | `PaymentFailurePage` | Pública |
| `/payment-pending` | `PaymentPendingPage` | Pública |

**Guard de navegação**: `app/App.tsx` tem um `useEffect` que redireciona:
- Não-autenticado em rota protegida → `'/'`
- Autenticado em `/login` ou `/register` → `/dashboard`

---

## Fluxo de Dados Global

```
Supabase Auth ──► AuthProvider ──► useAuth() hook ──► Componentes de página
                      │
                      ├── user (id, email, name, plan)
                      ├── planFeatures (PlanFeatures completo)
                      ├── saveStory()   → Edge Function save-story
                      └── loadStory()  → Supabase DB direto

NavigationProvider ──► useNavigate() hook ──► Componentes de página
                           │
                           ├── route (string atual)
                           ├── navigate(path) → window.location.hash
                           ├── setIsDirty(bool) → guard de navegação
                           └── setPreviewMode(bool) → oculta header/footer

NotificationProvider ──► useNotification() hook ──► Componentes de página
                              │
                              └── addToast(msg, type) → Toast visual
```

---

## Separação de Clientes Supabase (Backend)

As Edge Functions usam **dois clientes Supabase** com propósitos diferentes:

1. **User client** (anon key + auth header do usuário): Para verificar autenticação
2. **Admin client** (service role key): Para operações privilegiadas no banco (bypassar RLS)

Esse padrão é crítico para segurança — o admin client nunca é exposto ao frontend.
