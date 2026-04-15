"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AcademicHoliday = {
  id: string;
  session_id: string;
  date: string;
  title: string;
  created_at: string;
};

export async function getHolidays(sessionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("academic_holidays" as any)
    .select("*")
    .eq("session_id", sessionId)
    .order("date", { ascending: true });

  return { data: (data as any as AcademicHoliday[]) || [], error: error?.message || null };
}

export async function addHoliday(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const sessionId = formData.get("session_id") as string;

  if (!title || !date || !sessionId) {
    return { error: "Missing required fields" };
  }

  // 1. Insert Holiday
  // @ts-ignore
  const { error: insertError } = await supabase
    .from("academic_holidays" as any)
    .insert([{ title, date, session_id: sessionId }]);

  if (insertError) {
    if (insertError.code === "23505")
      return { error: "A holiday already exists on this date." };
    return { error: insertError.message };
  }

  // 2. Cascade Cancel class_sessions
  // All class_sessions falling exactly on this date will be canceled
  const { error: cascadeError } = await supabase
    .from("class_sessions")
    .update({ status: "cancelled" })
    .eq("date", date);

  if (cascadeError) {
    console.error("Cascade cancel failed:", cascadeError);
    // Even if cascade fails, holiday is saved. We don't rollback for now.
  }

  revalidatePath("/admin/holidays");
  return { success: true, error: null };
}

export async function deleteHoliday(holidayId: string) {
  const supabase = await createClient();
  
  // STEP 1: Get the holiday detail before deleting it so we know the EXACT date
  const { data: holidayData, error: fetchError } = await supabase
    .from("academic_holidays" as any)
    .select("date")
    .eq("id", holidayId)
    .single();

  if (fetchError || !holidayData) {
    return { error: fetchError?.message || "Holiday not found" };
  }

  const targetDate = (holidayData as any).date;

  // STEP 2: Rollback the class sessions on this date back to "scheduled"
  // Safe condition: only rollback those that are currently "cancelled"
  const { error: cascadeError } = await supabase
    .from("class_sessions")
    .update({ status: "scheduled" })
    .eq("date", targetDate)
    .eq("status", "cancelled");

  if (cascadeError) {
    console.error("Rollback failed:", cascadeError);
    // Don't stop here, we should still try to delete the holiday
  }

  // STEP 3: Now permanently delete the holiday record
  const { error } = await supabase
    .from("academic_holidays" as any)
    .delete()
    .eq("id", holidayId);
    
  if (!error) {
    revalidatePath("/admin/holidays");
  }
  return { error: error?.message || null };
}

export async function bulkImportHolidays(
  holidays: { date: string; title: string }[],
  sessionId: string
) {
  const supabase = await createClient();

  if (!holidays.length) {
    return { error: "No valid rows found to import." };
  }

  const payload = holidays.map((h) => ({
    session_id: sessionId,
    date: h.date,
    title: h.title,
  }));

  // 1. Insert Multiple Holidays
  // .insert() ignores identical duplicates if UPSERT is needed, but we'll let it fail if same date exists.
  // @ts-ignore
  const { error: insertError } = await supabase
    .from("academic_holidays" as any)
    .insert(payload);

  if (insertError) {
    if (insertError.code === "23505")
      return { error: "One or more dates in the CSV already exist as a holiday." };
    return { error: insertError.message };
  }

  // 2. Update class_sessions in parallel
  const dates = holidays.map((h) => h.date);

  await supabase
    .from("class_sessions")
    .update({ status: "cancelled" })
    .in("date", dates);

  revalidatePath("/admin/holidays");
  return { success: true, error: null };
}
