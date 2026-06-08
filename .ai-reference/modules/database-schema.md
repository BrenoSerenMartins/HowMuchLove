# Database Schema

## Scope
Observed schema shapes inferred from `AuthProvider`, `shared/lib/pricing.ts`, and all Edge Functions.

## Main entities
- `plans`
- `profiles`
- `love_stories`
- `story_images`
- `app_config`

## Relationship model
- `profiles.plan_id` references `plans.id`.
- `love_stories.user_id` matches the auth user ID and is treated as one story per user.
- `story_images.story_id` references `love_stories.id`.
- `app_config` is a key/value lookup table.

## Storage model
- Bucket: `story-images`.
- Uploaded files are made public and later converted to public URLs.

## Schema risks
- The full schema is not in the repository.
- RLS policies are not documented in the repository.
- Triggers for profile creation are only hinted at by comments.
