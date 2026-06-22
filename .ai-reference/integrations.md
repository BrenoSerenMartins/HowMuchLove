# Integrações Externas

## INT-001: Supabase

**Tipo**: BaaS (Backend as a Service)

**Serviços usados**:

### Auth
- **Operações**: `signInWithPassword`, `signUp`, `signOut`, `getSession`, `getUser`
- **Sessão**: JWT automático gerenciado pelo cliente Supabase
- **Acesso**: Via `supabase.auth.*` no cliente frontend
- **Na Edge Function**: Autenticação via JWT passado no header Authorization
- **Trigger implícito**: Criação automática de registro em `profiles` ao registrar usuário (trigger configurado no Supabase, NÃO no código da aplicação)

### Database (PostgreSQL)
- **Acesso frontend**: Via `@supabase/supabase-js` (sujeito a RLS)
- **Acesso nas Edge Functions**: Dois clientes:
  - User client (anon key + auth header) — respeitador de RLS
  - Admin client (service role key) — bypass de RLS
- **Tabelas acessadas pelo frontend diretamente**: `profiles`, `love_stories`, `story_images`
- **RPC**: `save_story_with_images` (chamada apenas via Edge Function, nunca diretamente do frontend)

### Storage
- **Bucket**: `story-images` (público)
- **Upload**: Somente via Edge Function `save-story` (admin client)
- **Download/exibição**: Via URL pública direta
- **Delete**: Via Edge Function após save bem-sucedido

### Edge Functions
- **Runtime**: Deno
- **Deploy**: Supabase CLI (independente do deploy do frontend)
- **Variáveis de ambiente**: Configuradas via Supabase Dashboard (Secrets), não em arquivos .env

---

## INT-002: Stripe

**Tipo**: Gateway de pagamento

**Modo de integração**: Server-side only (frontend NUNCA toca em Stripe)

### Checkout
- **Forma de criação**: `process-payment` Edge Function cria Stripe Checkout Session
- **Redirect**: Frontend redireciona para `session.url` (hosted checkout page do Stripe)
- **Retorno**: Stripe redireciona para `success_url` ou `cancel_url` configurados

### Webhooks
- **Endpoint**: `{SUPABASE_URL}/functions/v1/stripe-webhook`
- **Verificação**: HMAC-SHA256 via `verifyStripeWebhookSignature()` (implementação manual sem SDK Stripe)
- **Eventos monitorados**:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`

### Configuração de Planos
- Cada plano pago tem `billing_product_id` e `billing_price_id` no Supabase
- A resolução do plano pós-pagamento é feita por `billing_price_id` (Stripe) matchando com `plans.billing_price_id`

### Secrets (Supabase Function Secrets)
- `STRIPE_SECRET_KEY` — chave secreta da API Stripe
- `STRIPE_WEBHOOK_SECRET` — segredo para verificar assinatura do webhook

---

## INT-003: Cloudflare Workers / Pages

**Tipo**: CDN e runtime de hosting do frontend

**Configuração**: `wrangler.jsonc`
```json
{
  "name": "howmuchlove",
  "compatibility_date": "2026-05-25",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  },
  "compatibility_flags": ["nodejs_compat"]
}
```

**Modo SPA**: `not_found_handling: single-page-application` → qualquer path não encontrado serve `index.html` (essencial para Hash Router funcionar corretamente em reloads)

**Deploy**: `npm run deploy` → `vite build && wrangler deploy`

**Observabilidade**: `observability.enabled: true` (logging/analytics Cloudflare)

---

## INT-004: Google Analytics 4

**Tipo**: Analytics

**Integração**: Script inline no `index.html`
- ID: `G-THDC5T7C7T`
- Carregado de forma assíncrona (`async`)
- Não há evento personalizado disparado pelo código — apenas pageview automático do GA4

---

## INT-005: Mercado Pago (Legado / Removido)

**Status**: Script presente no `index.html` mas sem uso ativo no código:
```html
<script src="https://sdk.mercadopago.com/js/v2" defer></script>
```

**Evidência de remoção**: Migration `20260609020000_cleanup_legacy_payment_app_config.sql` faz cleanup de configurações legadas de pagamento.

> ⚠️ **ATENÇÃO**: O script do Mercado Pago ainda é carregado no HTML mas não tem integração funcional no código. Pode ser removido com segurança do `index.html` se Mercado Pago não for reintroduzido.

---

## INT-006: Google Fonts

**Tipo**: CDN de fontes

**Fontes carregadas**:
- `Dancing Script` (weight 700) — font cursiva
- `Plus Jakarta Sans` (weights 300–800) — font principal
- `Poppins` (weights 300–800) — font fallback

**Otimização**: Usa `rel="preload"` + `media="print" onload` para carregamento não-bloqueante

> **JetBrains Mono** (fonte mono) é definida no Tailwind mas **não está no Google Fonts**. Depende da fonte instalada no sistema do usuário ou de um CDN separado não configurado.

---

## Diagrama de Integrações

```
Browser (React SPA)
    │
    ├──────────── HTTPS ──────────────► Supabase
    │                (JS Client)           ├── Auth JWT
    │                                      ├── PostgreSQL (RLS)
    │                                      ├── Storage (R/O público)
    │                                      └── Edge Functions
    │                                              │
    │                                              ├── save-story ──► Storage (admin)
    │                                              ├── process-payment ──► Stripe API
    │                                              └── stripe-webhook ◄── Stripe Webhooks
    │
    ├──────────── redirect ───────────► Stripe Checkout (hosted)
    │
    ├──────────── script ─────────────► Google Analytics 4
    │
    ├──────────── preload ────────────► Google Fonts CDN
    │
    └──────────── static assets ──────► Cloudflare CDN (dist/)
```
