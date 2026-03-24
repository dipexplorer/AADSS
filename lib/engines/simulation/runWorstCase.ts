// lib/engines/simulation/runWorstCase.ts
import { SubjectSimInput, WorstCaseResult } from "./types";

export function runWorstCase(sub: SubjectSimInput): WorstCaseResult {
  const currentPct =
    sub.totalClasses > 0 ? (sub.present / sub.totalClasses) * 100 : 100;

  const r = sub.minAttendanceRequired / 100;
  const alreadyBreach = currentPct < sub.minAttendanceRequired;

  // Max skips x such that present / (total + x) >= r
  // x <= present/r - total
  let maxSkipsAllowed = 0;
  if (!alreadyBreach) {
    maxSkipsAllowed = Math.floor(sub.present / r - sub.totalClasses);
    maxSkipsAllowed = Math.max(0, maxSkipsAllowed);
    // Cap at remaining classes
    maxSkipsAllowed = Math.min(maxSkipsAllowed, sub.remainingClasses);
  }

  return {
    subjectId: sub.subjectId,
    currentPct: Math.round(currentPct * 10) / 10,
    maxSkipsAllowed,
    alreadyBreach,
  };
}
