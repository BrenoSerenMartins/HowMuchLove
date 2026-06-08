# App Shell

## Scope
Shell orchestration for the whole application: `App.tsx` as a compatibility export, `app/App.tsx`, `index.tsx`, `app/providers/*`, `app/hooks/*`, and the shared shell UI in `shared/ui/*`.

## Responsibility
- Boot the React tree.
- Restore auth state.
- Resolve the active hash route.
- Render the correct page component.
- Apply shell chrome, global background, and shared modals.

## Flow
1. `index.tsx` mounts `App`.
2. `App` re-exports the real shell.
3. `app/App.tsx` wraps providers.
4. `AuthProvider` rehydrates the session.
5. `NavigationProvider` tracks the hash route and dirty navigation blocking.
6. `NotificationProvider` stores toast messages.
7. `app/App.tsx` selects the page component and decides whether to show shell chrome.

## Shell rules
- Header and footer are hidden in preview mode.
- Bottom nav is shown on the public home page for logged out users and on protected pages for logged in users.
- The story route gets a custom layout without the normal shell chrome.
- Payment result pages are part of the main route switch but still rely on the shared header/footer components.

## High-risk coupling
- `NavigationProvider` state is central to dirty-route confirmation and preview mode.

## Change risk
- Any change in shell route logic can affect every page.
- A change in provider order can break auth, navigation, or toast rendering.
- A change in shell background assets can affect all routes visually.
