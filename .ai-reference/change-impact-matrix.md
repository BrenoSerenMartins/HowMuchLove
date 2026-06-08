# Change Impact Matrix

## If auth or profile loading changes
- Affected modules: `AuthProvider`, `app/App.tsx`, `auth/login/Page.tsx`, `auth/register/Page.tsx`, `customer/dashboard/Page.tsx`, `customer/settings/Page.tsx`.
- Possible breakage: route guards, plan detection, save-story auth, public story plan rendering.
- Test flows: login, register, refresh, logout, dashboard load.

## If story schema changes
- Affected modules: `AuthProvider.loadStory`, `CounterDemo`, `customer/dashboard/Page.tsx`, `PublicStory`, `StoryPreview`, `story/public/Page.tsx`, `save-story`, `save_story_with_images`, `get-public-story`, `verify-public-story-password`.
- Possible breakage: public share, preview mode, save/reload, password gate.
- Test flows: story edit, save, public view, password-protected view.

## If plan schema changes
- Affected modules: `PricingSection`, `PlanCard`, `AuthProvider`, `CounterDemo`, `customer/settings/Page.tsx`, `save-story`, `save_story_with_images`, `process-payment`, `get-all-plans`.
- Possible breakage: plan display, feature gating, payment flow, current-plan badges.
- Test flows: pricing page, dashboard editor restrictions, settings checkout.

## If payment config changes
- Affected modules: `customer/settings/Page.tsx`, `TransparentCheckoutForm`, `process-payment`, `customer/billing/success/Page.tsx`, `customer/billing/failure/Page.tsx`, `customer/billing/pending/Page.tsx`.
- Possible breakage: checkout redirect, transparent payment modal, profile update.
- Test flows: both checkout modes, redirect return, success toast, profile refresh.

## If public story identity changes
- Affected modules: `customer/dashboard/Page.tsx.generateShareLink`, `story/public/Page.tsx`, `get-public-story`, `verify-public-story-password`, sitemap and share-copy behavior.
- Possible breakage: all public URLs, password gate lookup, share-copy behavior.
- Test flows: public link generation, open shared story, password flow, invalid-link handling.

## If assets or shell chrome change
- Affected modules: `app/App.tsx`, `shared/ui/Header.tsx`, `shared/ui/Footer.tsx`, `shared/ui/BottomNavBar.tsx`, `shared/ui/PageWrapper.tsx`, `index.html`.
- Possible breakage: background rendering, mobile nav, header CTAs, payment result pages.
- Test flows: desktop shell, mobile shell, payment result pages, shell image/logo assets.
