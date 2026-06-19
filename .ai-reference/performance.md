# Análise de Performance

## Estratégias de Carregamento Assíncrono

1.  **Code Splitting via React Lazy**:
    *   A Home Landing (`HomePage`), as rotas pesadas e complexas de edição (`DashboardPage`) e as rotas críticas de visualização pública (`StoryPage`) são desacopladas do bundle central de Javascript usando a técnica `React.lazy()` no arquivo de entrada `App.tsx`.
    *   **Impacto de Negócio**: Isso acelera absurdamente a métrica "Time to Interactive" para leads da campanha de marketing na Landing Page, pois não fazem download das pesadas livrarias do Drag-and-Drop ou parse de data de edições necessárias no Dashboard.

2.  **Imagens e Storage Supabase**:
    *   No seed relacional, observa-se que o bucket `story-images` não tem `avif_autodetection = true` forçado por padrão, mas o frontend invoca imagens e backgrounds no formato `.avif` nativamente nas pastas `public/images/`. A compressão estática é excelente. Resta acompanhar como as fotos enviadas pelos usuários (Jpeg, Png) são escalonadas. Recomenda-se para trabalhos futuros habilitar a transformação dinâmica de imagens do Supabase Storage CDN se o custo não for uma barreira.

3.  **Transições com Filtros de UI**:
    *   O uso de `filter: 'blur(10px)'` no `<AnimatePresence>` é deslumbrante, no entanto, borramento renderizado em WebGL/CSS consome consideravelmente a placa de vídeo de clientes em dispositivos muito fracos (Mobile low-end). A fluidez se mantém dada a limitação de poucos elementos simultâneos animando dessa forma pesada.

## Custos Repetitivos Identificados

1.  **Chamadas API Desacopladas no Front-end**:
    *   O App pode sofrer do sintoma _Waterfall Data Fetching_ no fluxo de Marketing: A aba `#pricing` invoca `fetchAllPlans()`, forçando um round-trip assíncrono para o PostgreSQL para obter os cartões de compra. No Dashboard, executa `loadStory()` que gera *spinners* longos após autenticação.
2.  **Drag and Drop com Re-renderização Massiva**:
    *   Manipulação fotográfica nativa local no Dashboard, onde a edição espelha ativamente um componente em tela gigante do lado ("Studio Monitor") usando `<DashboardPreviewPane>`. A reconstrução inteira do layout com cada tecla apertada pode gargalar máquinas simples com a repetição da renderização da view e cálculo condicional se os *inputs* textuais sofrerem de debounce ruim (a testar na execução).

## Otimizações Constatadas (Bons Tratos)

*   **Evite Repetições (AuthProvider):** O provedor absorveu a métrica `planFeatures` para dentro de suas paredes. Ele funciona como uma fonte de verdade global hidratada na fundação da aplicação, impedindo dezenas de componentes filhos do App consultarem o SGBD para saber a "quantidade de limite de imagem" em toda micro-interação.
