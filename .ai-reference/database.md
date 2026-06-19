# Análise do Banco de Dados

## SGBD
- **PostgreSQL** (Hospedado via Supabase).

## Arquitetura de Dados Principal

O ecossistema gira em torno de duas trilhas conceituais: **Faturamento (Planos)** e o **Domínio Core (Histórias e Imagens)**. Os usuários vêm do esquema nativo de autenticação do Supabase (`auth.users`).

### 1. Entidade: `plans` (Catálogo de Preços e Limites)
- Tabela responsável por controlar todo o faturamento dinâmico e capacidades oferecidas aos usuários baseadas na sua hierarquia de preço.
- **Colunas Vitais:**
  - `billing_provider` e IDs de precificação externos (`billing_product_id`, `billing_price_id`): Usados primordialmente pelo Stripe.
  - `image_limit`: Regra de negócio gravada diretamente na base. Define quantas imagens do tipo StoryImage o plano permite.
  - `allow_youtube`, `allow_password_protection`, `allow_custom_button`: Booleanos atrelados explicitamente a features (Feature Flags derivadas do banco).
- A tabela de `plans` é majoritariamente lida pelo Frontend (para renderizar a página de vendas pública) e lida pela Edge Function na criação de Checkout. Ela raramente recebe *inserts* no ambiente de produção exceto por ação do Admin.

### 2. Entidade: `stories` (A Cápsula do Tempo)
- *Anotação: Baseado no front-end, a entidade `stories` parece existir atrelada ao usuário.*
- Contém metadados configurados no `/dashboard` como: a data de início (`startDate`), a mensagem declarativa (`message`), configurações de posicionamento de layout (`layoutPosition`), hash de senha (`storyPassword`) para bloqueio e a URL do vídeo (`youtubeUrl`).
- O acesso a essa tabela é o mais restrito de todos, garantido por políticas RLS rigorosas de UPDATE (apenas dono da história) e SELECT público (apenas de histórias visíveis ou mediante senha).

### 3. Entidade: `story_images` (A Galeria)
- Subentidade, relacionada a `stories`. Representa as mídias da galeria.
- **Colunas Vitais:**
  - `image_url`: Aponta para o arquivo real estocado no Storage (Bucket `story-images`).
  - `display_order`: Um inteiro que reflete a ordem imposta no frontend (via Drag and Drop do `dnd-kit`).
- **Comportamento Implícito:** A inserção neste local e posterior salvamento no backend utiliza a *Atomic Save* via SQL. Ou seja, se o frontend submete a exclusão de IDs antigos e a criação de novos, o banco transaciona isso, visando evitar imagens orfãs e ordenação quebrada.

### 4. Entidade de Sistema: `app_config`
- Uma tabela Key-Value (Chave e Valor) genérica para armazenar variáveis de ambiente/configurações globais necessárias no ambiente sem a necessidade de re-deploy da aplicação (Exemplo observado no seed: `FRONTEND_URL`).

## Mecanismos de Prevenção e Constraints

- **Migrations Regulares:** O fluxo de vida de esquema é ditado via `/supabase/migrations`. O sistema é proibido de possuir "alterações manuais não rastreáveis" via SQL Editor em produção. As migrations controlam incrementos como `add_stripe_billing_fields_to_profiles` e `save_story_atomic`.
- **Integridade Referencial Pesada:** Histórias dependem de usuários logados. Imagens dependem de Histórias. Na exclusão (se existir o comportamento de conta), cascateamento (ON DELETE CASCADE) será provavelmente ativado.
- **Atomic Operations:** As migrations como `save_story_atomic.sql` evidenciam a inteligência de banco para impedir *race-conditions* (condições de corrida) ou salvamentos parciais (ex: imagem upada, mas erro ao salvar ordenação da galeria, resultando na reversão total).

## Pontos de Risco (Gargalos)
- O número limite de requisições à tabela de histórias para acesso público (`/story/:id`) pode virar um gargalo de leitura na base se histórias atingirem pico de popularidade viral, exigindo no futuro camadas de cache externo (Redis, ou CDN agressivo da Cloudflare, dificultado pelo acesso por senha).
