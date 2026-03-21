// app/calendar-dashboard/components/MonthCalendar.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAttendanceByDates } from "@/lib/attendance/getAttendanceByDates";
import { formatLocalDate } from "@/lib/utils/dateUtils";

interface DayData {
  date: number;
  fullDate: string;
  isCurrentMonth: boolean;
  isSemesterDay: boolean;
  isToday: boolean;
  isWeekend: boolean;
  attended: number;
  missed: number;
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
        });
      }

      setCalendarDays(days);
      setLoading(false);
    }

    build();
  }, [year, month, semesterStart, semesterEnd, studentProfileId, semesterId]);

  const getIndicator = (day: DayData) => {
    const total = day.attended + day.missed;
    if (total === 0)
      return <div className="w-1.5 h-1.5 rounded-full bg-muted/30" />;

    const pct = (day.attended / total) * 100;
    const color =
      pct >= 75 ? "bg-green-500" : pct >= 70 ? "bg-yellow-500" : "bg-red-500";
    return <div className={`w-2 h-2 rounded-full ${color}`} />;
  };

  if (loading) {
    return (
      <div
        className={`bg-card rounded-xl p-6 border border-border/50 ${className}`}
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
      className={`bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 ${className}`}
    >
      <h3 className="text-lg font-bold text-foreground tracking-tight mb-4">
        {MONTH_NAMES[month]}
      </h3>

      {/* Week headers */}
      <div className="grid grid-cols-7 gap-3 mb-2">
        {WEEK_DAYS.map((d) => (
          <div
            key={d}
            className={`text-center text-[0.65rem] uppercase tracking-wider font-bold py-2 ${
              d === "Sun" || d === "Sat"
                ? "text-red-400/70"
                : "text-muted-foreground"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-3">
        {calendarDays.map((day, index) => {
          let cls =
            "relative aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200";

          if (!day.isCurrentMonth) {
            cls += " opacity-20 cursor-not-allowed bg-muted/10";
          } else {
            cls += " cursor-pointer";
            if (day.isWeekend) {
              cls +=
                " bg-red-50/50 dark:bg-red-950/20 border border-transparent";
            } else if (day.isSemesterDay) {
              cls +=
                " bg-primary/5 hover:bg-primary/10 border border-primary/10";
            } else {
              cls += " bg-muted/20 hover:bg-muted/40 border border-transparent";
            }
            if (day.isToday) {
              cls +=
                " ring-2 ring-primary ring-offset-1 ring-offset-background z-10";
            }
          }

          return (
            <button
              key={index}
              onClick={() => {
                if (!day.isCurrentMonth) return;
                router.push(`/daily-attendance?date=${day.fullDate}`);
              }}
              disabled={!day.isCurrentMonth}
              className={cls}
              aria-label={`${MONTH_NAMES[month]} ${day.date}, ${year}`}
            >
              <span
                className={`text-sm font-semibold ${
                  day.isToday
                    ? "text-primary"
                    : day.isWeekend && day.isCurrentMonth
                      ? "text-red-500/70 dark:text-red-300/70"
                      : "text-foreground/80"
                }`}
              >
                {day.date}
              </span>

              {day.isCurrentMonth && !day.isWeekend && day.isSemesterDay && (
                <div className="h-1.5 flex items-end">{getIndicator(day)}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
