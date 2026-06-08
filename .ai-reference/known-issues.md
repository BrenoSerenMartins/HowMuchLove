# Known Issues

## Confirmed by code and/or type checking
- `npm run build` and `npx tsc --noEmit` currently pass.
- Several Supabase function files are not type-resolvable under the local TypeScript config because they are Deno modules, so they need separate validation.

## Architectural issues
- Public story IDs are UUID-only; old base64 email links from earlier versions are no longer accepted.
- The current frontend no longer depends on a browser-side `utils` layer or IndexedDB persistence.
