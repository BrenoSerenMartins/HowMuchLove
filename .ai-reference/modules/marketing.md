# Módulo: Marketing (Landing)

## Objetivo
Adquirir e converter leads provendo o funil visual da startup e opções de monetização.

## Responsabilidade
- Exibir copy persuasivo (Features, How it Works, Social Proofs).
- Demonstrar ao vivo a capacidade da plataforma (`CounterDemo` sem estado atrelado a usuário).
- Renderizar Catálogo de Assinaturas dinâmicas.

## Contexto de Negócio
O primeiro contato com o usuário. Depende puramente da velocidade e de SEO.

## Arquivos Envolvidos
- `marketing/landing/Page.tsx`
- `marketing/landing/sections/*`
- `shared/pricing/PricingSection.tsx`
- `shared/lib/pricing.ts`

## Fluxo Completo
1. Visitante carrega `/`.
2. Em background, enquanto ele lê a seção "Hero", o `useEffect` da página já engatilhou `fetchAllPlans()`.
3. Quando as opções carregam, a seção de `Pricing` é hidratada (e.g. Gratuito, Sonho, Eterno).
4. Clicar em um plano aciona o desvio: "É anônimo? Vai para Registro. É logado? Roda Stripe Checkout Edge Function".

## Integrações Relacionadas
- Supabase Edge (`process-payment`).
- Stripe.
- Google Analytics 4 (Via `index.html`).

## Gargalos e Anti-Patterns Associados
- Uma falha de conectividade na API do Supabase impede que os planos carreguem, impedindo que os usuários comprem o sistema. (O `isPlansLoading` é retido perpetuamente).
