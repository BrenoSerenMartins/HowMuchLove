# Integration Map

## Supabase
- **Authentication**: Used for user sign-in/sign-up and session management.
- **PostgreSQL**: Primary data store for profiles, stories, images, and plans.
- **Storage**: `story-images` bucket for user-uploaded assets.
- **Edge Functions**: Serverless logic for payments, webhooks, and complex story operations.

## Stripe
- **Checkout**: Hosted payment pages for plan upgrades.
- **Webhooks**: Async notification of payment success, failures, and subscription lifecycle changes.
- **API**: Used by `process-payment` to create checkout sessions.

## YouTube
- **Embedding**: Used to play background music on public story pages.
- **URL Resolution**: Logic in `shared/lib/validators.ts` to extract video IDs.

## Cloudflare (Optional/Deployment)
- **Wrangler**: Configuration in `wrangler.jsonc` suggests potential use for static site hosting or proxying, though Vite/Vercel/Netlify are more common for this stack.

## Google
- **Analytics (GA4)**: Basic tracking injected via `index.html`.
- **Fonts**: `Poppins` and `Dancing Script` loaded from Google Fonts.
