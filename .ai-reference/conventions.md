# Convenções Adotadas

A base de código estabelece as seguintes convenções estruturais para todos os contribuidores e processos automatizados no ciclo de vida de manutenção deste produto.

## Convenções de Nomenclatura

1.  **Componentes React (`.tsx`)**:
    *   Todos os arquivos contendo componentes devem usar PascalCase em seus nomes (ex: `LoadingSpinner.tsx`, `ConfirmModal.tsx`).
    *   Arquivos que mapeiam páginas raízes em seus diretórios de domínio devem se chamar restritamente `Page.tsx` (ex: `customer/dashboard/Page.tsx`, `auth/login/Page.tsx`).
2.  **Hooks Customizados**:
    *   Obrigatório uso do prefixo `use` com PascalCase subsequente (ex: `useAuth`, `useFormValidator`).
3.  **Utilitários e Funções Genéricas (`.ts`)**:
    *   Devem estar no diretório `/shared/lib/` ou `/shared/utils/` e usar kebab-case ou camelCase baseado na complexidade (ex: `story-api.ts`, `validators.ts`, `ui-copy.ts`).
4.  **Tipos / Interfaces TypeScript**:
    *   Nomes no modelo PascalCase (ex: `PlanFeatures`, `LoveStoryData`). Não prefixar com 'I' (não usar `IPlanFeatures`).
5.  **Classes CSS de Design System**:
    *   Para componentes complexos abstraídos ao arquivo `index.css`, usa-se sintaxe BEM-semelhante ou aglutinação semântica kebab-case: `card-elite`, `input-elite`, `btn-primary`.

## Convenções Estruturais

1.  **Gestão de Copywriting**:
    *   Nenhum texto massivo "hardcoded" atrelado à lógica (mensagens de erro, botões chave de fallback) deve estar espalhado aleatoriamente nos arquivos `.tsx`. Todos residem no dicionário do `uiCopy` exportado de `shared/lib/ui-copy.ts` para fácil identificação e alteração não-destrutiva de negócio.
2.  **Transições de Visualização**:
    *   `Suspense` é estritamente obrigatório em volta de hierarquias pesadas vindas do `App.tsx` para assegurar Code-Splitting seguro do Vite.
    *   Animações de Desvanecimento / Movimentação usam `framer-motion` via `<motion.div>`. Não se convenciona o uso de Transitions/Animations do Tailwind CSS puro para blocos de entrada lógicos de DOM (e.g. aparecer e desaparecer modal), reservando classes tailwind como `transition-transform duration-300` estritamente para estados CSS primitivos do tipo `:hover`, `:focus` ou micro-interações de botões.

## Convenções de Arquitetura Limpa

1.  **Imports Absolutos**:
    *   Todos os módulos fora do escopo adjacente vizinho devem adotar path mappings do tsconfig: `@/`. (ex: `import { getErrorMessage } from '@/shared/lib/errors';`).
    *   NUNCA usar caminhos infernais relativos ex: `../../../shared/ui/Button`.
2.  **Comunicação Cega com UI**:
    *   Os componentes visuais (`/shared/ui/`) jamais importam estados da regra de negócio ativamente (Nenhum componente UI puro importará o `useAuth`). Eles apenas dependem de injeção direta de estado via `Props`.
    *   Isso garante o reaproveitamento absurdo dessas peças (O mesmo visual de componente que é renderizado no modo Administrador também é aproveitado integralmente para renderizar o modo de View Pública da Cápsula - Ex: `PublicStory.tsx`).
