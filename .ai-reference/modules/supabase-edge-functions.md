# Supabase Edge Functions Module

## Responsibility
Server-side logic that requires higher privileges, secret management, or complex orchestration.

## Key Functions

### `save-story`
- **Logic**: 
  1. Validates the user session.
  2. Parses multipart form data (JSON story data + binary image files).
  3. Checks plan-based feature limits (image count).
  4. Uploads new images to `story-images` bucket using a service role key.
  5. Calls the PostgreSQL RPC `public.save_story_with_images` to update the database atomically.
  6. Deletes old, replaced images from storage.
- **Security**: Requires a valid `Authorization` header.

### `get-public-story`
- **Logic**:
  1. Resolves a public story by UUID.
  2. Fetches associated images and the owner's plan rules.
  3. If the story has a password, it only returns `requiresPassword: true`.
- **Security**: Publicly accessible, but filters sensitive fields (like hashed passwords).

### `verify-public-story-password`
- **Logic**:
  1. Fetches the story and its hashed password.
  2. Uses `scrypt` to verify the provided password against the stored hash.
  3. Returns the full story data on success.
- **Security**: Publicly accessible; returns an error for incorrect passwords.

### `process-payment` & `stripe-webhook`
- **Logic**:
  - `process-payment`: Validates plan, creates Stripe Checkout session, returns URL.
  - `stripe-webhook`: Verifies signature, maps `checkout.session.completed` and `customer.subscription.*` events to update `profiles`.
- **Security**: Webhook requires signature verification using a secret key.

## Common Infrastructure
- `supabase/functions/_shared/`: Contains common types, CORS headers, and error handling.
- `service_role` key: Used within Edge Functions to bypass RLS for administrative tasks (like saving stories for other users or managing storage).
