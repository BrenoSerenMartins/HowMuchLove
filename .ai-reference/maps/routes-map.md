# Mapeamento de Rotas

O sistema não usa o React Router tradicional. Em vez disso, a variável de estado `route` processada pelo componente global `<App />` intercepta o pathname e substitui a UI imperativamente.

## 1. Rotas Públicas Principais
- `/` -> `HomePage` (`marketing/landing/Page.tsx`).
  - *Contexto:* Ponto de aterrissagem, indexado por SEO, mostra planos e demo. Redireciona usuários logados diretamente pro `/dashboard`.

## 2. Rotas de Autenticação (Restritas para Não-Logados)
- `/login` -> `LoginPage` (`auth/login/Page.tsx`).
- `/register` -> `RegisterPage` (`auth/register/Page.tsx`).
  - *Contexto:* Formulários isolados. Logar tira o usuário daqui via redirecionamento de hook.

## 3. Rotas de Consumidor (Privadas)
- `/dashboard` -> `DashboardPage` (`customer/dashboard/Page.tsx`).
  - *Contexto:* Gestão core. Rota protegida. Se tentado aceder sem login, despacha imperativamente pro `/`.
- `/settings` -> `SettingsPage` (`customer/settings/Page.tsx`).
  - *Contexto:* Configuração de Perfil/Configurações. Rota protegida.

## 4. Rotas de Fallback de Billing (Financeiro)
- `/payment-success` -> `PaymentSuccessPage`.
- `/payment-failure` -> `PaymentFailurePage`.
- `/payment-pending` -> `PaymentPendingPage`.
  - *Contexto:* Rotas temporárias exibidas após o ciclo de redirecionamento de checkout da plataforma Stripe.

## 5. Rotas de Visualização (Deep Links Públicos)
- `/story/:id` -> `StoryPage` (`story/public/Page.tsx`).
  - *Aviso:* O `id` aqui se refere ao `userId` do dono da cápsula no Supabase, passado internamente como o `storyId` que o banco exige.

## Controle de Histórico Navegador
O controle da barra de endereços (e botão nativo de voltar) acontece através das chamadas de Histórico da window (`window.history.pushState(null, '', url)`), gerenciado internamente pelo `<NavigationProvider>`.
