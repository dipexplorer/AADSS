// lib/attendance/autoCompleteSession.ts
"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Past scheduled sessions ko automatically "completed" mark karta hai.
 * Yeh function daily schedule load hone pe call hota hai
 * taake stats accurately calculate ho sakein.
 *
 * Rule: Agar session ka date past mein hai AND status "scheduled" hai
 *       → status "completed" mark kar do
 */
export async function autoCompletePastSessions(
  semesterId: string,
): Promise<{ updated: number; error: string | null }> {
  const supabase = createClient();

  const today = new Date().toISOString().split("T")[0];

  // Get semester subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id")
    .eq("semester_id", semesterId);

  if (!subjects || subjects.length === 0) {
    return { updated: 0, error: null };
  }

  const subjectIds = subjects.map((s) => s.id);

  // Update all past scheduled sessions to completed
  const { data, error } = await supabase
    .from("class_sessions")
    .update({ status: "completed" })
    .eq("status", "scheduled")
    .lt("date", today)
    .in("subject_id", subjectIds)
    .select("id");

  if (error) return { updated: 0, error: error.message };
  return { updated: data?.length ?? 0, error: null };
}
