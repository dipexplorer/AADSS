"use server";

import { createClient } from "@/lib/supabase/server";

export async function createProfile(
  sessionId: string,
  programId: string,
  semesterId: string,
) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Check if profile already exists
  const { data: existing } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return { error: "Profile already exists" };
  }

  const { error } = await supabase.from("student_profiles").insert({
    user_id: user.id,
    session_id: sessionId,
    program_id: programId,
    semester_id: semesterId,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
