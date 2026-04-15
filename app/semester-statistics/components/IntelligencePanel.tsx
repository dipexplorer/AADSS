// app/semester-statistics/components/IntelligencePanel.tsx
// Replaces multi-tab panel with a single Eligibility Forecast section.
"use client";

import type { SemesterProjection } from "@/lib/engines/analytics/calculateSemesterProjection";
import type { SubjectAnalytics } from "@/lib/engines/analytics/types";

interface Props {
  projections: SemesterProjection[];
  subjects: SubjectAnalytics[];
}

function getConfidence(totalClasses: number): "Low" | "Medium" | "High" {
  if (totalClasses >= 15) return "High";
  if (totalClasses >= 6) return "Medium";
  return "Low";
}

export default function EligibilityForecast({ projections, subjects }: Props) {
  const atRiskSubjects = subjects.filter((s) => s.riskLevel !== "safe");
  if (atRiskSubjects.length === 0) return null;

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 bg-muted/20">
        <h2 className="text-sm font-semibold text-foreground">📊 Eligibility Forecast</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Subjects that need attention to reach the 75% threshold.
        </p>
      </div>

      <div className="divide-y divide-border/40">
        {atRiskSubjects
          .sort((a, b) => b.riskScore - a.riskScore)
          .map((s) => {
            const proj = projections.find((p) => p.subjectId === s.subjectId);
            const remaining = proj?.remainingClasses ?? 0;
            // Max possible = if student attends ALL remaining classes
            const maxPossibleRaw = s.totalClasses + remaining > 0
              ? Math.round(((s.presentClasses + remaining) / (s.totalClasses + remaining)) * 100)
              : s.attendancePercentage;
            const maxPossible = maxPossibleRaw;
            const isRecoverable = maxPossible >= s.requiredPercentage;
            const confidence = getConfidence(s.totalClasses);

            const confidenceColor =
              confidence === "High"
                ? "text-green-600 dark:text-green-400"
                : confidence === "Medium"
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-zinc-400";

            return (
              <div key={s.subjectId} className="p-4 sm:p-5 space-y-3">
                {/* Subject name + badge */}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{s.subjectName}</p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      s.riskLevel === "danger"
                        ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                    }`}
                  >
                    {s.riskLevel === "danger" ? "Critical" : "At Risk"}
                  </span>
                </div>

                {/* Forecast row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <ForecastCell
                    label="Current"
                    value={`${s.attendancePercentage}%`}
                    color={s.riskLevel === "danger" ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400"}
                  />
                  <ForecastCell
                    label="Need to attend"
                    value={s.classesNeededToRecover > 0 ? `+${s.classesNeededToRecover} classes` : "—"}
                    color="text-foreground"
                  />
                  <ForecastCell
                    label="Max possible"
                    value={remaining > 0 ? `${maxPossible}%` : "—"}
                    color={isRecoverable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
                  />
                  <ForecastCell
                    label="Confidence"
                    value={confidence}
                    color={confidenceColor}
                    subtitle={`${s.totalClasses} classes done`}
                  />
                </div>

                {/* Actionable tip */}
                <div
                  className={`text-xs px-3 py-2 rounded-lg font-medium ${
                    !isRecoverable
                      ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                      : s.classesNeededToRecover > 0
                        ? "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400"
                        : "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                  }`}
                >
                  {!isRecoverable ? (
                    <>⚠️ Even attending all remaining classes, max possible is {maxPossible}% — below the 75% threshold.</>
                  ) : s.classesNeededToRecover > 0 ? (
                    <>✅ Attend the next <strong>{s.classesNeededToRecover}</strong> consecutive classes to reach eligibility.</>
                  ) : (
                    <>🎉 You are eligible — maintain your attendance.</>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

function ForecastCell({
  label,
  value,
  color = "text-foreground",
  subtitle,
}: {
  label: string;
  value: string;
  color?: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-muted/20 rounded-lg p-2.5">
      <div className={`text-sm font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{label}</div>
      {subtitle && <div className="text-[9px] text-muted-foreground/60 mt-0.5">{subtitle}</div>}
    </div>
  );
}
