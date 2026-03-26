// app/admin/subjects/page.tsx
import { createClient } from "@/lib/supabase/server";
import SubjectsClient from "./components/SubjectsClient";

export default async function AdminSubjectsPage() {
  const supabase = createClient();
  const [{ data: subjects }, { data: semesters }] = await Promise.all([
    supabase
      .from("subjects")
      .select("*, semesters(semester_number, programs(name))")
      .order("name"),
    supabase
      .from("semesters")
      .select("*, programs(name)")
      .order("semester_number"),
  ]);

  return (
    <SubjectsClient subjects={subjects ?? []} semesters={semesters ?? []} />
  );
}
