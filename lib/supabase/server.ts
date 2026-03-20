import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async getAll() {
        return (await cookieStore).getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(async ({ name, value, options }) =>
          (await cookieStore).set(name, value, options),
        );
      },
    },
  });
}
