"use client";

import type { OverallAnalytics } from "@/lib/engines/analytics/types";

interface Props {
  overall: OverallAnalytics;
  programName: string;
  semesterNumber: string | number;
  sessionName: string;
}

export default function StatisticsHeader({
  overall,
  programName,
  semesterNumber,
  sessionName,
}: Props) {
  const statusColor =
    overall.overallPercentage >= 75
      ? "text-green-600"
      : overall.overallPercentage >= 70
        ? "text-yellow-600"
        : "text-red-600";

  const barColor =
    overall.overallPercentage >= 75
      ? "bg-green-500"
      : overall.overallPercentage >= 70
        ? "bg-yellow-500"
        : "bg-red-500";

  const statusLabel =
    overall.overallPercentage >= 75
      ? "Safe Zone"
      : overall.overallPercentage >= 70
        ? "Caution Zone"
        : "Danger Zone";

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left — Title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Semester Statistics
          </h1>
          {(programName || semesterNumber || sessionName) && (
            <p className="text-sm text-muted-foreground">
              {programName}
              {semesterNumber ? ` · Semester ${semesterNumber}` : ""}
              {sessionName ? ` · ${sessionName}` : ""}
            </p>
          )}
        </div>

        {/* Right — Overall % */}
        <div
          className={`flex items-center gap-4 px-6 py-4 rounded-xl bg-muted/30 border border-border/50`}
        >
          <div className="text-center">
            <div className={`text-4xl font-bold tracking-tight ${statusColor}`}>
              {overall.overallPercentage}%
            </div>
            <div className={`text-sm font-semibold mt-0.5 ${statusColor}`}>
              {statusLabel}
            </div>
          </div>

          <div className="w-px h-12 bg-border/50" />

          <div className="text-sm text-muted-foreground space-y-1">
            <div>
              <span className="font-semibold text-foreground">
                {overall.presentClasses}
              </span>{" "}
              attended
            </div>
            <div>
              <span className="font-semibold text-foreground">
                {overall.totalClasses}
              </span>{" "}
              total classes
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 rounded-full ${barColor}`}
            style={{ width: `${overall.overallPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {[
          {
            label: "Safe",
            count: overall.safeSubjectsCount,
            color: "text-green-600 bg-green-50 dark:bg-green-950/20",
          },
          {
            label: "Warning",
            count: overall.warningSubjectsCount,
            color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20",
          },
          {
            label: "Danger",
            count: overall.dangerSubjectsCount,
            color: "text-red-600 bg-red-50 dark:bg-red-950/20",
          },
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-xl p-3 text-center ${color}`}>
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-xs font-semibold uppercase tracking-wider mt-0.5 opacity-80">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
