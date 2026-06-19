# Dependências do Projeto

## Dependências de Produção (`dependencies`)

| Pacote | Versão | Propósito | Impacto Arquitetural |
| :--- | :--- | :--- | :--- |
| `react` & `react-dom` | `^18.2.0` | Framework Core da UI. | Fundamental. Dita todo o modelo de ciclo de vida e estado. |
| `@supabase/supabase-js` | `^2.81.1` | SDK do Backend as a Service. | Crítico. Única ponte de comunicação para Autenticação, Banco de Dados e Storage. |
| `framer-motion` | `^12.40.0` | Biblioteca de Animação. | Alto. Quase toda view usa `<motion.div>` e `<AnimatePresence>`. Remoção quebraria as transições essenciais do projeto. |
| `@dnd-kit/core`, `sortable`, `utilities` | `v6+ / v10+` | Drag and Drop modular. | Médio. Usado na ordenação customizada de fotos da cápsula do tempo (galeria). |
| `date-fns` | `3.6.0` | Manipulação e formatação de datas. | Alto. O "Coração" do negócio é um *Contador de Tempo*. É usado para calcular exatos anos, meses, dias, horas, minutos e segundos. |
| `react-datepicker` | `6.9.0` | Componente de input de data. | Médio. Usado no editor do Story para selecionar a `startDate`. |
| `lucide-react` | `^1.17.0` | Sistema de ícones. | Baixo impacto lógico, alto impacto visual. Fornece ícones em SVG otimizados. |
| `qrcode.react` | `^4.2.0` | Geração de QR Code no canvas. | Médio. Permite o compartilhamento "Premium" físico/digital do link gerado da História. |

## Dependências de Desenvolvimento (`devDependencies`)

| Pacote | Versão | Propósito |
| :--- | :--- | :--- |
| `vite` | `^6.2.0` | Bundler e Dev Server super rápido. |
| `@vitejs/plugin-react` | `^5.0.0` | Plugin Vite para pipeline do React (Fast Refresh). |
| `@vitejs/plugin-basic-ssl` | `^2.1.0` | Habilita HTTPS local (necessário para testes com certas APIs como PWA ou Stripe em ambientes locais rigorosos). |
| `tailwindcss`, `postcss`, `autoprefixer` | `^3.4.x / 8.5.x` | Engine CSS utilitária responsável pela identidade visual da aplicação. |
| `typescript` | `~5.8.2` | Compilador estático (usado majoritariamente apenas para checagem estática, pois Vite usa esbuild para transpilar). |
| `wrangler` | `^4.94.0` | CLI da Cloudflare. Usado localmente para simular o ambiente Pages (`wrangler dev`) e realizar deploys. |
| `@cloudflare/vite-plugin` | `^1.38.0` | Integração Vite-Cloudflare para simular workers/funções no ambiente dev local. |

## Integrações Externas via CDN (Embutidas)
- `https://sdk.mercadopago.com/js/v2`: Script do MercadoPago.
  - *Nota Técnica:* Há rastros de legado do MercadoPago (e.g., `seed.sql` menciona `cleanup_legacy_payment_app_config.sql`). Atualmente o DB aponta pesadamente para o **Stripe**.
- `Google Analytics (gtag.js)`: Script injetado diretamente no `index.html` via ID `G-THDC5T7C7T`.

## Dependências e Padrões Não Adotados
- **React Router**: O projeto implementou seu próprio sistema via `NavigationProvider`.
- **Axios/Fetch Wrappers genéricos**: Usa-se o cliente do Supabase diretamente.
- **Redux/Zustand**: Evitado em favor de React Context genérico (`useAuth`).
- **React Hook Form**: Form validator escrito do zero (`useFormValidator`).
