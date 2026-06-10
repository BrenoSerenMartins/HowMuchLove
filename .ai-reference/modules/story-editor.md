# Story Editor Module

## Responsibility
Allows users to create and edit their "love story", including dates, text, images, music, and security settings.

## Key Files
- `customer/dashboard/Page.tsx`: Main container for the editor experience.
- `shared/story-editor/CounterDemo.tsx`: The heart of the editor UI, used for both editing and live preview.
- `shared/story-editor/StoryPreview.tsx`: Renders the story content in a preview-friendly format.
- `shared/story-editor/UpgradeToUnlock.tsx`: UI component that blocks features based on plan limits.
- `shared/lib/story-api.ts`: Frontend client for saving and loading story data.
- `shared/lib/storage.ts`: Handles image uploads to Supabase Storage.

## Features
- **Time Counter**: Select a start date and see a live-updating counter.
- **Message Editor**: Simple text input for the story message.
- **Image Gallery**: Support for multiple images with drag-and-drop reordering (via `@dnd-kit`).
- **Music (YouTube)**: Option to add a background song by pasting a YouTube link.
- **Security**: Optional password protection for the public page.
- **Live Preview**: Real-time visualization of how the public page will look.

## State Management
- Local state in `CounterDemo.tsx` and `Dashboard/Page.tsx` manages form values.
- `isDirty` flag tracks unsaved changes to prompt the user before navigation.

## Save Process
1. **Validation**: Checks image limits and other plan-based constraints.
2. **Image Upload**: New images are uploaded to the `story-images` bucket.
3. **Atomic Save**: Calls the `save-story` Edge Function with the complete payload.
4. **Cleanup**: On success, reloads the story data and clears the dirty flag.

## Feature Gating
- Gating logic is centralized in `shared/lib/plans.ts` (`resolvePlanCapabilities`).
- The editor uses these capabilities to disable inputs or show "Upgrade" prompts.
