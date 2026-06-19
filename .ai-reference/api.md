# Documentação da API

Devido à arquitetura adotada, o HowMuchLove não possui uma API tradicional baseada em rotas com documentação Swagger/OpenAPI. O contrato da API é, de fato, a exposição do esquema de banco de dados do PostgreSQL através do **PostgREST** integrado no cliente do **Supabase**.

## Cliente de API e Roteamento Oculto

O arquivo central de conexão é `shared/lib/supabase.ts`. Ele expõe o singleton `supabase`, inicializado através de duas chaves de ambiente:
- `VITE_SUPABASE_URL`: O endpoint do provedor BaaS (ex: `https://xxx.supabase.co`).
- `VITE_SUPABASE_PUBLISHABLE_KEY` ou `VITE_SUPABASE_ANON_KEY`: A chave pública restrita.

## Contratos DTO Conhecidos (`types.ts`)

O arquivo raiz de tipos dita os contratos de payload. O frontend molda o JSON exatamente como exigido pela base de dados subjacente.

### 1. Payload de Story (Salvar/Recuperar)
Ao fazer operações na História (Cápsula), o SDK espera um objeto compatível com a interface `LoveStoryData`.
```typescript
interface LoveStoryData {
  id?: number;
  startDate: string | null;
  message: string;
  images: StoryImage[];
  layoutPosition?: 'top' | 'center' | 'bottom';
  youtubeUrl?: string;
  storyPassword?: string;
  removePassword?: boolean;
  requiresPassword?: boolean;
  entryButtonText?: string;
}
```

### 2. Payload de Galeria de Imagens
```typescript
interface StoryImage {
  id: number;
  image_url: string;
  display_order: number;
}
```

### 3. Recuperação Dinâmica de Planos
```typescript
interface PlanFeatures {
  id: number;
  name: string;
  image_limit: number;
  allow_youtube: boolean;
  allow_password_protection: boolean;
  allow_custom_button: boolean;
  price: number;
  billing_cycle: string | null;
}
```

## Categorias de Requests de API Ativas

### 1. Autenticação (Auth)
Operações encapsuladas no `useAuth` hook.
- **Login/Register:** Aciona a API GoTrue subjacente (`supabase.auth.signInWithPassword`, etc.).

### 2. Domain Data Mutation (Banco de Dados)
Isso ocorre nos arquivos de biblioteca compartilhada (`shared/lib/story-api`).
- **Salvar História:** Transação atômica que pode submeter dados de mídia e dados em lote. Pode chamar funções RPC personalizadas (ex: `supabase.rpc('save_story_atomic', payload)`).
- **Fetch Público de História:** Uma chamada explícita `fetchPublicStory(storyId)` que aciona um `SELECT` otimizado para visitantes. Acesso livre apenas às histórias que dispensam restrição pesada, e omite dados sigilosos por padrão (via RLS).
- **Verificação de Senha:** `verifyStoryPassword(storyId, password)`. Devido a razões óbvias de segurança, a senha NUNCA é checada pelo frontend. Ela invoca uma API que roda no Supabase PostgREST ou numa Edge Function para aplicar hashing, validar a igualdade, e se for bem sucedida, então devolve o objeto integral da História.

### 3. Chamadas a Edge Functions (`supabase.functions.invoke`)
- **Rota Invocada:** `process-payment`
  - **Payload Enviado:** `{ body: { planId: number, planName: string } }`
  - **Resposta Esperada:** Sucesso `200` contento a URL do gateway (ex: `{ url: "https://checkout.stripe.com/..." }`).
  - **Tratamento de Erros:** O frontend aguarda e interpreta explicitamente códigos de erro para exibir `uiCopy.payment.genericError`.
