# Change Impact Matrix

## Core Data Models

### Altering `plans` table
- **Impacts**:
  - `shared/lib/plans.ts`: Capability resolution may break.
  - `shared/lib/pricing.ts`: Plan fetching and checkout session creation.
  - `supabase/functions/process-payment/`: Server-side plan validation.
  - `customer/settings/Page.tsx`: Pricing UI and plan selection.
  - `shared/pricing/PlanCard.tsx`: Visual representation of tiers.

### Altering `profiles` table
- **Impacts**:
  - `app/providers/AuthProvider.tsx`: Initial user state loading.
  - `supabase/functions/stripe-webhook/`: Webhook synchronization logic.
  - `customer/settings/Page.tsx`: User profile and billing info display.

### Altering `love_stories` or `story_images`
- **Impacts**:
  - `shared/lib/story-api.ts`: Save and load operations.
  - `supabase/functions/save-story/`: Atomic save logic and feature validation.
  - `customer/dashboard/Page.tsx`: Editor state management.
  - `story/public/Page.tsx`: Public viewer rendering.

## Shared Infrastructure

### Modifying `NavigationProvider`
- **Impacts**:
  - `app/App.tsx`: Routing orchestration.
  - `app/hooks/useNavigate.ts`: All programmatic transitions.
  - `shared/ui/Header.tsx`, `shared/ui/BottomNavBar.tsx`: Navigation links.

### Modifying `shared/lib/supabase.ts`
- **Impacts**:
  - The entire application's connectivity to the backend.
  - Auth, Database, and Storage client initialization.

## External Integrations

### Updating Stripe Product/Price IDs
- **Impacts**:
  - `plans` table (external ID columns).
  - `process-payment` Edge Function.
  - Successful checkout flow and subsequent webhook processing.

### Changing Supabase Storage Bucket Policies
- **Impacts**:
  - Image uploads in `save-story`.
  - Image viewing in both Dashboard and Public Story pages.
  - Image deletion logic in the backend.

## Critical Paths
1. **User Authentication**: Login/Register must work for any customer action.
2. **Story Saving**: The core value proposition of the app.
3. **Public Viewing**: The final "product" shared by users.
4. **Payment Webhooks**: Ensures users get the features they paid for.
5. **Session Rehydration**: Critical for app startup performance and UX.
