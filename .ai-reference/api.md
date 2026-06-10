# API

## Frontend service surface

### `fetchPublicStory(storyId)`
- Source: `shared/lib/story-api.ts`
- Calls: `supabase.functions.invoke('get-public-story')`
- Input contract: accepts a UUID-based public story identifier only.
- Returns: story payload or `null` when the Edge Function says the story is not found.

### `verifyStoryPassword(storyId, password)`
- Source: `shared/lib/story-api.ts`
- Calls: `supabase.functions.invoke('verify-public-story-password')`
- Returns: full story payload or throws on password failure.

### `fetchAllPlans()`
- Source: `shared/lib/pricing.ts`
- Calls: `supabase.functions.invoke('get-all-plans')`
- Returns: plan list or `null` on function error.

### `normalizeSupabaseStorageUrl(url)`
- Source: `shared/lib/storage.ts`
- Rewrites legacy public storage URLs so restored content keeps working after the project ref changed.

### `normalizeStoryImages(images)` / `normalizeLoveStoryData(story)`
- Source: `shared/lib/storage.ts`
- Ensures story payloads always expose image URLs normalized to the current Supabase origin.

### `validateRequired(value)` / `validateEmail(email)` / `validateMinLength(minLength)` / `validatePassword`
- Source: `shared/lib/validators.ts`
- Used by the auth forms and generic form validation hook.

### Error normalization helpers
- Source: `shared/lib/errors.ts`
- Responsibilities: normalize unknown client-side errors into user-facing messages, standardize log context, and parse structured error payloads returned by Edge Functions.

## Edge Function API contracts
- `get-all-plans`: returns an array of plans.
- `get-public-story`: returns either `requiresPassword`, a full story payload, or an error message.
- `verify-public-story-password`: returns a full story payload or a password error.
- `save-story`: accepts multipart form data, revalidates plan restrictions server-side, persists the story and its ordered images via an atomic database function, and returns `storyId`.
- `process-payment`: validates the selected plan, creates a Stripe Checkout session for the configured `billing_price_id`, and returns a hosted checkout `url` using the request origin as the primary redirect base.
- `stripe-webhook`: verifies Stripe webhook signatures, then synchronizes subscription state back into `profiles.plan_id` and billing metadata.
- All frontend wrappers now prefer structured error payloads from the Edge Functions and fall back to a shared user-facing message when the payload is missing or malformed.

## Error handling conventions
- Supabase function errors are usually surfaced as plain text or JSON `message` / `error` fields.
- UI components commonly show toast messages from caught exceptions.

## API risks
- Stripe and Supabase secrets for the Edge Functions live outside the frontend bundle, so the checkout contract still relies on runtime environment configuration and deployed function secrets.
