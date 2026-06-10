# Dependency Map

## Frontend Dependencies

### Core
- `react`: UI library.
- `typescript`: Type safety.
- `vite`: Build tool and dev server.
- `tailwindcss`: Styling.

### Supabase
- `@supabase/supabase-js`: Client for DB, Auth, and Storage.

### Utilities
- `date-fns`: Date formatting and calculation for the story counter.
- `qrcode.react`: Generates QR codes for story sharing.
- `@dnd-kit/*`: Drag and drop for image reordering in the editor.
- `react-datepicker`: Date selection for the story start date.

## Backend Dependencies (Edge Functions)
- `Deno` runtime.
- `Stripe`: Payment processing API.
- `Supabase SDK`: Database and storage access.

## External Services
- **Supabase**: Auth, DB, Storage, Edge Functions.
- **Stripe**: Billing, Subscriptions, Checkout.
- **Google Fonts**: `Poppins` and `Dancing Script`.
- **GA4 (Google Analytics)**: Basic tracking in `index.html`.
- **Cloudflare/Wrangler**: Used for project deployment/preview (per `package.json`).

## Internal Shared Logic (`shared/lib/`)
- `story-api.ts`: Frontend client for Edge Functions.
- `pricing.ts`: Plan fetching and Stripe session initiation.
- `plans.ts`: Plan capability and feature rule resolution.
- `supabase.ts`: Supabase client initialization.
- `storage.ts`: Image upload and normalization.
- `validators.ts`: Form and data validation logic.
- `errors.ts`: Unified error handling and messaging.
- `ui-copy.ts`: Centralized user-facing strings.
