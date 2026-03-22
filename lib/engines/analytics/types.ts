export interface SubjectAnalytics {
  subjectId: string;
  subjectName: string;
  creditHours: number;

  // Raw counts
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  cancelledClasses: number;

  // Calculated
  attendancePercentage: number; // present / total * 100
  requiredPercentage: number; // min threshold (usually 75)
  classesNeededToRecover: number; // 0 agar safe hai

  // Risk
  riskScore: number; // 0-100
  riskLevel: "safe" | "warning" | "danger";

  // Weekly trend (last 4 weeks)
  weeklyTrend: WeeklyTrendPoint[];
}

export interface WeeklyTrendPoint {
  weekLabel: string; // "Week 1", "Week 2" etc.
  weekStart: string; // YYYY-MM-DD
  attendancePercentage: number;
}

export interface OverallAnalytics {
  totalClasses: number;
  presentClasses: number;
  overallPercentage: number;
  safeSubjectsCount: number;
  warningSubjectsCount: number;
  dangerSubjectsCount: number;
  overallRiskLevel: "safe" | "warning" | "danger";
}

export interface AnalyticsSummary {
  subjects: SubjectAnalytics[];
  overall: OverallAnalytics;
  computedAt: string;
}
