# Business Rules

## Identity and accounts
- A user authenticates through Supabase Auth.
- The dashboard and settings are protected routes.
- Login and register redirect to the dashboard when successful.
- The profile row is assumed to exist for the authenticated user and to be linked to a plan.

## Story ownership
- One account is treated as owning one main story.
- `save-story` updates the existing story row when one exists for the user, otherwise inserts a new one.
- `loadStory` and the public story functions also assume one story per user.

## Story content rules
- The story may contain a start date, message, images, layout position, YouTube URL, optional access password, and custom entry button text.
- `DurationCounter` renders the elapsed time from `startDate` and updates every second.
- Images are ordered by `display_order`.
- The first image is used as the main background in the public view and dashboard summary.

## Plan rules
- Plans are loaded from `plans` and filtered by `is_active = true` and `show_on_pricing_page = true`.
- The free tier is synthetic (`Gratis`) and is not part of the public pricing catalog.
- Plan features gate image count, YouTube embedding, password protection, and custom entry button text in the editor.
- The UI uses plan names to determine rank and upgrade/downgrade copy.
- Free-plan detection is normalized in code and treats the synthetic free record and `Gratis` name variants as the same free tier.

## Sharing rules
- Public sharing uses a link derived from the authenticated user's `id`, which is opaque and stable.
- The public story functions accept only UUID-based identifiers; old base64 email links are no longer supported.
- If the story has a password, the public page asks for it before returning the full story payload.
- Free-plan stories show a watermark in the public view when the plan resolves to the normalized free tier.

## Payment rules
- Payment mode is controlled by `app_config.CHECKOUT_TYPE`.
- If the mode is `mp_pro`, the first payment call returns `init_point` and the UI redirects to Mercado Pago Checkout Pro.
- If the mode is transparent, the first call returns a marker that opens the transparent checkout modal.
- The backend validates the selected plan by `planId` when available, and rejects inactive or hidden plans.
- After a successful transparent payment, the backend updates `profiles.plan_id`.
- Payment success pages assume the profile plan may already have been updated by an external process or webhook.

## Current enforcement gap
- Plan limits are enforced mostly in the editor UI.
- `save-story` now revalidates the selected plan and feature limits server-side, but the editor still performs the first layer of gating for UX.

## Password rules
- Passwords are hashed with scrypt before storage.
- The public password check compares the plain input against the stored hash.
- The editor keeps the stored hash out of the input state.
- When editing an existing story, leaving the password field blank preserves the current password hash.
- An explicit remove-password control is used when the user wants to clear the existing password.
