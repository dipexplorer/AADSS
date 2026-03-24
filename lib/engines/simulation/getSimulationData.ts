// lib/engines/simulation/getSimulationData.ts
import { createClient } from "@/lib/supabase/server";
import { SubjectSimInput } from "./types";

export async function getSimulationData(
  semesterId: string,
  studentProfileId: string,
  sessionId: string,
): Promise<SubjectSimInput[]> {
  const supabase = createClient();

  // Fetch subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name, min_attendance_required")
    .eq("semester_id", semesterId);

  if (!subjects || subjects.length === 0) return [];

  const subjectIds = subjects.map((s) => s.id);

  // Fetch all sessions for this semester
  const { data: sessions } = await supabase
    .from("class_sessions")
    .select("id, subject_id, date, status")
    .in("subject_id", subjectIds);

  // Fetch attendance
  const sessionIds = (sessions ?? []).map((s) => s.id);
  const { data: attendance } = await supabase
    .from("attendance")
    .select("class_session_id, status")
    .eq("student_id", studentProfileId)
    .in("class_session_id", sessionIds);

  const attendanceMap = new Map(
    (attendance ?? []).map((a) => [a.class_session_id, a.status]),
  );

  // Get session's end date for remaining classes estimate
  const { data: sessionData } = await supabase
    .from("academic_sessions")
    .select("end_date")
    .eq("id", sessionId)
    .single();

  const today = new Date();
  const endDate = sessionData?.end_date
    ? new Date(sessionData.end_date)
    : today;
  const daysRemaining = Math.max(
    0,
    Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const weeksRemaining = daysRemaining / 7;

  return subjects.map((subject) => {
    const subjectSessions = (sessions ?? []).filter(
      (s) => s.subject_id === subject.id && s.status !== "cancelled",
    );

    let present = 0;
    let absent = 0;
    let cancelled = 0;

    subjectSessions.forEach((session) => {
      const status = attendanceMap.get(session.id);
      if (status === "present") present++;
      else if (status === "absent") absent++;
      else if (status === "cancelled") cancelled++;
    });

    // Estimate remaining classes from timetable frequency
    // Fetch weekly freq from sessions in last 4 weeks
    const recentSessions = subjectSessions.filter((s) => {
      const d = new Date(s.date);
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      return d >= fourWeeksAgo && d <= today;
    });
    const weeklyFreq = recentSessions.length / 4 || 1;
    const remainingClasses = Math.round(weeklyFreq * weeksRemaining);

    return {
      subjectId: subject.id,
      name: subject.name,
      present,
      absent,
      cancelled,
      totalClasses: present + absent,
      remainingClasses,
      minAttendanceRequired: subject.min_attendance_required ?? 75,
    };
  });
}
