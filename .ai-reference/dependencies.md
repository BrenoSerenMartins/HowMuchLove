# Dependencies

## Runtime dependencies
- `react`, `react-dom`: component runtime.
- `@supabase/supabase-js`: auth, database, storage, Edge Function client.
- `date-fns`: locale data for `react-datepicker`.
- `react-datepicker`: story start date input.
- `@dnd-kit/*`: drag and drop ordering in the dashboard editor.
- `qrcode.react`: QR code generation for share modal.

## Build and dev dependencies
- `vite`, `@vitejs/plugin-react`, `@vitejs/plugin-basic-ssl`: build/dev server.
- `typescript`: transpilation and type checking.
- `tailwindcss`, `postcss`, `autoprefixer`: styling pipeline.

## Dependency usage notes
- `date-fns` is used only for the Brazilian Portuguese locale registration in the date picker.
- `@dnd-kit` is only used in the dashboard editor image list.
- `qrcode.react` is only used in the QR sharing modal.

## Notable drift
- The current app does not include React Router.
- The current app does not include a state management library such as Redux or Zustand.
