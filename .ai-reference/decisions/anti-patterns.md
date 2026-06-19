# Anti-Padrões de Referência (Anti-Patterns)

1. **God Hook (`useAuth`)**
   - O Hook de Autenticação abraçou lógica pesada como carregar os Planos (`planFeatures`), carregar a História e gerenciar seu Salvamento.
   - *Efeito Prático:* Apesar de classificado como um Anti-Pattern claro (Violação do Princípio de Responsabilidade Única no conceito SOLID), reduziu-se o emaranhado complexo de "quem depende de quem". Isso unificou o escopo de variáveis visíveis ao Dashboard, mas dificulta refatorações na camada de identidade.

2. **Script Externo Chumbado no Index**
   - O injetável `sdk.mercadopago.com` está hardcoded no `index.html` mesmo num ambiente estritamente desenhado para **Stripe Checkout** (`seed.sql`), servindo como dívida intencional não limpada, provavelmente para evitar a quebra acidental de fallback legados em Edge Functions.

3. **Dupla Fonte de Verdade de Regra de Negócio (DB vs Frontend)**
   - A tabela Postgres (`plans`) limita o Plano Infinito a "10", enquanto as promessas copy no LandingPage descrevem "até 20 fotos". Esse distanciamento gera a anomalia grave onde a camada estática de UI mente ao cliente, e o Banco de Dados RLS recusa rigidamente a inserção da foto nº 11. Regras de limite deveriam fluir unicamente através do payload injetado do DB.
