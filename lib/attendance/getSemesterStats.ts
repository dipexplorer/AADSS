// lib/attendance/getSemesterStats.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export interface SubjectStat {
  id: string;
  name: string;
  minAttendanceRequired: number;
  totalClasses: number;
  attendedClasses: number;
  missedClasses: number;
  cancelledClasses: number;
  attendancePercentage: number;
  status: "safe" | "warning" | "danger";
  requiredClasses: number;
}

export interface SemesterStats {
  subjects: SubjectStat[];
  overall: {
    percentage: number;
    attended: number;
    total: number;
    safeCount: number;
    dangerCount: number;
    warningCount: number;
  };
}

export async function getSemesterStats(
  semesterId: string,
  studentProfileId: string,
): Promise<{ data: SemesterStats | null; error: string | null }> {
  const supabase = createClient();

  // 1. Subjects fetch karo
  const { data: subjects, error: subjectsError } = await supabase
    .from("subjects")
    .select("id, name, min_attendance_required")
    .eq("semester_id", semesterId);

  if (subjectsError) return { data: null, error: subjectsError.message };
  if (!subjects?.length) {
    return {
      data: {
        subjects: [],
        overall: {
          percentage: 0,
          attended: 0,
          total: 0,
          safeCount: 0,
          dangerCount: 0,
          warningCount: 0,
        },
      },
      error: null,
    };
  }

  const subjectIds = subjects.map((s) => s.id);

  // 2. Class sessions fetch karo (non-scheduled only)
  const { data: sessions, error: sessionsError } = await supabase
    .from("class_sessions")
    .select("id, subject_id, status")
    .in("subject_id", subjectIds)
    .neq("status", "scheduled");

  if (sessionsError) return { data: null, error: sessionsError.message };

  const sessionIds = (sessions ?? []).map((s) => s.id);

  // 3. Attendance fetch karo
  let attendanceRecords: { class_session_id: string; status: string }[] = [];
  if (sessionIds.length > 0) {
    const { data: attendance, error: attError } = await supabase
      .from("attendance")
      .select("class_session_id, status")
      .eq("student_id", studentProfileId)
      .in("class_session_id", sessionIds);

    if (attError) return { data: null, error: attError.message };
    attendanceRecords = attendance ?? [];
  }

  // 4. Per subject stats calculate karo
  const subjectStats: SubjectStat[] = subjects.map((subject) => {
    const subjectSessions = (sessions ?? []).filter(
      (s) => s.subject_id === subject.id && s.status !== "cancelled",
    );
    const totalClasses = subjectSessions.length;

    const attendedClasses = attendanceRecords.filter(
      (a) =>
        a.status === "present" &&
        subjectSessions.some((s) => s.id === a.class_session_id),
    ).length;

    const cancelledSessions = (sessions ?? []).filter(
      (s) => s.subject_id === subject.id && s.status === "cancelled",
    ).length;

    const missedClasses = totalClasses - attendedClasses;
    const minRequired = subject.min_attendance_required ?? 75;
    const attendancePercentage =
      totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

    let status: "safe" | "warning" | "danger" = "safe";
    if (attendancePercentage < 70) status = "danger";
    else if (attendancePercentage < minRequired) status = "warning";

    const requiredClasses =
      attendancePercentage < minRequired && totalClasses > 0
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
      cancelledClasses: cancelledSessions,
      attendancePercentage,
      status,
      requiredClasses,
    };
  });

  // 5. Overall stats
  const totalAll = subjectStats.reduce((s, x) => s + x.totalClasses, 0);
  const attendedAll = subjectStats.reduce((s, x) => s + x.attendedClasses, 0);
  const overall = {
    percentage: totalAll > 0 ? Math.round((attendedAll / totalAll) * 100) : 0,
    attended: attendedAll,
    total: totalAll,
    safeCount: subjectStats.filter((s) => s.status === "safe").length,
    warningCount: subjectStats.filter((s) => s.status === "warning").length,
    dangerCount: subjectStats.filter((s) => s.status === "danger").length,
  };

  return { data: { subjects: subjectStats, overall }, error: null };
}
