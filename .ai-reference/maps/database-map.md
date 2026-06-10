# Database Map

## Core Tables

### `plans`
- **Purpose**: Defines available product tiers and their capabilities.
- **Key Columns**: `id`, `name`, `type`, `price`, `image_limit`, `allow_youtube`, `allow_password_protection`, `allow_custom_button`, `feature_rules`.
- **Integration**: `billing_provider`, `billing_product_id`, `billing_price_id`.

### `profiles`
- **Purpose**: Extends auth user data with application-specific state.
- **Key Columns**: `id` (FK to auth.users), `name`, `plan_id` (FK to plans.id).
- **Billing Sync**: `billing_status`, `billing_subscription_id`, `billing_customer_id`, `billing_current_period_end`.

### `love_stories`
- **Purpose**: Main content for the user's love story.
- **Key Columns**: `id`, `user_id` (FK to profiles.id), `start_date`, `story_text`, `layout_position`, `youtube_url`, `entry_button_text`, `story_password` (hashed).

### `story_images`
- **Purpose**: Ordered gallery for a specific love story.
- **Key Columns**: `id`, `story_id` (FK to love_stories.id), `image_url`, `display_order`.

### `app_config`
- **Purpose**: Global application settings.
- **Key Columns**: `id`, `key`, `value`.
- **Main Keys**: `FRONTEND_URL`.

## Relationships
- `profiles.id` -> `auth.users.id` (1:1)
- `profiles.plan_id` -> `plans.id` (N:1)
- `love_stories.user_id` -> `profiles.id` (1:1)
- `story_images.story_id` -> `love_stories.id` (N:1)

## Storage Buckets
- `story-images`: Public bucket for user-uploaded photos. Filenames are typically UUID-based or prefixed with user/story identifiers.

## RPC / Functions
- `public.save_story_with_images`: Atomic update function for stories and their associated image records.
