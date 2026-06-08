# Conventions

## Routing conventions
- Hash routes always start with `#/`.
- Public routes and protected routes are filtered in `app/App.tsx`; the root `App.tsx` file is only a compatibility export.
- In-page anchors use a second hash fragment, for example `#/settings#pricing-section`.

## Naming conventions
- React components use PascalCase file names.
- Route entrypoints use `Page.tsx` inside semantic folders.
- Context hooks use `useX` names.
- Supabase Edge Functions use kebab-case directory names.
- Database column names are snake_case.

## Data conventions
- Client-facing story data uses camelCase.
- Database-facing story data uses snake_case.
- Plan feature flags are read as booleans from the DB.
- The free tier is named `Gratis`.

## UI conventions
- Cards and modals use glass backgrounds with a blurred backdrop.
- Sections are animated with the same fade-in class family.
- Scrollable sections hide their scrollbars.
- User-facing text should be sourced from `shared/lib/ui-copy.ts` when it is reused or semantically significant.

## Error conventions
- Most forms surface errors in a `form` field.
- Toast types are intended to be `success` or `error`, but some call sites pass `info`.
- Edge functions return plain text or JSON error payloads, depending on the code path.
- `shared/lib/errors.ts` is for technical error normalization and protocol fallback strings, not general UI copy.
