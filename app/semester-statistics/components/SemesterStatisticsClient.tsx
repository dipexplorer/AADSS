// app/semester-statistics/components/SemesterStatisticsClient.tsx
"use client";

import { useState, useMemo } from "react";
import { SemesterStats } from "@/lib/attendance/getSemesterStats";
import StatisticsHeader from "@/app/semester-statistics/components/StatisticsHeader";
import SubjectCard from "@/app/semester-statistics/components/SubjectCard";

type FilterStatus = "all" | "safe" | "warning" | "danger";
type SortBy = "percentage" | "name" | "attended" | "missed";

interface Props {
  stats: SemesterStats | null;
  error: string | null;
  programName: string;
  semesterNumber: string | number;
  sessionName: string;
}

export default function SemesterStatisticsClient({
  stats,
  error,
  programName,
  semesterNumber,
  sessionName,
}: Props) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("percentage");

  const filteredSubjects = useMemo(() => {
    if (!stats?.subjects) return [];

    let result = [...stats.subjects];

    if (filterStatus !== "all") {
      result = result.filter((s) => s.status === filterStatus);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "percentage":
          return a.attendancePercentage - b.attendancePercentage;
        case "name":
          return a.name.localeCompare(b.name);
        case "attended":
          return b.attendedClasses - a.attendedClasses;
        case "missed":
          return b.missedClasses - a.missedClasses;
        default:
          return 0;
      }
    });

    return result;
  }, [stats?.subjects, filterStatus, sortBy]);

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-[60px] pb-20 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Error Loading Statistics
          </h3>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats || stats.subjects.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-[60px] pb-20 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Statistics Yet
          </h3>
          <p className="text-muted-foreground text-sm">
            Mark some attendance first to see your statistics here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <StatisticsHeader
          overall={stats.overall}
          programName={programName}
          semesterNumber={semesterNumber}
          sessionName={sessionName}
        />

        {/* Filters + Sort */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {(["all", "safe", "warning", "danger"] as FilterStatus[]).map(
                (f) => {
                  const label =
                    f === "all"
                      ? `All (${stats.subjects.length})`
                      : f === "safe"
                        ? `Safe (${stats.overall.safeCount})`
                        : f === "warning"
                          ? `Warning (${stats.overall.warningCount})`
                          : `Danger (${stats.overall.dangerCount})`;

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
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filterStatus === f
                          ? activeColor
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {label}
                    </button>
                  );
                },
              )}
            </div>

            {/* Sort */}
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

        {/* Subject Cards */}
        {filteredSubjects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No subjects match this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-primary shrink-0 mt-0.5"
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
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-green-600">
                  Safe Zone (≥75%)
                </span>{" "}
                — Eligible for exams.
              </p>
              <p>
                <span className="font-semibold text-yellow-600">
                  Warning (70–74%)
                </span>{" "}
                — Attend upcoming classes to stay safe.
              </p>
              <p>
                <span className="font-semibold text-red-600">
                  Danger Zone (&lt;70%)
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
