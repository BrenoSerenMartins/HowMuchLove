# Landing Page

## Scope
`marketing/landing/Page.tsx`, `marketing/landing/sections/*`, and `shared/story-editor/CounterDemo.tsx`.

## Objective
Convert anonymous visitors into registered users by showing the product value, a live demo, and a strong CTA to register.

## Flow
1. The landing route entrypoint renders the marketing sections.
2. The marketing sections explain the product.
3. The demo editor lets visitors try the experience without authentication.
4. The CTAs route anonymous users to register.

## Key behaviors
- Section anchors are used for smooth scrolling from header and bottom nav.
- `CounterDemo` on the home page is read as a demo, not a persistent editor.
- The landing page no longer renders the pricing ladder. Plan selection now happens in the authenticated account flow.

## Business rules visible here
- Free trial behavior is emphasized in copy, but actual persistence only happens after login.
- The CTA always routes anonymous users to register.

## Risks
- Several anchor IDs are hardcoded across sections, so renaming them breaks navigation.
- The demo editor does not enforce the same constraints as the dashboard editor.
