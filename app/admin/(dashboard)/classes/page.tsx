// app/admin/classes/page.tsx
import { createClient } from "@/lib/supabase/server";
import ClassSessionsClient from "./components/ClassSessionsClient";
import { adminBulkGenerateSessionsForDate } from "@/lib/admin/bulkGenerateSessions";

export default async function AdminClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const supabase = createClient();
  const params = await searchParams;
  
  // Use toLocaleDateString with 'en-CA' (Canada locale natively outputs YYYY-MM-DD)
  // This correctly evaluates the local system timezone instead of forcing UTC like toISOString() 
  const today = new Date().toLocaleDateString("en-CA");
  const targetDate = params.date ?? today;

  // Force generate sessions for current/future dates so admin can manage them
  if (targetDate >= today) {
    await adminBulkGenerateSessionsForDate(targetDate);
  }

  const { data: sessions } = await supabase
    .from("class_sessions")
    .select("*, cancelled_at, cancelled_by, subjects(name, semesters(semester_number, programs(name)))")
    .eq("date", targetDate)
    .order("start_time");

  return (
    <ClassSessionsClient sessions={sessions ?? []} targetDate={targetDate} todayStr={today} />
  );
}
