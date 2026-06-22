# Regras de Negócio

## RN-001: Modelo de Planos

### Plano Gratuito ("Gratis")
- **Definição**: `id: 0`, `external_id: 'gratis'`, `billing_provider: 'manual'`
- **Limites**: 1 imagem, sem YouTube, sem senha, sem botão customizado, sem compartilhamento público
- **Criação implícita**: Todo usuário novo recebe automaticamente o plano Gratis por default
- **Identificação**: A função `isFreePlan()` verifica por `id === 0`, `name === 'gratis'`, `external_id === 'gratis'` (case-insensitive, sem diacríticos)
- **Hardcoded no frontend**: `defaultGratisPlan` em `shared/lib/plans.ts` — não depende de busca no banco

### Planos Pagos (seed atual)
| ID | Nome | Tipo | Preço | Imagens | YouTube | Senha | Botão Custom |
|---|---|---|---|---|---|---|---|
| 1 | Sonho | subscription | R$ 4,90/mês | 1 | ✗ | ✗ | ✗ |
| 2 | Eterno | subscription | R$ 29,90/ano | 5 | ✓ | ✓ | ✓ |
| 3 | Infinito | one-time | R$ 49,90 | 10 | ✓ | ✓ | ✓ |
| 7 | Gratis | one-time | R$ 0,00 | 1 | ✗ | ✗ | ✗ |

> **Atenção**: Os limites acima (ex: Eterno com 5 imagens) são os valores base na tabela. O campo `feature_rules` (JSONB) pode **sobrescrever** qualquer limite individual por plano.

---

## RN-002: Prioridade de Feature Rules (CRÍTICA)

As capabilities de um plano são resolvidas em **dupla camada de prioridade**:

```
1. feature_rules (JSONB) → tem PRIORIDADE sobre qualquer campo base
2. Campos base (image_limit, allow_youtube, etc.) → fallback se feature_rules não define
```

**Exemplo real de resolução** (via `resolvePlanCapabilities()` em `shared/lib/plans.ts`):
```
plan.image_limit = 5
plan.feature_rules = { image_limit: 10 }
→ imageLimit efetivo = 10  (feature_rules vence)
```

**Implicação**: Ao editar limites de planos, editar `feature_rules` tem precedência sobre os campos base. Ao verificar capabilities no backend (save-story), a mesma lógica é replicada em `normalizePlanFeatures()`.

---

## RN-003: Capacidade de Compartilhamento

- Um usuário **somente pode compartilhar** sua história se não estiver no plano gratuito
- A função `canShareStory()` verifica:
  1. Se `feature_rules.can_share_story` existe → usa esse valor
  2. Se não → `!isFreePlan(plan)` (qualquer plano pago pode compartilhar)
- O link de compartilhamento usa o **UUID do usuário** como storyId público: `/#/story/{userId}`
- O Dashboard só exibe o botão de compartilhamento e o QR Code se `shareLink` estiver definido (ou seja, história salva com `startDate` + usuário com plano que permite sharing)

---

## RN-004: Regras de Validação ao Salvar História

Aplicadas na Edge Function `save-story` (serverside, não apenas no frontend):

1. **Limite de imagens**: `storyData.images.length > plan.image_limit` → erro
2. **YouTube sem permissão**: `!plan.allow_youtube && nextYoutubeUrl` → erro
3. **Botão customizado sem permissão**: `!plan.allow_custom_button && nextEntryButtonText` → erro
4. **Senha sem permissão**:
   - Tentativa de definir nova senha sem permissão → erro
   - Manter senha existente sem permissão → erro (proteção contra downgrade silencioso)

> **CRÍTICO**: O backend SEMPRE revalida o plano do usuário. Um usuário que fizer downgrade não pode manter configurações que seu novo plano não permite.

---

## RN-005: Gerenciamento de Senha da História

A senha é criptografada com **scrypt** (biblioteca `deno.land/x/scrypt@v2.1.1`):

- **Definir senha nova**: hash scrypt gerado e persiste no `story_password`
- **Manter senha existente**: campo `storyPassword` vazio no payload → preserva `existingStory.story_password`
- **Remover senha**: campo `removePassword: true` no payload → persiste `null`
- **Otimização**: Se a senha enviada já for igual ao hash existente (comparação direta de string), não re-hasha (evita duplo hashing acidental)

> **ATENÇÃO**: A senha nunca é retornada para o frontend. O campo `storyPassword` no `LoveStoryData` carregado sempre é `''` e `requiresPassword` é um booleano inferido.

---

## RN-006: Fluxo de Pagamento

1. Usuário seleciona plano na tela de Settings → `handlePlanSelected(plan)`
2. Frontend invoca `process-payment` Edge Function com `{ planId }`
3. Edge Function valida:
   - Plano existe e está ativo (`is_active = true`)
   - Plano está visível na pricing page (`show_on_pricing_page = true`)
   - Plano usa Stripe como provider (`billing_provider = 'stripe'`)
   - Plano tem `billing_price_id` configurado
4. Cria Stripe Checkout Session (subscription ou one-time payment)
5. Retorna `{ url }` → frontend redireciona para Stripe Checkout
6. Após pagamento, Stripe envia webhook para `stripe-webhook` Edge Function
7. Webhook atualiza `profiles` com `plan_id` e dados de billing

---

## RN-007: Atualização de Plano via Webhook Stripe

Eventos tratados pelo `stripe-webhook`:

| Evento Stripe | Ação no sistema |
|---|---|
| `checkout.session.completed` | Atualiza `plan_id`, dados de billing no profiles |
| `customer.subscription.updated` | Atualiza plan_id e status da subscription |
| `customer.subscription.deleted` | Downgrade para plano Gratis, status = 'canceled' |
| `invoice.paid` | Mantém plan_id ativo, atualiza status |
| `invoice.payment_failed` | Atualiza status = 'past_due' |

**Resolução de plano**: O webhook tenta resolver o plano por `billing_price_id` no Stripe. Se não encontrar, tenta por `plan_id` do metadata. Se nenhum funcionar, downgrade para Gratis.

**Resolução de profile**: O webhook identifica o usuário por (em ordem de prioridade):
1. `metadata.user_id` da session/subscription
2. `client_reference_id` da session  
3. `billing_subscription_id` no profiles
4. `billing_customer_id` no profiles

---

## RN-008: Atomicidade do Save de História

O save usa um procedimento PostgreSQL atômico (`save_story_with_images`):

1. Adquire **advisory lock** no `user_id` (evita race conditions de concorrência)
2. **Upsert** da história: INSERT se não existe, UPDATE se existe
3. **DELETE + INSERT** das imagens: substitui todas as imagens de uma vez
4. Operação toda é transacional (ACID)

**Implicação de design**: O estado das imagens é SEMPRE o array completo enviado. Não existe "adicionar imagem incremental" — toda edição envia o estado final completo.

---

## RN-009: Identificação Pública de Histórias

- O storyId público é o **UUID do usuário** (`user_id` na tabela `profiles`/`love_stories`)
- O URL público é: `#/story/{userId}` (com `encodeURIComponent`)
- O backend valida o storyId com regex UUID: `/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`
- Qualquer valor que não seja UUID válido retorna 404

**Implicação de segurança**: O userId (UUID) é a "chave" pública da história. Não há segurança por obscuridade além da proteção por senha opcional.

---

## RN-010: Proteção por Senha na Visualização Pública

1. `get-public-story` é chamado sem autenticação
2. Se `storyData.story_password` existe → retorna `{ requiresPassword: true }` (sem dados da história)
3. Frontend exibe formulário de senha
4. Usuário submete senha → `verify-public-story-password` é chamado
5. Backend faz `scrypt.verify(password, storedHash)` — comparação segura
6. Se correto → retorna história completa; se errado → retorna 401

---

## RN-011: Marca d'Água no Plano Gratuito

- A `PublicStory` recebe o objeto `plan` na resposta do backend
- Se `isFreePlan(plan)` → renderiza `StoryWatermark`
- A marca d'água é decisão do **frontend**, mas a origem da informação é o **backend**
- O backend envia o objeto `plan` completo na resposta das funções públicas

---

## RN-012: Plano "show_on_pricing_page"

- Planos com `show_on_pricing_page = false` NÃO aparecem na listagem pública
- Planos de teste (IDs 8 e 9) têm `show_on_pricing_page = false`
- O `process-payment` Edge Function bloqueia tentativas de comprar planos com `show_on_pricing_page = false`
- O plano Gratis (ID 7) tem `show_on_pricing_page = false` (não aparece como opção de compra)

---

## RN-013: Guard de Navegação com Dirty State

- O `CounterDemo` (editor) chama `setIsDirty(true)` quando o usuário modifica dados
- Se `isDirty = true` e o usuário tenta navegar → modal de confirmação aparece
- Se confirmado → `isDirty` volta para `false` e navegação prossegue
- `isDirty` é resetado para `false` após save bem-sucedido
