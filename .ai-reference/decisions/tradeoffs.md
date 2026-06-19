# Trade-Offs e Anti-Padrões Internos

## Trade-offs de Design

1. **SPA Custom Router vs React-Router**
   - *O que ganhamos:* Controle sub-molecular em transições imperativas no `App.tsx` usando Suspense e Framer Motion. Zero quebras de estado da Store de Histórico global se algo acidentar no pipeline.
   - *O que custou:* Ausência de *Active Links*, sub-rota nativa sem re-render, e hooks nativos modernos como Loader Parameters. Desenvolvedores novatos demorarão para se acostumar que a rotação URL vive no `NavigationProvider`.

2. **Delegação Criptográfica via Banco de Dados (Senha)**
   - *O que ganhamos:* A rota da história não possui dependência de autenticação severa (Visitante não precisa criar conta). Ele consome a view livre, apenas precisando injetar o string da senha que é repassado ao Postgres para matching e devolução do dado encriptado original.
   - *O que custou:* Como a senha atua não só como trava, mas para liberar dados na base de dados, a arquitetura de acesso requer Edge Functions seguras que processam esse hash ou complexos grants no RLS que limitam manutenções de query.

## Anti-Patterns Assumidos Propositalmente

1. **God Hook no AuthProvider**
   - O Hook de Autenticação abraçou lógica pesada como carregar os Planos (`planFeatures`), carregar a História e gerenciar seu Salvamento.
   - *Efeito Prático:* Apesar de classificado como um Anti-Pattern claro (Violação do Princípio de Responsabilidade Única no conceito SOLID), reduziu-se o emaranhado complexo de "quem depende de quem", já que em um modelo restrito, você não salva sem Auth. Isso unificou o escopo de variáveis visíveis ao Dashboard.

2. **Script Externo Abandonado no Root**
   - O injetável `sdk.mercadopago.com` está chumbado no `index.html` mesmo num ambiente estritamente desenhado para **Stripe Checkout**, servindo como dívida intencional não limpada, presumidamente devido ao medo de regressão onde features secundárias escondidas parassem de funcionar.

3. **Dupla Fonte da Verdade para "Limites de Fotos"**
   - A tabela Postgres (`plans`) limita o Plano Infinito a "10", enquanto as promessas copy no LandingPage (provavelmente extraídas pelo `.features`) vendem "até 20 fotos". Esse distanciamento gera a anomalia grave onde a camada humana (Marketing) mente e o Banco de Dados frustra o pagamento, que é um clássico anti-pattern arquitetural de divergência de modelagem de negócio.
