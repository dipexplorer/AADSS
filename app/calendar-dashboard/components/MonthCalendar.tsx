// app/calendar-dashboard/components/MonthCalendar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAttendanceByDates } from "@/lib/attendance/getAttendanceByDates";
import { formatLocalDate } from "@/lib/utils/dateUtils";
import { createClient } from "@/lib/supabase/client";

interface DayData {
  date: number;
  fullDate: string;
  isCurrentMonth: boolean;
  isSemesterDay: boolean;
  isToday: boolean;
  isWeekend: boolean;
  attended: number;
  missed: number;
  cancelled: number;
  isCurrentWeek: boolean;
  isHoliday: boolean;
  holidayTitle?: string;
}

interface MonthCalendarProps {
  year: number;
  month: number;
  semesterStart: string;
  semesterEnd: string;
  studentProfileId: string;
  semesterId: string;
  className?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MonthCalendar({
  year,
  month,
  semesterStart,
  semesterEnd,
  studentProfileId,
  semesterId,
  className = "",
}: MonthCalendarProps) {
  const router = useRouter();
  const [calendarDays, setCalendarDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    async function build() {
      setLoading(true);

      const firstDay = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const startingDow = firstDay.getDay();
      const semStart = new Date(semesterStart);
      const semEnd = new Date(semesterEnd);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Current week range
      const dayOfWeek = today.getDay();
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - dayOfWeek);
      const currentWeekEnd = new Date(today);
      currentWeekEnd.setDate(today.getDate() + (6 - dayOfWeek));

      // Collect all dates in month
      const monthDates: string[] = [];
      for (let d = 1; d <= daysInMonth; d++) {
        monthDates.push(formatLocalDate(new Date(year, month, d)));
      }

      // Fetch attendance
      let attendanceMap: Record<
        string,
        { attended: number; missed: number; cancelled: number }
      > = {};
      try {
        attendanceMap = await getAttendanceByDates(
          studentProfileId,
          semesterId,
          monthDates,
        );
      } catch {
        attendanceMap = {};
      }

      // Fetch holidays
      let holidayMap: Record<string, string> = {};
      try {
        const supabase = createClient();
        const { data: hData } = await supabase
          .from("academic_holidays" as any)
          .select("date, title")
          .eq("session_id", semesterId)   // Filtering by session if necessary
          .gte("date", monthDates[0])
          .lte("date", monthDates[monthDates.length - 1]);
        
        (hData as any[])?.forEach(h => {
          holidayMap[h.date] = h.title;
        });
      } catch (e) {
        console.error(e);
      }

      const days: DayData[] = [];

      // Previous month padding
      for (let i = 0; i < startingDow; i++) {
        const prevLastDay = new Date(year, month, 0).getDate();
        const d = prevLastDay - startingDow + i + 1;
        days.push({
          date: d,
          fullDate: formatLocalDate(new Date(year, month - 1, d)),
          isCurrentMonth: false,
          isSemesterDay: false,
          isToday: false,
          isWeekend: false,
          attended: 0,
          missed: 0,
          cancelled: 0,
          isCurrentWeek: false,
          isHoliday: false,
        });
      }

      // Current month
      for (let d = 1; d <= daysInMonth; d++) {
        const cur = new Date(year, month, d);
        const fullDate = formatLocalDate(cur);
        cur.setHours(0, 0, 0, 0);

        const att = attendanceMap[fullDate];

        days.push({
          date: d,
          fullDate,
          isCurrentMonth: true,
          isSemesterDay: cur >= semStart && cur <= semEnd,
          isToday: cur.getTime() === today.getTime(),
          isWeekend: cur.getDay() === 0 || cur.getDay() === 6,
          attended: att?.attended ?? 0,
          missed: att?.missed ?? 0,
          cancelled: att?.cancelled ?? 0,
          isCurrentWeek: cur >= currentWeekStart && cur <= currentWeekEnd,
          isHoliday: !!holidayMap[fullDate],
          holidayTitle: holidayMap[fullDate],
        });
      }

      // Next month padding
      const remaining = 42 - days.length;
      for (let d = 1; d <= remaining; d++) {
        days.push({
          date: d,
          fullDate: formatLocalDate(new Date(year, month + 1, d)),
          isCurrentMonth: false,
          isSemesterDay: false,
          isToday: false,
          isWeekend: false,
          attended: 0,
          missed: 0,
          cancelled: 0,
          isCurrentWeek: false,
          isHoliday: false,
        });
      }

      setCalendarDays(days);
      setLoading(false);
    }

    build();
  }, [
    year,
    month,
    semesterStart,
    semesterEnd,
    studentProfileId,
    semesterId,
    refetchTrigger,
  ]);

  // Real-time synchronization
  useEffect(() => {
    if (!studentProfileId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`calendar_${year}_${month}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendance",
          filter: `student_id=eq.${studentProfileId}`,
        },
        () => {
          setRefetchTrigger((prev) => prev + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentProfileId, year, month]);

  const getIndicator = (day: DayData) => {
    const total = day.attended + day.missed;
    if (total === 0)
      return <div className="w-1.5 h-1.5 rounded-full bg-muted/30" />;

    const pct = (day.attended / total) * 100;
    const color =
      pct >= 75 ? "bg-green-500" : pct >= 70 ? "bg-yellow-500" : "bg-red-500";
    return <div className={`w-2 h-2 rounded-full ${color}`} />;
  };

  const isCurrentSessionMonth =
    year === new Date().getFullYear() && month === new Date().getMonth();

  useEffect(() => {
    if (
      !loading &&
      isCurrentSessionMonth &&
      containerRef.current &&
      !hasScrolledRef.current
    ) {
      hasScrolledRef.current = true;
      // Small timeout to allow the browser to paint the new DOM height
      setTimeout(() => {
        containerRef.current?.scrollIntoView({
          behavior: "instant",
          block: "start",
        });
      }, 50);
    }
  }, [loading, isCurrentSessionMonth]);

  if (loading) {
    return (
      <div
        ref={containerRef}
        className={`bg-card rounded-2xl p-6 border border-border/50 ${className}`}
      >
        <div className="h-5 bg-muted/30 rounded w-24 mb-4 animate-pulse" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 42 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-muted/20 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`bg-card border border-border/50 rounded-2xl shadow-sm p-8 ${className}`}
    >
      <h3 className="text-xl font-extrabold text-foreground tracking-tight mb-6">
        {MONTH_NAMES[month]}
      </h3>

      {/* Week headers */}
      <div className="grid grid-cols-7 gap-4 mb-3">
        {WEEK_DAYS.map((d) => (
          <div
            key={d}
            className={`text-center text-[0.65rem] uppercase tracking-wider font-extrabold py-2 ${
              d === "Sun" || d === "Sat"
                ? "text-red-400/80"
                : "text-muted-foreground"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-4">
        {calendarDays.map((day, index) => {
          let cls =
            "relative aspect-[4/3] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 border border-transparent";

          const isSundayOrSaturday = day.isWeekend;

          // Background base
          if (isSundayOrSaturday) {
            cls += " bg-red-50/60 dark:bg-red-950/20";
          } else {
            cls +=
              " bg-slate-50/60 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800";
          }

          if (day.isCurrentMonth) {
            cls += " hover:shadow-sm cursor-pointer hover:-translate-y-0.5";
          } else {
            cls += " opacity-40 cursor-default";
          }

          // Foreground base
          let textColor = "text-muted-foreground";
          if (day.isCurrentMonth) {
             if (day.isToday) textColor = "text-blue-500";
             else if (day.isHoliday) textColor = "text-amber-600 dark:text-amber-500";
             else if (isSundayOrSaturday) textColor = "text-red-500/80 dark:text-red-400/80";
             else textColor = "text-foreground";
          }

          // Figma layout for "Today" specifically requests a blue border, white bg, blue text
          if (day.isToday && day.isCurrentMonth) {
            cls =
              "relative aspect-[4/3] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer hover:shadow-sm hover:-translate-y-0.5 bg-background border border-blue-500 shadow-sm";
          } else if (day.isHoliday && day.isCurrentMonth) {
             cls = "relative aspect-[4/3] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer hover:shadow-sm hover:-translate-y-0.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 shadow-sm";
          }

          return (
            <button
              key={index}
              onClick={() => {
                if (!day.isCurrentMonth) return;
                router.push(`/daily-attendance?date=${day.fullDate}&holiday=${day.isHoliday}`);
              }}
              disabled={!day.isCurrentMonth}
              className={cls}
              title={day.holidayTitle}
              aria-label={`${MONTH_NAMES[month]} ${day.date}, ${year}`}
            >
              <span
                className={`text-sm font-bold ${textColor}`}
              >
                {day.date}
              </span>

              {day.isCurrentMonth && !day.isWeekend && day.isSemesterDay && !day.isHoliday && (
                <div className="absolute bottom-2 flex items-center justify-center w-full">
                  {getIndicator(day)}
                </div>
              )}
              {day.isHoliday && day.isCurrentMonth && (
                 <div className="absolute bottom-1 w-full text-center">
                    <div className="w-[4px] h-[4px] rounded-full bg-amber-500 mx-auto" />
                 </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
