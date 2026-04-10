"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// ── Helper ── //
async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return supabase;
}

/**
 * 1. GET PENDING REQUESTS
 * Fetches all requests that are waiting for admin approval.
 * It joins with student_profiles to get the name, roll number, and email.
 */
export async function getPendingDeviceResets() {
  const supabase = await requireAdmin();
  // Using explicit typing 'any' to bypass strict relation typing here for simplicity
  const db = supabase as any;

  const { data, error } = await db
    .from("device_reset_requests")
    .select(`
      id,
      user_id,
      student_profile_id,
      reason,
      status,
      requested_at,
      student_profiles(full_name, roll_number)
    `)
    .eq("status", "pending")
    .order("requested_at", { ascending: true });

  if (error) {
    console.error("Fetch pending resets error:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * 2. APPROVE DEVICE RESET
 * This completely wipes the stored device footprint (`device_id`) from the user's Auth metadata.
 * It also marks their profile as 'not device registered'.
 */
export async function approveDeviceReset(requestId: string, userId: string, profileId: string) {
  const supabase = await requireAdmin();
  const { data: { session }, error: adminErr } = await supabase.auth.getSession();
  
  if (adminErr) return { error: "Authentication critical error." };
  
  // A. Get the user's current Auth metadata (to preserve other fields)
  // To update other users' metadata, we must use the admin/service role.
  // We use Supabase Admin API with the Service Role key to securely update user's identity data.
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const adminAuthClient = adminClient.auth.admin;
  
  const { data: userRecord, error: userError } = await adminAuthClient.getUserById(userId);
  if (userError || !userRecord.user) {
    return { error: "Could not find Auth user to update." };
  }

  // Preserve existing metadata, but explicitly nullify 'device_id'
  const newMetadata = {
    ...userRecord.user.user_metadata,
    device_id: null,
  };

  const { error: updateAuthError } = await adminAuthClient.updateUserById(userId, {
    user_metadata: newMetadata
  });

  if (updateAuthError) return { error: "Failed to update internal auth identity." };

  // B. Update `student_profiles` to false
  const db = supabase as any;
  await db
    .from("student_profiles")
    .update({ is_device_registered: false })
    .eq("id", profileId);

  // C. Mark request as Approved
  await db
    .from("device_reset_requests")
    .update({
      status: "approved",
      approved_by: session?.user.id,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", requestId);

  revalidatePath("/admin/security");
  return { success: true };
}

/**
 * 3. REJECT DEVICE RESET
 */
export async function rejectDeviceReset(requestId: string, notes: string) {
  const supabase = await requireAdmin();
  const db = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await db
    .from("device_reset_requests")
    .update({
      status: "rejected",
      admin_notes: notes.trim() || null,
      approved_by: user?.id,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", requestId);

  if (error) return { error: error.message };

  revalidatePath("/admin/security");
  return { success: true };
}
