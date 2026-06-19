# Dívida Técnica (Technical Debt)

Esta base elenca atalhos de arquitetura ou débitos passíveis de revisão, gerados por escolhas táticas visando rápido Go-to-Market da aplicação.

## 1. Forte Acoplamento de Autenticação e Domínio (`useAuth`)
A entidade global `useAuth` excede a sua designação natural (prover a sessão de identidade e os tokens lógicos). 
*   **Problema:** Foi injetada a responsabilidade direta de funções como `saveStory()` e `loadStory()` atreladas aos limites de `planFeatures` para dentro do seu hook context.
*   **Implicação:** Isso transforma a ferramenta de autenticação num Controller gigantesco aglomerando domínio financeiro, lógica relacional da História do Usuário, e o seu Identity.
*   **Sugestão Futura:** Quebrar/Refatorar criando um `useStoryManager()` que consuma independentemente os limites providos pelo AuthContext.

## 2. Estado Efêmero em Arquivos Estáticos (`ui-copy.ts`)
*   A escolha por extrair todos os textos para um utilitário javascript (presumivelmente `shared/lib/ui-copy.ts`) é louvável se comparado a hardcoding brutal.
*   **Porém,** a falta de bibliotecas sólidas de formatação de string multinacional como `i18next` ou `react-intl` previne uma internacionalização indolor, amarrando o sistema a um arquivo gigante que exigirá reestruturação massiva do objeto para permitir linguagens como EN/ES (O texto base atual demonstra pt-BR primário).

## 3. Roteamento Frágil Case-by-Case (`NavigationProvider`)
*   **Problema:** O App abandonou o estabilíssimo `react-router-dom` em favor de uma Switch statement controlada manualmente no top-level `App.tsx` (`switch(route)`).
*   **Implicação:** Sem a abstração do router, funcionalidades nativas de browser (gestão de sub-rotas aninhadas pesadas `customer/billing/*`, interceptação via Scroll Restoration, e query-string parsers nativos) foram ou serão reescritos do zero. As animações de página, no entanto, tornaram-se mais fáceis neste modelo (A provável motivação do débito).

## 4. Testes Inexistentes vs SQL Atômico
*   As lógicas de RLS agressivas somadas a um backend com `Stored Procedures` atômicos em Nuvem são as únicas fortificações do serviço, mas como provado no painel anterior, falta infraestrutura de teste TDD nas lógicas do *Data Fetching* no Front, exigindo inspeções massivas manuais para assegurar que modificações em botões ou payloads não infrinjam validações do PostgreSQL.
