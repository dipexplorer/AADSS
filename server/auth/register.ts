"use server";

import { createClient } from "@/lib/supabase/server";

export async function register(email: string, password: string) {
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
