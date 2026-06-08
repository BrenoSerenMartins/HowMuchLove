# Shared UI

## Scope
`shared/ui/Header.tsx`, `shared/ui/Footer.tsx`, `shared/ui/BottomNavBar.tsx`, `shared/ui/PageWrapper.tsx`, `shared/ui/ConfirmModal.tsx`, `shared/ui/Toast.tsx`, `shared/ui/LoadingSpinner.tsx`, `shared/ui/icons/*`.

## Responsibility
- Provide shell chrome and reusable feedback primitives.
- Keep repeated visuals and actions consistent across pages.

## Component notes
- `Header` drives top navigation, plan badges, and logout entry points.
- `Footer` is a simple desktop-only copyright band.
- `BottomNavBar` provides the mobile-only navigation set.
- `PageWrapper` adds a small fade-in wrapper for page content.
- `ConfirmModal` blocks navigation or logout when user confirmation is needed.
- `Toast` renders transient success/error feedback.
- `LoadingSpinner` provides the heart-based loading indicator.

## Risks
- `Header` depends on props even on pages where it is rendered without them.
- `Toast` does not have a third informational state even though some callers pass `info`.
- `ConfirmModal` has no focus trap or escape key handling.
- The icon components are small but are part of the shared dependency surface for several routes.
- These components are now consumed from the semantic shell layer, so edits here have global visual impact across the app.
