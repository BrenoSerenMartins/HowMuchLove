# HowMuchLove — Visão Geral do Projeto

## Identidade do Produto

**HowMuchLove** é uma plataforma SaaS B2C voltada para casais. Permite que usuários criem uma "cápsula do tempo digital" personalizada — uma página pública que exibe um contador de tempo do relacionamento, galeria de fotos, mensagem surpresa, música do YouTube e botão de entrada customizado.

O produto funciona como um presente digital: o criador monta a página, compartilha o link (ou um QR Code gerado), e o destinatário acessa publicamente sem precisar de conta. A monetização ocorre via planos pagos (Stripe) que desbloqueiam funcionalidades extras.

- **Domínio**: howmuchlove.com.br
- **Idioma primário da UI**: Português Brasileiro (pt-BR)
- **Modelo de negócio**: Freemium / SaaS com planos pagos (mensal, anual, pagamento único)

---

## Stack Tecnológico

### Frontend
| Tecnologia | Versão | Papel |
|---|---|---|
| React | 18.2 | Framework UI |
| TypeScript | ~5.8 | Tipagem estática |
| Vite | 6.x | Build tool / Dev server |
| TailwindCSS | 3.4 | Estilização utilitária |
| Framer Motion | 12.x | Animações declarativas |
| Lucide React | 1.x | Ícones |
| @dnd-kit | 6.x + 10.x | Drag-and-drop (ordenação de imagens) |
| date-fns | 3.6 | Utilitários de data |
| react-datepicker | 6.9 | Seletor de data |
| qrcode.react | 4.x | Geração de QR Code |

### Backend (Serverless)
| Tecnologia | Papel |
|---|---|
| Supabase | BaaS — Auth, DB (PostgreSQL), Storage, Edge Functions |
| Deno (Supabase Edge Functions) | Runtime das funções serverless |
| Stripe | Gateway de pagamento (checkout, webhooks) |

### Deploy / Infraestrutura
| Tecnologia | Papel |
|---|---|
| Cloudflare Workers / Pages | Hospedagem do frontend (via Wrangler) |
| Supabase Cloud | Hospedagem do backend/banco |

---

## Topologia do Sistema

```
Browser (React SPA)
    │
    ├─ Hash Router (#/rota) ──► NavigationProvider (client-side routing)
    │
    ├─ Supabase JS Client ──► Supabase Auth (sessão JWT)
    │                    └──► PostgreSQL (profiles, love_stories, story_images, plans)
    │                    └──► Storage (bucket: story-images)
    │
    └─ fetch() direto ──────► Supabase Edge Functions (Deno)
                                 ├── save-story         (salvar história + upload de imagens)
                                 ├── get-public-story   (leitura pública sem auth)
                                 ├── get-all-plans      (listagem de planos)
                                 ├── process-payment    (criar Stripe Checkout Session)
                                 ├── verify-public-story-password (verificar senha)
                                 └── stripe-webhook     (receber eventos do Stripe)

Stripe ──► stripe-webhook Edge Function ──► Atualizar profiles no Supabase
```

---

## Características Arquiteturais Chave

1. **SPA com Hash Router**: O projeto NÃO usa React Router DOM. A navegação é feita via `window.location.hash` (ex: `/#/dashboard`). Isso é crítico para o deploy no Cloudflare Workers com `not_found_handling: single-page-application`.

2. **Sem biblioteca de estado global (Redux/Zustand)**: Estado gerenciado exclusivamente via React Context API (3 providers: AuthContext, NavigationContext, NotificationContext).

3. **Lazy Loading de páginas**: Todas as páginas são carregadas com `React.lazy()` + `Suspense` para reduzir o bundle inicial.

4. **Separação de ambiente**: Secrets do Stripe ficam **somente** nas Edge Functions do Supabase. O frontend nunca toca em secrets.

5. **Operação atômica de save**: A função `save-story` usa um procedimento PostgreSQL (`save_story_with_images`) com advisory lock para garantir que cada usuário tenha exatamente uma história (upsert seguro contra race conditions).

6. **Watermark no plano gratuito**: A `PublicStory` exibe uma marca d'água (`StoryWatermark`) quando detecta que o plano do proprietário é gratuito (`isFreePlan(plan)`). Isso é verificado em runtime pelo objeto `plan` retornado pelo backend.

---

## Deployment

- **Dev**: `npm run dev` → Vite dev server (HTTPS via plugin-basic-ssl)
- **Preview**: `npm run preview` → Build + Wrangler local
- **Deploy**: `npm run deploy` → Build + `wrangler deploy` (Cloudflare Workers)
- **Edge Functions**: Deployadas independentemente pelo Supabase CLI

---

## Variáveis de Ambiente (Frontend)

| Variável | Uso |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key do Supabase |
| `VITE_SUPABASE_ANON_KEY` | Alias alternativo da anon key |

> Stripe secrets são configurados nas Edge Functions do Supabase, NUNCA no frontend.
