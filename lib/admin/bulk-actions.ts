"use server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function processBulkStudentImport(
  targetSessionId: string,
  rows: { email: string; roll: string; program: string; semester: string }[]
) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return { error: "Missing SUPABASE_SERVICE_ROLE_KEY. Bulk account provisioning requires administrative service-role permissions." };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  let successCount = 0;
  const errors: string[] = [];

  // 1. Fetch available mappings for the SPECIFIC targeted session to find respective UUIDs
  const { data: programs } = await supabaseAdmin
    .from("programs")
    .select("id, name")
    .eq("session_id", targetSessionId);
    
  const { data: semesters } = await supabaseAdmin
    .from("semesters")
    .select("id, semester_number, program_id");

  if (!programs || !semesters) {
    return { error: "Failed to fetch academic structures." };
  }

  for (const row of rows) {
    try {
      // Find Program ID mapped by text
      const prog = programs.find(p => p.name.toLowerCase() === row.program.toLowerCase());
      if (!prog) {
        errors.push(`Row ${row.email}: Program '${row.program}' not found.`);
        continue;
      }

      // Find Semester ID
      const semNumber = parseInt(row.semester);
      const sem = semesters.find(s => s.program_id === prog.id && s.semester_number === semNumber);
      if (!sem) {
         errors.push(`Row ${row.email}: Semester ${semNumber} not found for ${prog.name}.`);
         continue;
      }

      // 2. Provision Supabase Auth User seamlessly
      // We generate a deterministic or secure default password so Auth doesn't fail.
      const securePassword = `${row.roll.toUpperCase()}@Acadence2026`;
      
      const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email: row.email,
        email_confirm: true, // Auto-confirm for enterprise import
        password: securePassword,
        user_metadata: {
          roll_number: row.roll,
          role: "student"
        }
      });

      if (authErr) {
        // If user already exists, it might throw an error. We log and skip.
        errors.push(`Row ${row.email}: Auth failed - ${authErr.message}`);
        continue;
      }

      const userId = authData.user.id;

      // 3. Map into Student Profiles rel-database
      const { error: profileErr } = await supabaseAdmin.from("student_profiles").insert({
        user_id: userId,
        session_id: targetSessionId,
        program_id: prog.id,
        semester_id: sem.id
      });

      if (profileErr) {
        // Rollback strategy could go here
        errors.push(`Row ${row.email}: DB Profile failed - ${profileErr.message}`);
        continue;
      }

      successCount++;
    } catch (e: any) {
      errors.push(`Row ${row.email}: Unexpected crash - ${e.message}`);
    }
  }

  revalidatePath("/admin/students");
  
  return { 
    success: true, 
    count: successCount, 
    total: rows.length,
    log: errors.length > 0 ? errors : null 
  };
}
