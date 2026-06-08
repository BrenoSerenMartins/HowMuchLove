# Forbidden Patterns

## Do not add or extend
- Business logic only in the controller/page layer when a backend or service layer is appropriate.
- Any new feature gate that exists only in the browser.
- Direct use of raw email as a public story identifier.
- New payment behavior without updating the `process-payment` contract and its consumers.
- New story persistence behavior without checking the image ordering and deletion semantics.
- New public story fields without updating both the public page and the password-protected path.
- Additional secret values in the frontend bundle.

## Do not repeat
- Duplicating story rendering logic without a clear reason and explicit synchronization plan.
- Using base64 as if it were an access token.
- Loading hashed credentials back into editable form inputs.
- Adding backend routes that bypass Supabase functions without documenting the impact.
- Adding new plan fields without updating the TypeScript model and the pricing mappers.

## Do not weaken
- Auth checks for `/dashboard` and `/settings`.
- Service-role-only operations in Edge Functions.
- Ordered replacement semantics for `story_images`.
- Password hashing for stored story passwords.

