// app/admin/sessions/page.tsx
import { createClient } from "@/lib/supabase/server";
import SessionsClient from "./components/SessionsClient";

export default async function AdminSessionsPage() {
  const supabase = createClient();

  const [{ data: sessions }, { data: programs }, { data: semesters }] =
    await Promise.all([
      supabase
        .from("academic_sessions")
        .select("*")
        .order("start_date", { ascending: false }),
      supabase.from("programs").select("*").order("name"),
      supabase
        .from("semesters")
        .select("*, programs(name)")
        .order("semester_number"),
    ]);

  return (
    <SessionsClient
      sessions={sessions ?? []}
      programs={programs ?? []}
      semesters={semesters ?? []}
    />
  );
}
