# App Shell Module

## Responsibility
The App Shell is responsible for the root orchestration, global state providers, layout consistency, and top-level routing.

## Key Files
- `app/App.tsx`: Main entrypoint that assembles the providers and handles page switching.
- `app/providers/NavigationProvider.tsx`: Manages the hash-based routing state.
- `app/providers/AuthProvider.tsx`: Manages Supabase authentication state and session rehydration.
- `app/providers/NotificationProvider.tsx`: Manages global toast notifications.
- `shared/ui/Header.tsx`: Global navigation header.
- `shared/ui/Footer.tsx`: Global footer.
- `shared/ui/BottomNavBar.tsx`: Mobile-specific navigation bar.

## Boot Sequence
1. **Providers Initialization**: The app is wrapped in `Navigation`, `Auth`, and `Notification` providers.
2. **Session Rehydration**: `AuthProvider` checks for an existing Supabase session.
3. **Route Resolution**: `NavigationProvider` reads the initial hash and sets the `route` state.
4. **Shell Rendering**: `App.tsx` renders the common layout (background, lights effect) and switches the `pageComponent` based on the current `route`.

## Navigation Guarding
- Unauthenticated users trying to access `/dashboard` or `/settings` are redirected to `/`.
- Authenticated users trying to access `/login` or `/register` are redirected to `/dashboard`.

## Layout Details
- Fixed background image (`/images/main-background.avif`) with blur and brightness filters.
- `lights-container`: An overlay for atmospheric lighting effects.
- Responsive padding and max-width containers for the main content area.
