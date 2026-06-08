# Dependency Map

## High-level graph
- `index.html` -> Vite bundle -> `index.tsx` -> `App.tsx` -> `app/App.tsx`.
- `app/App.tsx` -> `NavigationProvider`, `AuthProvider`, `NotificationProvider`.
- `app/App.tsx` -> semantic route entrypoints under `marketing/`, `auth/`, `customer/`, and `story/`.
- The semantic entrypoints compose feature components from `marketing/landing/sections/`, `shared/pricing/`, `shared/story-editor/`, `customer/dashboard/components/`, `customer/settings/components/`, and `story/public/components/`, plus helper modules from `shared/lib/*`.
- Shared UI and app hooks -> `shared/ui/*`, `app/hooks/*`, `app/providers/*`, `shared/lib/*`.
- `shared/lib/story-api.ts` -> Supabase Edge Functions and Supabase tables.
- `shared/lib/pricing.ts` -> `app_config` and `get-all-plans`.
- `shared/lib/storage.ts` -> public storage URL normalization.
- `AuthProvider` -> Supabase Auth, tables, storage via Edge Functions.

## Strong dependency clusters
| Cluster | Core files | Notes |
|---|---|---|
| Shell | `app/App.tsx`, `shared/ui/Header.tsx`, `shared/ui/Footer.tsx`, `shared/ui/BottomNavBar.tsx` | Shared chrome for most routes. |
| State | `app/providers/AuthProvider.tsx`, `app/providers/NavigationProvider.tsx`, `app/providers/NotificationProvider.tsx` | Cross-page coordination. |
| Story editor | `customer/dashboard/Page.tsx`, `shared/story-editor/CounterDemo.tsx`, `shared/story-editor/StoryPreview.tsx`, `customer/dashboard/components/DashboardSummary.tsx` | Most complex local feature. |
| Public story | `story/public/Page.tsx`, `story/public/components/PublicStory.tsx`, `story/public/components/DurationCounter.tsx`, `story/public/components/YouTubePlayer.tsx` | Public access and rendering. |
| Commerce | `customer/settings/Page.tsx`, `customer/settings/components/TransparentCheckoutForm.tsx`, `process-payment` | Payment orchestration. |
| Pricing | `marketing/landing/Page.tsx`, `shared/pricing/PricingSection.tsx`, `shared/pricing/PlanCard.tsx` | Public plan catalog. |

## Legacy dependencies
- The old `utils/` layer has been flattened into `shared/lib/*`.
- The removed IndexedDB helper is no longer part of the source tree.
- The backend helper surface now lives in `shared/lib/story-api.ts` and `shared/lib/pricing.ts`.
