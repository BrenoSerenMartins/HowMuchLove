# Análise de Segurança

## Controle de Acesso Baseado em Sessão

*   **Provedor Auth:** A autenticação é delegada totalmente ao **Supabase GoTrue (JWT Based)**. O token viaja em LocalStorage ou Cookie (dependendo da configuração oculta de front do GoTrue).
*   **Auth Guards (Frontend):** 
    *   Ocorre no React via interceptação global dentro do `App.tsx`.
    *   As rotas `/dashboard` e `/settings` são inacessíveis se o hook `useAuth` não reconhecer uma sessão. Invasores locais manipulando URL são imediatamente expulsos.
    *   Um usuário que entra na página principal ou em `/login` já tendo logado no passado, é impedido de ver essas páginas e é jogado de volta à sua central de controle (Dashboard).

## Supabase Row Level Security (RLS)

A proteção primária contra ataques de extração lateral ou exploração massiva de dados. O projeto adota uma premissa de *Zero Trust* em suas tabelas principais de CRUD.
*   **Tabela `stories`**: As políticas no PostgreSQL impedem que requisições na nuvem operem comandos SQL de Mutação `UPDATE` a menos que o `uuid` associado à identidade de log correspondam ao campo da linha manipulada. 
*   **Exposição de Galeria Pública**: Para uma História Pública `/story/:id`, a permissão de leitura não logada do SGBD pode atuar baseada em metadados. Se o usuário ativou senha (`requiresPassword`), o Frontend não recebe as informações do contador, texto e fotografias até bater no endpoint de RPC do servidor que fará o desafio do texto claro submetido com o *Hash* protegido na tabela.

## Mecanismos de Proteção Específicos do Frontend

*   **Prevenção contra Vulnerabilidades Autoplay:** A integração da API do YouTube é suscetível a penalidades severas dos navegadores modernos caso executem barulho contra a vontade. A "Câmara Escura" com o botão "Entrar" previne a quebra da imersão (o console levantando um erro e pausando o vídeo), alocando a ação voluntária do usuário antes da reprodução em tela cheia na Story Page.
*   **Contenção Dinâmica de Pagamento:** Os valores e dados dos planos Stripe **NÃO** viajam através das chamadas de API do cliente. O front envia um ID mínimo. É a **Edge Function** isolada quem entra no banco, verifica o custo de mercado confiável, e estabelece comunicação secreta com o gateway Stripe para obter a URL da Sessão. Alterar payload do react dev-tools é inofensivo.

## Tratamento de Dados Pessoais de Visitantes (Privacidade)

*   O Sistema não coleta contas, metadados persistentes de cache ou rastreios abusivos de usuários (parceiros amorosos/visitantes) que interagem na rota Pública `/story/:id` fora o cookie nativo/event tracking do Google Analytics. 
*   Nenhum nome de conta ou dado do perfil sensível (Ex: E-mail do cliente, método do cartão de crédito) é exposto de forma alguma nas áreas públicas ou no JSON que preenche o contador relacional de amor na visão do visitante.
