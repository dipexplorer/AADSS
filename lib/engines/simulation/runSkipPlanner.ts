// lib/engines/simulation/runSkipPlanner.ts
import { SubjectSimInput, SkipPlannerResult } from "./types";

export function runSkipPlanner(sub: SubjectSimInput): SkipPlannerResult {
  const currentPct =
    sub.totalClasses > 0 ? (sub.present / sub.totalClasses) * 100 : 100;

  // After 1 skip: present stays same, total+1
  const newTotal = sub.totalClasses + 1;
  const afterSkipPct = (sub.present / newTotal) * 100;

  return {
    subjectId: sub.subjectId,
    currentPct: Math.round(currentPct * 10) / 10,
    afterSkipPct: Math.round(afterSkipPct * 10) / 10,
    isSafe: afterSkipPct >= sub.minAttendanceRequired,
    wouldDropBelow:
      currentPct >= sub.minAttendanceRequired &&
      afterSkipPct < sub.minAttendanceRequired,
  };
}
