# Stack

## Overview
Acadence is built on a modern, React-based web stack using the Next.js App Router.

## Languages
- **TypeScript**: The primary language for both client and server logic. Strict mode is enabled.
- **CSS**: Tailwind CSS 4 is used with PostCSS.
- **SQL**: Supabase uses PostgreSQL under the hood.

## Frameworks & Libraries
- **Next.js 15+**: Full-stack React framework using the App Router.
- **React 19**: Core UI library.
- **Tailwind CSS v4**: Utility-first CSS framework.
- **shadcn/ui**: Reusable, accessible UI component primitives.
- **Radix UI**: Unstyled, accessible UI components under shadcn/ui.
- **Lucide React**: Icon library.
- **TipTap**: Rich text editor framework.

## Data & State
- **Supabase**: Handles database operations, edge functions, and authentication via `@supabase/supabase-js` and `@supabase/ssr`.
- **Database**: PostgreSQL (managed by Supabase locally or in cloud).

## Tooling
- **ESLint**: Linter (using flat config in `eslint.config.mjs`).
- **PostCSS**: CSS transformation.
- **TypeScript Compiler**: Type checking and compilation.
- **npm**: Package manager.
