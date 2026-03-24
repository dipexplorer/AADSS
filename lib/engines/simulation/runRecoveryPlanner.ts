// lib/engines/simulation/runRecoveryPlanner.ts
import { SubjectSimInput, RecoveryPlannerResult } from "./types";

export function runRecoveryPlanner(
  sub: SubjectSimInput,
  targetPct: number,
): RecoveryPlannerResult {
  const currentPct =
    sub.totalClasses > 0 ? (sub.present / sub.totalClasses) * 100 : 100;

  // Need: (present + x) / (total + x) >= target/100
  // Solve: x >= (target * total - 100 * present) / (100 - target)
  const r = targetPct / 100;
  let classesNeeded = 0;

  if (currentPct < targetPct) {
    if (r >= 1) {
      classesNeeded = Infinity;
    } else {
      classesNeeded = Math.ceil((r * sub.totalClasses - sub.present) / (1 - r));
    }
  }

  const isPossible = classesNeeded <= sub.remainingClasses;
  const classesShortBy = isPossible ? 0 : classesNeeded - sub.remainingClasses;

  return {
    subjectId: sub.subjectId,
    currentPct: Math.round(currentPct * 10) / 10,
    targetPct,
    classesNeeded: isFinite(classesNeeded) ? classesNeeded : 9999,
    isPossible,
    classesShortBy,
  };
}
