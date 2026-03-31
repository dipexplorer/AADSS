// lib/attendance/autoMarkAbsent.ts
"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * For every "completed" class_session in the semester,
 * finds students who have NO attendance record and inserts "absent" for them.
 *
 * This runs after autoCompletePastSessions so sessions are correctly marked
 * before we decide who was absent.
 *
 * Logic:
 *   1. Get all completed class_sessions for the semester
 *   2. Get all student_profiles enrolled in the semester
 *   3. Get existing attendance records (session_id → student set)
 *   4. For each (session × student) pair with NO record → INSERT absent
 */
export async function autoMarkAbsentForCompletedSessions(
  semesterId: string,
): Promise<{ inserted: number; error: string | null }> {
  const supabase = createClient();

  // 1. Get all completed sessions for this semester's subjects
  const { data: subjects, error: subjectsErr } = await supabase
    .from("subjects")
    .select("id")
    .eq("semester_id", semesterId);

  if (subjectsErr || !subjects || subjects.length === 0) {
    return { inserted: 0, error: subjectsErr?.message ?? null };
  }

  const subjectIds = subjects.map((s) => s.id);

  const { data: completedSessions, error: sessionsErr } = await supabase
    .from("class_sessions")
    .select("id")
    .eq("status", "completed")
    .in("subject_id", subjectIds);

  if (sessionsErr || !completedSessions || completedSessions.length === 0) {
    return { inserted: 0, error: sessionsErr?.message ?? null };
  }

  // 2. Get all students enrolled in this semester
  const { data: students, error: studentsErr } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("semester_id", semesterId);

  if (studentsErr || !students || students.length === 0) {
    return { inserted: 0, error: studentsErr?.message ?? null };
  }

  const sessionIds = completedSessions.map((s) => s.id);
  const studentIds = students.map((s) => s.id);

  // 3. Get existing attendance records for these sessions
  const { data: existingRecords, error: existingErr } = await supabase
    .from("attendance")
    .select("student_id, class_session_id")
    .in("student_id", studentIds)
    .in("class_session_id", sessionIds);

  if (existingErr) {
    return { inserted: 0, error: existingErr.message };
  }

  // Build a Set for O(1) lookup: "studentId|sessionId"
  const existingSet = new Set<string>(
    (existingRecords ?? []).map(
      (r) => `${r.student_id}|${r.class_session_id}`,
    ),
  );

  // 4. Build rows to insert where no record exists
  const absentRows: {
    student_id: string;
    class_session_id: string;
    status: string;
    marked_at: string;
  }[] = [];

  for (const session of completedSessions) {
    for (const student of students) {
      const key = `${student.id}|${session.id}`;
      if (!existingSet.has(key)) {
        absentRows.push({
          student_id: student.id,
          class_session_id: session.id,
          status: "absent",
          marked_at: new Date().toISOString(),
        });
      }
    }
  }

  if (absentRows.length === 0) {
    return { inserted: 0, error: null };
  }

  // Batch insert in chunks of 500 to avoid payload limits
  const CHUNK_SIZE = 500;
  let totalInserted = 0;

  for (let i = 0; i < absentRows.length; i += CHUNK_SIZE) {
    const chunk = absentRows.slice(i, i + CHUNK_SIZE);
    const { data, error } = await supabase
      .from("attendance")
      .upsert(chunk, {
        onConflict: "student_id,class_session_id",
        ignoreDuplicates: true, // don't overwrite existing records
      })
      .select("id");

    if (error) return { inserted: totalInserted, error: error.message };
    totalInserted += data?.length ?? 0;
  }

  return { inserted: totalInserted, error: null };
}
