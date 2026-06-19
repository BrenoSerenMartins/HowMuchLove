# Módulo: Story (Public View)

## Objetivo
Exibir a experiência central (Cápsula do tempo) para destinatários, o qualificador do produto.

## Responsabilidade
- Entregar uma página Single Page em tela cheia otimizada.
- Bloquear conteúdo por senha, quando necessário.
- Controlar o ecossistema e loop de aúdio/vídeo (YouTube Embed).

## Contexto de Negócio
O usuário final pagou para gerar o link. Este módulo é a execução da promessa comercial; tem o dever estético de rodar polidamente em celulares, e funcionar imune a bugs visuais.

## Arquivos Envolvidos
- `story/public/Page.tsx`
- `shared/lib/story-api.ts` (Dependência direta atômica).
- `shared/ui/story-view/PublicStory.tsx`

## Fluxo Completo
1. Resolução do parâmetro da URL: extrai `userId` do caminho da navegação (e.g. `/story/abc`).
2. Tenta fazer um fetch limpo (`fetchPublicStory(userId)`).
3. Avalia retorno: 
   - Se for senha protegida, trava a página principal atrás de um formulário. Quando senha é testada com sucesso via `verifyStoryPassword()`, os dados fluem.
4. Avalia Aúdio: Se existir música, uma Tela Oculta ("Portão") exige ação tátil ("Entrar"), contornando bloqueios de Autoplay.
5. A UI oficial assume o controle, injetando as fotos enviadas com orbes de partículas e calculando a data atual até a data informada com exatidão (`date-fns`).

## Dependências Diretas
- `framer-motion` (Ocultação dramática temporal `ENTRY_TRANSITION_MS`).
- API de Iframe Nativa do YouTube / SDKs de Vídeo.

## Regras de Negócio Ocultas e Side Effects
- Se o carregamento apontar `notFound`, uma rota silenciosa substituta (`errorKind: 'notFound'`) substitui a página.
- Vazamento e Sigilo de Senha: a comparação nunca é feita em React (`senha1 === senha2`). Ela repousa no RPC Supabase.

## Impacto e Regressões Mapeadas
- Qualquer bug introduzido nas transições condicionais do "Portão" renderá uma *tela preta permanente* arruinando o produto. Esse módulo é extremamente sagrado e suas alterações de `ENTRY_TRANSITION_MS` requerem QA pesado.
