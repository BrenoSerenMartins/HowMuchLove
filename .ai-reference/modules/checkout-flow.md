# Checkout Flow

## Scope
`customer/settings/Page.tsx`, `customer/settings/components/TransparentCheckoutForm.tsx`, `shared/pricing/PricingSection.tsx`, `shared/lib/pricing.ts`, `shared/lib/supabase.ts`, `customer/billing/success/Page.tsx`, `customer/billing/failure/Page.tsx`, `customer/billing/pending/Page.tsx`, and `supabase/functions/process-payment/index.ts`.

## Objective
Sell plans, process payments, and refresh the user plan after payment success.

## Flow
1. The settings route entrypoint loads the plan catalog and Mercado Pago public key via `shared/lib/pricing.ts`.
2. Clicking a plan calls `process-payment` with the selected `planId` and `planName` to determine the checkout mode and validate the plan server-side.
3. Checkout Pro returns `init_point` and redirects the browser.
4. Transparent checkout opens the modal and initializes the Mercado Pago card form.
5. A successful tokenization triggers a second `process-payment` call with the token and selected `planId`.
6. The profile plan is refreshed after a successful transparent payment.

## Payment mode rules
- `CHECKOUT_TYPE = mp_pro` selects redirect-based checkout.
- Any other value selects transparent checkout.
- The backend reads `MERCADO_PAGO_ACCESS_TOKEN` from `app_config`.

## Result pages
- Success page toasts success, refreshes the user, and redirects to dashboard after a delay.
- Failure and pending pages are informational and route back to dashboard.

## Risks
- No webhook file exists in the repository, so Checkout Pro success state depends on external handling.
- Transparent checkout depends on the SDK global and browser support.
- The modal flow is tied to `app_config` values, not frontend flags.
- `process-payment` still depends on Mercado Pago API availability and secret configuration stored in `app_config`.
