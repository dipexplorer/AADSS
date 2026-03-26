// app/admin/classes/page.tsx
import { createClient } from "@/lib/supabase/server";
import ClassSessionsClient from "./components/ClassSessionsClient";

export default async function AdminClassesPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];
  const targetDate = searchParams.date ?? today;

  const { data: sessions } = await supabase
    .from("class_sessions")
    .select("*, subjects(name, semesters(semester_number, programs(name)))")
    .eq("date", targetDate)
    .order("start_time");

  return (
    <ClassSessionsClient sessions={sessions ?? []} targetDate={targetDate} />
  );
}
