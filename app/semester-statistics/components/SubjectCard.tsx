// app/semester-statistics/components/SubjectCard.tsx
"use client";

import { useState } from "react";
import type { SubjectAnalytics } from "@/lib/engines/analytics/types";

interface Props {
  subject: SubjectAnalytics;
}

export default function SubjectCard({ subject }: Props) {
  const [expanded, setExpanded] = useState(false);

  const config = {
    safe: {
      bar: "bg-green-500",
      text: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/20",
      topBar: "bg-green-500",
      label: "Safe",
    },
    warning: {
      bar: "bg-yellow-500",
      text: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-950/20",
      topBar: "bg-yellow-500",
      label: "Warning",
    },
    danger: {
      bar: "bg-red-500",
      text: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/20",
      topBar: "bg-red-500",
      label: "Danger",
    },
  }[subject.riskLevel];

  return (
    <div className="bg-card rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-border/50">
      <div className={`h-1.5 w-full ${config.topBar}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-bold text-foreground text-base leading-tight flex-1 pr-2">
            {subject.subjectName}
          </h3>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full hrink-0 ${config.bg} ${config.text}`}
          >
            {config.label}
          </span>
        </div>

        {/* Percentage */}
        <div
          className={`flex items-center justify-center p-4 rounded-xl mb-4 ${config.bg}`}
        >
          <div className="text-center">
            <div className={`text-4xl font-bold ${config.text}`}>
              {subject.attendancePercentage}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Current Attendance
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${config.bar}`}
              style={{ width: `${subject.attendancePercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span className="font-medium">
              {subject.requiredPercentage}% required
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            {
              label: "Attended",
              value: subject.presentClasses,
              color: "text-green-600",
            },
            {
              label: "Missed",
              value: subject.absentClasses,
              color: "text-red-500",
            },
            {
              label: "Cancelled",
              value: subject.cancelledClasses,
              color: "text-yellow-600",
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center bg-muted/30 rounded-lg p-2">
              <div className={`text-xl font-bold ${color}`}>{value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Recovery alert */}
        {subject.classesNeededToRecover > 0 && (
          <div
            className={`p-3 rounded-lg mb-4 flex items-start gap-2 ${
              subject.riskLevel === "danger"
                ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                : "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400"
            }`}
          >
            <svg
              className="w-4 h-4 mt-0.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-medium">
              Attend <strong>{subject.classesNeededToRecover}</strong> more
              class
              {subject.classesNeededToRecover > 1 ? "es" : ""} to reach{" "}
              {subject.requiredPercentage}%
            </span>
          </div>
        )}

        {/* Expand */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors"
        >
          {expanded ? "Show Less" : "View Details"}
          <svg
            className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Classes</span>
              <span className="font-semibold">{subject.totalClasses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Attendance Rate</span>
              <span className="font-semibold">
                {subject.presentClasses}/{subject.totalClasses}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Required for {subject.requiredPercentage}%
              </span>
              <span className="font-semibold">
                {Math.ceil(
                  subject.totalClasses * (subject.requiredPercentage / 100),
                )}{" "}
                classes
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
