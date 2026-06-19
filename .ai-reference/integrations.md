# Integrações

## 1. Gateway de Pagamento: Stripe

O processamento financeiro é inteiramente terceirizado, gerido pelo **Stripe** (o sistema antigo aparentemente usava MercadoPago, que deixou artefatos legados). O fluxo funciona da seguinte maneira:

### Mapeamento do Fluxo de Pagamento
1. **Intenção de Compra**: O usuário, já autenticado, na rota de Landing (`/` e `#pricing`), escolhe um Plano (ex: "Sonho", "Eterno", "Infinito"). A função `handlePlanSelected` é invocada e direcionada via Edge Function `process-payment`.
2. **Checkout (Off-site)**: O usuário é redirecionado a uma URL hospedada no Stripe Checkout gerada de forma segura na função, com dados de preço provenientes do banco (`billing_price_id` / `billing_product_id`).
3. **Pós-Checkout Direto**: Ao concluir a compra, o Stripe Checkout redireciona o cliente de volta à aplicação nas rotas de fallback localizadas no domínio `/customer/billing`:
   - `/payment-success`
   - `/payment-failure`
   - `/payment-pending` (Em casos onde o pagamento não resolveu imediatamente no gateway).
4. **Sincronização Assíncrona (Webhooks)**: 
   - A atualização *real* da capacidade do cliente (permitir colocar vídeo, ou desbloquear galeria de 10 fotos) **NÃO** ocorre no redirecionamento do FrontEnd para evitar explorações via spoofing.
   - O Stripe notifica de volta o sistema via **Webhooks**, escutado provavelmente por outra Edge Function, que cruza o ID da Sessão, verifica o faturamento real, e aí sim atualiza o status de inscrição do usuário no Supabase.

### Impacto de Integração (Stripe)
- Acoplamento fortíssimo com Webhooks de status ("checkout.session.completed", etc).
- Produtos criados no painel do Stripe **obrigatoriamente** exigem que os IDs de referência batam com os `external_id`, `billing_product_id`, e `billing_price_id` da tabela `plans` do SGBD de Produção (como evidenciado na seed de teste do dev).

## 2. API do YouTube

- **Finalidade:** Fornecer trilha sonora ("música especial") para as cápsulas do tempo sem custo logístico astronômico de hospedagem de mídias e problemas iminentes de copyright.
- **Implementação:** O front end, notavelmente na exibição Pública da história (`story/public/Page.tsx`), utiliza um mecanismo `iframe` (possivelmente um wrapper embed) validando a URL de metadado (`youtubeUrl`).
- **Desafios Associados:** Políticas recentes (Chrome, Safari, iOS e Android) de **Autoplay**. Por este motivo, foi elaborada a mecânica da "Cortina de Entrada". A experiência imersiva de música automática requeria interação na DOM para contornar o bloqueio de som automático dos navegadores. O usuário clica em "Pronto para se emocionar?", que altera o flag do frontend (`hasEntered`, `isMuted`), engatilhando o playback audível da plataforma externa.

## 3. Hospedagem Global / CDN (Cloudflare)

- **Serviço**: Cloudflare Pages.
- **Propósito**: Hospedar a SPA estática baseada em Vite (`./dist`).
- **Como se integra**: O projeto usa um arquivo `wrangler.jsonc`. Com ele o comando interno `npm run deploy` delega para o wrangler fazer upload dos assets estáticos via pipeline CI/CD na plataforma. Cloudflare foi preferida em favor de Vercel/Netlify pelo uso da flag de SPA (`"not_found_handling": "single-page-application"`).
- O ambiente Edge da Cloudflare impõe cache super rápido aos arquivos Javascript, mas mantém as requisições para a API Supabase dinâmicas.

## 4. Google Analytics 4 (GA4)

- **Instalação:** Script no `index.html`.
- **Propósito:** Telemetria de consumo, monitoramento de fluxos de adoção, taxa de rejeição da Landing Page e mapeamento da eficácia das conversões de checkout para tráfego gerado em mídias.
