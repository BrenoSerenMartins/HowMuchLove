# Problemas Conhecidos (Known Issues)

Esta lista documenta anomalias arquiteturais, bugs reportados visualmente e peculiaridades do ecossistema que estão em monitoramento.

## 1. Discrepância na Exposição de Limite de Fotos (Planos)
*   **Sintoma:** O limite técnico na tabela Postgres `plans` para o plano "Infinito" consta como `image_limit = 10`. Contudo, os assets de cópia (`uiCopy`) e descrições vendáveis relatam a possibilidade de "Até 20 fotos".
*   **Risco Mapeado:** Usuários Infinito irão relatar *Bugs* e abrir incidentes que não conseguem submeter as fotos de número 11 a 20. Recomenda-se retificação no painel de administração via script/SQL ou retificação do texto de marketing com brevidade.

## 2. Inconsistência do Provedor de Pagamento (MercadoPago)
*   **Sintoma:** Artefatos de integração defasada encontram-se em todo projeto: uma importação direta de SDK JS do "MercadoPago" no `index.html` e *migrations* antigas (e.g. `cleanup_legacy_payment_app_config.sql`). Contudo o comportamento majoritário transacional no SGBD é do **Stripe**.
*   **Risco Mapeado:** O download do SDK inerte diminui performance na *First Contentful Paint* para a página inicial por baixar recursos de terceiros não utilizados pela infraestrutura. Recomenda-se remoção segura.

## 3. Gestão e Limpeza Expirada
*   **Sintoma:** A "promessa" comercial do plano **Sonho** clama por "Salvar sua página para sempre", contrastando com a modalidade "Gratuita" que sugere limites. No entanto não há menção explícita de limpezas de *CRON JOB* nas tabelas Postgres destruindo os Stories abandonados.
*   **Risco Mapeado:** O custo infraestrutural crescerá linearmente para sempre com leads não convertidos armazenando "1 foto pesada no banco e consumindo bandwidth".

## 4. Gargalo de Processamento Drag & Drop
*   **Sintoma:** Em máquinas obsoletas o repasse do `imageIdsToDelete` em conjunto do novo index das arrays baseadas na biblioteca do `dnd-kit/core` ao redor das previews do `DashboardPreviewPane` pode travar o frame rate durante renderizações concorrentes.
