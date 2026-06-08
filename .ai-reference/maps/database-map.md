# Database Map

## Tables and read/write paths

| Table | Read paths | Write paths | Notes |
|---|---|---|---|
| `plans` | `get-all-plans`, `process-payment`, `AuthProvider` via join | Not written by app code | Plan catalog and feature flags. |
| `profiles` | `AuthProvider`, `get-public-story`, `verify-public-story-password`, `process-payment` | `process-payment` | User name and plan membership. |
| `love_stories` | `AuthProvider.loadStory`, `get-public-story`, `verify-public-story-password` | `save-story` | Main story payload. |
| `story_images` | `AuthProvider.loadStory`, `get-public-story`, `verify-public-story-password`, `save-story` | `save-story` | Ordered image list. |
| `app_config` | `shared/lib/pricing.ts`, `process-payment` | Not written by app code | Payment and frontend configuration. |

## Relationship map
- `profiles.plan_id -> plans.id`
- `love_stories.user_id -> auth user id`
- `story_images.story_id -> love_stories.id`

## Storage map
- Bucket `story-images` stores uploaded story photos.
- Public URLs are generated after upload and stored in `story_images.image_url`.
