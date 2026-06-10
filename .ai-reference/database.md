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
- `billing_provider`
- `billing_product_id`
- `billing_price_id`
- `image_limit`
- `allow_youtube`
- `allow_password_protection`
- `allow_custom_button`
- `feature_rules`
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
- `billing_provider`
- `billing_customer_id`
- `billing_subscription_id`
- `billing_price_id`
- `billing_status`
- `billing_current_period_end`
- `billing_cancel_at_period_end`

Behavior:
- `id` matches the Supabase auth user ID.
- `plan_id` is the authoritative plan pointer and is resolved explicitly by code when loading the current user plan.

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
- `FRONTEND_URL`

## Migrations present in repo
- `20251117024849_add_show_on_pricing_to_plans.sql` adds `show_on_pricing_page` to `plans`.
- `20260609000000_add_plan_integration_metadata_and_feature_rules.sql` adds `billing_provider`, `billing_product_id`, `billing_price_id`, and `feature_rules` to `plans`.
- `20260609010000_add_stripe_billing_fields_to_profiles.sql` adds Stripe billing sync fields to `profiles`.
- `20260608000000_save_story_atomic.sql` creates the `public.save_story_with_images(...)` RPC used by `save-story` to persist the story and its ordered images atomically.

## Migration notes
- The `show_on_pricing_page` migration is written defensively so it can be applied to a restored database that already contains the column.
- `plans.feature_rules` is intentionally JSON-based so future billing integrations can override limits and feature flags without schema churn.
- The atomic story-save RPC is part of the server contract; if it is missing from the remote database, `save-story` fails at runtime even when the edge function itself is deployed.

## Constraints and assumptions
- The repository does not contain the full schema, RLS policies, or trigger definitions.
- The code assumes a profile row exists for every auth user.
- The code assumes a relation between `profiles.plan_id` and `plans.id`.
- The code assumes `love_stories.user_id` is unique per user.

## Database risks
- Plan enforcement is not duplicated in `save-story`.
- Public story lookup now depends on UUID-only story identifiers and fails closed when the story cannot be resolved.
- The schema is only partially documented in repository files, so some constraints are inferred.
