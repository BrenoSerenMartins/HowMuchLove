# Banco de Dados

## Tecnologia
- **SGBD**: PostgreSQL (gerenciado pelo Supabase)
- **ORM**: Nenhum — queries diretas via `@supabase/supabase-js`
- **RLS (Row Level Security)**: Ativado (gerenciado pelo Supabase)

---

## Tabelas Principais

### `profiles`
Perfil do usuário, sincronizado com `auth.users` via trigger Supabase.

| Coluna | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK, FK → auth.users | ID do usuário (mesmo do Supabase Auth) |
| `name` | text | NOT NULL | Nome do usuário |
| `plan_id` | integer | FK → plans.id | Plano atual (NULL = Gratis implícito) |
| `billing_provider` | text | NOT NULL DEFAULT 'manual' | Provider de billing atual |
| `billing_customer_id` | text | NULL | ID do customer no Stripe |
| `billing_subscription_id` | text | NULL | ID da subscription no Stripe |
| `billing_price_id` | text | NULL | ID do price ativo no Stripe |
| `billing_status` | text | NULL | Status do billing (active, past_due, canceled, etc.) |
| `billing_current_period_end` | timestamptz | NULL | Fim do período atual da subscription |
| `billing_cancel_at_period_end` | boolean | NOT NULL DEFAULT false | Se vai cancelar no fim do período |

**Observações**:
- `plan_id = NULL` é tratado como Gratis (via `defaultGratisPlan`)
- A relação entre `profiles.id` e `auth.users.id` é 1:1
- O trigger de criação do profile é responsabilidade do Supabase (não está no código da aplicação)

---

### `love_stories`
A história de amor criada por cada usuário (1 por usuário).

| Coluna | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | bigint | PK, serial | ID interno da história |
| `user_id` | uuid | FK → profiles.id, UNIQUE | Proprietário (1 história por usuário) |
| `start_date` | timestamptz | NULL | Data de início do relacionamento |
| `story_text` | text | NULL | Mensagem surpresa |
| `layout_position` | text | NULL | Posição do contador: 'top', 'center', 'bottom' |
| `youtube_url` | text | NULL | URL do vídeo do YouTube |
| `entry_button_text` | text | NULL | Texto customizado do botão de entrada |
| `story_password` | text | NULL | Hash scrypt da senha (ou NULL se sem senha) |

**Constraints implícitas**:
- A constraint UNIQUE em `user_id` garante que cada usuário tem no máximo 1 história
- A RPC `save_story_with_images` usa advisory lock + UNIQUE para garantir atomicidade

---

### `story_images`
Imagens associadas a uma história (ordem explícita por display_order).

| Coluna | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | bigint | PK, serial | ID da imagem |
| `story_id` | bigint | FK → love_stories.id | História associada |
| `image_url` | text | NOT NULL | URL pública no Supabase Storage |
| `display_order` | integer | NOT NULL | Posição (0-indexed) para ordenação |

**Observações**:
- Imagens são SEMPRE deletadas e re-inseridas no save (substituição total, não diff)
- `display_order` começa em 0 (calculado como `image_index - 1` na RPC)
- URLs seguem o padrão: `{SUPABASE_URL}/storage/v1/object/public/story-images/{userId}/{storyId|new}/{timestamp}-{filename}`

---

### `plans`
Planos de assinatura disponíveis.

| Coluna | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | integer | PK | ID do plano |
| `name` | text | NOT NULL, UNIQUE | Nome do plano (ex: 'Eterno') |
| `price` | numeric | NOT NULL | Preço em BRL |
| `external_id` | text | NULL | ID externo (para referência interna ou legado) |
| `billing_provider` | text | NOT NULL DEFAULT 'manual' | 'manual', 'stripe', etc. |
| `billing_product_id` | text | NULL | ID do produto no Stripe |
| `billing_price_id` | text | NULL | ID do price no Stripe |
| `type` | text | NULL | 'subscription' ou 'one-time' |
| `created_at` | timestamptz | | |
| `image_limit` | integer | NOT NULL | Limite de imagens (base) |
| `allow_youtube` | boolean | NOT NULL | Permite YouTube (base) |
| `allow_password_protection` | boolean | NOT NULL | Permite senha (base) |
| `allow_custom_button` | boolean | NOT NULL | Permite botão customizado (base) |
| `feature_rules` | jsonb | NOT NULL DEFAULT '{}' | Overrides de features (prioridade sobre base) |
| `is_active` | boolean | NULL | Se o plano está ativo |
| `is_featured` | boolean | NULL | Se é o plano "Popular" |
| `show_on_pricing_page` | boolean | NOT NULL DEFAULT true | Se aparece na listagem pública |
| `features` | text[] | NULL | Array de strings com bullets de features para UI |
| `billing_cycle` | text | NULL | Texto do ciclo ('mês', 'anual', 'Pagamento único') |
| `duration_days` | integer | NULL | Duração em dias (para planos temporários) |
| `description` | text | NULL | Descrição interna |
| `is_landing_offer` | boolean | NULL | Se é oferta especial na landing |

---

### `app_config`
Configurações da aplicação (chave-valor).

| Coluna | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | integer | PK | |
| `key` | text | UNIQUE | Nome da configuração |
| `value` | text | | Valor |
| `created_at` | timestamptz | | |

**Registros conhecidos**:
- `FRONTEND_URL` = `http://localhost:5173` (seed local) / URL de produção em prod

---

## Storage

### Bucket `story-images`
- **Tipo**: Public bucket
- **Visibilidade**: Pública (URLs acessíveis sem autenticação)
- **Estrutura de paths**: `{userId}/{storyId|'new'}/{timestamp}-{sanitizedFilename}`
- **Sanitização de filename**: `filename.replace(/[^a-zA-Z0-9_.-]/g, '_')`
- **Sem limit de tamanho** (null no seed)
- **MIME types**: Nenhuma restrição definida (null)

---

## Funções SQL (Procedures / RPCs)

### `save_story_with_images`
- **Arquivo**: `supabase/migrations/20260608000000_save_story_atomic.sql`
- **Assinatura**: `(p_user_id, p_start_date, p_story_text, p_layout_position, p_youtube_url, p_entry_button_text, p_story_password, p_images jsonb) RETURNS bigint`
- **Comportamento**:
  1. `pg_advisory_xact_lock(hashtext(p_user_id::text))` — lock por usuário
  2. SELECT id FROM love_stories WHERE user_id = p_user_id LIMIT 1
  3. IF NULL → INSERT; ELSE → UPDATE
  4. DELETE FROM story_images WHERE story_id = v_story_id
  5. INSERT INTO story_images (SELECT de jsonb_array_elements)
  6. RETURN v_story_id
- **Garantias**: ACID, atomicidade, prevenção de race conditions

---

## Migrations (Ordem Cronológica)

| Arquivo | O que faz |
|---|---|
| `20251117024849_add_show_on_pricing_to_plans.sql` | Adiciona `show_on_pricing_page` à tabela plans |
| `20260608000000_save_story_atomic.sql` | Cria a RPC `save_story_with_images` |
| `20260609000000_add_plan_integration_metadata_and_feature_rules.sql` | Adiciona `billing_provider`, `billing_product_id`, `billing_price_id`, `feature_rules` à tabela plans |
| `20260609010000_add_stripe_billing_fields_to_profiles.sql` | Adiciona campos de billing à tabela profiles |
| `20260609020000_cleanup_legacy_payment_app_config.sql` | Limpeza de configurações legadas de pagamento |

---

## Relacionamentos

```
auth.users (Supabase)
    │ 1:1 (trigger)
    ▼
profiles
    │ FK plan_id
    ├──────────────────► plans
    │                       │ (feature_rules JSONB — override de limites)
    │
    │ 1:1 (UNIQUE user_id)
    ▼
love_stories
    │ FK story_id
    │ 1:N
    ▼
story_images
    (arquivos físicos em storage.buckets/story-images)
```

---

## Normalização de URLs do Storage

**Problema**: A URL base do Supabase pode mudar entre ambientes (local vs. prod).

**Solução** (`shared/lib/storage.ts`):
```typescript
normalizeSupabaseStorageUrl(url)
```
- Detecta URLs do pattern `/storage/v1/object/public/`
- Substitui a origin pelo `VITE_SUPABASE_URL` atual
- Garante que URLs salvas em ambiente diferente ainda funcionem

**Quando é chamada**: `normalizeLoveStoryData()` → chamada em todo load de história (tanto no `AuthProvider.loadStory` quanto na `story-api.ts`).
