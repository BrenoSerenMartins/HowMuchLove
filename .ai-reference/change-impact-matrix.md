# Matriz de Impacto e Alteração (Change Impact Matrix)

Consulte esta tabela para prever o efeito dominó de qualquer requisição de alteração solicitada para o código.

| O que você pretende alterar? | Consequências Diretas (O que pode quebrar) | Integrações Afetadas | Módulos para Fazer QA |
| :--- | :--- | :--- | :--- |
| **Criar/Adicionar um novo 'Plano de Assinatura/Venda'** | Alterar nome ou permissão quebra mapeamento no Frontend (`types.ts`). Inserções vazias no Stripe não funcionarão. | Stripe (Precisa sincronizar IDs no *Seed* e base Produtiva); Edge Function (`process-payment`). | Marketing (`PricingSection`); RLS e limites checados via `loadStory` no Dashboard. |
| **Exigir novos campos no `LoveStoryData` (Ex: Cor de Fundo da Cápsula)** | `save_story_atomic` (se for stored procedure em SQL) rejeitará o input. Interface de `types.ts` vai acusar erro TypeScript. | Supabase (Migrations necessárias para a nova coluna na tabela). | Editor (`CounterDemo`); Visualização Pública (`PublicStory`). |
| **Mudar ou expandir a Validação do Formulário (`useFormValidator`)** | Regras agressivas podem prender a submissão infinita. Regex mal desenhada de senha travará bloqueios de login em cascata. | - | `auth/login`; `auth/register`; Inputs de email gerais. |
| **Trocar a engine de Animação (Remover Framer Motion)** | `App.tsx` quebra totalmente por injeção errônea no `AnimatePresence`. Todas as rotas pararão de renderizar conteúdos dentro de componentes *suspense*. | Nenhuma. Apenas DOM e Browser. | Todo o escopo de entrada visual; Modal de Segurança e Loading Spinners em toda Viewport. |
| **Alterar as regras do `NavigationProvider`** | O fluxo contra acidentes ("Modo Dirty") deixará de emitir modais impeditivos e o estado de perda massiva de dados digitados será reativado passivamente no `Dashboard`. | - | Cliques de cabeçalho (`Header`), cliques de log-out, atalhos de voltar do browser na Página Customer. |
| **Mexer na Lógica da 'Câmara Cega' (`requiresPassword / youtubeUrl`)** | Modificar a lógica do click na view Pública (`StoryPage`) pode ferir políticas severas e incorrer em auto-pause/bloqueio nativo pelo Safari/Chrome, tornando vídeos audíveis inteiramente mudos globalmente. | API iFrame do YouTube embeddado; Supabase Storage RLS. | Flow do Visitante recebendo um Convite QR (`story/public/Page`). |
