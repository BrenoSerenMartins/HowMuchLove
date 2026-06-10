# Technical Debt

## Legacy surface area
- No active Docker/Nginx backend stack remains in the repository.
- No experimental payment helper remains in the active Edge Function set beyond the Stripe checkout/webhook pair.

## Type debt
- The TypeScript model layer does not fully match the real DB plan shape.
- Some UI components and pages rely on runtime behavior that is not reflected in the types.
- Deno modules under `supabase/functions/` are not part of the main TypeScript build story.

## Domain debt
- Stripe subscription management is limited to hosted checkout plus webhook sync; there is no customer portal or in-app plan swap flow yet.

## Maintenance debt
- Several hardcoded URLs remain in metadata, watermarks, and public story defaults.
