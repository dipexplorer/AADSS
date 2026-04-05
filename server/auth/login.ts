"use server";

import { createClient } from "@/lib/supabase/server";

export async function login(email: string, password: string) {
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // console.error("Login error:", error);
    return { error: error.message };
  }

  const user = data?.user;
  const needsOnboarding = !user?.user_metadata?.device_id || !user?.user_metadata?.full_name;

  return { success: true, needsOnboarding };
}
