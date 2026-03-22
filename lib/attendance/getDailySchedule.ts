// lib/attendance/getDailySchedule.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { generateClassSessionsForDate } from "./generateClassSessions";

export interface ClassPeriod {
  sessionId: string;
  subjectId: string | null;
  subjectName: string;
  startTime: string;
  endTime: string;
  room: string | null;
  status: "scheduled" | "completed" | "cancelled";
  attendanceStatus: "present" | "absent" | "cancelled" | null;
}

export async function getDailySchedule(
  date: string,
  semesterId: string,
  studentProfileId: string,
): Promise<{ data: ClassPeriod[] | null; error: string | null }> {
  const supabase = createClient();

  // Weekend check
  const dateObj = new Date(date + "T00:00:00");
  const day = dateObj.getDay();
  if (day === 0 || day === 6) {
    return { data: [], error: null };
  }

  // Auto-generate sessions agar exist nahi karte
  await generateClassSessionsForDate(date, semesterId);

  // Is date ke class sessions fetch karo with subject info
  const { data: sessions, error: sessionsError } = await supabase
    .from("class_sessions")
    .select(
      `
      id,
      subject_id,
      start_time,
      end_time,
      status,
      timetable (
        room
      ),
      subjects (
        name
      )
    `,
    )
    .eq("date", date)
    .in(
      "subject_id",
      // Sirf is semester ke subjects
      (
        await supabase
          .from("subjects")
          .select("id")
          .eq("semester_id", semesterId)
      ).data?.map((s) => s.id) ?? [],
    )
    .order("start_time", { ascending: true });

  if (sessionsError) return { data: null, error: sessionsError.message };
  if (!sessions) return { data: [], error: null };

  const sessionIds = sessions.map((s) => s.id);

  // Attendance records fetch karo
  let attendanceMap: Record<string, string> = {};
  if (sessionIds.length > 0) {
    const { data: attendance } = await supabase
      .from("attendance")
      .select("class_session_id, status")
      .eq("student_id", studentProfileId)
      .in("class_session_id", sessionIds);

    (attendance ?? []).forEach((a) => {
      attendanceMap[a.class_session_id] = a.status;
    });
  }

  const result: ClassPeriod[] = sessions.map((s) => ({
    sessionId: s.id,
    subjectId: s.subject_id,
    subjectName: (s.subjects as any)?.name ?? "Unknown",
    startTime: s.start_time,
    endTime: s.end_time,
    room: (s.timetable as any)?.room ?? null,
    status: s.status as ClassPeriod["status"],
    attendanceStatus:
      (attendanceMap[s.id] as ClassPeriod["attendanceStatus"]) ?? null,
  }));

  return { data: result, error: null };
}
