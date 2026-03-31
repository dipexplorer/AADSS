# Integrations

## Core Integrations
Acadence relies heavily on **Supabase** for its backend infrastructure.

### Supabase Auth
- Provides Role-Based Access Control (RBAC).
- Handles secure login and registration flows.
- Uses server-side rendering (SSR) helpers `@supabase/ssr` to securely manage sessions in Next.js Server Components.

### Supabase Database
- PostgreSQL database integration using the JS client `@supabase/supabase-js`.
- Type-safe queries generated from the database schema (`types/supabase.ts`).
- Local development is supported via the Supabase CLI (`supabase/` folder).

## Third-Party Libraries
### TipTap
- **Purpose**: Used for rich text editing and notes within the application.
- **Extensions**: Uses the Starter Kit and Placeholder extensions for a customized editing experience.
- The TipTap integration is tightly coupled with the React ecosystem (`@tiptap/react`).

### UI & Styling
- **shadcn/ui & Radix UI**: Not exactly an external API, but pre-built components are integrated locally into the `components/ui/` directory.

## Known Webhooks or External APIs
Currently, there are no visible external API webhooks beyond Supabase, but the architecture allows for server actions in `app/server/auth` to interoperate with external services if needed.
