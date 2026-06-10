# Flows

## App bootstrap flow
1. Browser loads `index.html`.
2. `index.tsx` mounts the React app.
3. `AuthProvider` calls `supabase.auth.getSession()`.
4. If a session exists, it fetches `profiles` plus the joined `plans` record.
5. `app/App.tsx` renders the shell and the page selected by the hash route.

## Login flow
1. User opens `/login`.
2. `auth/login/Page.tsx` validates email and password with `useFormValidator`.
3. `AuthProvider.login` calls `supabase.auth.signInWithPassword`.
4. The profile and plan are fetched from Supabase.
5. The app navigates to `/dashboard`.

## Register flow
1. User opens `/register`.
2. `auth/register/Page.tsx` validates name, email, and password.
3. `AuthProvider.register` calls `supabase.auth.signUp`.
4. The user is provisionally assigned the synthetic `Gratis` plan in local state.
5. The app navigates to `/dashboard`.

## Landing page flow
1. `marketing/landing/Page.tsx` renders the hero and marketing sections.
2. The demo editor is shown with no authenticated plan features.
3. The primary CTAs call `navigate('/register')` for unauthenticated users.

## Dashboard edit flow
1. `customer/dashboard/Page.tsx` loads the current story with `loadStory()`.
2. If a story exists, a summary card is shown first.
3. Clicking edit mounts `CounterDemo` in dashboard mode.
4. Local edits mark the page dirty via `setIsDirty(true)`.
5. Save posts a multipart request to the `save-story` Edge Function.
6. After save, the story is reloaded and a toast is shown.

## Preview flow
1. The dashboard can switch to preview mode.
2. Preview mode hides the shell chrome through `NavigationProvider`.
3. `PublicStory` renders the current local story data.
4. The user can return to the editor without leaving the dashboard route.

## Public story flow
1. `story/public/Page.tsx` extracts `storyId` from the hash route.
2. The app calls `get-public-story`.
3. The backend resolves the story using the UUID-based public identifier only.
4. If the story requires a password, the password screen is shown.
5. If the story has a YouTube URL, the entry screen appears until the user clicks through.
6. `PublicStory` renders the story with the counter, images, watermark, and music player.

## Settings and payment flow
1. `customer/settings/Page.tsx` loads the plan catalog.
2. Clicking a plan sends `planId` to `process-payment`.
3. The Edge Function validates the plan server-side, creates a Stripe Checkout session, and returns a hosted checkout URL.
4. The browser is redirected to Stripe Checkout.
5. Stripe sends webhook events to `stripe-webhook`, which updates `profiles.plan_id` and billing metadata.
6. The success page refreshes the profile state and returns the user to the dashboard.

## Plan model flow
1. Plan rows are loaded from `get-all-plans`.
2. The UI treats `billing_provider`, `billing_product_id`, `billing_price_id`, and `feature_rules` as integration metadata rather than presentation data.
3. `shared/lib/plans.ts` resolves feature capabilities from the same row so the editor and server can read the same source of truth.
4. `save-story` revalidates the resolved capability set before persisting story changes.

## Password edit flow
1. `customer/dashboard/Page.tsx` loads the story without exposing the stored password hash.
2. If the story already has a password, the editor shows a removal control and leaves the input blank.
3. Saving with a blank password preserves the current hash.
4. Checking the removal control clears the stored hash.

## Logout flow
1. The shell calls `logout()`, which opens a confirmation modal.
2. `performLogout()` signs out via Supabase.
3. Local auth state is cleared and the free plan is restored.
