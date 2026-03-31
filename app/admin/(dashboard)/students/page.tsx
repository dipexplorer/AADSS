import { createClient } from "@/lib/supabase/server";
import StudentsClient from "./components/StudentsClient";

export default async function AdminStudentsPage() {
  const supabase = createClient();

  // Fetch student profiles with related academic context
  const { data: students } = await supabase
    .from("student_profiles")
    .select(`
      id,
      user_id,
      created_at,
      academic_sessions(name),
      programs(name),
      semesters(semester_number)
    `)
    .order("created_at", { ascending: false });

  const studentList = students ?? [];
  const userIds = studentList.map((s) => s.user_id).filter(Boolean);
  let userMap: Record<string, { email?: string; full_name?: string }> = {};

  // Use DB function to fetch auth user info (email + name) securely
  if (userIds.length > 0) {
    const { data: usersInfo } = await (supabase as any).rpc("get_users_info", {
      user_ids: userIds,
    });
    (usersInfo ?? []).forEach((u: { id: string; email: string; full_name: string }) => {
      userMap[u.id] = { email: u.email, full_name: u.full_name };
    });
  }

  // Fetch real attendance counts (excluding cancelled sessions)
  const studentIds = studentList.map((s) => s.id);
  let attendanceCounts: Record<string, { present: number; total: number }> = {};

  if (studentIds.length > 0) {
    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("student_id, status")
      .in("student_id", studentIds)
      .neq("status", "cancelled");

    (attendanceData ?? []).forEach((a) => {
      if (!attendanceCounts[a.student_id]) {
        attendanceCounts[a.student_id] = { present: 0, total: 0 };
      }
      attendanceCounts[a.student_id].total++;
      if (a.status === "present") attendanceCounts[a.student_id].present++;
    });
  }

  const studentsWithMetrics = studentList.map((s) => ({
    ...s,
    user_info: userMap[s.user_id] ?? {},
    attendance_metrics: attendanceCounts[s.id] ?? { present: 0, total: 0 },
  }));

  return <StudentsClient students={studentsWithMetrics} />;
}
