# Routes Map

## Hash routes

| Route | Entrypoint | Auth | Notes |
|---|---|---:|---|
| `/` | `marketing/landing/Page.tsx` | No | Marketing page, demo, pricing, CTA funnel. |
| `/login` | `auth/login/Page.tsx` | No | Public auth entry. |
| `/register` | `auth/register/Page.tsx` | No | Public auth entry. |
| `/dashboard` | `customer/dashboard/Page.tsx` | Yes | Story editor and summary. |
| `/settings` | `customer/settings/Page.tsx` | Yes | Plan management and payment. |
| `/story/:storyId` | `story/public/Page.tsx` | No | Public share view with optional password gate. |
| `/payment-success` | `customer/billing/success/Page.tsx` | No | Redirect landing page. |
| `/payment-failure` | `customer/billing/failure/Page.tsx` | No | Redirect landing page. |
| `/payment-pending` | `customer/billing/pending/Page.tsx` | No | Redirect landing page. |

## In-page anchors
| Anchor | Primary owners | Notes |
|---|---|---|
| `features` | `FeaturesSection` | Landing page marketing section. |
| `how-it-works` | `HowItWorksSection` | Landing page marketing section. |
| `testimonials` | `SocialProofSection` | Landing page social proof section. |
| `faq` | `FAQSection` | Landing page FAQ section. |
| `pricing` | `PricingSection` | Landing page pricing section. |
| `pricing-section` | `customer/settings/Page.tsx` | Scroll target inside settings. |
| `demo` | `CounterDemo` demo mode | Scroll target for the live demo. |

## Route guards
- `/dashboard` and `/settings` are protected by the auth effect in `app/App.tsx`.
- `/login` and `/register` are public-only when a session exists.
- `/story/:storyId` bypasses the shell chrome and uses a custom page layout.
