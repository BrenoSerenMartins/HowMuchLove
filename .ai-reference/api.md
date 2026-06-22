# API — Edge Functions

## Visão Geral

Todas as Edge Functions rodam em Deno (Supabase Edge Functions). São deployadas separadamente do frontend.

**Base URL**: `{SUPABASE_URL}/functions/v1/{function-name}`

**CORS**: Todas as funções aceitam qualquer origin (`Access-Control-Allow-Origin: *`) e tratam OPTIONS para pre-flight.

---

## EF-001: `save-story`

**Propósito**: Salvar (criar ou atualizar) a história do usuário autenticado.

**Autenticação**: Requerida (Bearer token JWT do Supabase)

**Método**: `POST`

**Content-Type**: `multipart/form-data`

**Request Body** (FormData):
| Campo | Tipo | Descrição |
|---|---|---|
| `storyData` | string (JSON) | Dados da história serializado |
| `imageIdsToDelete` | string | IDs separados por vírgula de imagens a deletar |
| `newFiles` | File[] | Novos arquivos de imagem |

**`storyData` JSON shape**:
```json
{
  "startDate": "2023-01-15T00:00:00.000Z",
  "message": "Texto da mensagem",
  "images": [
    { "image_url": "https://...", "story_id": 1, "display_order": 0 },  // existente
    { "originalFilename": "foto.jpg" }  // nova (sem story_id)
  ],
  "layoutPosition": "bottom",
  "youtubeUrl": "https://youtube.com/...",
  "entryButtonText": "Entrar",
  "storyPassword": "nova_senha",
  "removePassword": false
}
```

**Response** (200):
```json
{ "storyId": 42 }
```

**Erros possíveis**:
- `"Seu plano atual permite no máximo X foto(s)."` — limite de imagens
- `"Seu plano atual não permite vídeo no fundo."` — YouTube bloqueado
- `"Seu plano atual não permite botão personalizado."` — botão bloqueado
- `"Seu plano atual não permite proteção por senha."` — senha bloqueada
- `"Missing Authorization header"` — sem auth
- `"Unauthorized"` — token inválido

**Limpeza em caso de erro**: Se upload foi feito mas RPC falhou → arquivos do storage são removidos automaticamente.

---

## EF-002: `get-public-story`

**Propósito**: Buscar dados de uma história para exibição pública (sem autenticação).

**Autenticação**: Não requerida (usa anon key apenas para identificação)

**Método**: `POST` (ou `GET` com query param `?storyId=`)

**Request Body**:
```json
{ "storyId": "uuid-do-usuario" }
```

**Response** (200) — história pública sem senha:
```json
{
  "startDate": "2023-01-15T00:00:00.000Z",
  "message": "Texto",
  "images": [{ "id": 1, "image_url": "https://...", "display_order": 0, "story_id": 42 }],
  "layoutPosition": "bottom",
  "youtubeUrl": null,
  "entryButtonText": null,
  "plan": { "id": 2, "name": "Eterno", ... }
}
```

**Response** (200) — história com senha:
```json
{ "requiresPassword": true, "plan": { ... } }
```

**Response** (404) — não encontrada:
```json
{ "message": "História não encontrada." }
```

**Lógica de resolução**:
- `storyId` deve ser um UUID válido
- Busca por `love_stories.user_id = storyId` (o userId É o storyId)
- Busca plano do perfil associado
- Nunca expõe `story_password` no response

---

## EF-003: `verify-public-story-password`

**Propósito**: Verificar senha de história protegida e retornar dados completos se correta.

**Autenticação**: Não requerida (anon)

**Método**: `POST`

**Request Body**:
```json
{ "storyId": "uuid", "password": "senha-digitada" }
```

**Response** (200) — senha correta:
```json
{
  "startDate": "...",
  "message": "...",
  "images": [...],
  "layoutPosition": "...",
  "youtubeUrl": "...",
  "entryButtonText": "...",
  "plan": { ... }
}
```

**Errors**:
- `400` — `{ "message": "Esta história não requer senha." }`
- `401` — `{ "message": "Senha incorreta." }`
- `404` — `{ "message": "História não encontrada." }`

**Verificação de senha**: `scrypt.verify(plaintext, hash)` — resistente a timing attacks.

---

## EF-004: `get-all-plans`

**Propósito**: Listar todos os planos visíveis na pricing page.

**Autenticação**: Opcional (usa o token do header se presente)

**Método**: `GET` ou `POST`

**Response** (200):
```json
[
  {
    "id": 2,
    "name": "Eterno",
    "price": 29.90,
    "image_limit": 5,
    "allow_youtube": true,
    "allow_password_protection": true,
    "allow_custom_button": true,
    "features": ["Tudo do plano Sonho, e mais:", ...],
    "billing_cycle": "anual",
    "billing_provider": "stripe",
    "billing_product_id": "prod_...",
    "billing_price_id": "price_...",
    "feature_rules": {},
    "is_featured": true,
    "is_active": false,
    "show_on_pricing_page": true
  }
]
```

**Filtro**: Apenas planos com `show_on_pricing_page = true`, ordenados por `price ASC`.

---

## EF-005: `process-payment`

**Propósito**: Criar uma Stripe Checkout Session para upgrade de plano.

**Autenticação**: Requerida (Bearer JWT)

**Método**: `POST`

**Request Body**:
```json
{ "planId": 2 }
```

**Response** (200):
```json
{
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_..."
}
```

**Validações**:
1. `planId` válido e numérico
2. Plano existe no banco
3. `is_active = true`
4. `show_on_pricing_page = true`
5. `billing_provider = 'stripe'`
6. `billing_price_id` não nulo

**Modo de checkout**:
- `type = 'subscription'` → `mode: 'subscription'`
- `type = 'one-time'` → `mode: 'payment'`

**URLs de retorno** (dinâmicas):
- Detecta origin via `Origin` header ou `Referer` header
- Fallback para `FRONTEND_URL` em `app_config`
- `success_url`: `{frontendUrl}/#/payment-success`
- `cancel_url`: `{frontendUrl}/#/payment-failure`

**Metadados no Stripe**:
- `user_id`, `plan_id`, `plan_name`, `billing_provider`, `billing_price_id`, `billing_product_id`

---

## EF-006: `stripe-webhook`

**Propósito**: Receber e processar eventos do Stripe para sincronizar billing.

**Autenticação**: Verificação de assinatura Stripe (HMAC-SHA256)

**Método**: `POST`

**Headers requeridos**: `Stripe-Signature`

**Eventos tratados**:

| Evento | Ação |
|---|---|
| `checkout.session.completed` | Atualiza plan_id + billing data no profiles |
| `customer.subscription.updated` | Atualiza plano e status da subscription |
| `customer.subscription.deleted` | Downgrade para Gratis, status = 'canceled' |
| `invoice.paid` | Mantém plano, atualiza status para ativo |
| `invoice.payment_failed` | Atualiza status para 'past_due' |

**Outros eventos**: Retornam `{ ok: true, ignored: true, reason: 'event_not_supported' }` com status 200.

**Resolução de profile**: Tenta identificar o usuário por (em ordem):
1. `metadata.user_id` ou `client_reference_id`
2. `billing_subscription_id` no profiles
3. `billing_customer_id` no profiles

**Se profile não encontrado**: Retorna 200 com `{ ignored: true, reason: 'profile_not_found' }` (não erro — Stripe não precisa re-enviar).

---

## Utilitários Compartilhados das Edge Functions (_shared/)

### `cors.ts`
```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
```

### `env.ts`
Abstração para leitura de variáveis de ambiente Deno:
- `getSupabaseUrl()` → `SUPABASE_URL`
- `getSupabasePublishableKey()` → `SUPABASE_PUBLISHABLE_KEY` ou `SUPABASE_ANON_KEY`
- `getSupabaseSecretKey()` → `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY`
- `getStripeSecretKey()` → `STRIPE_SECRET_KEY`
- `getStripeWebhookSecret()` → `STRIPE_WEBHOOK_SECRET`

### `errors.ts`
- `createErrorResponse(scope, error, headers, status)` → Response padronizada `{ error: message }`
- `logEdgeError(scope, error, context)` → `console.error` com contexto estruturado
- `getEdgeErrorMessage(error)` → extrai mensagem de string, Error, ou objeto

### `stripe.ts`
- `stripeRequest<T>(apiKey, path, init)` → Wrapper para Stripe API REST
- `buildStripeForm(entries)` → Constrói URLSearchParams para requisições Stripe
- `verifyStripeWebhookSignature({ payload, signatureHeader, secret })` → Verificação HMAC-SHA256 manual (sem SDK Stripe)

### `public-story.ts`
- `resolvePublicStoryUserId(storyKey)` → Valida e decodifica o storyId; retorna UUID ou null

---

## Invocação do Frontend

O frontend usa duas formas de chamar as Edge Functions:

**Via Supabase client** (preferido para autenticado):
```typescript
supabase.functions.invoke('get-all-plans')
supabase.functions.invoke('process-payment', { body: { planId } })
```

**Via fetch direto** (para público ou multipart):
```typescript
fetch(`${supabaseProjectUrl}/functions/v1/save-story`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${session.access_token}` },
  body: formData
})

fetch(`${supabaseProjectUrl}/functions/v1/get-public-story`, {
  method: 'POST',
  headers: {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ storyId })
})
```
