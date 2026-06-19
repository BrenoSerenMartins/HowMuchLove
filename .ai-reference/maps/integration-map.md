# Mapa de Integrações

1. **Cliente Frontend (Vite/React)** <---> **Supabase API (PostgREST)**
   - *Onde Ocorre*: `shared/lib/supabase.ts`, `story-api.ts`.
   - *Finalidade*: Inserções atômicas, login, carregamento de histórias via RLS.

2. **Cliente Frontend** <---> **Supabase Edge Function** (`process-payment`)
   - *Onde Ocorre*: Ação de Click em `HomePage`.
   - *Finalidade*: Criar ID transacional secreto e gerar checkout URL.

3. **Supabase Edge Function** <---> **Stripe API**
   - *Onde Ocorre*: Interno ao ambiente Cloudflare Worker / Supabase Deno.
   - *Finalidade*: Consumir as variáveis sensíveis `billing_product_id` e gerar uma sessão segura transacional pro usuário pagar a cápsula.

4. **Cliente Frontend** <---> **YouTube iFrame API**
   - *Onde Ocorre*: Visita do convidado na `StoryPage`.
   - *Finalidade*: Ao contornar a regra Anti-Autoplay da web (clicando no portão interativo de entrada), envia o sinal via SDK pra injetar a trilha sonora.

5. **Cliente Frontend** <---> **MercadoPago SDK**
   - *Onde Ocorre*: Em script global via `index.html`.
   - *Finalidade*: Legado arquitetural, não ativado massivamente nos novos seeds. Recomenda-se purga.

6. **Cliente Frontend** <---> **Google Analytics (gtag.js)**
   - *Onde Ocorre*: Em script global via `index.html`.
   - *Finalidade*: Rastreamento de métricas e ROI para campanhas de Ads.
