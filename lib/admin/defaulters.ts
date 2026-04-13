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

  const { data: studentsRaw, error: studErr } = await supabase
    .from("student_profiles")
    .select("id, user_id")
    .eq("semester_id", semesterId);

  if (studErr) return { data: null, error: studErr.message };
  if (!studentsRaw || studentsRaw.length === 0) return { data: [], error: "No students currently enrolled in this semester." };

  const { data: subjectsRaw, error: subErr } = await supabase
    .from("subjects")
    .select(`
      id,
      name,
      min_attendance_required,
      semesters!inner(semester_number, programs!inner(name))
    `)
    .eq("semester_id", semesterId);

  if (subErr) return { data: null, error: subErr.message };
  if (!subjectsRaw || subjectsRaw.length === 0) return { data: [], error: "No subjects found for this semester." };

  // Fetch Class Sessions for these subjects to know the TOTAL possible classes (up to today)
  const todayStr = new Date().toLocaleDateString("en-CA");
  const { data: sessionsRaw, error: sessErr } = await supabase
    .from("class_sessions")
    .select(`
      id,
      date,
      subject_id,
      subjects!inner(semester_id)
    `)
    .eq("subjects.semester_id", semesterId)
    .lte("date", todayStr)
    .neq("status", "cancelled");

  if (sessErr) return { data: null, error: sessErr.message };

  const subjectTotalSessions: Record<string, number> = {};
  (subjectsRaw as any[]).forEach((s) => (subjectTotalSessions[s.id] = 0));
  (sessionsRaw ?? []).forEach((sess) => {
    if (subjectTotalSessions[sess.subject_id!] !== undefined) {
      subjectTotalSessions[sess.subject_id!]++;
    }
  });

  const totalPossibleSessions = Object.values(subjectTotalSessions).reduce((a, b) => a + b, 0);
  if (totalPossibleSessions === 0) {
    return { data: [], error: "No attendance data recorded yet for this semester." };
  }

  // Fetch attendance records for these sessions
  const { data: attendanceRaw, error: attErr } = await supabase
    .from("attendance")
    .select(`
      student_id,
      status,
      class_sessions!inner(
        subject_id,
        subjects!inner(semester_id)
      )
    `)
    .eq("class_sessions.subjects.semester_id", semesterId)
    .neq("status", "cancelled");

  if (attErr) return { data: null, error: attErr.message };

  // Aggregate Present Counts for each Student -> Subject
  // We initialize the agg matrix for ALL Students x ALL Subjects
  const aggMatrix: Record<string, number> = {}; // key: `${student_id}_${subject_id}`
  
  (studentsRaw as any[]).forEach((student) => {
    (subjectsRaw as any[]).forEach((subject) => {
      aggMatrix[`${student.id}_${subject.id}`] = 0;
    });
  });

  (attendanceRaw ?? []).forEach((att: any) => {
    // Only count 'present' status towards actual count
    if (att.status === "present") {
      const subjId = att.class_sessions.subject_id;
      const key = `${att.student_id}_${subjId}`;
      if (aggMatrix[key] !== undefined) {
        aggMatrix[key]++;
      }
    }
  });

  // Build the final records
  const allRecords: any[] = [];
  
  (studentsRaw as any[]).forEach((student) => {
    (subjectsRaw as any[]).forEach((subject) => {
      const total = subjectTotalSessions[subject.id];
      if (total > 0) {
        const present = aggMatrix[`${student.id}_${subject.id}`];
        const actual_percent = (present / total) * 100;
        
        allRecords.push({
          student_id: student.id,
          user_id: student.user_id,
          subject_name: subject.name,
          subject_code: subject.code || "N/A",
          min_required_percent: subject.min_attendance_required ?? 75,
          actual_percent: Math.round(actual_percent * 10) / 10,
          present_count: present,
          total_count: total,
          semester_number: subject.semesters?.semester_number ?? 0,
          program_name: subject.semesters?.programs?.name ?? "Unknown",
        });
      }
    });
  });

  if (allRecords.length === 0) return { data: [], error: null };

  // Resolve Student Names & Emails from userMap
  const userIdsList = studentsRaw.map((s) => s.user_id).filter(Boolean);
  let userMap: Record<string, { email: string; full_name: string }> = {};

  if (userIdsList.length > 0) {
    const { data: usersInfo } = await (supabase as any).rpc("get_users_info", {
      user_ids: userIdsList,
    });
    (usersInfo ?? []).forEach((u: any) => {
      userMap[u.id] = { email: u.email, full_name: u.full_name };
    });
  }

  const finalRecords: DefaulterRecord[] = allRecords.map((d: any) => {
    const userInfo = userMap[d.user_id] ?? {
      email: "Unknown",
      full_name: "Unknown Student",
    };
    return {
      student_id: d.student_id,
      student_name: userInfo.full_name,
      student_email: userInfo.email,
      program_name: d.program_name,
      semester_number: d.semester_number,
      subject_name: d.subject_name,
      subject_code: d.subject_code,
      min_required_percent: d.min_required_percent,
      actual_percent: d.actual_percent,
      present_count: d.present_count,
      total_count: d.total_count,
    };
  });

  // Sort by biggest deficit first so defaulters appear prominently in processing
  finalRecords.sort((a, b) => {
    const deficitA = a.min_required_percent - a.actual_percent;
    const deficitB = b.min_required_percent - b.actual_percent;
    return deficitB - deficitA;
  });

  return { data: finalRecords, error: null };
}
