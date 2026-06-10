# Integrations

## Supabase
- Auth: login, register, logout, session restoration.
- Database: plan lookup, profile lookup, story lookup, image ordering, config lookup, and billing state sync.
- Storage: `story-images` bucket for uploads and public URLs.
- Edge Functions: all server orchestration for public story, save story, plan listing, and payment.

## Stripe
- Checkout is created server-side from the `process-payment` Edge Function.
- The plan row must provide `billing_provider = 'stripe'` and a valid `billing_price_id`.
- Stripe Checkout is hosted, so the frontend only receives a redirect URL.
- The `stripe-webhook` function is the source of truth for subscription lifecycle updates back into `profiles`.

## YouTube
- The page extracts the video ID from a URL and loads the IFrame API script dynamically.
- Playback is hidden offscreen and controlled from the public story view.

## Google Analytics
- GA4 script is loaded directly in `index.html`.

## Fonts and assets
- Google Fonts loads `Poppins` and `Dancing Script`.
- App chrome depends on assets in `/images`.

## Browser APIs
- `window.location.hash` for routing.
- `indexedDB` for legacy local story storage.
- `IntersectionObserver` for message reveal in public stories.
- `navigator.share` and `navigator.clipboard` for QR/share actions.
- `URL.createObjectURL` for previewing uploaded images.

## Integration risks
- YouTube relies on a globally injected script.
- External assets and SDKs can fail silently if blocked by network policy or CSP.
- Public story links are UUID-only, so any stale email-derived link will now fail instead of resolving through a compatibility path.
