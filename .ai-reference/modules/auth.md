# Módulo: Auth

## Objetivo
Gerenciar a identificação, o acesso e a proteção de recursos da aplicação para clientes, garantindo segurança entre as áreas logadas e públicas.

## Responsabilidade
- Controle de Cadastro (Registro) e Autenticação (Login).
- Preservação da sessão via LocalStorage/Cookies integrados com o ecossistema Supabase GoTrue.
- Verificação da camada de privilégio ativa do cliente (Limites de features de acordo com as regras pagas da `PlanFeatures`).

## Contexto de Negócio
O usuário anônimo visita a "Landing" page e pode testar a ferramenta, contudo é impossibilitado de adquirir a "Posse" sem conta. O Auth é a chave para transacionar a criação efêmera do sandbox para a persistência real da cápsula do tempo.

## Arquivos Envolvidos
- `app/providers/AuthProvider.tsx`
- `app/hooks/useAuth.ts`
- `auth/login/Page.tsx`
- `auth/register/Page.tsx`

## Fluxo Completo
1. O usuário submete formulário no `login/Page.tsx` ou `register/Page.tsx`.
2. A view aciona `useAuth().login(email, pass)` ou `register(email, pass)`.
3. O Provider (Contexto Global) dispara `supabase.auth.signInWithPassword`.
4. Mediante sucesso, o Provider atualiza o estado de `user` com a entidade JWT, permitindo à renderização global (`App.tsx`) injetar componentes bloqueados.
5. Em segundo plano, uma rotina no próprio provider pode recuperar o *Plano* do cliente.

## Entradas & Saídas
- **Entradas**: Email, Senha.
- **Saídas**: Token JWT armazenado, User UUID, `PlanFeatures` JSON.

## Dependências Diretas
- `supabase.auth`
- Formulário validador (`useFormValidator`)

## Dependências Indiretas
- Cloudflare Edge (DNS / HTTPS handshake).

## Regras de Negócio e Validações
- **Não permitido para logados**: Rotas de `/login` recusam renderização se a sessão existir, redirecionando o fluxo imperativamente para a área do Consumidor (`/dashboard`).

## Impacto Arquitetural e Regressões
- Qualquer bug introduzido no `AuthProvider` derruba a visibilidade da aplicação. Como ele circunda o `<Main />`, um Crash de ciclo de vida neste provider deixará o visitante olhando para a tela de fallback (`loadingFallback`) perpetuamente.
