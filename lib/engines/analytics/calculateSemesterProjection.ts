export interface SemesterProjection {
  subjectId: string;
  subjectName: string;
  currentPercentage: number;
  projectedFinalPercentage: number;
  remainingClasses: number;
  projectedStatus: "safe" | "warning" | "danger";
  trend: "improving" | "declining" | "stable";
}

/**
 * Yeh function kya karta hai:
 *
 * 1. Semester end date se aaj ka difference nikalta hai (days)
 * 2. Timetable se us subject ki weekly frequency nikalta hai
 * 3. Remaining classes = (remaining_weeks × weekly_frequency)
 * 4. Projection = agar student SAME rate pe attend karta rahe
 *    projected_present = present + (remaining × current_rate)
 *    projected_total   = total + remaining
 *    projected_%       = projected_present / projected_total × 100
 *
 * Trend:
 *   Last 2 weeks ka avg vs usse pehle 2 weeks ka avg compare karta hai
 *   improving  → recent avg > older avg + 5
 *   declining  → recent avg < older avg - 5
 *   stable     → baaki sab
 */
export function calculateSemesterProjection(params: {
  subjectId: string;
  subjectName: string;
  totalClasses: number;
  presentClasses: number;
  remainingClasses: number;
  requiredPercentage: number;
  weeklyTrend: { attendancePercentage: number }[];
}): SemesterProjection {
  const {
    subjectId,
    subjectName,
    totalClasses,
    presentClasses,
    remainingClasses,
    requiredPercentage,
    weeklyTrend,
  } = params;

  const currentRate = totalClasses > 0 ? presentClasses / totalClasses : 0;

  const currentPercentage = Math.round(currentRate * 100);

  // Projected final assuming same attendance rate
  const projectedPresent =
    presentClasses + Math.round(remainingClasses * currentRate);
  const projectedTotal = totalClasses + remainingClasses;
  const projectedFinalPercentage =
    projectedTotal > 0
      ? Math.round((projectedPresent / projectedTotal) * 100)
      : currentPercentage;

  const projectedStatus: "safe" | "warning" | "danger" =
    projectedFinalPercentage >= requiredPercentage
      ? "safe"
      : projectedFinalPercentage >= 65
        ? "warning"
        : "danger";

  // Trend — last 2 weeks vs first 2 weeks of the 4-week window
  let trend: "improving" | "declining" | "stable" = "stable";
  if (weeklyTrend.length >= 4) {
    const olderAvg =
      (weeklyTrend[0].attendancePercentage +
        weeklyTrend[1].attendancePercentage) /
      2;
    const recentAvg =
      (weeklyTrend[2].attendancePercentage +
        weeklyTrend[3].attendancePercentage) /
      2;

    if (recentAvg > olderAvg + 5) trend = "improving";
    else if (recentAvg < olderAvg - 5) trend = "declining";
  }

  return {
    subjectId,
    subjectName,
    currentPercentage,
    projectedFinalPercentage,
    remainingClasses,
    projectedStatus,
    trend,
  };
}
