# Technical Debt

## Legacy surface area
- No active Docker/Nginx backend stack remains in the repository.
- No experimental Mercado Pago helper remains in the active Edge Function set.

## Type debt
- The TypeScript model layer does not fully match the real DB plan shape.
- Some UI components and pages rely on runtime behavior that is not reflected in the types.
- Deno modules under `supabase/functions/` are not part of the main TypeScript build story.

## Domain debt
- Payment success still depends on external Mercado Pago behavior that is not fully captured in the repository.

## Maintenance debt
- Several hardcoded URLs remain in metadata, watermarks, and public story defaults.
