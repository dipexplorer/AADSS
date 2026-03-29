"use server";

import { createClient } from "@/lib/supabase/server";

export async function getNoteForDate(studentId: string, _date: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notes")
    .select("id, content")
    .eq("student_id", studentId)
    .eq("date", _date)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    console.error("Error fetching note:", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function saveNoteForDate(
  studentId: string,
  _date: string,
  content: string,
) {
  const supabase = createClient();

  // Check if exists because there might not be a unique constraint on (student_id, date)
  const { data: existing } = await supabase
    .from("notes")
    .select("id")
    .eq("student_id", studentId)
    .eq("date", _date)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from("notes")
      .update({ content })
      .eq("id", existing.id)
      .select()
      .single();

    return { data, error: error?.message };
  } else {
    const { data, error } = await supabase
      .from("notes")
      .insert({ student_id: studentId, date: _date, content })
      .select()
      .single();

    return { data, error: error?.message };
  }
}
