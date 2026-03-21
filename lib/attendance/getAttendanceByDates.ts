"use server";

import { createClient } from "@/lib/supabase/server";

export interface DayAttendanceStatus {
  attended: number;
  missed: number;
  cancelled: number;
}

export async function getAttendanceByDates(
  studentProfileId: string,
  semesterId: string,
  dates: string[], // YYYY-MM-DD format
): Promise<Record<string, DayAttendanceStatus>> {
  if (!dates.length) return {};

  const supabase = createClient();

  // Get class_sessions for these dates
  const { data: sessions, error: sessionsError } = await supabase
    .from("class_sessions")
    .select(
      `
      id,
      date,
      status,
      subject_id,
      subjects!inner (
        semester_id
      )
    `,
    )
    .eq("subjects.semester_id", semesterId)
    .in("date", dates);

  if (sessionsError || !sessions) return {};

  const sessionIds = sessions.map((s) => s.id);
  if (!sessionIds.length) return {};

  // Get attendance for these sessions
  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance")
    .select("class_session_id, status")
    .eq("student_id", studentProfileId)
    .in("class_session_id", sessionIds);

  if (attendanceError) return {};

  // Group by date
  const result: Record<string, DayAttendanceStatus> = {};

  sessions.forEach((session) => {
    const dateStr = session.date as string;
    if (!result[dateStr]) {
      result[dateStr] = { attended: 0, missed: 0, cancelled: 0 };
    }

    if (session.status === "cancelled") {
      result[dateStr].cancelled++;
      return;
    }

    const record = (attendance ?? []).find(
      (a) => a.class_session_id === session.id,
    );

    if (record?.status === "present") {
      result[dateStr].attended++;
    } else if (record?.status === "absent") {
      result[dateStr].missed++;
    }
  });

  return result;
}
