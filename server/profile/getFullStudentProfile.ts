"use server";

import { createClient } from "@/lib/supabase/server";

export interface FullStudentProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  roll_number: string | null;
  email: string;
  created_at: string | null;
  device_id: string | null;
  is_device_registered: boolean;
  program: { id: string; name: string } | null;
  semester: { id: string; semester_number: number } | null;
  session: {
    id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    status: string | null;
  } | null;
  subjects: {
    id: string;
    name: string;
    code: string | null;
    credits: number | null;
    min_attendance_required: number | null;
  }[];
  attendance_stats: {
    total: number;
    present: number;
    absent: number;
    percentage: number;
  };
}

export async function getFullStudentProfile(): Promise<{
  data: FullStudentProfile | null;
  error: string | null;
}> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { data: null, error: "Not authenticated" };

  // Fetch the profile row with all relations
  const { data: profile, error: profileError } = await supabase
    .from("student_profiles")
    .select(
      `
      id,
      user_id,
      full_name,
      roll_number,
      created_at,
      academic_sessions (
        id, name, start_date, end_date, status
      ),
      programs (
        id, name
      ),
      semesters (
        id,
        semester_number,
        subjects (
          id, name, code, credits, min_attendance_required
        )
      )
    `
    )
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile)
    return { data: null, error: profileError?.message ?? "Profile not found" };

  // Fetch overall attendance totals for this student
  const { data: attendanceRows } = await supabase
    .from("attendance")
    .select("status")
    .eq("student_id", profile.id);

  const total = attendanceRows?.length ?? 0;
  const present = attendanceRows?.filter((r) => r.status === "present").length ?? 0;
  const absent = attendanceRows?.filter((r) => r.status === "absent").length ?? 0;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  // Auth metadata: device_id, roll_number (from the auth user object)
  const device_id = (user.user_metadata?.device_id as string) ?? null;

  const sem = profile.semesters as any;
  const subjects = (sem?.subjects ?? []) as FullStudentProfile["subjects"];

  return {
    data: {
      id: profile.id,
      user_id: profile.user_id,
      full_name: profile.full_name ?? (user.user_metadata?.full_name as string) ?? null,
      roll_number: profile.roll_number ?? (user.user_metadata?.roll_number as string) ?? null,
      email: user.email ?? "",
      created_at: profile.created_at ?? null,
      device_id,
      is_device_registered: !!device_id,
      program: profile.programs
        ? { id: (profile.programs as any).id, name: (profile.programs as any).name }
        : null,
      semester: sem
        ? { id: sem.id, semester_number: sem.semester_number }
        : null,
      session: profile.academic_sessions
        ? {
            id: (profile.academic_sessions as any).id,
            name: (profile.academic_sessions as any).name,
            start_date: (profile.academic_sessions as any).start_date,
            end_date: (profile.academic_sessions as any).end_date,
            status: (profile.academic_sessions as any).status,
          }
        : null,
      subjects,
      attendance_stats: { total, present, absent, percentage },
    },
    error: null,
  };
}
