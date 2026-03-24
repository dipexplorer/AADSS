// lib/engines/simulation/runStreakSimulator.ts
import { SubjectSimInput, StreakSimulatorResult } from "./types";

export function runStreakSimulator(
  sub: SubjectSimInput,
  streakN: number,
): StreakSimulatorResult {
  const currentPct =
    sub.totalClasses > 0 ? (sub.present / sub.totalClasses) * 100 : 100;

  // Attend next N classes: present+N, total+N
  const newPresent = sub.present + streakN;
  const newTotal = sub.totalClasses + streakN;
  const projectedPct = newTotal > 0 ? (newPresent / newTotal) * 100 : 100;

  return {
    subjectId: sub.subjectId,
    currentPct: Math.round(currentPct * 10) / 10,
    projectedPct: Math.round(projectedPct * 10) / 10,
    streakNeeded: streakN,
    willReachTarget: projectedPct >= sub.minAttendanceRequired,
  };
}
