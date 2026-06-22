# Tarefas - Lançamento SaaS HowMuchLove

- `[/]` **Fase 1: Sincronização Dinâmica com o Stripe**
  - `[ ]` Criar migration para adicionar `stripe_lookup_key` na tabela `plans`
  - `[ ]` Atualizar Edge Function `get-all-plans` para buscar preços reais do Stripe via lookup_key
  - `[ ]` Atualizar Edge Function `process-payment` para usar a busca por lookup_key
- `[ ]` **Fase 2: Otimização de Performance e Custos**
  - `[ ]` Instalar biblioteca de compressão de imagens
  - `[ ]` Integrar compressão no `CounterDemo.tsx` antes do upload
- `[ ]` **Fase 3: SEO e Viralidade**
  - `[ ]` Migrar Frontend para Path Routing (`/story/123`)
  - `[ ]` Configurar redirecionamentos no `wrangler.jsonc` (se necessário)
- `[ ]` **Fase 4: UX & Autenticação**
  - `[ ]` Criar rota e UI para Esqueci minha Senha
  - `[ ]` Criar rota e UI para Resetar Senha
- `[ ]` **Fase 5: Preparação Jurídica**
  - `[ ]` Criar páginas de Termos de Uso e Privacidade
