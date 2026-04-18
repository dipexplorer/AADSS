// lib/engines/simulation/getSimulationData.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { SubjectSimInput } from "./types";

export async function getSimulationData(
  semesterId: string,
  studentProfileId: string,
  sessionId: string,
): Promise<SubjectSimInput[]> {
  const supabase = createClient();

  // 1. Fetch academic session info (Start date is critical for accurate filtering)
  const { data: sessionData } = await supabase
    .from("academic_sessions")
    .select("start_date, end_date")
    .eq("id", sessionId)
    .single();

  const sessionStart = sessionData?.start_date ?? "1970-01-01";
  const sessionEnd = sessionData?.end_date ?? new Date().toISOString().split("T")[0];

  // 2. Fetch subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name, min_attendance_required")
    .eq("semester_id", semesterId);

  if (!subjects || subjects.length === 0) return [];

  const subjectIds = subjects.map((s) => s.id);

  // 3. Fetch past sessions ONLY (up to today) to calculate current status
  const todayStr = new Date().toLocaleDateString("en-CA");
  const { data: sessions } = await supabase
    .from("class_sessions")
    .select("id, subject_id, date, status")
    .in("subject_id", subjectIds)
    .gte("date", sessionStart)
    .lte("date", todayStr);

  const filteredSessions = sessions ?? [];
  const sessionIds = filteredSessions.map((s) => s.id);

  // 4. Fetch attendance for these sessions
  let attendanceMap = new Map<string, string>();
  if (sessionIds.length > 0) {
    const { data: attendance } = await supabase
      .from("attendance")
      .select("class_session_id, status")
      .eq("student_id", studentProfileId)
      .in("class_session_id", sessionIds);

    attendanceMap = new Map(
      (attendance ?? []).map((a) => [a.class_session_id, a.status]),
    );
  }

  // 5. Remaining classes estimate
  const today = new Date();
  const endDate = new Date(sessionEnd);
  const daysRemaining = Math.max(
    0,
    Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const weeksRemaining = daysRemaining / 7;

  // 6. Map to dashboard reality
  return subjects.map((subject) => {
    const subjectSessions = filteredSessions.filter(
      (s) => s.subject_id === subject.id && s.status !== "cancelled",
    );

    let present = 0;
    let absent = 0;

    subjectSessions.forEach((session) => {
      const status = attendanceMap.get(session.id);
      if (status === "present") present++;
      else absent++; // Default is absent for passed sessions with no mark
    });

    // Estimate remaining classes robustly
    // We check how many sessions existed in the past few weeks to get frequency
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
      cancelled: 0, // Not needed for primary sim logic
      totalClasses: present + absent, 
      remainingClasses,
      minAttendanceRequired: subject.min_attendance_required ?? 75,
    };
  });
}
