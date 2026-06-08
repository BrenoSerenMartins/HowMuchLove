# Landing Page

## Scope
`marketing/landing/Page.tsx`, `marketing/landing/sections/*`, `shared/story-editor/CounterDemo.tsx`, `shared/pricing/*`, and `shared/lib/pricing.ts`.

## Objective
Convert anonymous visitors into registered users by showing the product value, a live demo, and the pricing ladder.

## Flow
1. The landing route entrypoint fetches the plan catalog and Mercado Pago public key via `shared/lib/pricing.ts`.
2. The marketing sections explain the product.
3. The demo editor lets visitors try the experience without authentication.
4. Pricing cards send anonymous users to register.

## Key behaviors
- Section anchors are used for smooth scrolling from header and bottom nav.
- `CounterDemo` on the home page is read as a demo, not a persistent editor.
- Pricing cards are centered on the featured plan or current plan if logged in.
- The plan catalog is pulled from Supabase instead of being hardcoded.

## Business rules visible here
- Free trial behavior is emphasized in copy, but actual persistence only happens after login.
- The price table excludes plans that are inactive or hidden from pricing.
- The CTA always routes anonymous users to register before plan selection.

## Risks
- Plan data load failure leaves the page with empty pricing cards.
- Several anchor IDs are hardcoded across sections, so renaming them breaks navigation.
- The demo editor does not enforce the same constraints as the dashboard editor.
