# Tradeoffs

## What the current architecture optimizes for
- Fast iteration on a single frontend repository.
- Low infrastructure overhead.
- Clear visual control over the story experience.
- Tight integration with Supabase-managed services.

## What the current architecture sacrifices
- Strict server-side enforcement of every possible plan gate across every screen.
- A fully typed backend contract.
- Separation between product logic and UI logic.
- Some story presentation concerns still depend on context-specific wrappers.

## Operational tradeoffs
- Using Edge Functions simplifies deployment but increases dependence on Supabase runtime behavior.
- Keeping the service helpers in `shared/lib/*` is cleaner than a generic `utils/` bucket, but it still means the browser talks directly to Supabase Edge Functions and `app_config` for some flows.
- Using UUID-only public story identifiers removes a privacy-sensitive admin lookup path and keeps share resolution cheap.
- Loading the story hash back into the editor is convenient for continuity but unsafe for password handling.
