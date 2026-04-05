"use server";

import { createClient } from "@/lib/supabase/server";
import { generateClassSessionsForDate } from "@/lib/attendance/generateClassSessions";

/**
 * Iterates through all active semesters and force-generates Class Sessions for a target date.
 * Allows administrators to pre-generate future sessions for holistic visibility and to
 * schedule advance holidays.
 */
export async function adminBulkGenerateSessionsForDate(date: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  // Retrieve all distinct semester IDs (or all active semesters)
  const { data: semesters, error: semErr } = await supabase
    .from("semesters")
    .select("id");

  if (semErr || !semesters) {
    return { error: semErr?.message || "Failed to fetch semesters" };
  }

  let totalGenerated = 0;

  for (const sem of semesters) {
    const result = await generateClassSessionsForDate(date, sem.id);
    if (result && result.generated > 0) {
      totalGenerated += result.generated;
    }
  }

  return { success: true, generated: totalGenerated };
}
