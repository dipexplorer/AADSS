// app/calendar-dashboard/components/CalendarDashboardInteractive.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getSubjectsWithStats,
  SubjectWithStats,
} from "@/lib/attendance/getSubjectsWithStats";
import { getOverallAttendanceStats } from "@/lib/attendance/getOverallStats";
import YearNavigator from "@/app/calendar-dashboard/components/YearNavigator";
import MonthCalendar from "@/app/calendar-dashboard/components/MonthCalendar";
import SemesterInfoPanel from "@/app/calendar-dashboard/components/SemesterInfoPanel";
import YearProgressCard from "@/app/calendar-dashboard/components/YearProgressCard";

interface Profile {
  id: string;
  semester_id: string;
  academic_sessions: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
  } | null;
  programs: { id: string; name: string } | null;
  semesters: { id: string; semester_number: number } | null;
}

interface CalendarDashboardInteractiveProps {
  profile: Profile;
}

export default function CalendarDashboardInteractive({
  profile,
}: CalendarDashboardInteractiveProps) {
  const [currentYear, setCurrentYear] = useState(
    profile.academic_sessions
      ? new Date(profile.academic_sessions.start_date).getFullYear()
      : new Date().getFullYear(),
  );

  const [subjects, setSubjects] = useState<SubjectWithStats[]>([]);
  const [overallStats, setOverallStats] = useState({
    percentage: 0,
    attended: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  const semesterStart = profile.academic_sessions?.start_date ?? "";
  const semesterEnd = profile.academic_sessions?.end_date ?? "";

  useEffect(() => {
    async function fetchStats() {
      if (!profile.semester_id || !profile.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [subjectsResult, statsResult] = await Promise.all([
          getSubjectsWithStats(profile.semester_id, profile.id),
          getOverallAttendanceStats(profile.semester_id, profile.id),
        ]);

        setSubjects(subjectsResult.data ?? []);
        setOverallStats({
          percentage: statsResult.percentage,
          attended: statsResult.attended,
          total: statsResult.total,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [profile.semester_id, profile.id]);

  const months = Array.from({ length: 12 }, (_, i) => i);

  if (!semesterStart || !semesterEnd) {
    return (
      <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-6 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="inline-flex p-6 rounded-full bg-primary/5 text-primary mb-6">
            <svg
              className="w-16 h-16"
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
          <h2 className="text-2xl font-bold text-foreground mb-3">
            No Academic Session Found
          </h2>
          <p className="text-muted-foreground mb-6">
            Your academic session dates are not configured. Please contact
            admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-6">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Year Progress */}
        <div className="mb-6">
          <YearProgressCard
            semesterStart={semesterStart}
            semesterEnd={semesterEnd}
          />
        </div>

        {/* Year Navigator */}
        <div className="mb-8">
          <YearNavigator
            initialYear={currentYear}
            onYearChange={setCurrentYear}
          />
        </div>

        {/* Calendar Grid + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {months.map((month) => (
              <MonthCalendar
                key={month}
                year={currentYear}
                month={month}
                semesterStart={semesterStart}
                semesterEnd={semesterEnd}
                studentProfileId={profile.id}
                semesterId={profile.semester_id}
              />
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-[76px]">
              <SemesterInfoPanel
                semesterStart={semesterStart}
                semesterEnd={semesterEnd}
                overallPercentage={overallStats.percentage}
                subjects={subjects}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
