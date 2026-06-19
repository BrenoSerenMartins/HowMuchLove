# System Overview: HowMuchLove

## Objetivo do Sistema
O **HowMuchLove** é uma aplicação web de consumo (B2C) projetada para permitir que casais celebrem seus relacionamentos. O sistema funciona como um construtor de "cápsulas do tempo" digitais, onde usuários pagantes podem criar, personalizar e compartilhar uma página interativa (Story) contendo um contador de tempo de relacionamento, uma galeria de fotos, uma música de fundo (via YouTube) e mensagens personalizadas.

## Público-Alvo
Casais em relacionamentos de longo prazo procurando presentes de aniversário de namoro/casamento, dia dos namorados, ou formas de imortalizar a história do casal digitalmente.

## Proposta de Valor Core
- Criação de uma página web única, estética e imersiva (`/story/:userId`).
- Contagem dinâmica de tempo (anos, meses, dias, horas, minutos, segundos).
- Compartilhamento via link ou QR Code.
- Controle de acesso (opcionalmente protegido por senha).

## Stack Tecnológico de Alto Nível
- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, Framer Motion (para animações core).
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **Infraestrutura/Deploy**: Cloudflare Pages (via Wrangler).
- **Monetização**: Integração de pagamentos via Stripe (anteriormente MercadoPago, dado o JS SDK no index.html, mas ativamente usando Stripe conforme `seed.sql`).

## Principais Domínios
1. **Marketing/Landing**: Página pública otimizada para conversão, SEO (Google Analytics 4 integrado), e exibição de planos de preços (gratuitos e pagos).
2. **Auth (Autenticação)**: Fluxos de Login e Registro gerenciados localmente com sessão Supabase Auth.
3. **Customer (Dashboard/Admin)**: Área restrita (`/dashboard`, `/settings`, `/payment-success`) onde o usuário edita a cápsula do tempo, faz upload de imagens e gerencia seu plano.
4. **Story (Public View)**: O produto final entregue. Uma página pública e imersiva (`/story/:id`) com animações de entrada e verificação de senha.
5. **Shared/Infrastructure**: Componentes reutilizáveis, validadores de formulário e integrações de API.

## Modelos de Monetização
O sistema suporta múltiplos níveis de acesso baseados na tabela `plans`, processados pelo Stripe:
- **Gratuito/Teste**: Funcionalidades limitadas (ex: 1 foto, sem YouTube).
- **Sonho**: Assinatura básica.
- **Eterno**: Assinatura intermediária (senha, música, 5 fotos).
- **Infinito**: Pagamento único (lifetime access, 10-20 fotos, botões customizados).

## Ponto de Atenção Arquitetural
A aplicação é uma SPA pura (Single Page Application) hospedada na Cloudflare. Toda a lógica de servidor, regras de negócio severas de validação e integrações com o gateway de pagamento rodam em **Supabase Edge Functions** (ex: `process-payment`). O acesso a dados é feito via Supabase JS SDK, dependendo pesadamente de Row Level Security (RLS) no PostgreSQL para garantir o isolamento de tenants (usuários não podem ver histórias alheias que estão em rascunho, ou editar sem permissão).
