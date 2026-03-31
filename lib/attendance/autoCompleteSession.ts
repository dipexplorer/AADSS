// lib/attendance/autoCompleteSession.ts
"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Past + today's ended scheduled sessions ko automatically "completed" mark karta hai.
 * Yeh function daily schedule load hone pe call hota hai.
 *
 * Rule:
 *   Agar session ka date past mein hai (date < today)           → completed
 *   Agar session ka date aaj hai AND end_time < current time    → completed
 *   Status "scheduled" hona chahiye (already completed/cancelled skip)
 */
export async function autoCompletePastSessions(
  semesterId: string,
): Promise<{ updated: number; error: string | null }> {
  const supabase = createClient();

  const now = new Date();
  const today = now.toISOString().split("T")[0]; // "YYYY-MM-DD"

  // Current time in "HH:MM:SS" format (local server time — same as DB time zone)
  const nowTime = now.toTimeString().slice(0, 8); // "HH:MM:SS"

  // Get semester subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id")
    .eq("semester_id", semesterId);

  if (!subjects || subjects.length === 0) {
    return { updated: 0, error: null };
  }

  const subjectIds = subjects.map((s) => s.id);

  // Update all past scheduled sessions (past days, plus today if end_time has passed)
  const { data, error } = await supabase
    .from("class_sessions")
    .update({ status: "completed" })
    .eq("status", "scheduled")
    .in("subject_id", subjectIds)
    .or(`date.lt.${today},and(date.eq.${today},end_time.lt.${nowTime})`)
    .select("id");

  if (error) return { updated: 0, error: error.message };
  return { updated: data?.length ?? 0, error: null };
}
