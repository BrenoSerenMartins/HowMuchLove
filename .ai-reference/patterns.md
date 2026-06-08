# Patterns

## Confirmed patterns
- Provider sandwich pattern around the entire app.
- Hash-based manual routing instead of a router library.
- Route-level code splitting with `React.lazy`.
- Glassmorphism visual language across most pages.
- Client-side composition of page sections on the landing page.
- Reusable confirmation modal for destructive or blocking actions.
- Reusable toast notification system for non-blocking feedback.
- Editor/preview split for the story creation experience.

## Data patterns
- Supabase row shapes are mapped directly into UI-facing TypeScript types.
- Story images are re-saved in a full replace strategy to preserve order.
- Public story rendering is shared between the public view and the dashboard preview through a thin wrapper.

## Commerce patterns
- Plan data is fetched from the database rather than being hardcoded.
- Checkout type is configured from `app_config`.
- The same payment Edge Function handles both flow selection and transaction processing.

## Anti-patterns already present
- Legacy browser-side helpers are gone, but some hardcoded external URLs still exist in metadata, watermark text, and public story defaults.
- Mixed-responsibility service files should stay out of the active `shared/lib` layer.
