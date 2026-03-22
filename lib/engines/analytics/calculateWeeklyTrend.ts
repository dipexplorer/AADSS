// lib/engines/analytics/calculateWeeklyTrend.ts

import type { WeeklyTrendPoint } from "./types";
import { parseLocalDate } from "@/lib/utils/dateUtils";

interface AttendanceRecord {
  scheduledDate: string; // YYYY-MM-DD
  status: "present" | "absent" | "cancelled";
}

/**
 * Last 4 weeks ka attendance % calculate karta hai
 * per-week breakdown ke saath.
 *
 * Week = Monday se Sunday
 * Cancelled classes total mein count nahi hote
 */
export function calculateWeeklyTrend(
  records: AttendanceRecord[],
  referenceDate: Date = new Date(),
): WeeklyTrendPoint[] {
  const weeks: WeeklyTrendPoint[] = [];

  for (let weekOffset = 3; weekOffset >= 0; weekOffset--) {
    const weekStart = getMonday(referenceDate, weekOffset);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekRecords = records.filter((r) => {
      const d = parseLocalDate(r.scheduledDate);
      return d >= weekStart && d <= weekEnd && r.status !== "cancelled";
    });

    const total = weekRecords.length;
    const present = weekRecords.filter((r) => r.status === "present").length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    const weekNumber = 4 - weekOffset;
    weeks.push({
      weekLabel: `Week ${weekNumber}`,
      weekStart: weekStart.toISOString().split("T")[0],
      attendancePercentage: percentage,
    });
  }

  return weeks;
}

/**
 * N weeks ago ka Monday return karta hai
 * weekOffset=0 → current week ka Monday
 * weekOffset=1 → last week ka Monday
 */
function getMonday(date: Date, weeksAgo: number): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? 6 : day - 1; // Monday tak ka diff
  d.setDate(d.getDate() - diff - weeksAgo * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}
