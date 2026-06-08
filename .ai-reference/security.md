# Security

## Confirmed security controls
- Authenticated operations use Supabase Auth sessions.
- Story passwords are hashed with scrypt before storage.
- Payment processing uses the service role key in Edge Functions, not in the browser.
- Save story requests require a bearer access token.

## Security-sensitive dependencies
- `save-story` uses the service role to write tables and storage.
- `process-payment` reads secret configuration from `app_config`.

## Main risks
- Public story links are UUID-only; old base64 email links are no longer accepted.
- Client-side plan gating is still a UX layer, but save and payment flows now revalidate plan restrictions server-side.
- No rate limiting or lockout is implemented for password guessing.
- Public story lookup now avoids a full admin user list scan, which removes the privacy and performance cost of the legacy path.

## UI/security mismatches
- The story editor no longer exposes the stored password hash in the input state.
- Existing passwords are preserved unless the user explicitly removes them.
- The plan-name mismatch issue in the payment flow has been removed from the current implementation.

## Secret handling notes
- Supabase anon key is embedded in the frontend by design.
- Supabase service role key stays server-side in Edge Functions.
- Mercado Pago keys are stored in `app_config`, not in the frontend bundle.
