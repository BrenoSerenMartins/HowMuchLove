# Performance

## Positive performance choices
- Page-level lazy loading reduces the initial bundle.
- Most landing-page sections are static and inexpensive to render.
- The editor preview and public story use image cross-fades instead of large rerenders.

## Bottlenecks and costs
- `get-public-story` and `verify-public-story-password` now avoid the legacy admin user scan entirely.
- `DurationCounter` updates every second and rerenders its display continuously.
- `PublicStory` can animate multiple layered images and a YouTube player.
- The dashboard reloads story data after every save.
- `process-payment` makes a remote call to Stripe plus a small number of Supabase lookups.

## Caching opportunities
- Plan data is fetched on page mount without client caching.
- The public story payload is now keyed by a stable opaque UUID and could be cached by story ID if future requirements allow it.
- The plan catalog is effectively public and could be cached at the edge.

## Bundle and asset notes
- The marketing page includes large static images and third-party scripts.
- `@dnd-kit` and `react-datepicker` are only needed in the editor, so lazy loading them could further reduce the initial bundle.
- Build output shows a relatively large main chunk, with `CounterDemo` and the root bundle being the largest pieces.

## Observed warnings during build
- Browserslist data is stale.
- `baseline-browser-mapping` warns that its data is older than two months.
