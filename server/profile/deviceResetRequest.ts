"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const COOLDOWN_DAYS = 30;

export async function submitDeviceResetRequest(reason: string): Promise<{
  success?: boolean;
  error?: string;
  cooldownDaysLeft?: number;
}> {
  if (!reason || reason.trim().length < 20) {
    return { error: "Please provide a detailed reason (at least 20 characters)." };
  }

  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { error: "Not authenticated." };

  // Get student profile id
  const { data: profile } = await db
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { error: "Student profile not found." };

  // Check 30-day cooldown: find any request in last 30 days
  const cooldownDate = new Date();
  cooldownDate.setDate(cooldownDate.getDate() - COOLDOWN_DAYS);

  const { data: recentRequest } = await db
    .from("device_reset_requests")
    .select("requested_at")
    .eq("student_profile_id", profile.id)
    .gte("requested_at", cooldownDate.toISOString())
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentRequest) {
    const requestedAt = new Date(recentRequest.requested_at);
    const nextAllowed = new Date(
      requestedAt.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000
    );
    const msLeft = nextAllowed.getTime() - Date.now();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    return {
      error: `You already have a recent reset request. Next request allowed in ${daysLeft} day(s).`,
      cooldownDaysLeft: daysLeft,
    };
  }

  // Insert the request
  const { error: insertErr } = await db
    .from("device_reset_requests")
    .insert({
      student_profile_id: profile.id,
      user_id: user.id,
      reason: reason.trim(),
      status: "pending",
    });

  if (insertErr) return { error: insertErr.message };

  revalidatePath("/profile");
  return { success: true };
}

export async function getMyResetRequests(): Promise<{
  data: {
    id: string;
    reason: string;
    status: string;
    admin_notes: string | null;
    requested_at: string;
    reviewed_at: string | null;
    activates_at: string | null;
    completed_at: string | null;
  }[];
  error: string | null;
}> {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await db
    .from("device_reset_requests")
    .select(
      "id, reason, status, admin_notes, requested_at, reviewed_at, activates_at, completed_at"
    )
    .eq("user_id", user.id)
    .order("requested_at", { ascending: false })
    .limit(5);

  return { data: data ?? [], error: error?.message ?? null };
}
