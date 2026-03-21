"use server";

import { createClient } from "@/lib/supabase/server";

export async function getStudentProfile() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("student_profiles")
    .select(
      `
      id,
      user_id,
      session_id,
      program_id,
      semester_id,
      academic_sessions (
        id,
        name,
        start_date,
        end_date
      ),
      programs (
        id,
        name
      ),
      semesters (
        id,
        semester_number
      )
    `,
    )
    .eq("user_id", user.id)
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}
