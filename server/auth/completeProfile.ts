"use server";

import { createClient } from "@/lib/supabase/server";

export async function verifyStudentProfile(fullName: string, deviceFingerprint: string) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Ensure the admin actually provisioned this student in student_profiles
  const { data: existing } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return { error: "Access Denied: Your academic profile hasn't been provisioned by the Admin. Please contact HOD." };
  }

  // Update User Metadata with their actual full name and locked Device Fingerprint
  const { error: updateErr } = await supabase.auth.updateUser({
    data: {
      full_name: fullName.trim(),
      device_id: deviceFingerprint,
    }
  });

  if (updateErr) {
    return { error: updateErr.message };
  }

  return { success: true };
}
