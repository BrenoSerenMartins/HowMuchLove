# Análise e Guia de Testes

## Cenário Atual de Cobertura

O diretório do repositório indica que **não existe um ambiente de testes automatizados formalmente consolidado** (ausência de pastas `__tests__`, arquivos `*.spec.tsx` ou dependências de configuração estrita como `vitest`, `jest`, `cypress` no topo das dependências visíveis). Portanto, o ciclo de vida depende vigorosamente de Quality Assurance manual em ambiente PWA e testes localizados de desenvolvedor via comandos de console.

## Fluxo de Testabilidade Embutida (Mocks e Seed)

O projeto compensa isso mantendo um ambiente de desenvolvimento limpo com um "Database Substituto" forte dentro da pasta `supabase`.
- O arquivo `supabase/seed.sql` popula planos fixos simulados: `Plano Teste Produto (0.01)` com IDs mascarados de Produto Stripe que facilitam testar o fluxo completo de pagamento `process-payment` (Edge Function) conectando à uma conta de Stripe de *Sandbox*.

## Testes Críticos Manuais Obrigatórios Antes de Deploy

Devido à ausência de *unit testing* nativo, qualquer contribuição futura IA/Dev na base principal deverá testar as seguintes ramificações antes de commitar mudanças:

1. **A Máquina de Estado Suja (`isDirty`)**
   - Alterar input textual no modo "Edição". Tentar fechar a janela, navegar pelo botão superior, e clicar em voltar do navegador de Internet, conferindo se os eventos capturaram o escape sem perder o progresso.
2. **Atomicidade da Base de Dados**
   - Upload de foto pesada com alteração do texto da história. Fechar conexão simuladamente ou apagar os nós da internet, a tabela do servidor (`save_story_atomic`) deve limpar referências órfãs e não gravar de forma parcial.
3. **Pilar da Proteção de Senha**
   - Marcar uma cápsula como restrita (`allow_password_protection = true` por *Features*). Tentar acessá-la em uma Janela Anônima deslogado e buscar via `curl` as informações textuais sem fornecer a chave-segredo para certificar se as regras RLS não vazaram.
4. **Resoluções Híbridas (Responsividade)**
   - Avaliar a interface altamente carregada do "Studio Monitor" no Dashboard, que exibe duas colunas divididas no Desktop, num emulador Mobile apertado para avaliar se o `hidden` ou o bloco de colapso visual funciona perfeitamente (UI/UX).
