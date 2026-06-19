# Análise de Fluxos Críticos

Esta seção documenta o comportamento exato, o encadeamento de rotas e o ciclo de vida dos processos centrais do negócio de criação da "Cápsula do Tempo".

## 1. O Fluxo de Onboarding e Compra (Checkout)

O caminho do visitante inexplorado até virar cliente premium:
1. O usuário entra na rota inicial (`/`), visualizando o `HeroSection` e a `CounterDemo`.
2. Acessa a `PricingSection` (`#pricing`), onde o sistema renderizou os planos puxados de forma assíncrona do banco pelo método `fetchAllPlans()`.
3. O usuário seleciona um Plano.
4. **Desvio Condicional (Usuário Anônimo vs Logado):**
   - **SE anônimo**: A função `handlePlanSelected` emite um Toast informativo (`uiCopy.payment.createAccount`), bloqueia o redirecionamento financeiro, e roteia para `/register`.
   - **Após Registro**: (Caminho implícito/esperado) O usuário agora recém logado no `/dashboard`, que também contém botões ou alertas indicando sua carência de Features, deverá iniciar o pagamento da nova conta em uma seção de Upgrade do painel. (A integração específica desse ciclo estendido não é plenamente contida num único passo na SPA principal, dependendo do retorno do Stripe).
   - **SE autenticado na Home**: Dispara uma transação de intenção invocando a Edge Function `'process-payment'`. Recebe resposta HTTP e aplica um redirecionamento pesado de janela (`window.location.href`) para o Stripe Checkout.
5. **Retorno do Stripe**: Volta para `/payment-success` e pode começar a gozar do seu upgrade no `Dashboard`.

## 2. O Fluxo de Criação e Edição do Story (Dashboard Monitor)

Onde o esforço do desenvolvedor se concentrou em ergonomia e fluidez para o Cliente:
1. Usuário acessa `/dashboard`.
2. Em background, o componente dispara o hook assíncrono `fetchStory()` via `loadStory()` atrelado ao `useAuth()`. A tela exibe estado de `LoadingSpinner`.
3. Se existir a história (`isActiveStory`), a tela de resumo (`DashboardSummary`) e as imagens heroificadas (`DashboardHero`) são montadas na DOM, bem como a URL final para copiar e compartilhar.
4. **Estado de Edição:** O usuário clica no botão "Editar" ativando a flag state `isEditing = true`.
5. A UI transiciona. A tela central colapsa e divide-se na metade em telas *Desktop/Tablet* ("Monitor de Estúdio"). À esquerda os controles utilitários de submissão (datas, campos, drag&drop fotográfico) fornecidos pelo `CounterDemo` em modo de dashboard. À direita a reprodução fiel e instantânea da página da cápsula consumindo as premissas sujas da sessão via o prop `editorPreviewData`.
6. A página de dashboard registra `isDirty = true` junto ao provedor de Navegação, ativando assim os "Cadeados" nas portas da aplicação. Se ele apertar no logo (botão de home), surge um Modal crítico perguntando se quer ignorar alterações.
7. Quando pressiona "Salvar", executa o despache massivo para `saveStory()` enviando `(newData, newFiles, imageIdsToDelete)`.
8. Conforme salvo, flags de `isDirty` falseiam e encerram as notificações vermelhas na DOM; a rota permanece no resumo do Dashboard.

## 3. O Fluxo de Visualização Pública ("A Apresentação")

O clímax do presente do usuário, entregue ao seu parceiro amoroso:
1. Visitante recebe um link gerado do QR Code (`#story/:userId`) via whatsapp.
2. O react renderiza `story/public/Page.tsx`. O componente emite um sinal HTTP `fetchPublicStory(storyId)`.
3. **Barreira Condicional:** Se o atributo em banco for `requiresPassword = true`, o aplicativo tranca todo o fluxo em uma tela escura de Login Customizada. Submeter o pin errado levanta um tooltip de segurança (erro de senha); o certo armazena o token na memória (flag `isPasswordVerified`) e faz download do Payload integral com imagens sensíveis/data sigilosa.
4. **O Efeito "Portão":** Após a passagem de dados ser recebida (com ou sem senha), verifica-se o metadado em particular: `youtubeUrl`. Se isso existir, surge a tela de entrada obrigatória "Pronto para se emocionar?" envelopada em uma div `z-50` preenchendo 100% viewport.
5. Visitante clica em *Play/Entrar*: O trigger dispara a mutação `setEntryTransitionState('fading')`. O som desmuta (`setIsMuted(false)`). Um temporizador de atraso milimétrico de Javascript (cerca de 2000ms `ENTRY_TRANSITION_MS`) inicia desvanecimento lírico de opacidade permitindo a exibição dramática completa do fundo estrelado/ruído de interface, revelando simultaneamente a galeria principal da História, contador temporal, os dizeres do amor do cliente, e ouvindo o Youtube Frame oculto cantando.
