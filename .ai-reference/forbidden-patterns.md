# Padrões Proibidos (Forbidden Patterns)

A proteção da estética e da engenharia estabelecida deste produto depende de não quebrar princípios duramente elaborados. **Nunca pratique ou comita código com estes padrões:**

## 1. Bypass Direto de Validação no Frontend vs SDK API
🚫 **Proibido:** Modificar campos estritos submetidos diretamente ao `saveStory()` pelo SDK Supabase bypassando os middlewares sem o tratamento local pelo `useFormValidator`. 
*   **Por que?** O Backend falhará de maneira obscura dependendo do RLS, ou pior, encherá o PostgreSQL com inconsistências se as restrições não existirem nativamente no banco. Utilize a camada controladora local para rejeitar inputs grotescos na fonte.

## 2. Abordagens Mistas de Requisições "Fetch/Axios"
🚫 **Proibido:** Incorporar pacotes como `Axios` ou chamar APIs com `fetch` rudimentar para se comunicar com recursos controlados pela Plataforma.
*   **Solução:** Tudo que orbita o banco de dados e os microserviços (Edge Functions) é injetado sob a guarda e padronização contida na referência `supabase.ts` (ex: `supabase.functions.invoke`).

## 3. Lógica de Redirecionamento Direta no `window.location` Interno
🚫 **Proibido:** Usar `window.location.href = '/dashboard'` para migrar visualizações internas da plataforma em locais lógicos dentro dos componentes.
*   **Solução:** Sempre injetar e usar o hook `const { navigate } = useNavigate()`, que manipula a interceptação do dirty-state e aciona a fluidez das animações Framer Motion `<AnimatePresence>`. *A exceção ocorre apenas em navegação extrínseca do projeto, e.g., rotear forçadamente pro site do Stripe.*

## 4. Omissão de Pseudo-Classes Visuais em Elementos Interativos
🚫 **Proibido:** Criar links genéricos ou submissões que não mudam a *cor*, *opacidade* ou transicionam algum pixel lateral com uma seta indicadora aquando houver interação pseudo-classe (`:hover`, `:focus`). O projeto depende estritamente dessa reatividade.
*   **Solução:** Adicione `.group` nas âncoras e propague as pseudo classes animadas internas (Exemplo clássico: `<ArrowRight className="transition-transform group-hover:translate-x-1" />`).

## 5. Chamadas Complexas do SGBD dentro dos Componentes Burros
🚫 **Proibido:** Implementar chamadas estáticas explícitas e brutais (ex: `const data = await supabase.from('plans').select('*')`) misturadas dentro de componentes simples do `shared/ui`. 
*   **Solução:** Trate-os através da "Lift State Up" ou hooks customizados. Todos os acessos remotos deverão residir logicamente nos diretórios de página (`Page.tsx`) ou ser centralizados em bibliotecas isoladas como se faz no `fetchPublicStory`.
