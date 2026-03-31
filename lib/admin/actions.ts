// lib/admin/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Helper ──────────────────────────────────────────────────────
async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return supabase;
}

// ── Academic Sessions ───────────────────────────────────────────
export async function createSession(data: {
  name: string;
  start_date: string;
  end_date: string;
}) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("academic_sessions").insert(data);
  if (error) return { error: error.message };
  revalidatePath("/admin/sessions");
  return { success: true };
}

export async function updateSession(
  id: string,
  data: {
    name?: string;
    start_date?: string;
    end_date?: string;
  },
) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("academic_sessions")
    .update(data)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/sessions");
  return { success: true };
}

export async function deleteSession(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("academic_sessions")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/sessions");
  return { success: true };
}

// ── Programs ────────────────────────────────────────────────────
export async function createProgram(name: string, session_id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("programs").insert({ name, session_id });
  if (error) return { error: error.message };
  revalidatePath("/admin/sessions");
  return { success: true };
}

export async function updateProgram(id: string, name: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("programs").update({ name }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/sessions");
  return { success: true };
}

export async function deleteProgram(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("programs").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/sessions");
  return { success: true };
}

// ── Semesters ───────────────────────────────────────────────────
export async function createSemester(
  program_id: string,
  semester_number: number,
) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("semesters")
    .insert({ program_id, semester_number });
  if (error) return { error: error.message };
  revalidatePath("/admin/sessions");
  return { success: true };
}

export async function updateSemester(
  id: string,
  data: {
    program_id?: string;
    semester_number?: number;
  }
) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("semesters").update(data).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/sessions");
  return { success: true };
}

export async function deleteSemester(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("semesters").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/sessions");
  return { success: true };
}

// ── Subjects ────────────────────────────────────────────────────
export async function createSubject(
  semester_id: string,
  name: string,
  code: string,
  credits: number,
  min_attendance_required: number
) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("subjects").insert({
    semester_id,
    name,
    code,
    credits,
    min_attendance_required,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/subjects");
  return { success: true };
}

export async function updateSubject(
  id: string,
  data: {
    name?: string;
    code?: string;
    credits?: number;
    min_attendance_required?: number;
  },
) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("subjects").update(data).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/subjects");
  return { success: true };
}

export async function deleteSubject(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/subjects");
  return { success: true };
}

// ── Timetable ───────────────────────────────────────────────────
export async function createTimetableSlot(data: {
  subject_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room?: string;
  latitude?: number;
  longitude?: number;
  allowed_radius?: number;
}) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("timetable").insert({
    ...data,
    allowed_radius: data.allowed_radius ?? 100,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/timetable");
  return { success: true };
}

export async function updateTimetableSlot(
  id: string,
  data: {
    day_of_week?: number;
    start_time?: string;
    end_time?: string;
    room?: string;
    latitude?: number;
    longitude?: number;
    allowed_radius?: number;
  },
) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("timetable").update(data).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/timetable");
  return { success: true };
}

export async function deleteTimetableSlot(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("timetable").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/timetable");
  return { success: true };
}

// ── Class Sessions ──────────────────────────────────────────────
export async function updateClassSessionStatus(
  id: string,
  status: "scheduled" | "cancelled" | "completed",
) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("class_sessions")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/classes");
  return { success: true };
}

export async function rescheduleClassSession(
  id: string,
  data: {
    date: string;
    start_time: string;
    end_time: string;
  },
) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("class_sessions")
    .update(data)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/classes");
  return { success: true };
}

// ── Attendance Management ────────────────────────────────────────

/**
 * Admin cancels a class session and cascades "cancelled" attendance
 * to every enrolled student in the semester.
 */
export async function cancelClassAndCascade(classSessionId: string) {
  const supabase = await requireAdmin();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: session, error: sessionErr } = await supabase
    .from("class_sessions")
    .select("id, subject_id, status, subjects(semester_id)")
    .eq("id", classSessionId)
    .single();

  if (sessionErr || !session) return { error: "Session not found" };
  if (session.status === "cancelled") return { error: "Already cancelled" };

  const subjectData = session.subjects as unknown as { semester_id: string } | null;
  if (!subjectData?.semester_id) return { error: "Semester not found for session" };
  const semesterId = subjectData.semester_id;

  const { error: cancelErr } = await supabase
    .from("class_sessions")
    .update({
      status: "cancelled",
      cancelled_by: user?.id,
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", classSessionId);

  if (cancelErr) return { error: cancelErr.message };

  const { data: students, error: studentsErr } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("semester_id", semesterId);

  if (studentsErr) return { error: studentsErr.message };
  if (!students || students.length === 0) {
    revalidatePath("/admin/classes");
    return { success: true, cascaded: 0 };
  }

  const attendanceRows = students.map((s) => ({
    student_id: s.id,
    class_session_id: classSessionId,
    status: "cancelled" as const,
    marked_at: new Date().toISOString(),
  }));

  const CHUNK_SIZE = 500;
  for (let i = 0; i < attendanceRows.length; i += CHUNK_SIZE) {
    const chunk = attendanceRows.slice(i, i + CHUNK_SIZE);
    const { error } = await supabase
      .from("attendance")
      .upsert(chunk, { onConflict: "student_id,class_session_id" });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/classes");
  revalidatePath("/admin/students");
  return { success: true, cascaded: students.length };
}

/**
 * Admin manually overrides a student's attendance (present ↔ absent).
 * Records who overrode and optionally why — for the audit log.
 */
export async function overrideStudentAttendance(
  studentProfileId: string,
  classSessionId: string,
  status: "present" | "absent",
  reason?: string,
) {
  const supabase = await requireAdmin();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("attendance").upsert(
    {
      student_id: studentProfileId,
      class_session_id: classSessionId,
      status,
      marked_at: new Date().toISOString(),
      overridden_by: user?.id,
      override_reason: reason ?? null,
    },
    { onConflict: "student_id,class_session_id" },
  );

  if (error) return { error: error.message };

  revalidatePath("/admin/students");
  revalidatePath("/admin/classes");
  return { success: true };
}
