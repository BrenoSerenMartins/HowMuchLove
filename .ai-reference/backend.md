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
- Purpose: create a Stripe Checkout session for the selected paid plan.
- Inputs: `planId`.
- Output: hosted checkout `url` and session id metadata.
- Dependencies: request `Origin`/`Referer` fallback plus `app_config.FRONTEND_URL`, `plans`, `profiles`, Stripe API, auth bearer token.
- Important: validates the selected plan as active and visible before proceeding.
- Important: validates plan existence by `planId` and rejects plans that are not Stripe-backed or are missing a Stripe price id.
- Important: no longer writes plan membership directly; billing state is synchronized by `stripe-webhook`.
- Important: supports both subscription and one-time Stripe Checkout sessions depending on the plan type.

### `stripe-webhook`
- Purpose: synchronize Stripe subscription and checkout events back into `profiles`.
- Inputs: raw Stripe webhook event body.
- Output: event acknowledgment JSON.
- Dependencies: `profiles`, `plans`, Stripe webhook secret, Stripe API for subscription lookups.
- Important: updates `profiles.plan_id` and billing metadata after checkout completion and subscription lifecycle events.

## Backend conventions
- Edge Functions use CORS preflight handling.
- The service role key is used for admin-level database access.
- Most functions use JSON responses with plain `message` or `error` fields.
- The payment function and the Stripe webhook are the most stateful backend components.
- Shared error logging and response shaping live in `supabase/functions/_shared/errors.ts`.

## Backend gaps
- Stripe webhook handling now exists and is the canonical billing sync path.
- No queue or cron automation exists in the repository.
- No dedicated backend test suite exists in the repository.
