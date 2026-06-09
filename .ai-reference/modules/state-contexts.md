# State Contexts

## Scope
`app/providers/AuthProvider.tsx`, `app/providers/NavigationProvider.tsx`, `app/providers/NotificationProvider.tsx`, `app/hooks/useAuth.ts`, `app/hooks/useNavigate.ts`.

## AuthProvider
- Owns the Supabase session and user profile data through the provider wrapper.
- Exposes `login`, `register`, `logout`, `performLogout`, `saveStory`, `loadStory`, and `refreshUser`.
- Keeps a synthetic `Gratis` plan as the default fallback.
- Depends on a `profiles` row with `plan_id`, which is resolved into the current plan record.
- Hard requirement: if profile data is missing or malformed, the context falls back to anonymous state.

## NavigationProvider
- Owns the current hash route.
- Owns dirty-state navigation blocking.
- Owns preview mode.
- Provides a custom `navigate` function that mutates `window.location.hash`.
- `getRouteFromHash()` strips nested hashes after the first route segment.

## NotificationProvider
- Owns toast stack state through the provider wrapper.
- Provides `addToast` and `removeToast`.
- Toast IDs are generated locally with a simple random string helper.
- Type contract currently only allows `success` and `error`, although some callers pass `info`.

## Design implications
- Most pages and components are not coupled directly to Supabase; they go through hooks and context.
- Most pages and components are not coupled directly to Supabase; they go through providers and hooks.
- Global behaviors such as preview mode and route blocking are not handled by a router library.
- Context state is the primary source of cross-page coordination.

## Risks
- A missing provider will break all child consumers.
- Auth and navigation are tightly coupled through route guards in `app/App.tsx`.
- The notification system is used for payment and save feedback, so any type mismatch changes user-visible semantics quickly.
