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
1. `marketing/landing/Page.tsx` fetches the Mercado Pago public key and visible plans in parallel.
2. The hero and marketing sections render.
3. The demo editor is shown with no authenticated plan features.
4. Pricing cards call `navigate('/register')` for unauthenticated users.

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
1. `customer/settings/Page.tsx` loads the plan catalog and Mercado Pago key.
2. Clicking a plan sends `planId` and `planName` to `process-payment` to detect the flow and validate the plan server-side.
3. For Checkout Pro, the response contains `init_point` and the browser is redirected.
4. For transparent checkout, the modal opens.
5. The card form creates a token and calls `process-payment` again with payment data and the selected `planId`.
6. On success, the UI refreshes the profile and closes the modal.

## Password edit flow
1. `customer/dashboard/Page.tsx` loads the story without exposing the stored password hash.
2. If the story already has a password, the editor shows a removal control and leaves the input blank.
3. Saving with a blank password preserves the current hash.
4. Checking the removal control clears the stored hash.

## Logout flow
1. The shell calls `logout()`, which opens a confirmation modal.
2. `performLogout()` signs out via Supabase.
3. Local auth state is cleared and the free plan is restored.
