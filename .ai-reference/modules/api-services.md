# API Services

## Scope
`shared/lib/story-api.ts`, `shared/lib/pricing.ts`, `shared/lib/storage.ts`, `shared/lib/supabase.ts`, `shared/lib/validators.ts`, `shared/lib/errors.ts`, `app/hooks/useAuth.ts`, `app/hooks/useNavigate.ts`, `app/hooks/useFormValidator.ts`.

## Responsibility
- Provide shared clients and helper functions.
- Keep UI pages thin by centralizing repeated remote calls, storage normalization, and validation helpers.

## Current status
- `shared/lib/supabase.ts` is the active Supabase client used everywhere.
- `shared/lib/story-api.ts` contains the active public story fetch and password verification calls.
- `shared/lib/pricing.ts` contains the plan catalog and Mercado Pago public key lookups.
- `shared/lib/storage.ts` contains storage URL normalization and payload normalization helpers.
- `shared/lib/validators.ts` contains the string validators used by auth forms.
- `shared/lib/errors.ts` contains shared error normalization and logging helpers for client-side services.
- The old IndexedDB helper file was removed because it was not part of the current UI flow.

## Validation helpers
- Required check.
- Email regex check.
- Minimum length validator.
- Password validator composed from required + minimum length.

## Service risks
- Type typing for `import.meta.env` is still runtime-backed in the Vite app.
- The public story helpers still depend on the Edge Function contract staying stable.
