// app/semester-statistics/components/StatisticsHeader.tsx
"use client";

import type { OverallAnalytics } from "@/lib/engines/analytics/types";

interface Props {
  overall: OverallAnalytics;
  programName: string;
  semesterNumber: string | number;
  sessionName: string;
}

export default function StatisticsHeader({ overall, programName, semesterNumber, sessionName }: Props) {
  const hasCritical = overall.dangerSubjectsCount > 0;
  const hasAtRisk   = overall.warningSubjectsCount > 0;
  const allSafe     = !hasCritical && !hasAtRisk;

  // Status label — plain and clear, no "Eligible/Not Eligible" confusion
  const statusLabel = hasCritical ? "Critical Subjects Present" : hasAtRisk ? "Needs Attention" : "All Subjects Safe";

  const statusColors = hasCritical
    ? { text: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800", dot: "bg-red-500" }
    : hasAtRisk
      ? { text: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800", dot: "bg-yellow-500" }
      : { text: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800", dot: "bg-green-500" };

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-4">

      {/* Title + status badge */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Attendance Overview</h1>
          {(programName || semesterNumber || sessionName) && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {programName}
              {semesterNumber ? ` · Semester ${semesterNumber}` : ""}
              {sessionName ? ` · ${sessionName}` : ""}
            </p>
          )}
        </div>

        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold shrink-0 ${statusColors.bg} ${statusColors.text}`}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${statusColors.dot}`} aria-hidden="true" />
          {statusLabel}
        </div>
      </div>

      {/* Risk counts — the 3 cells are the main data point */}
      <div className="grid grid-cols-3 gap-3">
        <RiskCell count={overall.safeSubjectsCount}    label="Safe (≥75%)"  color="text-green-600 dark:text-green-400"   bg="bg-green-50 dark:bg-green-950/20" />
        <RiskCell count={overall.warningSubjectsCount} label="At Risk"      color="text-yellow-600 dark:text-yellow-400" bg="bg-yellow-50 dark:bg-yellow-950/20" />
        <RiskCell count={overall.dangerSubjectsCount}  label="Critical"     color="text-red-600 dark:text-red-400"       bg="bg-red-50 dark:bg-red-950/20" />
      </div>

      <p className="text-[11px] text-muted-foreground">
        Exam eligibility requires <strong>all subjects</strong> to have ≥75% attendance. Cancelled classes are excluded from calculations.
      </p>
    </div>
  );
}

function RiskCell({ count, label, color, bg }: { count: number; label: string; color: string; bg: string }) {
  return (
    <div className={`rounded-xl p-3 text-center ${bg}`}>
      <div className={`text-2xl font-black ${color}`}>{count}</div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
