// app/daily-attendance/components/ScheduleTimeline.tsx
"use client";

import { ClassPeriod } from "@/lib/attendance/getDailySchedule";

interface ScheduleTimelineProps {
  periods: ClassPeriod[];
  loading: boolean;
  date: string;
  onStatusChange: (
    sessionId: string,
    status: "present" | "absent" | "cancelled" | null,
  ) => void;
}

function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00").getDay();
  return d === 0 || d === 6;
}

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

export default function ScheduleTimeline({
  periods,
  loading,
  date,
  onStatusChange,
}: ScheduleTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-5 border border-border/50 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted/50 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-muted/50 rounded w-1/3" />
                <div className="h-4 bg-muted/30 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isWeekend(date)) {
    return (
      <div className="bg-card/50 border border-border/50 rounded-xl p-12 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          It's a Weekend!
        </h3>
        <p className="text-muted-foreground text-sm">
          No classes today. Enjoy your day off!
        </p>
      </div>
    );
  }

  if (periods.length === 0) {
    return (
      <div className="bg-card/50 border border-border/50 border-dashed rounded-xl p-12 text-center">
        <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-primary/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No Classes Scheduled
        </h3>
        <p className="text-muted-foreground text-sm">Enjoy your free time!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {periods.map((period, index) => (
        <PeriodCard
          key={period.sessionId}
          period={period}
          periodNumber={index + 1}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}

function PeriodCard({
  period,
  periodNumber,
  onStatusChange,
}: {
  period: ClassPeriod;
  periodNumber: number;
  onStatusChange: (
    sessionId: string,
    status: "present" | "absent" | "cancelled" | null,
  ) => void;
}) {
  const status = period.attendanceStatus;
  const isCancelled = period.status === "cancelled";

  const borderColor =
    status === "present"
      ? "border-l-green-500"
      : status === "absent"
        ? "border-l-red-400"
        : status === "cancelled"
          ? "border-l-yellow-500"
          : "border-l-transparent";

  return (
    <div
      className={`bg-card rounded-xl p-5 border border-border/50 border-l-[6px] shadow-sm hover:shadow-md transition-all ${borderColor}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Period Number */}
        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-primary/5 shrink-0">
          <span className="text-[10px] uppercase text-primary/60 font-bold tracking-wider">
            Period
          </span>
          <span className="text-2xl font-bold text-primary">
            {periodNumber}
          </span>
        </div>

        {/* Subject Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-foreground uppercase tracking-tight truncate">
            {period.subjectName}
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5 text-primary/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formatTime(period.startTime)} — {formatTime(period.endTime)}
            </span>
            {period.room && (
              <span className="flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5 text-primary/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {period.room}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isCancelled ? (
          <div className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-semibold">
            Class Cancelled
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            {/* Present */}
            <button
              onClick={() =>
                onStatusChange(
                  period.sessionId,
                  status === "present" ? null : "present",
                )
              }
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                status === "present"
                  ? "bg-green-600 text-white shadow-sm ring-2 ring-green-500 ring-offset-2 ring-offset-card"
                  : "text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Present
            </button>

            {/* Absent */}
            <button
              onClick={() =>
                onStatusChange(
                  period.sessionId,
                  status === "absent" ? null : "absent",
                )
              }
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                status === "absent"
                  ? "bg-red-500 text-white shadow-sm ring-2 ring-red-400 ring-offset-2 ring-offset-card"
                  : "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Absent
            </button>

            {/* Cancelled */}
            <button
              onClick={() =>
                onStatusChange(
                  period.sessionId,
                  status === "cancelled" ? null : "cancelled",
                )
              }
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                status === "cancelled"
                  ? "bg-yellow-500 text-white shadow-sm ring-2 ring-yellow-400 ring-offset-2 ring-offset-card"
                  : "text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/30"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 12H4"
                />
              </svg>
              <span className="hidden sm:inline">Cancel</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
