# Mapa de Rotinas Temporizadas (Cron)

Não há instâncias agendadas de execução (CronJobs) visíveis neste repositório.

## Áreas Potenciais que Demandam/Demandariam Cron:
1. **Limpeza de Lixo Storage:** Usuários que inserem fotos no drag-and-drop mas nunca salvam geram mídias orfãs.
2. **Expurgo de Plano Grátis:** Conforme a premissa de negócio diz que apenas assinaturas salvam "para sempre", planos grátis inativos precisariam ser rodados em batch para desativação/deleção.
*A implementação disto, dado o ecosistema, ocorreria via extensões nativas `pg_cron` diretamente ativadas no painel SQL do Supabase Database.*
