# Regras de Negócio

## 1. Regras Relacionadas aos Planos (Billing)

O modelo de negócio gira em torno da assinatura ou compra de funcionalidades extras para a cápsula do tempo ("Story"). As regras são ditadas pela tabela de `plans` e enforçadas rigidamente nas views do cliente e nas transações de salvamento.

*   **Gratuito (`Gratis` / ID: 7)**:
    *   Limite de Imagens (`image_limit`): Máximo de **1 foto** anexada à História.
    *   Integração Musical (`allow_youtube`): **Falso**.
    *   Proteção por Senha (`allow_password_protection`): **Falso**.
    *   Customização CTA (`allow_custom_button`): **Falso**.
    *   *Comportamento Extra:* O dashboard indica visualmente as lacunas/funcionalidades trancadas usando badges de "Upgrade", e a tentativa maliciosa de injetar esses campos bloqueados através da interface resulta em negação antes e durante a transação com a base de dados.
*   **Sonho (`Sonho` / ID: 1)**:
    *   Idêntico em restrições lógicas ao Gratuito (1 foto, sem vídeo), porém é caracterizado como "assinatura base para salvar a página para sempre". Isso implica numa política extra de que Contas Gratuitas possivelmente possuam expiração de link ou limite de vida útil (apesar de ainda não implementado visivelmente no Supabase cleanup, a cópia diz isso).
*   **Eterno (`Eterno` / ID: 2)**:
    *   Limite de Imagens: **5 fotos**.
    *   Integração Musical: **Verdadeiro**.
    *   Proteção por Senha: **Verdadeiro**.
    *   Customização CTA: **Verdadeiro** (Permite mudar o botão da Cortina de Entrada).
*   **Infinito (`Infinito` / ID: 3)**:
    *   Limite de Imagens: **10 a 20 fotos** (A database exibe `image_limit: 10`, mas as copy-rights dizem "Até 20 fotos". É vital que no futuro se sincronize isso, possivelmente o plano infinito aceita extensões).
    *   **Pagamento Único (`one-time`)**: Este plano não debita cobranças recorrentes. O modelo no Stripe é configurado como Pagamento único.

## 2. Regras Implícitas de Criação de Story

*   **Existência Única (1:1)**: Um usuário cria, gerencia e edita **apenas UMA cápsula do tempo**. O design de roteamento `/story/:userId` (onde a história é mapeada e recuperada baseada no UID do dono) sinaliza que no banco de dados, o campo da história é único para cada cliente. Não existe "Lista de Minhas Cápsulas".
*   **Dirty State de Edição**: O sistema é impiedoso com perda de trabalho. Toda e qualquer digitação nos inputs é rastreada sob o paradigma `isDirty`. Se o usuário navegar ou apertar botão de log-out, ele sofre intervenção de UX ("Você tem alterações não salvas. Perderá todo o seu progresso.").
*   **Mídia Órfã**: Na re-ordenação de galeria e exclusão de fotos antigas para substituir por fotos novas (limitado a quantia do plano), a UI cria uma array de `imageIdsToDelete` e o envia simultaneamente junto com os novos *buffers* de *File* no momento de submissão para evitar exclusões prematuras na nuvem. O Storage Supabase e o registro de banco não expiram as velhas até o fluxo inteiro da função `saveStory` concluir (operação transacional atômica no sql: `save_story_atomic`).

## 3. Regras de Entrada na Cápsula (A "Apresentação Pública")

*   **O Gatilho de Permissão Ocular**: A página pública `/story/:userId` **NUNCA** revela o contador de dias ou as fotografias pessoais antes de duas regras:
    1.  Se existir metadado `requiresPassword = true`, uma interface com Cadeado assume a tela inteira. Somente o hash validado contra o banco rompe isso.
    2.  Se existir metadado `youtubeUrl = true` validado e preenchido, a tela do cadeado, após sucesso, entra numa **segunda câmara cega**: Uma tela interativa exigindo o clique em um botão CTA ("Pronto para se emocionar?"). Esta regra existe para contornar o mecanismo de segurança nativo dos navegadores contra áudio *Autoplay*.
*   **Se a música não estiver alocada**, a segunda câmara cega é suprimida; a página de amor é exibida imediatamente para o familiar/parceiro visitando.
