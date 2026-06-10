# Forbidden Patterns

## Architectural Constraints

### ❌ NO Direct Database Access in UI
- Components must NOT use `supabase.from('...')` directly for business logic.
- Use service helpers in `shared/lib/` (e.g., `story-api.ts`, `pricing.ts`) to encapsulate data access.

### ❌ NO Manual Route Manipulation
- Components must NOT modify `window.location.hash` directly.
- Use the `navigate` function from `useNavigate` hook to ensure state consistency and proper guarding.

### ❌ NO Hardcoded Plan Names for Logic
- Do NOT use strings like `"Sonho"` or `"Eterno"` to gate features.
- Use `resolvePlanCapabilities` from `shared/lib/plans.ts` to check for `imageLimit`, `allowYoutube`, etc.

### ❌ NO Raw Image URLs in State
- Do NOT store or pass around raw Supabase Storage URLs without normalization.
- Use `normalizeSupabaseStorageUrl` from `shared/lib/storage.ts` to ensure the correct origin is used.

### ❌ NO Plaintext Passwords in Storage
- Stories must NEVER store plaintext passwords.
- Password protection must use the `scrypt` hashing provided by the `verify-public-story-password` and `save-story` backend functions.

### ❌ NO Business Logic in View Components
- Keep JSX files focused on presentation.
- Move complex calculations, validation, or data transformation to `shared/lib/` or custom hooks.

### ❌ NO Direct Storage Deletion from UI
- The frontend should NOT call `supabase.storage.from(...).remove(...)`.
- Storage cleanup must be handled by the `save-story` Edge Function to ensure consistency with database records.

### ❌ NO Circular Dependencies in `shared/lib/`
- Keep service helpers focused and avoid cross-importing between them (e.g., `story-api` should not depend on `pricing` if possible).
- Shared types should live in `types.ts` to prevent circular imports.
