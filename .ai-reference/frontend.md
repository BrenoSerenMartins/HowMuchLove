# Frontend

## Frontend composition
The frontend is organized by semantic domains and route entrypoints. The shell logic lives in `app/App.tsx`; the root `App.tsx` file is only a compatibility export. The migration target is a domain-first tree:
- `app/` for shell, providers, and routing orchestration.
- `customer/` for the authenticated product area.
- `marketing/` for the public landing funnel.
- `auth/` for login and register flows.
- `story/` for the public story experience.
- `shared/` for reusable UI primitives and shell chrome.

The semantic route tree now owns the page layer. The remaining implementation detail lives mostly in `marketing/landing/sections/`, `shared/pricing/`, `shared/story-editor/`, `customer/dashboard/components/`, `customer/settings/components/`, `story/public/components/`, and `shared/lib/`.

## Route entrypoints
- `marketing/landing/Page.tsx` is the marketing and discovery page.
- `auth/login/Page.tsx` and `auth/register/Page.tsx` handle auth forms.
- `customer/dashboard/Page.tsx` is the story editor and summary screen.
- `customer/settings/Page.tsx` handles account data and payment.
- `story/public/Page.tsx` renders public shared stories.
- `customer/billing/success/Page.tsx`, `customer/billing/failure/Page.tsx`, and `customer/billing/pending/Page.tsx` are redirect landing pages.

## Reusable UI layer
- Shell: `shared/ui/Header.tsx`, `shared/ui/Footer.tsx`, `shared/ui/BottomNavBar.tsx`, `shared/ui/PageWrapper.tsx`.
- Modals: `shared/ui/ConfirmModal.tsx` and `customer/dashboard/components/QRCodeModal.tsx`.
- Feedback: `shared/ui/Toast.tsx`, `shared/ui/LoadingSpinner.tsx`.
- Story UI: `shared/story-editor/CounterDemo.tsx`, `shared/story-editor/StoryPreview.tsx`, `story/public/components/PublicStory.tsx`, `customer/dashboard/components/DashboardSummary.tsx`, `story/public/components/DurationCounter.tsx`.
- Commerce UI: `shared/pricing/PricingSection.tsx`, `shared/pricing/PlanCard.tsx`, `shared/story-editor/UpgradeToUnlock.tsx`.
- Plan capability resolution is centralized in `shared/lib/plans.ts`. UI code should prefer that helper over re-deriving image limits or feature flags from raw plan names, because it supports `feature_rules` overrides and integration metadata.
- Plan cards no longer depend on hardcoded names like `Sonho` or `Eterno` for their visual state; featured state and relative price drive the upgrade/current/downgrade treatment.
- The checkout path is Stripe-hosted. The frontend only requests a session URL and redirects the browser; no card form lives in the app bundle anymore.
- UI copy is centralized in `shared/lib/ui-copy.ts`. Route and feature components should prefer that file for user-facing labels, button text, empty states, marketing copy, and success/error copy instead of scattering ad-hoc strings.
- `shared/lib/errors.ts` remains the technical fallback/contract layer for parsing backend and client errors; it is not the source of truth for general UI wording.
- The landing page no longer renders the pricing ladder; pricing and checkout are now concentrated in the authenticated account flow.

## State model
- Global auth state comes from `app/providers/AuthProvider.tsx` and `app/hooks/useAuth.ts`.
- Navigation state comes from `app/providers/NavigationProvider.tsx` and `app/hooks/useNavigate.ts`.
- Toast notifications come from `app/providers/NotificationProvider.tsx`.
- Most form state is local or handled by `app/hooks/useFormValidator.ts`.

## Design system
- Tailwind utility classes are the main styling mechanism.
- The theme uses dark glassmorphism panels on top of a romantic background image.
- Fonts are loaded from Google Fonts and exposed via `Poppins` and `Dancing Script`.
- Several components inject local `<style>` blocks for custom animations.

## Responsiveness
- Desktop uses wider cards and chrome.
- Mobile uses bottom navigation and horizontal scrolling sections.
- `PricingSection`, `FeaturesSection`, `HowItWorksSection`, and `SocialProofSection` deliberately switch between carousel-like mobile layouts and grid desktop layouts.

## Notable UI conventions
- `animate-fade-in-slide-up` is a repeated entrance animation.
- `hide-scrollbar` hides horizontal scrollbars on carousels.
- Glass panels use `bg-black/30`, `backdrop-blur-xl`, and white borders.
- The shell background is fixed and shared across routes.

## Frontend risks
- Client-side feature gating still exists for UX, but the server now revalidates plan limits on story save and plan checkout.
- Plan rows can carry provider metadata (`billing_provider`, `billing_product_id`, `billing_price_id`) and `feature_rules` JSON overrides, so future billing changes should extend the data model before touching the editor gate logic.
- The migration still has two visible layers in the component/service surface, so file ownership must be read carefully: semantic route/shell files first, domain feature folders and `shared/lib` second.
