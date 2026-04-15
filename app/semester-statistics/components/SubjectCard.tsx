// app/semester-statistics/components/SubjectCard.tsx
"use client";

import { useState } from "react";
import type { SubjectAnalytics } from "@/lib/engines/analytics/types";

interface Props {
  subject: SubjectAnalytics;
}

export default function SubjectCard({ subject }: Props) {
  const [expanded, setExpanded] = useState(false);

  const pct = subject.attendancePercentage;
  const effectiveTotal = subject.totalClasses; // cancelled already excluded in analytics engine
  
  // Max possible = if student attends all future (unknown count) — use a conservative estimate
  // Since we don't have remaining classes here, show what we have
  const isEligible = pct >= subject.requiredPercentage;
  const isWarning = pct >= 65 && pct < subject.requiredPercentage;
  const isDanger = pct < 65;

  const config = isDanger
    ? {
        bar: "bg-red-500",
        text: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-950/20",
        topBar: "bg-red-500",
        label: "Critical",
        badgeBg: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
      }
    : isWarning
      ? {
          bar: "bg-yellow-500",
          text: "text-yellow-600 dark:text-yellow-400",
          bg: "bg-yellow-50 dark:bg-yellow-950/20",
          topBar: "bg-yellow-500",
          label: "At Risk",
          badgeBg: "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400",
        }
      : {
          bar: "bg-green-500",
          text: "text-green-600 dark:text-green-400",
          bg: "bg-green-50 dark:bg-green-950/20",
          topBar: "bg-green-500",
          label: "Eligible",
          badgeBg: "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400",
        };

  return (
    <article
      className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-border/50"
      aria-label={`${subject.subjectName} attendance card`}
    >
      {/* Color top bar */}
      <div className={`h-1 w-full ${config.topBar}`} aria-hidden="true" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <h3 className="font-bold text-foreground text-sm leading-tight flex-1">
            {subject.subjectName}
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${config.badgeBg}`}>
            {config.label}
          </span>
        </div>

        {/* Percentage display */}
        <div className={`flex items-center justify-center py-4 rounded-xl mb-4 ${config.bg}`}>
          <div className="text-center">
            <div className={`text-4xl font-black ${config.text}`} aria-label={`${pct}% attendance`}>
              {pct}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Current Attendance</div>
          </div>
        </div>

        {/* Progress bar with 75% marker */}
        <div className="mb-4">
          <div className="relative w-full bg-muted/30 rounded-full h-2 overflow-visible">
            <div
              className={`h-full transition-all duration-700 rounded-full ${config.bar}`}
              style={{ width: `${pct}%` }}
            />
            {/* 75% threshold marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-zinc-400 dark:bg-zinc-500 rounded"
              style={{ left: `${subject.requiredPercentage}%` }}
              aria-hidden="true"
            />
          </div>
          <div className="relative h-4">
            <span
              className="absolute text-[10px] text-muted-foreground -translate-x-1/2"
              style={{ left: `${subject.requiredPercentage}%`, top: "2px" }}
            >
              {subject.requiredPercentage}% required
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatCell label="Attended" value={subject.presentClasses} color="text-green-600 dark:text-green-400" />
          <StatCell label="Missed" value={subject.absentClasses} color="text-red-500 dark:text-red-400" />
          <StatCell
            label="Cancelled"
            value={subject.cancelledClasses}
            color="text-zinc-400"
            tooltip="Cancelled classes are excluded from calculations"
          />
        </div>

        {/* Actionable tip */}
        {!isEligible && (
          <div
            className={`text-xs px-3 py-2.5 rounded-lg mb-4 ${
              isDanger
                ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                : "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400"
            }`}
            role="alert"
          >
            {subject.classesNeededToRecover > 0
              ? <>Attend <strong>{subject.classesNeededToRecover}</strong> more class{subject.classesNeededToRecover > 1 ? "es" : ""} consecutively to reach {subject.requiredPercentage}%</>
              : <>Maintain attendance to stay eligible.</>}
          </div>
        )}

        {effectiveTotal === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2 italic">
            No effective classes yet.
          </p>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((p) => !p)}
          aria-expanded={expanded}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors"
        >
          {expanded ? "Show Less" : "View Details"}
          <svg
            className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-2 text-sm">
            <Row label="Effective Classes" value={`${subject.presentClasses + subject.absentClasses} conducted`} />
            <Row label="Cancelled (excluded)" value={subject.cancelledClasses} />
            <Row label="Attended / Missed" value={`${subject.presentClasses} / ${subject.absentClasses}`} />
            {subject.classesNeededToRecover > 0 && (
              <Row label="Still need" value={`${subject.classesNeededToRecover} more to reach ${subject.requiredPercentage}%`} />
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function StatCell({
  label,
  value,
  color,
  tooltip,
}: {
  label: string;
  value: number;
  color: string;
  tooltip?: string;
}) {
  return (
    <div className="text-center bg-muted/30 rounded-lg p-2" title={tooltip}>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{label}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
