# Routes Map

## Public Routes (Marketing)
- `/`: `marketing/landing/Page.tsx` - Main landing page with hero, features, how it works, FAQ, and final CTA.

## Auth Routes
- `/login`: `auth/login/Page.tsx` - User authentication page.
- `/register`: `auth/register/Page.tsx` - New user registration page.

## Protected Routes (Customer Area)
- `/dashboard`: `customer/dashboard/Page.tsx` - Main user dashboard, contains the story editor and live preview.
- `/settings`: `customer/settings/Page.tsx` - Account settings, billing management, and plan selection.

## Public Story Route
- `/story/:id`: `story/public/Page.tsx` - The public shared story page. The `:id` is a UUID matching the user's ID.

## Billing/Payment Redirect Routes
- `/payment-success`: `customer/billing/success/Page.tsx` - Redirect target after successful Stripe checkout.
- `/payment-failure`: `customer/billing/failure/Page.tsx` - Redirect target after failed or cancelled Stripe checkout.
- `/payment-pending`: `customer/billing/pending/Page.tsx` - Redirect target after Stripe checkout when payment is still processing (e.g., async payment methods).

## Technical Implementation
- Routing is hash-based (`window.location.hash`).
- Managed by `app/providers/NavigationProvider.tsx`.
- Handled via `useNavigate` hook for transitions.
- Route mapping and lazy loading are orchestrated in `app/App.tsx`.
