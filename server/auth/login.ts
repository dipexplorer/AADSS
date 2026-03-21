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

  return { success: true };
}
