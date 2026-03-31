# Architecture

## High-Level Pattern
Acadence utilizes the **Next.js App Router** architecture, distinguishing strictly between Server Components and Client Components.

## Layers & Data Flow
1. **Routing Layer (`app/`)**: Define the page UI. Server Components fetch data directly from Supabase, pass data to Client Components as props.
2. **Component Layer (`components/`)**:
   - `admin/`: Admin dashboard widgets and views.
   - `common/`: Global UI (navbars, wrappers).
   - `ui/`: shadcn/ui primitives.
3. **Logic Layer (`lib/`)**:
   - `attendance/`: Functions handling attendance calculation and data retrieval.
   - `engines/`: More complex, algorithm-heavy business logic (e.g., simulation engines).
   - `supabase/`: Centralized Supabase client instances.
4. **Action Layer (`server/`)**: Server Actions to execute mutations and securely interact with Supabase (e.g., logging in, updating records) without exposing keys to the client.
5. **Data Layer (`db/`)**: Local schema (`supabase-schema.sql`) and seed data. Type interfaces generated in `types/`.

## Boundary Management
- **SSR vs CSR**: Pages default to Server Components for performance and SEO. Interactive components use the `"use client"` directive.
- **Authentication**: Managed via Next.js middleware or server-side layout checks to protect routes like `/admin` and `/daily-attendance`.
