// app/admin/timetable/page.tsx
import { createClient } from "@/lib/supabase/server";
import TimetableClient from "./components/TimetableClient";

export default async function AdminTimetablePage() {
  const supabase = createClient();
  const [{ data: slots }, { data: subjects }] = await Promise.all([
    supabase
      .from("timetable")
      .select("*, subjects(name, semesters(semester_number, programs(name)))")
      .order("day_of_week")
      .order("start_time"),
    supabase
      .from("subjects")
      .select("*, semesters(semester_number, programs(name))")
      .order("name"),
  ]);

  return <TimetableClient slots={slots ?? []} subjects={subjects ?? []} />;
}
