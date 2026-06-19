# Mapa de Dependências do Fluxo

## Grafo de Dependência Frontend Central

1. `App.tsx` (Root/Mount)
   ↳ **Providers:** `NavigationProvider`, `AuthProvider`, `NotificationProvider`.
     ↳ **Hooks Consumidores Globais:** `useNavigate`, `useAuth`, `useNotification`.

## Grafo de Negócio (Dashboard)

1. `DashboardPage`
   ↳ Depende de: `useAuth()` (Para ler a propriedade `planFeatures` da Assinatura ativa do Cliente e a Função mutadora `saveStory()`).
   ↳ Injeta dados em: `<CounterDemo>` (Aba Esquerda de Edição) e `<DashboardPreviewPane>` (Aba Direita de Visualização).
      ↳ `<CounterDemo>` Depende de: `@dnd-kit` (Drag and drop para manipulação de `story_images`).

## Grafo Analítico
1. Visitante na URL
   ↳ O script `gtag.js` invoca a injeção do monitor de eventos base do GA4 do Google dependendo unicamente da rede (Não bloqueante).
