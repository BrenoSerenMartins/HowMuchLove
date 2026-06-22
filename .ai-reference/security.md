# Segurança

## SEC-001: Autenticação

**Mecanismo**: Supabase Auth (JWT)
- Tokens JWT gerados pelo Supabase Auth
- Sessões persistidas via localStorage (padrão do Supabase JS Client)
- `getSession()` verifica sessão existente no bootstrap da aplicação
- Sessões expiram automaticamente (configurado no Supabase Dashboard)

**Validação no frontend**:
- Guard de rotas em `app/App.tsx` via `useEffect`
- Usuário não autenticado em rota protegida → redirect para `/`
- Usuário autenticado em `/login` ou `/register` → redirect para `/dashboard`

**Validação no backend**:
- `save-story`: Cria user client com auth header → `supabase.auth.getUser()` → rejeita se não autenticado
- `process-payment`: Mesmo padrão com `supabaseAuthClient.auth.getUser()`
- `get-public-story`: Sem autenticação (público)
- `verify-public-story-password`: Sem autenticação (público)
- `stripe-webhook`: Autenticação via assinatura Stripe

---

## SEC-002: Autorização

**Row Level Security (RLS)**:
- Ativado no Supabase (regras configuradas via Supabase Dashboard)
- O frontend acessa `profiles`, `love_stories`, `story_images` via anon key + JWT do usuário
- Cada usuário só pode ler/escrever seus próprios dados

**Validação de plano no backend (serverside enforcement)**:
- A Edge Function `save-story` SEMPRE busca o plano real do usuário no banco
- Não confia no plano enviado pelo cliente
- Revalida limites e permissões de features antes de persistir

**Acesso admin nas Edge Functions**:
- Service Role Key é usada apenas nas Edge Functions, nunca exposta ao frontend
- O cliente admin bypassa RLS para operações administrativas necessárias

---

## SEC-003: Senhas de Histórias

**Algoritmo**: scrypt (`deno.land/x/scrypt@v2.1.1`)
- scrypt é resistente a ataques de força bruta (custo computacional alto)
- A senha original NUNCA é armazenada — apenas o hash
- Verificação via `scrypt.verify(plaintext, hash)` — resistente a timing attacks

**Fluxo de hash**:
1. Nova senha → `scrypt.hash(password)` → persiste hash
2. Manter senha → preserva hash existente (SEM re-hash)
3. Remover senha → persiste `null`

**Proteção contra comparação direta acidental**:
```javascript
// save-story: se a senha enviada já é igual ao hash armazenado, não re-hasha
if (existingStory?.story_password && incomingPassword === existingStory.story_password) {
    passwordToPersist = existingStory.story_password; // mantém hash existente
} else {
    passwordToPersist = await scrypt.hash(incomingPassword); // novo hash
}
```

---

## SEC-004: Verificação de Webhook Stripe

**Implementação manual** (sem SDK Stripe):
1. Extrai `timestamp` e `signatures` (v1=...) do header `Stripe-Signature`
2. Constrói payload: `{timestamp}.{rawBody}`
3. Calcula HMAC-SHA256 com Web Crypto API
4. Compara hex resultante com signatures do header
5. Rejeita se não bater

**Risco**: Não há verificação de replay attack (não valida se timestamp é recente). O Stripe por padrão rejeita events com timestamp > 5 minutos, mas isso é enforcement do Stripe, não da aplicação.

---

## SEC-005: Sanitização de Input

**Nomes de arquivo** (`save-story`):
```javascript
const sanitizeFilename = (filename) => filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
```
- Remove caracteres especiais para evitar path traversal no Storage

**storyId público**:
- Validado contra regex UUID estrita antes de qualquer operação no banco
- Valores inválidos → 404 imediato (sem leak de informação)

**Extração de YouTube videoId** (`PublicStory.tsx`):
```javascript
const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
```
- Valida que videoId tem exatamente 11 caracteres
- Sem validação de XSS além do React's sanitização padrão

---

## SEC-006: Exposição de Dados

**Dados que o backend NUNCA expõe**:
- `story_password` (hash) — nunca retornado em nenhum endpoint público
- Service Role Key — nunca no frontend
- Stripe Secret Key — nunca no frontend
- Senhas de outros usuários

**Dados públicos por design**:
- Conteúdo da história (startDate, message, images, youtubeUrl, entryButtonText)
- Objeto `plan` simplificado do proprietário (necessário para renderizar watermark)
- `requiresPassword: true` (informação mínima para mostrar tela de senha)

---

## SEC-007: CORS

**Edge Functions**: `Access-Control-Allow-Origin: *` (permissivo)

> ⚠️ **Risco Potencial**: CORS aberto (`*`) nas Edge Functions. Para funções autenticadas (`save-story`, `process-payment`), o JWT mitiga o risco (requer token válido). Para funções públicas (`get-public-story`, `verify-public-story-password`), o design é intencionalmente público.

**Frontend**: Servido pelo Cloudflare, sem configuração CORS específica no `wrangler.jsonc`.

---

## SEC-008: Proteção contra Race Conditions

**Advisory Lock no save**:
```sql
PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));
```
- Garante que dois saves simultâneos do mesmo usuário não criem duplicatas
- O lock é por transação (released automaticamente ao fim do commit/rollback)

---

## SEC-009: Variáveis de Ambiente

**Frontend** (expostas no bundle JS — NÃO são secrets):
- `VITE_SUPABASE_URL` — URL pública do projeto
- `VITE_SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_ANON_KEY` — chave anônima pública

**Edge Functions** (Supabase Secrets — nunca acessíveis pelo frontend):
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_ANON_KEY`
- `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

> **REGRA CRÍTICA**: Stripe secrets NUNCA devem ir para o frontend ou para `.env` do Vite. Se necessário, devem ficar nas Supabase Function Secrets.

---

## SEC-010: Vulnerabilidades Potenciais Conhecidas

| Risco | Nível | Mitigação |
|---|---|---|
| CORS aberto nas Edge Functions | Baixo | JWT mitiga para endpoints autenticados |
| storyId = userId UUID (previsibilidade) | Baixo | UUID v4 não é sequencial nem previsível |
| Script Mercado Pago carregado mas inativo | Baixo | Remove do HTML se não há plano de uso |
| Webhook sem validação de replay (timestamp age) | Médio | Stripe já valida no lado deles, mas a app não valida |
| JetBrains Mono não configurada em CDN | N/A (UX) | Fallback para monospace do sistema |
| Toast ID com Math.random (possível colisão) | Muito baixo | Apenas visual, sem impacto de segurança |
