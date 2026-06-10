# Architecture

## Architectural style
This project is a client-heavy SPA with serverless backends. The UI owns most of the orchestration, while Supabase provides authentication, database access, file storage, and Edge Functions.

## Layering
- Shell and route entrypoints: `app/App.tsx` plus the semantic route folders under `marketing/`, `auth/`, `customer/`, and `story/`.
- Shared UI layer: `shared/ui/*`.
- Client state layer: `app/providers/*`, `app/hooks/*`.
- Service layer: `shared/lib/story-api.ts`, `shared/lib/pricing.ts`, `shared/lib/plans.ts`, `shared/lib/storage.ts`, `shared/lib/supabase.ts`, `shared/lib/validators.ts`.
- Backend layer: `supabase/functions/*`.
- Data layer: Supabase Postgres tables, auth users, and storage bucket `story-images`.

## Routing model
- Route state lives in `NavigationContext`.
- The route is derived from `window.location.hash`.
- `app/App.tsx` switches pages by string matching on the route.
- Root `App.tsx` is a compatibility export that points at `app/App.tsx`.
- Nested hash fragments are used for in-page anchors such as `#/settings#pricing-section`.

## Composition model
- `app/App.tsx` wraps the entire app in `NavigationProvider`, `AuthProvider`, and `NotificationProvider`.
- The shell renders global background, header, footer, mobile bottom nav, modals, and toast container.
- Route entrypoints own the feature-specific composition and import shared feature components directly.

## Data ownership
- Supabase Auth owns the identity/session.
- `profiles` owns user name and plan membership.
- `plans` owns plan metadata and feature flags.
- `love_stories` owns the story body and access restrictions.
- `story_images` owns image ordering and URLs.
- `app_config` owns payment and deployment configuration values.

## Coupling characteristics
- Strong coupling exists between UI types and Supabase row shapes.
- Strong coupling exists between public story links and the auth `user.id`; the public identifier is UUID-only.
- Strong coupling exists between plan names and feature rank logic.
- Strong coupling exists between payment behavior and the Stripe plan metadata (`billing_provider`, `billing_price_id`) plus the webhook sync path.

## Boot sequence
1. `index.html` loads fonts, GA4, and the Vite bundle.
2. `index.tsx` mounts `App` into `#root`.
3. `AuthProvider` rehydrates the session with `supabase.auth.getSession()`.
4. `app/App.tsx` blocks rendering until auth loading completes.
5. The current hash route selects the page component.

## Architectural drift
- The service helpers live in `shared/lib/*` and talk directly to Supabase Edge Functions and tables.
- The semantic tree is the preferred edit surface now, but several feature implementations are still physically located in the domain feature folders and `shared/lib/` while the shell and route layers are fully migrated.
