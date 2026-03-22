// lib/attendance/markAttendance.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function markAttendance(
  sessionId: string,
  studentProfileId: string,
  status: "present" | "absent" | "cancelled",
): Promise<{ error: string | null }> {
  const supabase = createClient();

  // Upsert — already marked hai toh update, nahi toh insert
  const { error } = await supabase.from("attendance").upsert(
    {
      class_session_id: sessionId,
      student_id: studentProfileId,
      status,
      marked_at: new Date().toISOString(),
    },
    {
      onConflict: "student_id,class_session_id",
    },
  );

  if (error) return { error: error.message };
  return { error: null };
}

export async function clearAttendance(
  sessionId: string,
  studentProfileId: string,
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("class_session_id", sessionId)
    .eq("student_id", studentProfileId);

  if (error) return { error: error.message };
  return { error: null };
}
