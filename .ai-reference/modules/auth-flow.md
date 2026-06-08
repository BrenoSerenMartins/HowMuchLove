# Auth Flow

## Scope
`auth/login/Page.tsx`, `auth/register/Page.tsx`, `app/providers/AuthProvider.tsx`, `app/hooks/useAuth.ts`, `app/hooks/useFormValidator.ts`, `shared/lib/validators.ts`.

## Objective
Create and rehydrate authenticated users and route them into the protected area of the app.

## Flow
1. Login/register pages build local form state with `useFormValidator`.
2. Validation runs before submission.
3. `AuthProvider` calls Supabase Auth.
4. On success, the profile and plan are loaded or a provisional `Gratis` user is created.
5. The UI navigates to `/dashboard`.

## Validation rules
- Required fields cannot be blank.
- Email must match a simple regex.
- Password must be at least six characters.

## Data dependencies
- Login and register both assume the Supabase auth backend is reachable.
- Login additionally assumes the profile row and plan relation exist.
- Register assumes some external bootstrap path will create the profile row later if needed.

## Risks
- Form-level error handling depends on exceptions being thrown by the auth methods.
- The validation hook is generic but only supports string fields.
- Password validation is minimal and does not enforce complexity beyond length.
