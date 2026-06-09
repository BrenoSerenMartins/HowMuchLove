# Story Editor

## Scope
`customer/dashboard/Page.tsx`, `shared/story-editor/CounterDemo.tsx`, `shared/story-editor/StoryPreview.tsx`, `shared/story-editor/UpgradeToUnlock.tsx`, `customer/dashboard/components/DashboardSummary.tsx`, `customer/dashboard/components/QRCodeModal.tsx`.

## Objective
Allow authenticated users to create, preview, edit, save, and share their love story.

## Flow
1. Dashboard route entrypoint loads the current story via `loadStory()`.
2. If a story exists, a summary card is shown first.
3. The user can switch into edit mode.
4. `CounterDemo` binds editor state to the local story model.
5. Saving posts the story and image changes to `save-story`.
6. A successful save reloads the story and shows a toast.

## Editor responsibilities
- Set the story start date.
- Edit the message.
- Upload, delete, and reorder images.
- Set layout position.
- Set YouTube URL, password, and entry button text when the plan allows it.

## Important mechanics
- Image edits are optimistic and local until saved.
- Existing images are identified by `story_id`; new images are matched by `originalFilename`.
- The save function fully replaces the image list to preserve order through a database-side atomic function.
- Preview mode renders a dedicated compact story preview with the current unsaved data and the current plan so the dashboard stays readable without reusing the full public page layout.
- Existing passwords are not loaded back into the editor as raw hashes.
- Leaving the password input blank preserves the current hash; an explicit removal control clears it.

## Feature gating
- Free plans are limited by `UpgradeToUnlock` in the UI and revalidated again on the server when saving.
- Image count is bounded by `planFeatures.image_limit` in the UI and in `save-story`.
- YouTube, password, and custom button inputs are wrapped in plan gates and are rejected server-side when the plan does not allow them.

## Known risks
- The story editor depends on a one-story-per-user assumption.
