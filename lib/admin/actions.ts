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
