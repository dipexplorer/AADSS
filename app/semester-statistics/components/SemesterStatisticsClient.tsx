// app/semester-statistics/components/SemesterStatisticsClient.tsx
"use client";

import { useMemo } from "react";
import type { ExtendedAnalyticsSummary } from "@/lib/engines/analytics/getAnalyticsSummary";
import StatisticsHeader from "./StatisticsHeader";
import SubjectCard from "./SubjectCard";

interface Props {
  analytics: ExtendedAnalyticsSummary | null;
  error: string | null;
  programName: string;
  semesterNumber: string | number;
  sessionName: string;
}

export default function SemesterStatisticsClient({
  analytics,
  error,
  programName,
  semesterNumber,
  sessionName,
}: Props) {
  // Auto-sort: Danger → Warning → Safe (no user filter/sort needed)
  const sortedSubjects = useMemo(() => {
    if (!analytics?.subjects) return [];
    const order = { danger: 0, warning: 1, safe: 2 };
    return [...analytics.subjects].sort(
      (a, b) => order[a.riskLevel] - order[b.riskLevel]
    );
  }, [analytics?.subjects]);

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-[60px] pb-20 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <p className="text-red-500 font-medium">Error loading statistics</p>
          <p className="text-muted-foreground text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.subjects.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-[60px] pb-20 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No statistics yet</h3>
          <p className="text-muted-foreground text-sm">
            Mark attendance for a few classes to see statistics here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* 1. Overview header with eligibility + confidence */}
        <StatisticsHeader
          overall={analytics.overall}
          programName={programName}
          semesterNumber={semesterNumber}
          sessionName={sessionName}
        />

        {/* Subject cards — auto-sorted by risk (Danger → Warning → Safe) */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Subject Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedSubjects.map((subject) => (
              <SubjectCard key={subject.subjectId} subject={subject} />
            ))}
          </div>
        </div>

        {/* 4. Legend / key */}
        <div className="bg-card/40 border border-border/40 rounded-xl px-5 py-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span><span className="font-semibold text-green-600">🟢 Eligible</span> — ≥75% attendance</span>
            <span><span className="font-semibold text-yellow-600">🟡 At Risk</span> — 65–74%</span>
            <span><span className="font-semibold text-red-600">🔴 Critical</span> — &lt;65%</span>
            <span className="text-muted-foreground/70">Cancelled classes are excluded from all calculations.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
