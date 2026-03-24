// lib/engines/analytics/getAnalyticsSummary.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateRiskScore } from "./calculateRiskScore";
import { calculateClassesNeeded } from "./calculateClassesNeeded";
import { calculateWeeklyTrend } from "./calculateWeeklyTrend";
import { calculateSemesterProjection } from "./calculateSemesterProjection";
import { calculateDangerThreshold } from "./calculateDangerThreshold";
import type {
  AnalyticsSummary,
  SubjectAnalytics,
  OverallAnalytics,
} from "./types";
import type { SemesterProjection } from "./calculateSemesterProjection";
import type { DangerThreshold } from "./calculateDangerThreshold";

// Extended summary with new intelligence fields
export interface ExtendedAnalyticsSummary extends AnalyticsSummary {
  projections: SemesterProjection[];
  dangerThresholds: DangerThreshold[];
}

export async function getAnalyticsSummary(
  semesterId: string,
  studentProfileId: string,
  sessionId: string, // academic_session ka id — end_date ke liye
): Promise<{ data: ExtendedAnalyticsSummary | null; error: string | null }> {
  const supabase = createClient();

  // 1. Subjects fetch
  const { data: subjects, error: subjectsError } = await supabase
    .from("subjects")
    .select("id, name, min_attendance_required")
    .eq("semester_id", semesterId);

  if (subjectsError) return { data: null, error: subjectsError.message };
  if (!subjects?.length) {
    return {
      data: {
        subjects: [],
        overall: {
          totalClasses: 0,
          presentClasses: 0,
          overallPercentage: 0,
          safeSubjectsCount: 0,
          warningSubjectsCount: 0,
          dangerSubjectsCount: 0,
          overallRiskLevel: "safe",
        },
        projections: [],
        dangerThresholds: [],
        computedAt: new Date().toISOString(),
      },
      error: null,
    };
  }

  const subjectIds = subjects.map((s) => s.id);

  // 2. Semester end date + timetable fetch (parallel)
  const [
    { data: sessionData },
    { data: timetableData },
    { data: sessions, error: sessionsError },
  ] = await Promise.all([
    supabase
      .from("academic_sessions")
      .select("end_date")
      .eq("id", sessionId)
      .single(),
    supabase
      .from("timetable")
      .select("subject_id, day_of_week")
      .in("subject_id", subjectIds),
    supabase
      .from("class_sessions")
      .select("id, subject_id, status, date")
      .in("subject_id", subjectIds)
      .neq("status", "scheduled"),
  ]);

  if (sessionsError) return { data: null, error: sessionsError.message };

  // 3. Remaining classes per subject calculate karo
  const today = new Date();
  const endDate = sessionData?.end_date ? new Date(sessionData.end_date) : null;

  // Days remaining
  const daysRemaining = endDate
    ? Math.max(
        0,
        Math.floor(
          (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        ),
      )
    : 0;
  const weeksRemaining = daysRemaining / 7;

  // Per subject weekly frequency from timetable
  const remainingClassesMap = new Map<string, number>();
  subjectIds.forEach((subjectId) => {
    const weeklyClasses = (timetableData ?? []).filter(
      (t) => t.subject_id === subjectId,
    ).length;
    remainingClassesMap.set(
      subjectId,
      Math.floor(weeksRemaining * weeklyClasses),
    );
  });

  // 4. Attendance fetch
  const sessionIds = (sessions ?? []).map((s) => s.id);
  let attendanceRecords: { class_session_id: string; status: string }[] = [];

  if (sessionIds.length > 0) {
    const { data: attendance, error: attError } = await supabase
      .from("attendance")
      .select("class_session_id, status")
      .eq("student_id", studentProfileId)
      .in("class_session_id", sessionIds);

    if (attError) return { data: null, error: attError.message };
    attendanceRecords = attendance ?? [];
  }

  // 5. Per-subject analytics
  const subjectAnalytics: SubjectAnalytics[] = subjects.map((subject) => {
    const subjectSessions = (sessions ?? []).filter(
      (s) => s.subject_id === subject.id,
    );
    const nonCancelledSessions = subjectSessions.filter(
      (s) => s.status !== "cancelled",
    );
    const cancelledSessions = subjectSessions.filter(
      (s) => s.status === "cancelled",
    );

    const totalClasses = nonCancelledSessions.length;
    const presentClasses = attendanceRecords.filter(
      (a) =>
        a.status === "present" &&
        nonCancelledSessions.some((s) => s.id === a.class_session_id),
    ).length;
    const absentClasses = totalClasses - presentClasses;
    const attendancePercentage =
      totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

    const requiredPercentage = subject.min_attendance_required ?? 75;
    const { riskScore, riskLevel } = calculateRiskScore(
      attendancePercentage,
      requiredPercentage,
    );
    const classesNeededToRecover = calculateClassesNeeded(
      totalClasses,
      presentClasses,
      requiredPercentage,
    );

    const trendRecords = nonCancelledSessions.map((session) => {
      const attRecord = attendanceRecords.find(
        (a) => a.class_session_id === session.id,
      );
      return {
        scheduledDate: session.date,
        status: (attRecord?.status ?? "absent") as
          | "present"
          | "absent"
          | "cancelled",
      };
    });

    const weeklyTrend = calculateWeeklyTrend(trendRecords);

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      totalClasses,
      presentClasses,
      absentClasses,
      cancelledClasses: cancelledSessions.length,
      attendancePercentage,
      requiredPercentage,
      classesNeededToRecover,
      riskScore,
      riskLevel,
      weeklyTrend,
    };
  });

  // 6. Projections + Danger Thresholds
  const projections: SemesterProjection[] = subjectAnalytics.map((s) =>
    calculateSemesterProjection({
      subjectId: s.subjectId,
      subjectName: s.subjectName,
      totalClasses: s.totalClasses,
      presentClasses: s.presentClasses,
      remainingClasses: remainingClassesMap.get(s.subjectId) ?? 0,
      requiredPercentage: s.requiredPercentage,
      weeklyTrend: s.weeklyTrend,
    }),
  );

  const dangerThresholds: DangerThreshold[] = subjectAnalytics
    .map((s) =>
      calculateDangerThreshold(
        s.subjectId,
        s.subjectName,
        s.totalClasses,
        s.presentClasses,
        s.requiredPercentage,
      ),
    )
    .filter(Boolean) as DangerThreshold[];

  // 7. Overall
  const totalAll = subjectAnalytics.reduce((s, x) => s + x.totalClasses, 0);
  const presentAll = subjectAnalytics.reduce((s, x) => s + x.presentClasses, 0);
  const overallPercentage =
    totalAll > 0 ? Math.round((presentAll / totalAll) * 100) : 0;

  const overall: OverallAnalytics = {
    totalClasses: totalAll,
    presentClasses: presentAll,
    overallPercentage,
    safeSubjectsCount: subjectAnalytics.filter((s) => s.riskLevel === "safe")
      .length,
    warningSubjectsCount: subjectAnalytics.filter(
      (s) => s.riskLevel === "warning",
    ).length,
    dangerSubjectsCount: subjectAnalytics.filter(
      (s) => s.riskLevel === "danger",
    ).length,
    overallRiskLevel: subjectAnalytics.some((s) => s.riskLevel === "danger")
      ? "danger"
      : subjectAnalytics.some((s) => s.riskLevel === "warning")
        ? "warning"
        : "safe",
  };

  return {
    data: {
      subjects: subjectAnalytics,
      overall,
      projections,
      dangerThresholds,
      computedAt: new Date().toISOString(),
    },
    error: null,
  };
}
