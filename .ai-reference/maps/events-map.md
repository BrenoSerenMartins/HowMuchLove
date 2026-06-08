# Events Map

## Client events
| Event | Source | Consumer | Effect |
|---|---|---|---|
| `hashchange` | `NavigationProvider` | `app/App.tsx` | Updates active route. |
| `before-save dirty flag` | `CounterDemo` | `NavigationContext` | Opens confirmation modal on navigation. |
| `drag end` | `DndContext` in `CounterDemo` | Local story editor state | Reorders images and updates `display_order`. |
| `file input change` | `CounterDemo` | Local story editor state | Adds a new preview image and queues upload. |
| `toast add/remove` | `NotificationProvider` | `Toast` | Shows transient success/error messages. |
| `intersection observer` | `PublicStory` | Message section | Triggers message blur and reveal behavior. |
| `youtube entry click` | `story/public/Page.tsx` | `PublicStory` / `YouTubePlayer` | Enables music playback and hides the entry gate. |
| `payment success` | `TransparentCheckoutForm` | `customer/settings/Page.tsx` | Continues payment orchestration. |
| `share/download` | `QRCodeModal` | Browser APIs | Copies link, triggers share sheet, or downloads QR code. |

## Backend and remote events
| Event | Source | Consumer | Effect |
|---|---|---|---|
| `Supabase auth session restored` | Supabase Auth | `AuthProvider` | Hydrates user and plan. |
| `story saved` | `save-story` | `customer/dashboard/Page.tsx` | Reloads story and updates share link. |
| `payment processed` | `process-payment` | `customer/settings/Page.tsx` | Refreshes profile plan or redirects. |
