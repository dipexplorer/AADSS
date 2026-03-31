# Coding Conventions

## Code Style & Naming
- **TypeScript**: Strict typing is required. Explicit types and interfaces are preferred over `any`.
- **Naming**:
  - Components: PascalCase (e.g., `AdminSidebar.tsx`).
  - Directories: kebab-case (e.g., `calendar-dashboard`, `daily-attendance`).
  - Utilities/Constants: camelCase or UPPER_SNAKE_CASE.
  - Server actions are grouped in `server/` directory and use camelCase naming.

## Architecture Guidelines
- **Server Components**: Used by default for all data fetching.
- **Client Components**: Marked explicitly with `"use client"` at the top. Kept as small as possible to optimize bundle size.
- **UI Components**: Must be accessible and styled using Tailwind classes via `cn()` utility (clsx + tailwind-merge) from `lib/utils.ts`.

## Error Handling
- Use Next.js `error.tsx` boundary files to catch page-level exceptions.
- Server actions return serializable error objects for client-side consumption via `react-hot-toast` or form state.
- Supabase errors are checked using `if (error) throw new Error(error.message)` patterns.

## Formatting & Linting
- The project enforces rules via ESLint 9 (`eslint.config.mjs`).
- Prettier/Tailwind plugin ensures consistent class ordering.
