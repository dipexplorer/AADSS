// lib/engines/analytics/calculateTodayPriority.ts

import type { SubjectAnalytics } from "./types";

export interface TodayPriority {
  subjectId: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  riskLevel: "safe" | "warning" | "danger";
  riskScore: number;
  isMustAttend: boolean; // danger ya warning mein hai
  alreadyMarked: boolean;
  currentPercentage: number;
}

/**
 * Yeh function aaj ke class schedule ko analytics ke saath
 * merge karke priority list banata hai.
 *
 * isMustAttend = true jab:
 *   - Subject warning ya danger zone mein ho
 *   - Ya riskScore > 40 ho
 *
 * Sort order: must-attend pehle, phir risk score descending
 */
export function calculateTodayPriority(
  todaySchedule: {
    subjectId: string;
    subjectName: string;
    startTime: string;
    endTime: string;
    alreadyMarked: boolean;
  }[],
  subjectAnalytics: SubjectAnalytics[],
): TodayPriority[] {
  const analyticsMap = new Map(subjectAnalytics.map((s) => [s.subjectId, s]));

  const priorities: TodayPriority[] = todaySchedule.map((classItem) => {
    const analytics = analyticsMap.get(classItem.subjectId);

    const riskLevel = analytics?.riskLevel ?? "safe";
    const riskScore = analytics?.riskScore ?? 0;
    const currentPercentage = analytics?.attendancePercentage ?? 100;

    return {
      subjectId: classItem.subjectId,
      subjectName: classItem.subjectName,
      startTime: classItem.startTime,
      endTime: classItem.endTime,
      riskLevel,
      riskScore,
      isMustAttend: riskLevel !== "safe" || riskScore > 40,
      alreadyMarked: classItem.alreadyMarked,
      currentPercentage,
    };
  });

  // Must-attend pehle, phir risk score se sort
  return priorities.sort((a, b) => {
    if (a.isMustAttend && !b.isMustAttend) return -1;
    if (!a.isMustAttend && b.isMustAttend) return 1;
    return b.riskScore - a.riskScore;
  });
}
