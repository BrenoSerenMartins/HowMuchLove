# Testing

## Current state
- No dedicated automated test suite is present in the repository.
- `npm run build` succeeds.
- `npx tsc --noEmit` fails, which means type-level regressions are currently visible only through manual validation.

## What should be tested manually
- Auth bootstrap after refresh.
- Login and register redirects.
- Dashboard story load, edit, save, and re-open.
- Image upload, deletion, and drag reorder.
- Free-plan and paid-plan feature gating.
- Public story with and without password.
- Public story with and without YouTube entry screen.
- Checkout Pro redirect path.
- Transparent checkout path.
- Logout confirmation flow.
- Mobile bottom nav and anchor scrolling.

## High-value regression tests to add
- One story per user should stay true across save and load.
- Password-protected stories should not re-hash the stored hash on edit.
- Free-plan users should not be able to bypass share restrictions.
- Public story links should remain stable and opaque.
- Payment success should update the profile plan deterministically.

