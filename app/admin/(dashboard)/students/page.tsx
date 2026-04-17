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
      academic_sessions(name, start_date),
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
    // Step 1: Fetch all class sessions for the relevant semesters to get the TRUE total count
    // IMPORTANT: Include ONLY sessions up to TODAY that are not cancelled.
    const uniqueSemesterIds = Array.from(new Set(studentList.map(s => s.semester_id)));
    const todayStr = new Date().toLocaleDateString("en-CA");
    
    const { data: sessionData } = await supabase
      .from("class_sessions")
      .select(`
        id,
        date,
        subjects!inner(semester_id)
      `)
      .in("subjects.semester_id", uniqueSemesterIds)
      .lte("date", todayStr)
      .neq("status", "cancelled");

    // We can't just group eagerly because some old 2025 classes belong
    // to the semester_id but NOT to the current student's active session!
    const classSessions = sessionData ?? [];

    // Initialize student counts by precisely matching class_session date with student's session bound
    studentList.forEach(s => {
      const sessionStart = s.academic_sessions?.start_date ?? "1970-01-01";
      
      const validClasses = classSessions.filter((c: any) => 
        c.subjects.semester_id === s.semester_id && 
        c.date >= sessionStart
      );

      attendanceCounts[s.id] = {
        present: 0,
        total: validClasses.length
      };
    });

    // Step 2: Fetch student attendance records
    const { data: attendanceData } = await supabase
      .from("attendance")
      .select(`
        student_id,
        status,
        class_sessions!inner (
          date,
          subject_id,
          subjects!inner (
            semester_id
          )
        )
      `)
      .in("student_id", studentIds)
      .neq("status", "cancelled");

    const studentSemMap: Record<string, string> = {};
    const studentSessionStartMap: Record<string, string> = {};
    studentList.forEach((s) => {
      studentSemMap[s.id] = s.semester_id;
      studentSessionStartMap[s.id] = (s.academic_sessions as any)?.start_date ?? "1970-01-01";
    });

    // Step 3: Count only "present" rows where the class belongs to their current semester
    (attendanceData ?? []).forEach((a: any) => {
      const classDate = a.class_sessions?.date;
      const classSemesterId = a.class_sessions?.subjects?.semester_id;
      const studentCurrentSemId = studentSemMap[a.student_id];
      const studentSessionStart = studentSessionStartMap[a.student_id];

      if (!classSemesterId || classSemesterId !== studentCurrentSemId) return;
      if (!classDate || classDate < studentSessionStart) return;

      if (a.status === "present") {
        attendanceCounts[a.student_id].present++;
      }
    });
  }

  const studentsWithMetrics = studentList.map((s) => ({
    ...s,
    user_info: userMap[s.user_id] ?? {},
    attendance_metrics: attendanceCounts[s.id] ?? { present: 0, total: 0 },
  }));

  return <StudentsClient students={studentsWithMetrics} />;
}
