"use server";
/*
 * ─────────────────────────────────────────────────────────────────────────────
 *  promotionActions.ts — Bulk Semester Promotion Server Actions
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  TEACHING NOTES (Read This To Understand The Architecture):
 *  
 *  "Server Actions" kya hote hain?
 *  Next.js App Router me "use server" likhne se ye function sirf server par
 *  chalta hai. Matlab: user ka browser directly database se baat nahi karta.
 *  Saara kaam server pe hota hai — zyada secure!
 *
 *  Is file ka kaam:
 *  1. getPromotionData()    → Semesters & enrolled counts fetch karna (Admin ko
 *                             dikhane ke liye)
 *  2. promoteStudents()     → 1-click mein sab students ka semester_id update
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Helper: Ensure admin only ──────────────────────────────────────────────
async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return supabase;
}

// ─────────────────────────────────────────────────────────────────────────────
//  1. GET PROMOTION DATA
//  WHY: Admin ko ye dekhna chahiye ki "Agar main promote karoon, toh kitne
//  students move honge?" — Ye function exactly wo data deta hai.
//
//  RETURNS: List of programs with their semesters + enrolled student count.
// ─────────────────────────────────────────────────────────────────────────────
export async function getPromotionData() {
  const supabase = await requireAdmin();

  // STEP A: Fetch all programs
  const { data: programs, error: progErr } = await supabase
    .from("programs")
    .select("id, name")
    .order("name");

  if (progErr || !programs) return { error: "Failed to load programs" };

  // STEP B: Fetch all semesters
  const { data: semesters, error: semErr } = await supabase
    .from("semesters")
    .select("id, semester_number, program_id")
    .order("semester_number");

  if (semErr || !semesters) return { error: "Failed to load semesters" };

  // STEP C: Count enrolled students per semester (from student_profiles)
  const allSemIds = semesters.map((s) => s.id);
  const { data: profileCounts } = await supabase
    .from("student_profiles")
    .select("semester_id")
    .in("semester_id", allSemIds);

  // Build a simple count map: { semester_id: count }
  const countMap: Record<string, number> = {};
  (profileCounts ?? []).forEach((p) => {
    countMap[p.semester_id] = (countMap[p.semester_id] ?? 0) + 1;
  });

  // STEP D: Combine data into a nice nested structure for the UI
  const result = programs.map((prog) => {
    const progSemesters = semesters
      .filter((s) => s.program_id === prog.id)
      .map((s) => ({
        id: s.id,
        semester_number: s.semester_number,
        enrolledCount: countMap[s.id] ?? 0,
      }));

    return {
      id: prog.id,
      name: prog.name,
      semesters: progSemesters,
    };
  });

  return { success: true, data: result };
}

// ─────────────────────────────────────────────────────────────────────────────
//  2. PROMOTE STUDENTS
//  WHY: The core action. Moves ALL students in [fromSemesterId] to
//  [toSemesterId]. If toSemesterId doesn't exist yet, it creates it first.
//
//  INPUT:
//   - programId      → Which program (e.g. B.Tech CSE UUID)
//   - fromSemesterId → Current semester students are in
//   - nextSemNumber  → What the next semester number should be (e.g. 6)
//
//  RETURNS: { success, promoted } or { error }
// ─────────────────────────────────────────────────────────────────────────────
export async function promoteStudents(
  programId: string,
  fromSemesterId: string,
  nextSemNumber: number
) {
  const supabase = await requireAdmin();
  const db = supabase as any;

  // STEP 1: Check if the "next semester" already exists in the DB
  let { data: existingSem } = await db
    .from("semesters")
    .select("id")
    .eq("program_id", programId)
    .eq("semester_number", nextSemNumber)
    .maybeSingle();

  let targetSemesterId: string;

  if (existingSem) {
    // The next semester already exists — use its ID directly
    targetSemesterId = existingSem.id;
  } else {
    // STEP 2 (If not found): CREATE the next semester row automatically
    //
    // TEACHING: This is called "auto-provisioning". Instead of making admin
    // manually create Sem 6 before promoting, system does it automatically.
    const { data: newSem, error: createErr } = await db
      .from("semesters")
      .insert({ program_id: programId, semester_number: nextSemNumber })
      .select("id")
      .single();

    if (createErr || !newSem) {
      return { error: `Failed to create Semester ${nextSemNumber}: ${createErr?.message}` };
    }

    targetSemesterId = newSem.id;
  }

  // STEP 3: Bulk-update all affected students (the actual promotion!)
  //
  // TEACHING: This is a single SQL UPDATE that moves ALL students at once.
  // It's: UPDATE student_profiles SET semester_id = <new> WHERE semester_id = <old>
  // No loops, no N+1 queries — pure efficiency!
  const { data: updated, error: updateErr } = await db
    .from("student_profiles")
    .update({ semester_id: targetSemesterId })
    .eq("semester_id", fromSemesterId)
    .select("id");

  if (updateErr) {
    return { error: `Promotion failed: ${updateErr.message}` };
  }

  // Revalidate relevant pages so the cache is cleared
  revalidatePath("/admin/students");
  revalidatePath("/admin/promotions");

  return {
    success: true,
    promoted: (updated ?? []).length,
    newSemesterId: targetSemesterId,
    nextSemNumber,
  };
}
