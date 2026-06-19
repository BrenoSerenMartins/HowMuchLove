# Padrões Arquiteturais e de Design (Patterns)

Este documento descreve os padrões implementados e adotados na base de código do **HowMuchLove**. Ao fazer manutenção ou criar novas features, siga estritamente estas diretrizes.

## 1. Padrões de React
### Context como Injeção de Dependência Front-End
Os serviços e estados globais são encapsulados em Contexts (`NavigationProvider`, `AuthProvider`, `NotificationProvider`) e expostos puramente através de Hooks consumíveis (`useAuth`, `useNavigate`).
*Isso oculta a complexidade e permite mocking mais fácil se testado no futuro.*

### Roteamento Baseado em Estado de App
O `App.tsx` possui a lógica de decisão (`switch(route)`) aliada à renderização suspensa (`Suspense` + `React.lazy`). Isso implementa implicitamente o **Lazy Loading / Code Splitting Pattern** a nível de view.

### Error Boundaries e Fallbacks Elegantes
Qualquer processamento assíncrono (carregamento de view, obtenção de dados de auth, carregamento da história via API) usa uma UI em full-screen rica (e.g., o `loadingFallback` com background animado). Erros não desconfiguram a tela, são renderizados dentro de modais/cards customizados (`ShieldAlert`).

## 2. Padrões de Estilização e UI (Tailwind & Framer Motion)
### Utilitários Abstratos em Classes CSS
Para evitar código Tailwind massivo no JSX ("HTML poluído"), classes que se repetem muito foram movidas para `index.css` via `@apply`.
- **Cards/Containers**: `.card-elite`, `.input-elite`.
- **Botões**: `.btn-primary`, `.btn-secondary`.
- **Tipografia Específica**: `.font-cursive`.
*Sempre reutilize estas classes quando for desenvolver uma nova seção.*

### Animação Declarativa Uniforme
Todas as aparições de página no `App.tsx` ou listas de itens dinâmicos utilizam `<AnimatePresence>` do Framer Motion com configurações padronizadas de transição (easing `[0.22, 1, 0.36, 1]`). Isso dita o tom *Premium* do app.
- **Padrão:** O elemento nasce com opacidade 0 e deslocamento para baixo (`y: 20` ou `scale: 0.95`) e se resolve para o centro.

### Micro-Interações Obrigatórias
Nenhum botão de ação principal existe sem feedback tátil-visual.
- Ações incluem agrupamento visual (`group`) com um ícone (`ArrowRight` ou `ChevronLeft`) que move em `hover:translate-x-1`.
- Símbolos de carregamento `Spinners` assumem controle do botão quando em *submitting state*.

## 3. Padrões de Comunicação com Backend (Supabase)
### "Thick Client" com Lógica Direta
Para CRUDs do domínio (atualizar história, salvar foto), a arquitetura ignora um proxy/BFF backend e vai direto para a interface do Supabase PostgREST no client (`shared/lib/story-api`).
- A segurança é transferida para o Banco de Dados (Row Level Security). O frontend envia a query otimista; o RLS assegura que, se for maliciosa, ela falhará no banco de dados, e o frontend gerenciará a exceção via try-catch e Toasts.

### Edge Functions para Operações Sensíveis
Se a operação depende de chaves privadas externas (ex: Stripe Secret Key para gerar o link de Checkout), adota-se o padrão **RPC/Edge Function** (`supabase.functions.invoke`). Nunca há exposição de lógicas sensíveis de pagamento no cliente.

## 4. Padrões Comportamentais (Behavioral)
### Proteção Oculta de Dirty State ("Sair sem Salvar")
Rotas ou ações que levam o usuário para fora do contexto de edição ("Studio Monitor") são interceptadas pelo `useNavigate`, que verifica a flag `isDirty`. Se alterado, exibe-se um Modal de Confirmação impeditivo.
- Este padrão age como mecanismo **Anti-Regressão de UX**, impedindo a perda de inputs (principalmente textos e fotos grandes).

### Delegação de Acesso Criptográfica Simples
O acesso a URLs protegidas de cápsulas de tempo não usa fluxos de autenticação complexos, e sim um campo de Senha Hashed na tabela `stories`, checado via função RPC do banco de dados (provavelmente via edge-function ou RPC no postgres), garantindo que visitantes não autenticados via Supabase consigam visualizar se fornecerem a senha.

## 5. Padrões de Estruturação de Dados
### Tipos Centralizados (`types.ts`)
Todas as interfaces e contratos DTO entre o frontend, Edge Functions e o DB são centralizados no `/types.ts` raiz.
- `PlanFeatures`, `LoveStoryData`, `StoryImage`.
- Isso evita re-declaração e mantém uma fonte única de verdade no TypeScript.
