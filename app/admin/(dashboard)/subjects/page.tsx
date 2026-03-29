// app/admin/(dashboard)/subjects/page.tsx
import { createClient } from "@/lib/supabase/server";
import SubjectsClient from "./components/SubjectsClient";

export default async function AdminSubjectsPage() {
  const supabase = createClient();
  
  // Fetch hierarchical data to populate the context filters
  const [
    { data: sessions },
    { data: programs },
    { data: semesters },
    { data: subjects }
  ] = await Promise.all([
    supabase.from("academic_sessions").select("id, name, status").order("start_date", { ascending: false }),
    supabase.from("programs").select("id, name, session_id, status").order("name"),
    supabase.from("semesters").select("id, semester_number, program_id, status").order("semester_number"),
    supabase.from("subjects").select("*, semesters(semester_number, program_id, programs(session_id))").order("name"),
  ]);

  return (
    <SubjectsClient 
      sessions={sessions ?? []} 
      programs={programs ?? []} 
      semesters={semesters ?? []} 
      subjects={subjects ?? []} 
    />
  );
}
