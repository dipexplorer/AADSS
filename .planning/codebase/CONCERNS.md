# Technical Concerns & Debt

## Security & Auth Configuration
- **Supabase Credentials**: The app relies strictly on `.env.local` keys (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Misconfiguration here breaks the entire app.
- Ensure that Row Level Security (RLS) is correctly defined in `db/supabase-schema.sql` to prevent unauthorized access via the JS client.

## Performance
- **Client Component Bloat**: Deep integrations with Tiptap (`@tiptap/react`) or complex dashboards could increase JS payload if not lazy-loaded properly.
- **Data Fetching Patterns**: Avoid waterfall network requests in Server Components by parallelizing independent fetch operations.

## Scalability & Robustness
- **Complex Logic in `engines/`**: The `lib/engines` folder likely contains complex attendance rules. This logic is a high risk area if untested.
- **Database Migrations**: Manual management of `db/supabase-schema.sql` could cause discrepancies in production if not handled properly alongside Supabase CLI migrations.

## Fragile Areas
- The intersection of Server Actions (`server/auth/`) and client-side router navigation can sometimes yield race conditions if not precisely coordinated using `startTransition` or Next.js cache revalidation.
