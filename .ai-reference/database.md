# Database

## Confirmed data surfaces
- Supabase Auth stores users and sessions.
- Postgres stores app data.
- Supabase Storage stores story images in a bucket named `story-images`.

## Observed tables

### `plans`
Confirmed from code:
- `id`
- `name`
- `price`
- `type`
- `external_id`
- `image_limit`
- `allow_youtube`
- `allow_password_protection`
- `allow_custom_button`
- `features`
- `billing_cycle`
- `is_featured`
- `is_active`
- `show_on_pricing_page`

Inferred:
- likely a primary key on `id`
- likely a uniqueness constraint on `name`

### `profiles`
Confirmed from code:
- `id`
- `name`
- `plan_id`

Behavior:
- `id` matches the Supabase auth user ID.
- `plan_id` is joined as `plans (*)`.

### `love_stories`
Confirmed from code:
- `id`
- `user_id`
- `start_date`
- `story_text`
- `layout_position`
- `youtube_url`
- `entry_button_text`
- `story_password`

Behavior:
- one story per user is assumed by all save/load functions.
- `story_password` stores a scrypt hash, not the raw password.

### `story_images`
Confirmed from code:
- `id`
- `story_id`
- `image_url`
- `display_order`

Behavior:
- image ordering is restored by sorting on `display_order`.
- image deletion is handled by ID and storage file path reconstruction.

### `app_config`
Confirmed from code:
- `key`
- `value`

Used for:
- `MERCADO_PAGO_PUBLIC_KEY`
- `MERCADO_PAGO_ACCESS_TOKEN`
- `CHECKOUT_TYPE`
- `FRONTEND_URL`
- `MP_TEST_USER_EMAIL`

## Migrations present in repo
- `20251117024849_add_show_on_pricing_to_plans.sql` adds `show_on_pricing_page` to `plans`.

## Constraints and assumptions
- The repository does not contain the full schema, RLS policies, or trigger definitions.
- The code assumes a profile row exists for every auth user.
- The code assumes a relation between `profiles.plan_id` and `plans.id`.
- The code assumes `love_stories.user_id` is unique per user.

## Database risks
- Plan enforcement is not duplicated in `save-story`.
- Public story lookup depends on email rather than a random public token.
- The schema is only partially documented in repository files, so some constraints are inferred.

