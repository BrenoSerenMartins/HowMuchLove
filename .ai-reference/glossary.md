# Glossário do Projeto

Este dicionário mapeia os jargões, nomes de variáveis onipresentes e domínios da aplicação para facilitar a ambientação na engenharia do HowMuchLove.

*   **Story (História / Cápsula):** A entidade central. Uma página pública web construída para celebrar um relacionamento, abrigando cronômetros, mensagens e galerias fotográficas.
*   **PlanFeatures:** Estrutura de dados consumida em quase todo o Frontend (`types.ts`) que mapeia quais limites ou recursos a conta do usuário tem no momento (e.g. `image_limit: 5`, `allow_youtube: true`).
*   **Câmara Cega (Entry Transition):** O jargão arquitetural para a tela "Pronto para se emocionar?" exibida antes da inicialização do Story público. Projetada para permitir *unmute* seguro via ação do usuário.
*   **Dirty State (`isDirty`):** Estado de *NavigationProvider* ativado ativamente no "Studio Monitor". Acusa que o usuário alterou forms/inputs porém não despachou um commit no banco de dados.
*   **Supabase / GoTrue / PostgREST:** Ecossistema que compõe o BaaS do backend. *GoTrue* é a suíte de Auth; *PostgREST* é a API gerada do PostgreSQL em tempo real.
*   **Edge Functions:** Código Typescript de Backend que reside fisicamente no repositório mas é deployado fora da Cloudflare, na rede Edge do Supabase, rodando o *Deno runtime* para mediar integrações perigosas, como Gateway de pagamentos.
*   **Atomic Save / Atomicidade:** Mecânica implementada em base de dados visando garantir o "tudo ou nada". O upload de fotos e alteração de texto do Story ou acontecem perfeitamente agrupados, ou o banco recusa a mutação toda caso haja falha local.
*   **Wrangler:** A interface Command Line (CLI) operante da provedora de Hospedagem (Cloudflare).
