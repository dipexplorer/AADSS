// app/semester-statistics/components/IntelligencePanel.tsx
"use client";

import { useState } from "react";
import type { SemesterProjection } from "@/lib/engines/analytics/calculateSemesterProjection";
import type { DangerThreshold } from "@/lib/engines/analytics/calculateDangerThreshold";
import type { SubjectAnalytics } from "@/lib/engines/analytics/types";

interface Props {
  projections: SemesterProjection[];
  dangerThresholds: DangerThreshold[];
  subjects: SubjectAnalytics[];
}

type ActiveTab = "projection" | "trajectory" | "recovery";

export default function IntelligencePanel({
  projections,
  dangerThresholds,
  subjects,
}: Props) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("projection");

  const atRiskSubjects = subjects.filter((s) => s.riskLevel !== "safe");
  const recoveryCount = atRiskSubjects.length;

  const tabs: { key: ActiveTab; label: string; count?: number }[] = [
    { key: "projection", label: "Semester Projection" },
    { key: "trajectory", label: "Trajectory" },
    ...(recoveryCount > 0
      ? [
          {
            key: "recovery" as ActiveTab,
            label: "Recovery Needed",
            count: recoveryCount,
          },
        ]
      : []),
  ];

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border/50">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">
        {/* Projection tab */}
        {activeTab === "projection" && (
          <ProjectionTab projections={projections} />
        )}

        {/* Trajectory tab */}
        {activeTab === "trajectory" && <TrajectoryTab subjects={subjects} />}

        {/* Recovery tab */}
        {activeTab === "recovery" && <RecoveryTab subjects={atRiskSubjects} />}
      </div>
    </div>
  );
}

// ─── Projection Tab ───────────────────────────────────────────────────────────

function ProjectionTab({ projections }: { projections: SemesterProjection[] }) {
  if (projections.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No projection data available.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground mb-4">
        Projected final % if you continue at your current attendance rate
      </p>
      {projections.map((p) => {
        const isWorse = p.projectedFinalPercentage < p.currentPercentage;
        const isBetter = p.projectedFinalPercentage > p.currentPercentage;

        return (
          <div
            key={p.subjectId}
            className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Trend arrow */}
              <span
                className={`text-base flex-shrink-0 ${
                  p.trend === "improving"
                    ? "text-green-500"
                    : p.trend === "declining"
                      ? "text-red-500"
                      : "text-muted-foreground"
                }`}
              >
                {p.trend === "improving"
                  ? "↗"
                  : p.trend === "declining"
                    ? "↘"
                    : "→"}
              </span>
              <span className="text-sm text-foreground truncate">
                {p.subjectName}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <span className="text-xs text-muted-foreground">
                {p.currentPercentage}% now
              </span>
              <svg
                className="w-3 h-3 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span
                className={`text-sm font-bold ${
                  p.projectedStatus === "safe"
                    ? "text-green-600 dark:text-green-400"
                    : p.projectedStatus === "warning"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                }`}
              >
                {p.projectedFinalPercentage}%
              </span>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  p.projectedStatus === "safe"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : p.projectedStatus === "warning"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {p.projectedStatus}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Trajectory Tab ───────────────────────────────────────────────────────────

function TrajectoryTab({ subjects }: { subjects: SubjectAnalytics[] }) {
  const withTrend = subjects.map((s) => ({
    ...s,
    trend: getTrend(s.weeklyTrend.map((w) => w.attendancePercentage)),
  }));

  const declining = withTrend.filter((s) => s.trend === "declining");
  const improving = withTrend.filter((s) => s.trend === "improving");
  const stable = withTrend.filter((s) => s.trend === "stable");

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        Based on last 4 weeks of attendance
      </p>

      {declining.length > 0 && (
        <TrendGroup
          label="Declining"
          icon="↘"
          color="text-red-500"
          subjects={declining}
        />
      )}
      {improving.length > 0 && (
        <TrendGroup
          label="Improving"
          icon="↗"
          color="text-green-500"
          subjects={improving}
        />
      )}
      {stable.length > 0 && (
        <TrendGroup
          label="Stable"
          icon="→"
          color="text-muted-foreground"
          subjects={stable}
        />
      )}
    </div>
  );
}

function TrendGroup({
  label,
  icon,
  color,
  subjects,
}: {
  label: string;
  icon: string;
  color: string;
  subjects: (SubjectAnalytics & { trend: string })[];
}) {
  return (
    <div>
      <p
        className={`text-xs font-semibold mb-2 flex items-center gap-1 ${color}`}
      >
        <span>{icon}</span> {label}
      </p>
      <div className="space-y-2">
        {subjects.map((s) => (
          <div
            key={s.subjectId}
            className="flex items-center gap-3 py-1.5 px-3 rounded-lg bg-muted/20"
          >
            <span className="text-sm text-foreground flex-1 truncate">
              {s.subjectName}
            </span>
            {/* Mini sparkline */}
            <div className="flex items-end gap-0.5 h-5 flex-shrink-0">
              {s.weeklyTrend.map((w, i) => {
                const h = Math.max(2, (w.attendancePercentage / 100) * 20);
                return (
                  <div
                    key={i}
                    className={`w-2 rounded-sm ${
                      w.attendancePercentage >= s.requiredPercentage
                        ? "bg-green-400"
                        : w.attendancePercentage >= 65
                          ? "bg-yellow-400"
                          : "bg-red-400"
                    }`}
                    style={{ height: `${h}px` }}
                  />
                );
              })}
            </div>
            <span
              className={`text-xs font-semibold w-8 text-right flex-shrink-0 ${
                s.riskLevel === "safe"
                  ? "text-green-600 dark:text-green-400"
                  : s.riskLevel === "warning"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
              }`}
            >
              {s.attendancePercentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Recovery Tab ─────────────────────────────────────────────────────────────

function RecoveryTab({ subjects }: { subjects: SubjectAnalytics[] }) {
  const sorted = [...subjects].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground mb-4">
        Classes needed to reach the required attendance threshold
      </p>
      {sorted.map((s) => (
        <div
          key={s.subjectId}
          className={`flex items-center justify-between p-4 rounded-lg border ${
            s.riskLevel === "danger"
              ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
              : "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
          }`}
        >
          <div>
            <p className="text-sm font-medium text-foreground">
              {s.subjectName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Currently {s.attendancePercentage}% · needs {s.requiredPercentage}
              %
            </p>
          </div>
          <div
            className={`text-right ml-4 flex-shrink-0 ${
              s.riskLevel === "danger"
                ? "text-red-600 dark:text-red-400"
                : "text-yellow-600 dark:text-yellow-400"
            }`}
          >
            <p className="text-2xl font-bold">+{s.classesNeededToRecover}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide">
              classes needed
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getTrend(percentages: number[]): "improving" | "declining" | "stable" {
  if (percentages.length < 4) return "stable";
  const older = (percentages[0] + percentages[1]) / 2;
  const recent = (percentages[2] + percentages[3]) / 2;
  if (recent > older + 5) return "improving";
  if (recent < older - 5) return "declining";
  return "stable";
}
