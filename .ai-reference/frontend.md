# Frontend — Componentes e Arquitetura

## Design System

### Tokens de Design (tailwind.config.js)

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#ff2d55` | Cor de destaque principal (vermelho/rosa) |
| `primary-hover` | `#e6244b` | Estado hover do primary |
| `magic-purple` | `#7c3aed` | Cor secundária de acento |
| `deep-black` | `#050505` | Background base da aplicação |
| `surface-black` | `#0a0a0a` | Background de superfícies |
| Font `sans` | Plus Jakarta Sans, Poppins | Texto geral |
| Font `cursive` | Dancing Script | Textos cursivos/românticos |
| Font `mono` | JetBrains Mono | Labels técnicos, badges |

### Classes Utilitárias Customizadas (index.css)

| Classe | Descrição |
|---|---|
| `.btn-primary` | Botão vermelho padrão (uppercase, tracking, shadow) |
| `.btn-secondary` | Botão glass/translúcido |
| `.card-elite` | Card com glassmorphism, hover elevado |
| `.glass-panel` | Painel glass simples |
| `.input-elite` | Input field com estilo dark/glass |
| `.container-fluid` | Container responsivo com clamp |
| `.section-fluid` | Seção com padding vertical fluido |
| `.bg-grain` | Textura de granulado sobre toda a tela |
| `.lights-container` | Efeito de luz animada (pseudo-elementos radial blur) |
| `.hide-scrollbar` | Remove scrollbar visível |

### Efeito Visual Global

Toda a aplicação tem um sistema de camadas fixas:
1. **Background de imagem** (`/images/main-background.avif`) — blurrado, escuro
2. **Camada de cor** (`bg-[#050505]`)
3. **Lights container** — dois blobs de luz vermelha animados
4. **Grain texture** — textura sutil de granulado
5. **Conteúdo** (z-index positivo)

---

## Providers (app/providers/)

### AuthProvider
- **Arquivo**: `app/providers/AuthProvider.tsx`
- **Contexto**: `AuthContext`
- **Estado gerenciado**:
  - `user: AuthUser | null` — dados do usuário autenticado
  - `planFeatures: PlanFeatures | null` — objeto completo do plano
  - `isLoading: boolean` — controle de loading inicial
  - `showLogoutConfirm: boolean` — controle do modal de logout
- **Funções expostas**:
  - `login(email, pass)` — auth + busca profile
  - `register(name, email, pass)` — signup + default Gratis plan
  - `logout()` — abre modal de confirmação
  - `performLogout()` — logout efetivo
  - `saveStory(data, files, idsToDelete)` — delega para Edge Function
  - `loadStory()` — busca direta no Supabase DB
  - `refreshUser()` — re-executa `verifyAuth()`

### NavigationProvider
- **Arquivo**: `app/providers/NavigationProvider.tsx`
- **Contexto**: `NavigationContext`
- **Padrão de routing**: Hash-based (`window.location.hash`)
- **Estado gerenciado**:
  - `route: string` — rota atual extraída do hash
  - `isDirty: boolean` — se há alterações não salvas
  - `modalState: { isOpen, pendingPath }` — modal de confirmação de navegação
  - `isPreviewMode: boolean` — se está em modo de preview (oculta chrome)
- **Comportamento de guard**: Se `isDirty=true` e `navigate()` é chamado → abre modal, não navega imediatamente

### NotificationProvider
- **Arquivo**: `app/providers/NotificationProvider.tsx`
- **Contexto**: `NotificationContext` (NOT exported, apenas via `useNotification`)
- **Estado gerenciado**: `toasts: ToastMessage[]`
- **Funções expostas**: `addToast(message, type)`, `removeToast(id)`
- **IDs de toast**: Gerados por `'id-' + Math.random().toString(36).substr(2, 9)` (não UUID, pode colidir raramente)

---

## Hooks Globais (app/hooks/)

### useAuth
```typescript
const { user, planFeatures, isLoading, login, register, logout, performLogout,
        showLogoutConfirm, setShowLogoutConfirm, saveStory, loadStory, refreshUser } = useAuth();
```
- Consome `AuthContext`

### useNavigate
```typescript
const { route, navigate, setIsDirty, isConfirmationModalOpen, confirmNavigation,
        cancelNavigation, isPreviewMode, setPreviewMode } = useNavigate();
```
- Consome `NavigationContext`

### useFormValidator
- **Arquivo**: `app/hooks/useFormValidator.ts`
- Validação client-side de formulários de auth (email format, password length, name required)
- Retorna objeto `{ errors, validate, clearErrors }`

---

## Componentes Compartilhados (shared/ui/)

### Header
- **Arquivo**: `shared/ui/Header.tsx`
- Navbar responsiva: logo + links de navegação + botões de auth
- Em mobile: links de scroll na landing, botões de auth
- Recebe `onLogoutRequest` e `handleScrollTo` como props
- Links de navegação usam `navigate()` ou `handleScrollTo()` dependendo do contexto

### BottomNavBar
- **Arquivo**: `shared/ui/BottomNavBar.tsx`
- Barra de navegação inferior (mobile-first)
- Exibida apenas em: home pública + dashboard/settings autenticado (nunca em /login, /register, preview mode)
- Inclui link para história, dashboard, settings, logout

### Toast
- **Arquivo**: `shared/ui/Toast.tsx`
- Sistema de toasts com auto-dismiss
- Tipos: `'success'` (verde) | `'error'` (vermelho)
- Exporta `ToastContainer` que consome `useNotification()`

### ConfirmModal
- **Arquivo**: `shared/ui/ConfirmModal.tsx`
- Modal genérico de confirmação com título, mensagem, botão confirmar e cancelar
- Usado para: guard de navegação, confirmação de logout

### PageWrapper
- **Arquivo**: `shared/ui/PageWrapper.tsx`
- Wrapper simples que adiciona padding-top para o header fixo

### LoadingSpinner
- **Arquivo**: `shared/ui/LoadingSpinner.tsx`
- Spinner centralizado, usado durante carregamentos

---

## Componentes de História (shared/ui/story-view/)

### PublicStory
- **Arquivo**: `shared/ui/story-view/PublicStory.tsx`
- **Componente raiz** da experiência visual da história
- Recebe: `{ storyData, hasEntered, isMuted, setIsMuted, isPreview, previewDensityOverride }`
- **Container-aware**: usa `ResizeObserver` para medir a própria largura e adaptar o layout
- Quando `containerWidth >= 1024` → modo desktop (aspect ratio 16:9, estilo diferente)
- Slideshow automático de imagens (5 segundos por imagem)
- Exibe `StoryWatermark` se `isFreePlan(plan)`
- Modo preview vs. modo público afeta densidade do layout

### StoryHero
- **Arquivo**: `shared/ui/story-view/StoryHero.tsx`
- Seção de hero com imagem principal e `DurationCounter`
- A posição do contador é definida por `layoutPosition`: `'top' | 'center' | 'bottom'`

### DurationCounter
- **Arquivo**: `shared/ui/story-view/DurationCounter.tsx`
- Contador em tempo real (dias, horas, minutos, segundos desde `startDate`)
- Atualiza a cada segundo via `setInterval`

### YouTubePlayer
- **Arquivo**: `shared/ui/story-view/YouTubePlayer.tsx`
- Embeds o player do YouTube de forma oculta (apenas áudio)
- Responde a `hasEntered` e `isMuted`
- Extração do videoId é feita em `PublicStory` com regex

### StoryFloatingControls
- **Arquivo**: `shared/ui/story-view/StoryFloatingControls.tsx`
- Controles flutuantes: botão de mute/unmute do YouTube
- Se `showUpgradeCta=true` (não preview + plano gratuito) → exibe CTA de upgrade

### StoryWatermark
- **Arquivo**: `shared/ui/story-view/StoryWatermark.tsx`
- Marca d'água "howmuchlove.com.br" para plano gratuito
- Adapta posição/tamanho conforme `density` (mobile vs. desktop)

### story-layout.ts
- **Arquivo**: `shared/ui/story-view/story-layout.ts`
- Lógica puramente funcional para resolver layout responsivo
- `resolvePreviewDensity(containerWidth)` → `'desktop' | 'tablet' | 'mobile'`
- `resolvePublicDensity()` → usa `window.innerWidth`

---

## Editor da História (shared/story-editor/)

### CounterDemo
- **Arquivo**: `shared/story-editor/CounterDemo.tsx`
- **O componente mais complexo do projeto** (497 linhas)
- Editor completo com accordion sections:
  - "Conteúdo principal": data de início + mensagem
  - "Mídia e aparência": fotos (com D&D) + posição do contador + YouTube
  - "Configurações de acesso": senha + botão de entrada
- D&D de imagens com `@dnd-kit` (SortableContext + useSortable por imagem)
- Upload de imagens: novas imagens ficam como `File` objects locais; imagens existentes têm `story_id`
- Recebe `planFeatures` → bloqueia features indisponíveis com `UpgradeToUnlock`
- Props: `{ initialData, onSave, onCancel, saveStatus, isDashboard, onDirty, planFeatures, showPreview, onPreviewDataChange }`

### StoryPreview
- **Arquivo**: `shared/story-editor/StoryPreview.tsx`
- Preview inline dentro do editor (versão compacta)
- Wrapper que renderiza `PublicStory` em modo preview

### UpgradeToUnlock
- **Arquivo**: `shared/story-editor/UpgradeToUnlock.tsx`
- Banner de "Faça upgrade para desbloquear" para features bloqueadas
- Navega para `/settings` com scroll para a seção de preços

---

## Componentes de Pricing (shared/pricing/)

### PricingSection
- **Arquivo**: `shared/pricing/PricingSection.tsx`
- Grid de planos, suporta `variant: 'full' | 'compact'`
- Recebe `{ plans, currentPlan, onPlanSelect }`
- Detecta plano atual do usuário por nome

### PlanCard
- **Arquivo**: `shared/pricing/PlanCard.tsx`
- Card individual de plano
- Estado visual: "Seu plano atual" | "Fazer upgrade" | "Mudar para este plano"
- Plano `is_featured` → badge "Popular"

---

## Páginas de Módulos

### Landing Page (marketing/landing/Page.tsx)
- Composta por 6 seções:
  1. `HeroSection` — CTA principal + demo link
  2. `FeaturesSection` — 3 features cards
  3. `HowItWorksSection` — 3 passos
  4. `SocialProofSection` — 3 depoimentos
  5. `FAQSection` — 4 perguntas accordion
  6. `FinalCTASection` — CTA final
- `CounterDemo` também aparece embutido como demonstração interativa

### DashboardPage (customer/dashboard/Page.tsx)
- Estado local complexo:
  - `storyData` — dados salvos no banco
  - `editorPreviewData` — dados do editor em edição (live preview)
  - `isPreviewing` — modo preview fullscreen
  - `isEditing` — modo de edição (mostra editor + monitor)
  - `isQrModalOpen` — modal de QR Code
  - `shareLink` — link calculado se história válida + plano permite
- Background cinematic: usa `createPortal` para renderizar imagem blurrada no `document.body`

### SettingsPage (customer/settings/Page.tsx)
- 3 seções via sidebar: `'profile'` | `'billing'` | `'security'`
- Linka para `#pricing-section` via hash interno na URL para scroll automático
- Usa `PricingSection` para exibir planos disponíveis

### StoryPage (story/public/Page.tsx)
- NÃO usa `PageWrapper` do shared — tem seu próprio wrapper simplificado
- Gerencia estados de: loading, error (notFound vs loadError), passwordProtected, hasEntered
- Transição de entrada (2000ms fade) quando história tem YouTube

---

## Responsividade

O design usa extensivamente `clamp()` do CSS para escalonamento fluido:
- `clamp(2rem, 5vw, 4rem)` para espaçamentos
- `clamp(2.5rem, 9vw, 9rem)` para tipografia de destaque
- Breakpoints Tailwind padrão (`md:`, `lg:`, `xl:`) para layout switching

O `PublicStory` usa `ResizeObserver` no próprio container para adaptar densidade (não depende de `window.innerWidth`), permitindo uso tanto em fullscreen quanto em preview embedded.
