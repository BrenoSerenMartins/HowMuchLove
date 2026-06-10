# Public Story Module

## Responsibility
Renders the final "love story" page for viewers using a shared link.

## Key Files
- `story/public/Page.tsx`: The route entrypoint that handles story loading and password protection.
- `shared/ui/story-view/PublicStory.tsx`: The main visual component for the story content.
- `shared/ui/story-view/DurationCounter.tsx`: Specialized version of the counter for public viewing.
- `shared/story-editor/StoryPreview.tsx`: Reuses `PublicStory` for a true 1:1 simulation.

## Viewing Flow
1. **Identifier Resolution**: The `id` from `#/story/:id` is treated as a UUID.
2. **Initial Load**: Calls `get-public-story`.
3. **Password Gate**: If the response indicates a password is required, shows a secure input field.
4. **YouTube Entry Gate**: If a YouTube URL is present, shows an entry button (text customizable by plan) to satisfy browser requirements for autoplaying audio.
5. **Content Rendering**: Displays the main photo, elapsed time counter, story text, and the full image gallery.

## Features
- **Responsive Layout**: Adapts the story layout (Top/Bottom) based on the `layout_position` setting.
- **Watermark**: Displays a "Criado com Amor" watermark for stories on the free plan.
- **YouTube Audio**: Plays the background music once the user interacts with the page.
- **Gallery**: Interactive image gallery showing all uploaded photos.

## Performance
- Images are served via Supabase Storage public URLs.
- The page is lightweight to ensure fast loading on mobile devices.
