// app/semester-statistics/components/SemesterStatisticsClient.tsx
"use client";

import { useState, useMemo } from "react";
import type { ExtendedAnalyticsSummary } from "@/lib/engines/analytics/getAnalyticsSummary";
import StatisticsHeader from "./StatisticsHeader";
import IntelligencePanel from "./IntelligencePanel";
import SubjectCard from "./SubjectCard";

type FilterStatus = "all" | "safe" | "warning" | "danger";
type SortBy = "percentage" | "name" | "attended" | "missed";

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
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("percentage");

  const filteredSubjects = useMemo(() => {
    if (!analytics?.subjects) return [];
    let result = [...analytics.subjects];
    if (filterStatus !== "all") {
      result = result.filter((s) => s.riskLevel === filterStatus);
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case "percentage":
          return a.attendancePercentage - b.attendancePercentage;
        case "name":
          return a.subjectName.localeCompare(b.subjectName);
        case "attended":
          return b.presentClasses - a.presentClasses;
        case "missed":
          return b.absentClasses - a.absentClasses;
        default:
          return 0;
      }
    });
    return result;
  }, [analytics?.subjects, filterStatus, sortBy]);

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
            <svg
              className="w-8 h-8 text-primary/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No statistics yet
          </h3>
          <p className="text-muted-foreground text-sm">
            Mark attendance for a few classes to see statistics here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Overall header */}
        <StatisticsHeader
          overall={analytics.overall}
          programName={programName}
          semesterNumber={semesterNumber}
          sessionName={sessionName}
        />

        {/* Intelligence panel — projection + trajectory + recovery */}
        <IntelligencePanel
          projections={analytics.projections}
          dangerThresholds={analytics.dangerThresholds}
          subjects={analytics.subjects}
        />

        {/* Filter + Sort bar */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {(["all", "safe", "warning", "danger"] as FilterStatus[]).map(
                (f) => {
                  const count =
                    f === "all"
                      ? analytics.subjects.length
                      : f === "safe"
                        ? analytics.overall.safeSubjectsCount
                        : f === "warning"
                          ? analytics.overall.warningSubjectsCount
                          : analytics.overall.dangerSubjectsCount;

                  const activeColor =
                    f === "safe"
                      ? "bg-green-600 text-white"
                      : f === "warning"
                        ? "bg-yellow-500 text-white"
                        : f === "danger"
                          ? "bg-red-500 text-white"
                          : "bg-primary text-primary-foreground";

                  return (
                    <button
                      key={f}
                      onClick={() => setFilterStatus(f)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                        filterStatus === f
                          ? activeColor
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {f === "all"
                        ? `All (${count})`
                        : `${f.charAt(0).toUpperCase() + f.slice(1)} (${count})`}
                    </button>
                  );
                },
              )}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="percentage">Sort: Lowest First</option>
              <option value="name">Sort: Name</option>
              <option value="attended">Sort: Most Attended</option>
              <option value="missed">Sort: Most Missed</option>
            </select>
          </div>
        </div>

        {/* Subject cards */}
        {filteredSubjects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No subjects match this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
              <SubjectCard key={subject.subjectId} subject={subject} />
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <svg
              className="w-4 h-4 text-primary shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-green-600">
                  Safe (≥75%)
                </span>{" "}
                — Eligible for exams.
              </p>
              <p>
                <span className="font-semibold text-yellow-600">
                  Warning (65–74%)
                </span>{" "}
                — Attend upcoming classes.
              </p>
              <p>
                <span className="font-semibold text-red-600">
                  Danger (&lt;65%)
                </span>{" "}
                — Immediate action required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
