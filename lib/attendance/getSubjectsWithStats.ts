"use server";

import { createClient } from "@/lib/supabase/server";

export interface SubjectWithStats {
  id: string;
  name: string;
  minAttendanceRequired: number;
  totalClasses: number;
  attendedClasses: number;
  missedClasses: number;
  attendancePercentage: number;
  status: "safe" | "warning" | "danger";
  requiredClasses: number;
}

export async function getSubjectsWithStats(
  semesterId: string,
  studentProfileId: string,
): Promise<{ data: SubjectWithStats[] | null; error: string | null }> {
  const supabase = createClient();

  // 1. Get all subjects for this semester
  const { data: subjects, error: subjectsError } = await supabase
    .from("subjects")
    .select("id, name, min_attendance_required")
    .eq("semester_id", semesterId);

  if (subjectsError) return { data: null, error: subjectsError.message };
  if (!subjects || subjects.length === 0) return { data: [], error: null };

  // 2. Get all class_sessions for these subjects
  const subjectIds = subjects.map((s) => s.id);

  const { data: sessions, error: sessionsError } = await supabase
    .from("class_sessions")
    .select("id, subject_id, status")
    .in("subject_id", subjectIds)
    .neq("status", "scheduled"); // only completed/cancelled

  if (sessionsError) return { data: null, error: sessionsError.message };

  // 3. Get attendance records for this student
  const sessionIds = (sessions ?? []).map((s) => s.id);

  let attendanceRecords: { class_session_id: string; status: string }[] = [];

  if (sessionIds.length > 0) {
    const { data: attendance, error: attendanceError } = await supabase
      .from("attendance")
      .select("class_session_id, status")
      .eq("student_id", studentProfileId)
      .in("class_session_id", sessionIds);

    if (attendanceError) return { data: null, error: attendanceError.message };
    attendanceRecords = attendance ?? [];
  }

  // 4. Calculate stats per subject
  const result: SubjectWithStats[] = subjects.map((subject) => {
    const subjectSessions = (sessions ?? []).filter(
      (s) => s.subject_id === subject.id && s.status !== "cancelled",
    );

    const totalClasses = subjectSessions.length;

    const attendedClasses = attendanceRecords.filter(
      (a) =>
        a.status === "present" &&
        subjectSessions.some((s) => s.id === a.class_session_id),
    ).length;

    const missedClasses = totalClasses - attendedClasses;
    const minRequired = subject.min_attendance_required ?? 75;

    const attendancePercentage =
      totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

    let status: "safe" | "warning" | "danger" = "safe";
    if (attendancePercentage < 70) status = "danger";
    else if (attendancePercentage < minRequired) status = "warning";

    // Formula: (attended + x) / (total + x) = 0.75
    const requiredClasses =
      attendancePercentage < minRequired
        ? Math.max(
            0,
            Math.ceil(
              ((minRequired / 100) * totalClasses - attendedClasses) /
                (1 - minRequired / 100),
            ),
          )
        : 0;

    return {
      id: subject.id,
      name: subject.name,
      minAttendanceRequired: minRequired,
      totalClasses,
      attendedClasses,
      missedClasses,
      attendancePercentage,
      status,
      requiredClasses,
    };
  });

  return { data: result, error: null };
}
