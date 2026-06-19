# Mapeamento do Banco de Dados

Baseado no dump (`seed.sql` e migrations lidas) e na premissa operacional do sistema, eis o mapa relacional e suas instâncias fundamentais no Supabase.

## 1. Schema: `auth` (Natual do GoTrue)
- **Tabela**: `users`
  - Contém as entidades de login registradas. Nenhuma lógica pesada da aplicação toca diretamente aqui a não ser a Edge Function do Auth.

## 2. Schema: `public` (Regra de Negócio Própria)
- **Tabela**: `plans`
  - *Função*: Dicionário universal de features e preços. Controla o acesso funcional da aplicação inteira.
  - *PK*: `id` (ou `name`).
- **Tabela**: `app_config`
  - *Função*: Singleton com propriedades (ex: `FRONTEND_URL`) injetadas no deploy.
- **Tabela**: `stories` (e metadados associados implicitamente ao user)
  - *Função*: Raiz de um projeto do cliente. Relaciona 1:1 ao UUID do `auth.users`.
- **Tabela**: `story_images`
  - *Função*: A galeria atrelada à `stories`.
  - *Relação*: `N:1` para Story. Contém `display_order` usado pelo drag-and-drop.

## 3. Schema: `storage` (Arquivos)
- **Bucket**: `story-images`
  - *Propósito*: Armazenamento bruto (S3-like) das mídias transferidas do `CounterDemo` em base64/blob, transformadas para URL Pública referenciada dentro da galeria (`story_images.image_url`).

## 4. Banco Dinâmico em Tela (DTO)
A estrutura exata do fluxo não existe em JSON, mas via proxy no frontend via `LoveStoryData`. O frontend manipula os três domínios (`plans`, `stories`, `story_images`) enviando para funções armazenadas como a migração atômica no banco `save_story_atomic.sql`.
