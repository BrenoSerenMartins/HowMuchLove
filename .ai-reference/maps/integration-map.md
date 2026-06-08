# Integration Map

| Integration | Caller | Purpose | Auth / secret source | Failure mode |
|---|---|---|---|---|
| Supabase Auth | `AuthProvider` | Login, register, session, signout | Supabase anon key in client | Routes fall back to public/home state. |
| Supabase Postgres | UI + Edge Functions | Load plans, profiles, stories, config | Client anon or service role in Edge Functions | Empty state, toasts, or hard errors. |
| Supabase Storage | `save-story` | Upload and delete story images | Service role key | Images fail to persist or remove. |
| Mercado Pago SDK | `index.html`, `TransparentCheckoutForm` | Tokenize card data | Public key from `app_config` | Checkout modal cannot render or submit. |
| Mercado Pago APIs | `process-payment` | Checkout Pro or payment execution | Access token from `app_config` | Payment cannot start or complete. |
| YouTube IFrame API | `YouTubePlayer` | Background music playback | Public script load | Music player never initializes. |
| Google Analytics | `index.html` | Site analytics | GA measurement ID in HTML | No analytics collection. |
| Google Fonts | `index.html` | Typography | Public stylesheet | Fallback fonts render. |
| Browser share / clipboard | `QRCodeModal` | Share public link | User permission / browser support | Share falls back or fails. |
