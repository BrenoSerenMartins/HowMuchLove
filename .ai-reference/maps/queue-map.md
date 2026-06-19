# Mapa de Filas (Queues)

Atualmente a aplicação trabalha sob processamento estritamente **Síncrono/Bloqueante** na interação cliente-servidor para CRUDs.

- **Processamento de Imagem:** Diferente de grandes arquiteturas que despacham uploads para workers secundários rodarem compressão, as imagens do `HowMuchLove` sobem inteiramente via cliente Web e são consumidas pelo bucket CDN. Não existem filas (ex: SQS, Redis Bull, Celery) configuradas.

**Recomendação de Impacto Futuro:**
Se for inserida a feature "Gerar Vídeo a partir de Fotos", a arquitetura precisará invocar Edge Functions assíncronas que disparem jobs de fila e notifiquem o frontend via SSE/WebSockets.
