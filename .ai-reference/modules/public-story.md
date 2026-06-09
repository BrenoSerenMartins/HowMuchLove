# Public Story

## Scope
`story/public/Page.tsx`, `story/public/components/PublicStory.tsx`, `story/public/components/DurationCounter.tsx`, `story/public/components/YouTubePlayer.tsx`, `shared/lib/story-api.ts`.

## Objective
Render a shareable public page for a story link, including password gate, entry gate, music, watermark, and time counter.

## Flow
1. The route entrypoint extracts the encoded story identifier.
2. The app requests the public payload from `get-public-story`.
3. The backend resolves the story using the UUID-based public identifier only.
4. If a password is required, the password form is shown.
5. If a YouTube URL exists, the entry screen is shown until the visitor clicks through.
6. `PublicStory` renders the counter, image layers, message, watermark, and player for the real public route. The dashboard preview uses a separate compact preview component and does not rely on this page layout.
7. When the visitor clicks through an entry-gated story, the overlay fades out slowly while the underlying story fades in over the same window so the visual entry matches the music fade.

## Behavior details
- The first image acts as the background and also drives the page mood.
- Multiple images are cross-faded on a timer.
- The message section fades in when it enters the viewport.
- When a story has YouTube music, the player starts muted in the background and fades the volume in after the visitor clicks through the entry screen.
- The public entry gate and the story content both use a long coordinated fade so the page does not appear abruptly after the click.
- Watermark rendering is tied to normalized free-plan detection rather than a single hardcoded literal.

## Dependencies
- `DurationCounter` computes elapsed time every second.
- `YouTubePlayer` injects the YouTube IFrame API, manages mute state, and ramps volume on entry so the audio transition is not abrupt.
- The public story data shape is shared with the dashboard editor and save path, and the fetch/verify logic lives in `shared/lib/story-api.ts`.

## Risks
- The current share flow is opaque and UUID-only.
- Public story lookup no longer performs an admin user scan.
- If the plan relation is missing, watermark behavior can become inconsistent.
