// app/semester-statistics/components/StatisticsHeader.tsx
"use client";

interface Overall {
  percentage: number;
  attended: number;
  total: number;
  safeCount: number;
  warningCount: number;
  dangerCount: number;
}

interface Props {
  overall: Overall;
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
    overall.percentage >= 75
      ? "text-green-600"
      : overall.percentage >= 70
        ? "text-yellow-600"
        : "text-red-600";

  const barColor =
    overall.percentage >= 75
      ? "bg-green-500"
      : overall.percentage >= 70
        ? "bg-yellow-500"
        : "bg-red-500";

  const statusLabel =
    overall.percentage >= 75
      ? "Safe Zone"
      : overall.percentage >= 70
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
              {overall.percentage}%
            </div>
            <div className={`text-sm font-semibold mt-0.5 ${statusColor}`}>
              {statusLabel}
            </div>
          </div>

          <div className="w-px h-12 bg-border/50" />

          <div className="text-sm text-muted-foreground space-y-1">
            <div>
              <span className="font-semibold text-foreground">
                {overall.attended}
              </span>{" "}
              attended
            </div>
            <div>
              <span className="font-semibold text-foreground">
                {overall.total}
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
            style={{ width: `${overall.percentage}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {[
          {
            label: "Safe",
            count: overall.safeCount,
            color: "text-green-600 bg-green-50 dark:bg-green-950/20",
          },
          {
            label: "Warning",
            count: overall.warningCount,
            color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20",
          },
          {
            label: "Danger",
            count: overall.dangerCount,
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
