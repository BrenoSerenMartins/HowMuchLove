# Overview

## Purpose
HowMuchLove is a single-page React application for creating and sharing a "love story" page with a time counter, photo gallery, optional YouTube background music, optional password protection, and plan-based feature gating.

## Confirmed runtime model
- Frontend stack: Vite + React 18 + TypeScript + Tailwind CSS.
- Routing model: hash-based routing implemented manually in `NavigationProvider` / `NavigationContext`, not React Router.
- Auth model: Supabase Auth session rehydration on app boot.
- Persistence model: Supabase Postgres + Supabase Storage.
- Server model: Supabase Edge Functions, not a dedicated Express backend in the current source tree.

## Main entrypoints
- Browser bootstrap: `index.html`, `index.tsx`.
- App orchestration: `App.tsx` as a compatibility export, with the real shell in `app/App.tsx`.
- Semantic route entrypoints: `marketing/landing/Page.tsx`, `auth/*/Page.tsx`, `customer/*/Page.tsx`, `story/public/Page.tsx`.
- Shared shell and providers: `app/providers/*`, `app/hooks/*`, `shared/ui/*`.
- Feature implementation layer: `marketing/landing/sections/*`, `shared/pricing/*`, `shared/story-editor/*`, `customer/dashboard/components/*`, `customer/settings/components/*`, `story/public/components/*`, `shared/lib/*`.
- Public data/services: `shared/lib/story-api.ts`, `shared/lib/pricing.ts`, `shared/lib/supabase.ts`, `shared/lib/storage.ts`, `shared/lib/validators.ts`.
- Serverless endpoints: `supabase/functions/*`.

## Product surface
- Public landing page with marketing sections and pricing.
- Auth pages for login and register.
- Authenticated customer area for editing the story and managing settings/billing.
- Public story page for shared links.
- Payment result pages for checkout redirects.

## Copy and messaging
- User-facing copy is centralized in `shared/lib/ui-copy.ts`.
- Error parsing and technical fallback messages remain in `shared/lib/errors.ts`, which should be treated as a contract layer rather than a general text source.
- The landing page marketing sections, auth screens, dashboard/account flows, pricing cards, and checkout messaging all read from `uiCopy` where possible.

## Structural note
- The codebase is being migrated toward a semantic, domain-first tree.
- New entrypoints live under `app/`, `customer/`, `marketing/`, `auth/`, `story/`, and `shared/`.
- The old `pages/`, `contexts/`, and `hooks/` folders were removed after the migration pass.
- The remaining feature implementation is split across domain folders, shared feature folders, and `shared/lib/` instead of a flat `components/` tree.

## Most important invariants
- There is effectively one love story per authenticated user.
- The story share link is derived from the Supabase auth `user.id` and only UUID-based links are accepted.
- Plan restrictions are enforced in the UI for UX and revalidated on the backend for `save-story` and payment processing.
- Free-plan behavior depends on a synthetic `Gratis` plan object that does not come from the pricing catalog.

## High-risk findings already confirmed
- `npm run build` and `npx tsc --noEmit` both pass after the current restore and cleanup pass.
- Public sharing now uses an opaque UUID-based identifier and old email-derived URLs are no longer accepted.
- Story password editing no longer exposes the stored hash in the editor state; the backend preserves the existing hash unless the user explicitly removes it.
- `save-story` now performs image replacement through an atomic database function and only cleans up storage after the database commit succeeds.
- Shell image and logo references now point at assets that actually exist in `public/images/`.

## Source of truth
- UI behavior should be read from the React source files, not the generated `dist/` folder.
- Data model expectations are inferred from code because there are no full schema migrations in the repository.
