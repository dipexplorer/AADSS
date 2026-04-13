"use server";

import { createClient } from "@/lib/supabase/server";

export interface DefaulterRecord {
  student_id: string;
  student_name: string;
  student_email: string;
  program_name: string;
  semester_number: number;
  subject_name: string;
  subject_code: string;
  min_required_percent: number;
  actual_percent: number;
  present_count: number;
  total_count: number;
}

export interface SemesterOption {
  id: string;
  semester_number: number;
  program_name: string;
}

export async function getAvailableSemesters(): Promise<{
  data: SemesterOption[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return { data: null, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("semesters")
    .select("id, semester_number, programs(name)")
    .order("semester_number");

  if (error) return { data: null, error: error.message };

  const formatted = (data ?? []).map((s: any) => ({
    id: s.id,
    semester_number: s.semester_number,
    program_name: s.programs?.name ?? "Unknown",
  }));

  return { data: formatted, error: null };
}

export async function getDefaultersReport(semesterId: string): Promise<{
  data: DefaulterRecord[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return { data: null, error: "Unauthorized" };
  }

  if (!semesterId) return { data: [], error: null };

  const { data: attendanceRaw, error: attErr } = await supabase
    .from("attendance")
    .select(
      `
      student_id,
      status,
      class_sessions!inner(
        subject_id,
        subjects!inner(
          name,
          code,
          min_attendance_required,
          semester_id,
          semesters!inner(
            semester_number,
            programs!inner(name)
          )
        )
      )
    `,
    )
    .eq("class_sessions.subjects.semester_id", semesterId)
    .neq("status", "cancelled");

  if (attErr) return { data: null, error: attErr.message };
  if (!attendanceRaw || attendanceRaw.length === 0)
    return { data: [], error: null };

  // Aggregate by student_id + subject_id
  const agg: Record<
    string,
    {
      student_id: string;
      subject_id: string;
      present: number;
      total: number;
      subject_name: string;
      subject_code: string;
      min_req: number;
      sem_num: number;
      prog_name: string;
    }
  > = {};

  const uniqueStudentIds = new Set<string>();

  attendanceRaw.forEach((row: any) => {
    uniqueStudentIds.add(row.student_id);
    const session = row.class_sessions;
    if (!session || !session.subjects) return;

    const subj = session.subjects;
    const sem = subj.semesters;
    const prog = sem?.programs;

    const key = `${row.student_id}_${session.subject_id}`;
    if (!agg[key]) {
      agg[key] = {
        student_id: row.student_id,
        subject_id: session.subject_id,
        present: 0,
        total: 0,
        subject_name: subj.name,
        subject_code: subj.code,
        min_req: subj.min_attendance_required ?? 75,
        sem_num: sem?.semester_number ?? 0,
        prog_name: prog?.name ?? "Unknown",
      };
    }

    agg[key].total++;
    if (row.status === "present") agg[key].present++;
  });

  // Calculate percentages and filter only defaulters (below min_req)
  const defaulterList: any[] = [];
  const defaulterStudentIds = new Set<string>();

  Object.values(agg).forEach((subjectAgg) => {
    if (subjectAgg.total > 0) {
      const actual_percent = (subjectAgg.present / subjectAgg.total) * 100;
      if (actual_percent < subjectAgg.min_req) {
        defaulterList.push({
          ...subjectAgg,
          actual_percent: Math.round(actual_percent * 10) / 10,
        });
        defaulterStudentIds.add(subjectAgg.student_id);
      }
    }
  });

  if (defaulterList.length === 0) return { data: [], error: null };

  // Resolve Student Names & Emails
  const { data: studentProfiles } = await supabase
    .from("student_profiles")
    .select("id, user_id")
    .in("id", Array.from(defaulterStudentIds));

  const profileMap: Record<string, string> = {};
  const userIdsList: string[] = [];
  (studentProfiles ?? []).forEach((sp) => {
    profileMap[sp.id] = sp.user_id;
    if (sp.user_id) userIdsList.push(sp.user_id);
  });

  let userMap: Record<string, { email: string; full_name: string }> = {};
  if (userIdsList.length > 0) {
    const { data: usersInfo } = await (supabase as any).rpc("get_users_info", {
      user_ids: userIdsList,
    });
    (usersInfo ?? []).forEach((u: any) => {
      userMap[u.id] = { email: u.email, full_name: u.full_name };
    });
  }

  const finalRecords: DefaulterRecord[] = defaulterList.map((d) => {
    const uId = profileMap[d.student_id];
    const userInfo = userMap[uId] ?? {
      email: "Unknown",
      full_name: "Unknown Student",
    };
    return {
      student_id: d.student_id,
      student_name: userInfo.full_name,
      student_email: userInfo.email,
      program_name: d.prog_name,
      semester_number: d.sem_num,
      subject_name: d.subject_name,
      subject_code: d.subject_code,
      min_required_percent: d.min_req,
      actual_percent: d.actual_percent,
      present_count: d.present,
      total_count: d.total,
    };
  });

  // Sort by biggest deficit first
  finalRecords.sort((a, b) => {
    const deficitA = a.min_required_percent - a.actual_percent;
    const deficitB = b.min_required_percent - b.actual_percent;
    return deficitB - deficitA;
  });

  return { data: finalRecords, error: null };
}
