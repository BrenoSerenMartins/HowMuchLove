# Backend

## Backend shape
There is no conventional Express backend in the current source tree. The active backend is Supabase Edge Functions plus Supabase hosted services.

## Edge Functions

### `get-all-plans`
- Purpose: return the public plan catalog.
- Inputs: optional auth header, no request body.
- Output: JSON array of active plans with `show_on_pricing_page = true`.
- Dependencies: `plans` table, CORS helper, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- Notes: uses the user authorization header when creating the Supabase client, but the query itself is public-facing.

### `get-public-story`
- Purpose: return a public story by an opaque public identifier.
- Inputs: `storyId` in body or query string.
- Output: story payload or `requiresPassword: true`.
- Dependencies: `profiles.plan_id`, `love_stories`, `story_images`, `plans`, and the UUID-only public identifier resolver.
- Risk: invalid or stale share identifiers now fail immediately instead of attempting backward compatibility.

### `verify-public-story-password`
- Purpose: verify the password for a public story and return the full payload.
- Inputs: `storyId`, `password`.
- Output: full story payload after successful scrypt verification.
- Dependencies: `profiles.plan_id`, `love_stories`, `story_images`, `plans`, and the UUID-only public identifier resolver.
- Risk: no rate limiting on password attempts in the codebase.

### `save-story`
- Purpose: persist the authenticated user story and images.
- Inputs: multipart form with `storyData`, `imageIdsToDelete`, and `newFiles`.
- Output: story ID.
- Dependencies: auth bearer token, service role key, `profiles.plan_id`, `plans`, `love_stories`, `story_images`, storage bucket `story-images`.
- Important: the function now calls a database-side atomic save routine to keep story and image updates consistent.
- Important: storage cleanup for replaced images happens only after the database commit succeeds.
- Important: existing story passwords are preserved unless explicitly cleared; the function no longer re-hashes a stored hash on save.
- Important: feature limits are validated server-side before saving.

### `process-payment`
- Purpose: orchestrate Mercado Pago checkout creation and payment processing.
- Inputs: `planId` or `planName`, and optionally `cardToken` and `paymentMethodId`.
- Output: `init_point` for Checkout Pro, or success metadata for transparent payments.
- Dependencies: `app_config`, `plans`, `profiles`, Mercado Pago APIs, auth bearer token.
- Important: validates the selected plan as active and visible before proceeding.
- Important: validates plan existence by `planId` first and rejects plan mismatches.
- Important: updates `profiles.plan_id` after successful transparent payment.

## Backend conventions
- Edge Functions use CORS preflight handling.
- The service role key is used for admin-level database access.
- Most functions use JSON responses with plain `message` or `error` fields.
- The payment function is the most stateful backend component.
- Shared error logging and response shaping live in `supabase/functions/_shared/errors.ts`.

## Backend gaps
- No webhook handler exists in the repository for Mercado Pago callbacks.
- No queue or cron automation exists in the repository.
- No dedicated backend test suite exists in the repository.
