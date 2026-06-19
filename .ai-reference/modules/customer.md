# Módulo: Customer

## Objetivo
Atuar como o Painel de Controle (CMS Pessoal) e balcão financeiro do cliente.

## Responsabilidade
- Exibir e Permitir Edição da Cápsula do Tempo (`/dashboard`).
- Interceptar status de pagamentos (`/billing/*`).
- Atualizações de perfil ou configurações (`/settings`).

## Contexto de Negócio
Após a aquisição, o cliente passa 90% da sua estadia em gerenciamento neste módulo, até concluir a peça artística digital e obter o "Share Link". É o core business B2C isolado de visualização externa.

## Arquivos Envolvidos
- `customer/dashboard/Page.tsx`
- `customer/dashboard/components/*`
- `customer/billing/success/Page.tsx` (e variações de pending/failure)
- `customer/settings/Page.tsx`

## Fluxo Completo (Dashboard)
1. Carregamento inicia. Spinner é exibido e `loadStory()` é chamado.
2. A tela repassa os dados lidos para `<DashboardSummary>` ou, se clicar em *Editar*, constrói um Layout Bifurcado de Tela: `<CounterDemo>` (Esquerda) e `<DashboardPreviewPane>` (Direita).
3. Modificações em inputs ou Drag&Drop ativam flag `isDirty`.
4. Ao "Salvar", imagens deletadas, imagens novas e payload texto/data são mesclados num request unitário ao servidor `saveStory`.

## Entradas & Saídas
- **Entradas**: Dados de Perfil, Textos da História, Arquivos Fotográficos (Buffers/Blobs), Ordenação (Inteiros), Flags de Design (`layoutPosition`).
- **Saídas**: Payload renderizado no iframe/preview, Geração Dinâmica da URL do QR Code (e.g. `https://howmuchlove.com.br/#story/123-abc`).

## Dependências Diretas
- `useAuth()` (Para ler as `PlanFeatures` da conta limitando Drag and Drop).
- Componentes da biblioteca nativa `@dnd-kit/core` (Orquestração de Imagem).

## Regras de Negócio e Validações
- O usuário não pode subir N+1 imagens se seu `planFeatures.image_limit` não permitir, bloqueado em hard-code na view de inserção.
- Sem um `startDate` válido na história, a URL do ShareLink permanece oculta ou inativa como medida para que histórias em branco não sejam divulgadas.

## Impacto Arquitetural e Regressões
- **Gargalo no Preview**: Mutações massivas do `editorPreviewData` (que é clonado e passado para a aba direita ao vivo) podem vazar memória ou travar a main thread do Javascript. Se um componente dentro de `CounterDemo` disparar loop infinito, a tela inteira congela.
