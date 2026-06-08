# Supabase Edge Functions

## Scope
`supabase/functions/get-all-plans/index.ts`, `supabase/functions/get-public-story/index.ts`, `supabase/functions/verify-public-story-password/index.ts`, `supabase/functions/save-story/index.ts`, `supabase/functions/process-payment/index.ts`, `supabase/functions/_shared/cors.ts`, `supabase/functions/_shared/errors.ts`.

## Function responsibilities
- `get-all-plans`: public plan listing.
- `get-public-story`: public payload lookup.
- `verify-public-story-password`: password verification and full payload return.
- `save-story`: authenticated story persistence and image storage.
- `process-payment`: payment orchestration and profile plan update.

## Cross-cutting behavior
- All functions handle CORS preflight.
- The service role key is used for admin operations.
- JSON payloads and simple error strings are the common response style.
- Shared error logging and error-response shaping is centralized in `supabase/functions/_shared/errors.ts`.

## Shared risks
- No typed database contract exists in the repo.
- Most functions assume specific table and relation names.
- `process-payment` is the only function with external payment side effects.
