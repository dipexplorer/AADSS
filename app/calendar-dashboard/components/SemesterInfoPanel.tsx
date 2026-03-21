// app/calendar-dashboard/components/SemesterInfoPanel.tsx
"use client";

import Link from "next/link";
import { SubjectWithStats } from "@/lib/attendance/getSubjectsWithStats";

interface SemesterInfoPanelProps {
  semesterStart: string;
  semesterEnd: string;
  overallPercentage: number;
  subjects: SubjectWithStats[];
  loading: boolean;
  className?: string;
}

const STATUS_ICON = {
  safe: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  danger: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

export default function SemesterInfoPanel({
  semesterStart,
  semesterEnd,
  overallPercentage,
  subjects,
  loading,
  className = "",
}: SemesterInfoPanelProps) {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // Show only non-safe subjects as alerts
  const alerts = subjects.filter((s) => s.status !== "safe");

  if (loading) {
    return (
      <div
        className={`bg-card rounded-xl p-6 border border-border/50 animate-pulse space-y-4 ${className}`}
      >
        <div className="h-5 bg-muted/30 rounded w-40" />
        <div className="h-4 bg-muted/20 rounded" />
        <div className="h-4 bg-muted/20 rounded w-3/4" />
      </div>
    );
  }

  return (
    <div
      className={`bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm p-6 space-y-6 ${className}`}
    >
      {/* Semester Dates */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">
          Current Semester
        </h3>
        <div className="space-y-3">
          {[
            { label: "Start Date", value: formatDate(semesterStart) },
            { label: "End Date", value: formatDate(semesterEnd) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  {label}
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Attendance */}
      <div className="border-t border-border/50 pt-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Overall Attendance
          </span>
          <Link
            href="/semester-statistics"
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            View Details
            <svg
              className="w-3 h-3"
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
          </Link>
        </div>

        <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">
              Current Status
            </span>
            <span
              className={`text-3xl font-bold tracking-tight ${
                overallPercentage >= 75
                  ? "text-green-600"
                  : overallPercentage >= 70
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {overallPercentage}%
            </span>
          </div>

          <div className="w-full bg-background/50 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                overallPercentage >= 75
                  ? "bg-green-500"
                  : overallPercentage >= 70
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Subject Alerts */}
      <div className="border-t border-border/50 pt-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Subject Alerts
        </h4>

        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {alerts.length > 0 ? (
            alerts.map((subject) => (
              <div
                key={subject.id}
                className={`p-3 rounded-lg border flex items-start gap-3 ${
                  subject.status === "warning"
                    ? "bg-yellow-50/50 border-yellow-200/50 dark:bg-yellow-950/20"
                    : "bg-red-50/50 border-red-200/50 dark:bg-red-950/20"
                }`}
              >
                <div
                  className={
                    subject.status === "warning"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }
                >
                  {STATUS_ICON[subject.status]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">
                    {subject.name}
                  </div>
                  <div
                    className={`text-xs font-bold mt-0.5 ${
                      subject.status === "warning"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {subject.attendancePercentage}%
                  </div>
                  {subject.requiredClasses > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Attend{" "}
                      <span className="font-semibold text-foreground">
                        {subject.requiredClasses}
                      </span>{" "}
                      more class{subject.requiredClasses > 1 ? "es" : ""} to
                      reach {subject.minAttendanceRequired}%
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 bg-muted/20 rounded-xl border border-dashed border-border">
              <div className="inline-flex p-2 rounded-full bg-green-100 text-green-600 mb-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                All subjects in safe zone!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Configure Link */}
      <div className="border-t border-border/50 pt-5">
        <Link
          href="/semester-configuration"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm font-semibold text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Configure Semester
        </Link>
      </div>
    </div>
  );
}
