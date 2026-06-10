# Tradeoffs

## Custom Hash Routing vs. React Router
- **Pros**: Zero dependencies, absolute control over navigation lifecycle, 100% compatibility with static hosting.
- **Cons**: No out-of-the-box support for transitions, deep linking requires `window.location.hash` parsing, manual handling of "go back" behavior.
- **Decision**: Custom Hash Routing won for its simplicity in a Supabase-centric environment.

## Manual State Providers vs. Global Store (Redux/Zustand)
- **Pros**: Explicit data flow, no extra library overhead, easy to debug via React DevTools.
- **Cons**: Potential for "provider hell" (nested wrappers), manual optimization to avoid unnecessary re-renders.
- **Decision**: Manual Providers were chosen as the app state is relatively shallow and scoped to discrete domains (Auth, Nav, Notifications).

## Supabase Edge Functions vs. Custom API (Node/Express)
- **Pros**: Seamless integration with Supabase Auth/DB, zero server management, auto-scaling.
- **Cons**: Deno runtime limitations, cold start latency, harder local development setup (requires Supabase CLI).
- **Decision**: Edge Functions are the backbone for high-privilege operations, keeping the project "serverless".

## Inline Styles/Tailwind vs. CSS Modules/Sass
- **Pros**: Fast prototyping, zero CSS bundle management, consistent design system.
- **Cons**: JSX can become cluttered with utility classes, complex animations sometimes require `<style>` tags.
- **Decision**: Tailwind CSS is the primary styling engine for its productivity benefits.

## Stripe Checkout vs. Embedded Elements
- **Pros**: Zero security risk for card data, native support for Apple/Google Pay, handles localized payment methods (Pix, etc.) automatically.
- **Cons**: Interrupted user experience (external redirect), less "premium" integrated feel.
- **Decision**: Stripe Checkout was selected to prioritize security and speed to market.
