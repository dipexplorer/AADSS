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
      semester_id,
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

  // ─────────────────────────────────────────────────────────────────────────
  //  CURRENT SEMESTER ATTENDANCE CALCULATION
  //
  //  TEACHING: Pehla code galat tha kyunki wo sabki saari attendance ek
  //  saath ginta tha (Sem1 + Sem2 + Sem3... sab milakar).
  //
  //  Sahi tarika: Chain follow karo:
  //  student_profiles.semester_id
  //      ↓
  //  subjects.semester_id  (is semester mein jo subjects padhaye gaye)
  //      ↓
  //  class_sessions.subject_id  (un subjects ki classes)
  //      ↓
  //  attendance.class_session_id  (un classes ki attendance)
  //
  //  Is tarah sirf "Current Semester" ki classes ki attendance count hogi.
  // ─────────────────────────────────────────────────────────────────────────
  const studentIds = studentList.map((s) => s.id);
  let attendanceCounts: Record<string, { present: number; total: number }> = {};

  if (studentIds.length > 0) {
    // Step 1: Fetch attendance WITH the joined class_session and subject data
    // so we can match each attendance record to a semester
    const { data: attendanceData } = await (supabase as any)
      .from("attendance")
      .select(`
        student_id,
        status,
        class_sessions (
          subject_id,
          subjects (
            semester_id
          )
        )
      `)
      .in("student_id", studentIds)
      .neq("status", "cancelled");

    // Step 2: Build a map of student_id → semester_id (current semester)
    const studentSemMap: Record<string, string> = {};
    studentList.forEach((s) => {
      studentSemMap[s.id] = s.semester_id;
    });

    // Step 3: Count only attendance rows where the class's semester_id
    // matches the student's CURRENT semester_id
    (attendanceData ?? []).forEach((a: any) => {
      const classSemesterId = a.class_sessions?.subjects?.semester_id;
      const studentCurrentSemId = studentSemMap[a.student_id];

      // Only count if this class belongs to student's current semester
      if (!classSemesterId || classSemesterId !== studentCurrentSemId) return;

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
