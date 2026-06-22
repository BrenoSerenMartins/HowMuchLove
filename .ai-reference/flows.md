# Fluxos do Sistema

## FLUXO-001: Autenticação — Login

```
Usuário acessa /#/login
    │
    ▼
LoginPage renderiza formulário
    │
    ▼ (submit)
useFormValidator → valida email + password localmente
    │ (erro local)
    ├──► Exibe erro no campo (sem chamar backend)
    │
    │ (válido)
    ▼
AuthProvider.login(email, password)
    │
    ▼
supabase.auth.signInWithPassword()
    │ (erro Supabase)
    ├──► throw new Error(getErrorMessage(error, errorMessages.auth))
    │    └── LoginPage captura → exibe toast de erro
    │
    │ (sucesso)
    ▼
supabase.from('profiles').select('name, plan_id').eq('id', user.id)
    │
    ▼
resolvePlanById(plan_id)
    │ → tenta fetchAllPlans() via Edge Function get-all-plans
    │ → se não encontrar → busca diretamente em plans por id
    │ → se nenhum → retorna defaultGratisPlan
    │
    ▼
processUserSession(user, { name, plan })
    │ → setUser({ id, email, name, plan: plan.name })
    │ → setPlanFeatures(plan)
    │
    ▼
app/App.tsx detecta user != null && route === '/login'
    │
    ▼
navigate('/dashboard')
```

---

## FLUXO-002: Autenticação — Registro

```
Usuário acessa /#/register
    │
    ▼
RegisterPage renderiza formulário (name, email, password, confirmPassword)
    │
    ▼ (submit)
useFormValidator → valida todos os campos
    │
    ▼
AuthProvider.register(name, email, password)
    │
    ▼
supabase.auth.signUp({ email, password, options: { data: { name } } })
    │
    │ NOTA: Um trigger no Supabase cria automaticamente o registro em 'profiles'
    │       com o name do metadata e plan_id = null (Gratis)
    │
    ▼ (sucesso)
processUserSession(user, { name, plan: defaultGratisPlan })
    │ → NÃO busca plan do banco (registro novo sempre é Gratis)
    │
    ▼
navigate('/dashboard')
```

---

## FLUXO-003: Autenticação — Verificação de Sessão (App Bootstrap)

```
App carrega (index.tsx)
    │
    ▼
AuthProvider.verifyAuth() [useEffect na montagem]
    │
    ▼
supabase.auth.getSession()
    │
    ├── sem sessão → setUser(null), setPlanFeatures(defaultGratisPlan), isLoading=false
    │
    └── com sessão ──►
            supabase.from('profiles').select('name, plan_id')
                │
                ▼
            resolvePlanById(plan_id)
                │
                ▼
            processUserSession(session.user, profile)
                │
                ▼
            isLoading=false

Durante isLoading=true → App renderiza LoadingSpinner (tela de espera)
```

---

## FLUXO-004: Autenticação — Logout

```
Usuário clica "Sair" (Header ou Settings)
    │
    ▼
AuthProvider.logout()  [apenas abre modal]
    │ → setShowLogoutConfirm(true)
    │
    ▼
ConfirmModal exibido em app/App.tsx
    │
    ├── Cancelar → setShowLogoutConfirm(false) [fecha modal]
    │
    └── Confirmar ──►
            AuthProvider.performLogout()
                │
                ▼
            supabase.auth.signOut()
                │
                ▼
            setUser(null)
            setPlanFeatures(defaultGratisPlan)
            setShowLogoutConfirm(false)
                │
                ▼
            app/App.tsx detecta user=null → navigate('/')
```

---

## FLUXO-005: Criação e Salvamento da História

```
Usuário autenticado acessa /dashboard
    │
    ▼
DashboardPage.useEffect → loadStory()
    │
    ├── sem história → storyData inicializado com defaults vazios
    │
    └── com história ──►
            supabase.from('love_stories').select(*)
            + supabase.from('story_images').select(*).order('display_order')
            + normalizeLoveStoryData() (normaliza URLs do storage)
            → setStoryData(data)

Usuário edita via CounterDemo (editor)
    │
    ▼ (qualquer mudança)
onDirty() → setIsDirty(true) [ativa guard de navegação]

    │
    ▼ (submit do editor)
handleSaveStory(newData, newFiles, imageIdsToDelete)
    │
    ▼
AuthProvider.saveStory(storyData, newFiles, imageIdsToDelete)
    │
    ▼
GET supabase.auth.getSession() → obtém access_token
    │
    ▼
POST fetch(`${supabaseProjectUrl}/functions/v1/save-story`, {
    Authorization: Bearer {access_token},
    body: FormData {
        storyData: JSON.stringify(storyData),
        imageIdsToDelete: "1,2,3",
        newFiles: [File, File]
    }
})
    │
    ▼ [Edge Function save-story]
    │
    1. Autentica usuário via JWT
    2. Parse FormData
    3. Busca história existente (existingStory)
    4. Busca plano do usuário (profile.plan_id → plans)
    5. Valida constraints do plano
    6. Processa senha (hash scrypt se necessário)
    7. Upload de novos arquivos → Supabase Storage (story-images bucket)
    8. Chama RPC save_story_with_images (transação atômica):
       - Advisory lock por user_id
       - Upsert love_stories
       - DELETE + INSERT story_images
    9. Delete de imagens antigas do storage
    │
    ▼ (sucesso)
loadStory() novamente → atualiza estado com dados do banco
setIsDirty(false)
addToast('Sua história foi salva com sucesso.', 'success')
setIsEditing(false)
```

---

## FLUXO-006: Visualização Pública da História

```
Visitante acessa /#/story/{userId}
    │
    ▼
StoryPage [story/public/Page.tsx]
    │
    ▼
fetchPublicStory(storyId)
    │
    ▼
POST /functions/v1/get-public-story { storyId }
    │ (sem auth header — usa apenas apikey)
    │
    ▼ [Edge Function get-public-story]
    │
    1. resolvePublicStoryUserId(storyId) → valida UUID
    2. SELECT love_stories WHERE user_id = userId
    3. SELECT profiles WHERE id = userId → plan_id
    4. SELECT plans WHERE id = plan_id → plan completo
    5. Se story_password existe:
       └── Retorna { requiresPassword: true, plan }
    6. Se sem senha:
       │
       ▼
       SELECT story_images WHERE story_id = story.id ORDER BY display_order
       └── Retorna dados completos + plan
    │
    ▼ [Frontend]
    │
    ├── requiresPassword = true ──►
    │       Exibe formulário de senha
    │           │ (submit)
    │           ▼
    │       verifyStoryPassword(storyId, password)
    │           │
    │           ▼
    │       POST /functions/v1/verify-public-story-password { storyId, password }
    │           │
    │           ▼
    │       scrypt.verify(password, story_password)
    │           ├── incorreto → 401 "Senha incorreta."
    │           └── correto → Retorna história completa
    │
    └── sem senha ──►
            setStoryData(data)
            │
            ▼
            SE youtubeUrl presente:
                entryTransitionState = 'visible'
                Exibe tela de entrada "Pronto para se emocionar?"
                    │ (clique no botão)
                    ▼
                startEntryTransition()
                    setHasEntered(true)
                    setIsMuted(false)
                    entryTransitionState = 'fading' → 'hidden' (após 2000ms)
            │
            ▼
            PublicStory renderiza:
            - StoryHero (imagens + contador de tempo)
            - StoryMessage (mensagem)
            - YouTubePlayer (se youtubeUrl)
            - StoryFloatingControls (mute button, upgrade CTA se plano gratuito)
            - StoryWatermark (se isFreePlan(plan))
```

---

## FLUXO-007: Fluxo de Checkout (Upgrade de Plano)

```
Usuário autenticado acessa /settings → aba "Assinatura"
    │
    ▼
fetchAllPlans() → invoca Edge Function get-all-plans
    │
    ▼
PricingSection renderiza planos (filtrado por show_on_pricing_page=true)
    │
    ▼
Usuário clica em plano → handlePlanSelected({ id, name, amount })
    │
    ▼
supabase.functions.invoke('process-payment', { body: { planId } })
    │
    ▼ [Edge Function process-payment]
    │
    1. Autentica usuário
    2. Valida planId
    3. Busca plan no DB: is_active, show_on_pricing_page, billing_provider='stripe', billing_price_id
    4. Busca billing_customer_id do usuário (se já existe no Stripe)
    5. Determina mode: 'subscription' ou 'payment' (one-time)
    6. Cria Stripe Checkout Session via POST /v1/checkout/sessions
       - success_url: {frontendUrl}/#/payment-success
       - cancel_url: {frontendUrl}/#/payment-failure
       - metadata inclui user_id e plan_id
    7. Retorna { url }
    │
    ▼ [Frontend]
    window.location.href = url  (redireciona para Stripe)
    │
    ▼ [Stripe Checkout]
    │
    ├── Abandono → cancel_url → /#/payment-failure
    ├── Pendente → /#/payment-pending
    └── Sucesso → success_url → /#/payment-success
                    │
                    [Stripe Webhook → stripe-webhook Edge Function]
                    │
                    ▼
                    Evento checkout.session.completed
                    → Atualiza profiles: plan_id, billing_customer_id,
                      billing_subscription_id, billing_status, etc.
```

---

## FLUXO-008: Preview da História no Dashboard

```
Usuário está no Dashboard com história salva
    │
    ▼
Clica "Ver prévia" → setIsPreviewing(true)
    │
    ▼
setPreviewMode(true) no NavigationContext
    │ → Header e Footer desaparecem (showHeaderFooter = false quando isPreviewMode)
    │
    ▼
DashboardPage renderiza em modo fullscreen:
    <div fixed inset-0 z-[10000]>
        <PublicStory storyData={...} isPreview={true} hasEntered={true} isMuted={true} />
        <button "Voltar ao Dashboard">
    </div>
    │
    ▼
Usuário clica "Voltar ao Dashboard"
    → setIsPreviewing(false)
    → setPreviewMode(false)
    → fetchStory() é re-executado (isPreviewing mudou)
```

---

## FLUXO-009: Modo de Edição no Dashboard (Live Preview)

```
Usuário clica "Editar história" → setIsEditing(true)
    │
    ▼
Dashboard renderiza layout 2 colunas (xl:grid-cols-2):
    Coluna Esquerda: CounterDemo (editor)
    Coluna Direita:  DashboardPreviewPane (monitor)
    │
    ▼
CounterDemo emite onPreviewDataChange(data)
    → setEditorPreviewData(data)
    → DashboardPreviewPane recebe storyData atualizado em tempo real
    │
    ▼
Usuário salva → handleSaveStory() → setIsEditing(false)
    OU
Usuário cancela → setIsEditing(false)
```

---

## FLUXO-010: Geração e Compartilhamento do QR Code

```
DashboardActions exibe botão "Compartilhar"
    │
    ▼
Usuário clica → setIsQrModalOpen(true)
    │
    ▼
QRCodeModal renderiza:
    - QR Code gerado por qrcode.react com o shareLink
    - shareLink = `${baseUrl}#/story/${encodeURIComponent(userId)}`
    │
    ├── Download QR Code (como PNG via canvas)
    ├── Web Share API (navigator.share se disponível)
    └── Copiar link (navigator.clipboard.writeText)
```
