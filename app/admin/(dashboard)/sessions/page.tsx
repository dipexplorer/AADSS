// app/admin/(dashboard)/sessions/page.tsx
import { createClient } from "@/lib/supabase/server";
import SessionsClient from "./components/SessionsClient";

export default async function AdminSessionsPage() {
  const supabase = createClient();

  const { data: sessions } = await supabase
    .from("academic_sessions")
    .select("*, programs(count)")
    .order("start_date", { ascending: false });

  // Map the nested count to a flat property for the client
  const formattedSessions = (sessions ?? []).map((session) => ({
    ...session,
    programs_count: session.programs?.[0]?.count ?? 0,
  }));

  return <SessionsClient sessions={formattedSessions} />;
}
