# Decisões Arquiteturais (Architectural Decisions)

## 1. Abandono de Frameworks MVC/SSR por SPA Puro
- **Decisão**: A aplicação não usa Next.js ou Remix, mas sim Vite (React em formato estático SPA).
- **Razão (Porquê)**: O núcleo comercial da plataforma é uma tela imersiva (a "Story"). Aplicações estáticas são infinitamente mais fáceis de hospedar massivamente via CDNs como Cloudflare Pages. A indexação agressiva de SEO se foca só na Landing Page, onde a velocidade pura da SPA descarrega o JavaScript rapidamente sem precisar instanciar servidores NodeJS no mundo todo.
- **Trade-off**: Custou o abandono do React Router para algo minúsculo manual e gerou atrasos no parse de redes mais lentas por causa do *Client-side rendering* exclusivo.

## 2. Injeção Direta "BaaS" (Backend as a Service)
- **Decisão**: Ausência completa de uma camada Node.js controlando requisições REST/GraphQL intermediárias. O App aponta `fetch` ou o SDK diretamente ao Banco (via PostgREST).
- **Razão**: Agilidade (Time to Market) e supressão de manutenção de rotas CRUD exaustivas para salvar fotos e textos.
- **Consequência Oculta**: Segurança precisou ser ancorada 100% no Row Level Security (RLS) do Postgres e em Stored Procedures como `save_story_atomic.sql`. Se o desenvolvedor futuro for inexperiente em SQL, toda a aplicação trancará ou sofrerá regressão crítica.

## 3. Gestão Centralizada Limitada por Contexto (`planFeatures`)
- **Decisão**: Injetar toda a estrutura do `Plan` do consumidor dentro do contexto onipresente `useAuth()`.
- **Razão**: Economia dramática de chamadas HTTP. Componentes renderizando blocos do "Dashboard" tomam decisões lógicas sub-milisegundo sabendo o que bloquear, em vez de depender de múltiplas consultas asíncronas lentas e confusas ao servidor.

## 4. Contorno Criativo de Audio ("The Gate")
- **Decisão**: Exigir um "Clique Prévio" (um portão de bloqueio de Interação) numa tela opaca e estática antes do Show Principal nas Páginas da História contendo música de fundo YouTube.
- **Razão**: Contorno contra restrições rígidas impostas pelo Safari e Chromium. Caso a tela imersiva tentasse "Tocar e Mover partículas" autonomamente ao visitar a URL, os browsers nativos cortam o áudio perpetuamente.
