# Architectural Decisions

## Manual hash routing
Decision: use `window.location.hash` and custom route parsing instead of a router library.
Reason: simple deployment and compatibility with static hosting.
Tradeoff: route guards, anchors, and nested hash handling must be managed manually.

## Supabase-first backend
Decision: use Supabase Auth, Postgres, Storage, and Edge Functions as the backend platform.
Reason: lowers operational footprint and keeps the app serverless.
Tradeoff: tighter coupling to Supabase schema and admin APIs.

## Story image full replace
Decision: rewrite the entire image list on save instead of diffing individual items.
Reason: guarantees final order and simplifies persistence.
Tradeoff: higher write cost and more complex delete/upload orchestration.

## UUID-derived public story id
Decision: derive the share identifier from the Supabase auth `user.id` and accept UUID-only public links.
Reason: keeps the link opaque, stable, and independent of the user's email address.
Tradeoff: old email-derived links are no longer supported and must be regenerated if they still exist in the wild.

## Plan gating in the UI
Decision: gate several features in the editor and pricing UI using plan flags.
Reason: fast feature rollout and simple UX.
Tradeoff: the same plan rules must also be revalidated server-side in save/payment flows to avoid drift.

## Server-side plan validation for checkout
Decision: validate the selected plan in `process-payment` using `planId` when available and reject inactive or hidden plans.
Reason: reduces trust in client-selected plan names and keeps checkout aligned with the plan catalog.
Tradeoff: checkout now depends on the plan id being available in the UI flow.

## Shared preview renderer
Decision: keep `StoryPreview` as a thin wrapper over `PublicStory`.
Reason: keeps the dashboard preview aligned with the public story without maintaining a second renderer.
Tradeoff: preview-specific tweaks need to remain compatible with the public story component contract.
