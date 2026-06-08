# Integrations

## Supabase
- Auth: login, register, logout, session restoration.
- Database: plan lookup, profile lookup, story lookup, image ordering, config lookup.
- Storage: `story-images` bucket for uploads and public URLs.
- Edge Functions: all server orchestration for public story, save story, plan listing, and payment.

## Mercado Pago
- Frontend SDK is loaded in `index.html`.
- Public key is read from `app_config` and passed to `TransparentCheckoutForm`.
- Checkout Pro is used when `CHECKOUT_TYPE = mp_pro`.
- Transparent checkout uses card tokenization via the SDK and then a backend payment call.

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
- YouTube and Mercado Pago both rely on globally injected scripts.
- External assets and SDKs can fail silently if blocked by network policy or CSP.
- Public story links are UUID-only, so any stale email-derived link will now fail instead of resolving through a compatibility path.
