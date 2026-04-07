// lib/attendance/markAbsentees.ts
"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Finds all enrolled students who have NO attendance record for the given class session,
 * and marks them as 'absent'.
 * Runs automatically when a class session is marked as 'completed' (either by admin or auto-completed).
 */
export async function markAbsenteesForSession(classSessionId: string) {
  const supabase = createClient();

  // 1. Get session and its semester_id
  const { data: session, error: sessionErr } = await supabase
    .from("class_sessions")
    .select("subject_id, subjects(semester_id)")
    .eq("id", classSessionId)
    .single();

  if (sessionErr || !session) return;
  const semesterId = (session.subjects as any)?.semester_id;
  if (!semesterId) return;

  // 2. Get all enrolled students for this semester
  const { data: students } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("semester_id", semesterId);

  if (!students || students.length === 0) return;

  // 3. Get existing attendance for this session (who already marked present)
  const { data: attendance } = await supabase
    .from("attendance")
    .select("student_id")
    .eq("class_session_id", classSessionId);

  const presentStudentIds = new Set((attendance || []).map((a) => a.student_id));

  // 4. Filter out absentees (students with no attendance record at all)
  const absentees = students.filter((s) => !presentStudentIds.has(s.id));

  if (absentees.length === 0) return;

  // 5. Insert absent records
  const absenteeRows = absentees.map((s) => ({
    student_id: s.id,
    class_session_id: classSessionId,
    status: "absent" as const,
    marked_at: new Date().toISOString(),
  }));

  // Batch insert to handle large classes safely
  const CHUNK_SIZE = 500;
  for (let i = 0; i < absenteeRows.length; i += CHUNK_SIZE) {
    const chunk = absenteeRows.slice(i, i + CHUNK_SIZE);
    
    // Using upsert with ignoring conflicts to be 100% safe against duplicate inserts
    await supabase.from("attendance").upsert(chunk, {
      onConflict: "student_id,class_session_id",
      ignoreDuplicates: true 
    });
  }
}
