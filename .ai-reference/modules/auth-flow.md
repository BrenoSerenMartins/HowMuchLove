# Auth Flow Module

## Responsibility
Manages user identity, registration, login, and session persistence.

## Key Files
- `app/providers/AuthProvider.tsx`: The primary state container for authentication.
- `app/hooks/useAuth.ts`: Hook for consuming auth state and actions.
- `auth/login/Page.tsx`: Login form page.
- `auth/register/Page.tsx`: Registration form page.
- `shared/lib/supabase.ts`: Supabase client used for auth operations.

## Registration Process
1. User provides name, email, and password.
2. `supabase.auth.signUp` is called.
3. On success, a `profiles` row is automatically created (usually via Supabase DB trigger, though not visible in migrations).
4. The user is assigned the default `Gratis` plan.
5. The session is established, and the user is redirected to the dashboard.

## Login Process
1. User provides email and password.
2. `supabase.auth.signInWithPassword` is called.
3. Profile and current plan information are fetched.
4. The user is redirected to the dashboard.

## Session Management
- `supabase.auth.onAuthStateChange` is used to listen for session updates.
- Sessions are persisted in `localStorage` by the Supabase client.
- The `App` component waits for the initial session rehydration before rendering protected content.

## Profile Sync
- The `profiles` table stores the relationship between the Auth User and their assigned Plan.
- `profiles.plan_id` is the source of truth for feature gating.
- Billing updates from Stripe (via webhooks) modify the `profiles` table to reflect new plans or expiration dates.
