# Mapa de Eventos

A aplicação não utiliza um Event-Bus tradicional (Kafka, RabbitMQ) no Backend.

## Eventos do Front-End (Client-Side)
- **Supabase Auth Events:** O provedor principal `AuthProvider` escuta mudanças no estado de autenticação (`onAuthStateChange`). Quando um login, logoff ou recuperação de senha acontece assincronamente pelo serviço externo, o evento emite atualização imediata na Store.
- **Form State Events:** Inputs de preenchimento disparam eventos de Change em tempo real limitados pela arquitetura React/DOM, capturados pelo `useFormValidator` e pelo `CounterDemo`.
