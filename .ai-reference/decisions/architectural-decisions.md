# Architectural Decisions

## 1. Hash-Based Routing
- **Decision**: Use `window.location.hash` for routing instead of the History API or React Router.
- **Reason**: Simplifies deployment on static hosting providers (like Supabase Storage or simple CDNs) without requiring server-side redirects for deep links.
- **Tradeoff**: URLs look like `#/dashboard` instead of `/dashboard`. Search engine indexing is slightly more complex for deep pages.

## 2. Manual Context-Based Providers
- **Decision**: Build custom `NavigationProvider`, `AuthProvider`, and `NotificationProvider` instead of using a large framework like Redux or TanStack Router.
- **Reason**: Keeps the bundle size small and provides full control over the specific authentication and navigation needs of a single-story-per-user application.
- **Tradeoff**: Requires more boilerplate for basic features like navigation guards and state management.

## 3. Atomic Save via RPC
- **Decision**: Perform story updates and image metadata changes in a single PostgreSQL function (`save_story_with_images`).
- **Reason**: Prevents inconsistent states where a story is updated but its image records are not (or vice versa).
- **Tradeoff**: Moves logic into PL/pgSQL which can be harder to test and version control compared to TypeScript.

## 4. Domain-First Directory Structure
- **Decision**: Organize the codebase by features (`marketing`, `auth`, `customer`, `story`) rather than by technical layers (`components`, `pages`, `services`).
- **Reason**: Improves discoverability and keeps related logic together as the project grows.
- **Tradeoff**: Can lead to duplication of UI patterns if not carefully managed in the `shared/` directory.

## 5. Stripe-Hosted Checkout
- **Decision**: Use Stripe Checkout instead of a custom credit card form (Stripe Elements).
- **Reason**: Minimizes PCI compliance burden and provides a polished, mobile-ready payment experience with zero custom UI work.
- **Tradeoff**: Less control over the exact checkout UI and a redirect away from the main application.
