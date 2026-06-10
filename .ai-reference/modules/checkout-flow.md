# Checkout Flow

## Scope
`customer/settings/Page.tsx`, `shared/pricing/PricingSection.tsx`, `shared/lib/pricing.ts`, `shared/lib/supabase.ts`, `customer/billing/success/Page.tsx`, `customer/billing/failure/Page.tsx`, `customer/billing/pending/Page.tsx`, `supabase/functions/process-payment/index.ts`, and `supabase/functions/stripe-webhook/index.ts`.

## Objective
Sell plans through Stripe Checkout, then synchronize the resulting subscription state back into the user profile.

## Flow
1. The settings route entrypoint loads the plan catalog through `shared/lib/pricing.ts`.
2. Clicking a plan calls `process-payment` with the selected `planId`.
3. The Edge Function validates the plan server-side, confirms it is Stripe-backed, and creates a hosted Checkout session using the plan's `billing_price_id`.
4. The browser is redirected to the Stripe-hosted checkout page.
5. Stripe redirects back to the success or failure route.
6. The `stripe-webhook` function receives the real payment/subscription events and updates `profiles.plan_id` plus billing metadata.
7. The success page refreshes the authenticated user state so the updated plan becomes visible in the UI.

## Payment mode rules
- Paid plans must be marked with `billing_provider = 'stripe'`.
- `billing_price_id` is the external Stripe price used to create the checkout session.
- `type = 'subscription'` creates a subscription checkout session.
- `type = 'one-time'` creates a one-time payment checkout session.
- The public frontend URL is resolved from the request `Origin` or `Referer` first, then falls back to `app_config.FRONTEND_URL`, so Stripe can redirect back into the hash-based router even when the site is served from a tunnel or preview domain.

## Result pages
- Success page toasts success, refreshes the user, and redirects to dashboard after a delay.
- Failure and pending pages route the user back to the settings pricing section so they can try again.

## Webhook rules
- `checkout.session.completed` is the first synchronization point and marks the profile with the selected plan and billing ids.
- `customer.subscription.updated` and `customer.subscription.deleted` keep the profile synced with the subscription status.
- `invoice.paid` and `invoice.payment_failed` update the current billing state so recurring plans stay in sync after renewals and failures.

## Risks
- The checkout depends on the plan row being fully configured with a Stripe price id.
- The webhook depends on the remote Stripe secret and webhook secret being deployed correctly.
- Plan changes are currently modeled as a direct profile sync, not as a full customer-portal subscription management flow.
