// app/calendar-dashboard/components/SemesterInfoPanel.tsx
"use client";

import Link from "next/link";
import type { SubjectAnalytics } from "@/lib/engines/analytics/types";

interface SemesterInfoPanelProps {
  semesterStart: string;
  semesterEnd: string;
  overallPercentage: number;
  subjects: SubjectAnalytics[];
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

  // Show all subjects, not just alerts, so the user sees real-time data for everything
  const displaySubjects = subjects;

  if (loading) {
    return (
      <div
        className={`bg-card rounded-2xl p-6 border border-border/50 animate-pulse space-y-4 ${className}`}
      >
        <div className="h-5 bg-muted/30 rounded w-40" />
        <div className="h-4 bg-muted/20 rounded" />
        <div className="h-4 bg-muted/20 rounded w-3/4" />
      </div>
    );
  }

  return (
    <div
      className={`bg-card border border-border/50 rounded-2xl shadow-sm p-8 flex flex-col gap-8 ${className}`}
    >
      {/* Semester Dates */}
      <div>
        <h3 className="text-xl font-extrabold text-foreground mb-6">
          Current Semester
        </h3>
        <div className="space-y-4">
          {[
            { label: "START DATE", value: formatDate(semesterStart) },
            { label: "END DATE", value: formatDate(semesterEnd) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="p-2 rounded-lg border border-blue-100 bg-blue-50/50 text-blue-500">
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
                <div className="text-[0.65rem] font-bold text-muted-foreground tracking-wider mb-0.5">
                  {label}
                </div>
                <div className="text-sm font-bold text-foreground">
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-border/50" />

      {/* Overall Attendance */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-muted-foreground">
            OVERALL ATTENDANCE
          </span>
          <Link
            href="/semester-statistics"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
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
                strokeWidth={3}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border/50 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-foreground/80">
              Current Status
            </span>
            <span
              className={`text-3xl font-extrabold tracking-tight ${
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

          <div className="w-full bg-blue-50 border border-blue-100 rounded-full h-2.5 overflow-hidden flex items-center p-px">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                overallPercentage >= 75
                  ? "bg-green-500"
                  : overallPercentage >= 70
                    ? "bg-yellow-500"
                    : "bg-red-600"
              }`}
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-border/50" />

      {/* All Subjects List */}
      <div>
        <h4 className="text-[0.65rem] font-extrabold uppercase tracking-widest text-muted-foreground mb-4">
          SUBJECTS
        </h4>

        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
          {displaySubjects.length > 0 ? (
            displaySubjects.map((subject) => (
              <div
                key={subject.subjectId}
                className="p-4 rounded-xl border border-border shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex items-start gap-3 bg-card transition-all"
              >
                <div
                  className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white ${
                    subject.riskLevel === "safe"
                      ? "bg-green-500"
                      : subject.riskLevel === "warning"
                      ? "bg-yellow-500"
                      : "bg-red-600"
                  }`}
                >
                  {subject.riskLevel === "safe" ? (
                     <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                     </svg>
                  ) : (
                     <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-extrabold text-foreground uppercase tracking-wide mb-1">
                    {subject.subjectName}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-black ${
                        subject.riskLevel === "safe"
                          ? "text-green-600"
                          : subject.riskLevel === "warning"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {subject.attendancePercentage}%
                    </span>
                    {subject.classesNeededToRecover > 0 && (
                      <span className="text-[0.65rem] text-muted-foreground font-medium">
                        Attend <strong className="font-bold text-foreground">{subject.classesNeededToRecover}</strong> more class{subject.classesNeededToRecover > 1 ? "es" : ""} to reach {subject.requiredPercentage}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-muted/10 rounded-xl border border-dashed border-border/60">
              <div className="inline-flex p-2 rounded-full bg-blue-50 text-blue-500 mb-2 border border-blue-100">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                No subjects found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
