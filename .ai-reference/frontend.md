# Análise do Frontend

## Tecnologias e Setup
- **Core**: React 18 (SPA).
- **Linguagem**: TypeScript (Strict mode ativado no tsconfig).
- **Build Tool**: Vite (com plugins de React e BasicSSL para dev local).
- **Estilização**: TailwindCSS + Arquivo de estilos base (`index.css`). Extenso uso de classes utilitárias e variáveis CSS (`text-primary`, `bg-grain`).
- **Animações**: Framer Motion extensivamente usado para micro-interações, fade-ins e page transitions.
- **UI Libraries**: `lucide-react` para ícones, `react-datepicker` para o calendário, `qrcode.react` para geração de convites, `@dnd-kit` para arrastar e soltar (ordenar fotos na galeria).

## Estrutura de Diretórios de Domínio
- **`/app`**: Configurações raízes de providers (`AuthProvider`, `NavigationProvider`) e hooks globais (`useAuth`, `useNavigate`, `useFormValidator`). Ponto de montagem global no `App.tsx`.
- **`/auth`**: Contém `/login` e `/register`. Formulários minimalistas com validação *client-side* imediata.
- **`/customer`**: Área autenticada.
  - `/dashboard`: Componente principal para visualizar o resumo do "Story" atual e editá-lo.
  - `/billing`: Rotas de retorno do Gateway de pagamento (`success`, `failure`, `pending`).
  - `/settings`: Área para gerenciamento de perfil e conta.
- **`/marketing/landing`**: Landing page pública modularizada em seções (`HeroSection`, `FeaturesSection`, `PricingSection`, etc.).
- **`/story/public`**: A view pública final imersiva (`/story/:id`).
- **`/shared`**: Componentes de UI genéricos (`Button`, `Modal`, `LoadingSpinner`, `Toast`), utilitários (`validators`, `ui-copy`, formatadores de data), e lógica de API do Supabase (`supabase.ts`).

## Roteamento Global (Customizado)
O aplicativo não usa `react-router-dom`. Em vez disso, possui um sistema próprio:
- Um `NavigationProvider` rastreia a `route` atual no estado e manipula o histórico do navegador (PushState).
- O `App.tsx` funciona como um grande Switch (`switch (route)`).
- Componentes de nível de página são envelopados em `<Suspense>` e `<AnimatePresence>` para garantir transições suaves (fade in/out com blur) entre rotas.
- O controle de acesso (Auth Guard) reside num `useEffect` crítico no `App.tsx`:
  - Se tentar acessar rotas `protectedRoutes` (`/dashboard`, `/settings`) sem `user`, redireciona para `/`.
  - Se tentar acessar `publicOnlyRoutes` (`/login`, `/register`) já tendo `user`, redireciona para `/dashboard`.

## Padrões de Componentização
1. **Page Components**: Têm o nome `Page.tsx` dentro do seu respectivo diretório de domínio. Geralmente gerenciam o *Data Fetching* e layout macro.
2. **UI Components (`shared/ui`)**: Componentes de apresentação pura ("Dumb components"). Recebem `props` e disparam callbacks. Exemplo: `LoadingSpinner`, `ConfirmModal`.
3. **Compound/Domain Components**: Componentes complexos que misturam regras de UI com regras de negócio específicas, como `CounterDemo` ou `PublicStory`.
4. **Design System**: Não há biblioteca como MUI ou Radix. Tudo é customizado. Uso agressivo de pseudo-classes e estilos baseados em classes de marca no Tailwind (ex: `btn-primary`, `input-elite`, `card-elite`).

## Gerenciamento de Estado
- O `AuthProvider` guarda o estado do usuário e os *features* do plano (`planFeatures`), evitando recarregamentos múltiplos do banco de dados para checar se o usuário tem permissão X ou Y.
- Formulários não usam `react-hook-form` ou `Formik`, usam uma solução própria leve: `useFormValidator`.
- O Dashboard mantém o estado do Editor (`isEditing`, `editorPreviewData`) no nível da página para permitir edição em tempo real ("Studio Monitor") antes de fazer persistência.
- Foi implementado um modal de confirmação ("Sair sem salvar?") manipulado pelo `NavigationProvider` através de uma flag `isDirty`.

## Fluxos Visuais Imersivos
A estética é de extrema importância neste projeto (design rico, dark mode premium, micro-animações).
- **Backgrounds**: Utilização da classe `bg-grain` (noise overlay) misturada com orbes de luz (`lights-container`) gerados via CSS animado pseudo-elements.
- **Entry Transition (`/story/:id`)**: Um "portão de entrada" dramático. A página só revela o conteúdo real após o clique em "Pronto para se emocionar?", que remove o mute do vídeo do YouTube e faz um fade-out suave da overlay em 2 segundos.
- **Dashboard Editing**: No modo de edição (`isEditing`), o dashboard se divide revelando um preview em tempo real (lado direito) usando o componente `DashboardPreviewPane`.

## Lidando com Textos/Copys
Foi implementado um arquivo `ui-copy.ts` em `/shared/lib/` (inferido). Isso centraliza as mensagens de erro, textos de CTA e títulos das páginas, facilitando manutenção e provável futura internacionalização.
