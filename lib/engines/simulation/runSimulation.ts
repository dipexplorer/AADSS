// lib/engines/simulation/runSimulation.ts
import {
  SubjectSimInput,
  SimulationOutput,
  SubjectSimulationResult,
} from "./types";
import { runSkipPlanner } from "./runSkipPlanner";
import { runRecoveryPlanner } from "./runRecoveryPlanner";
import { runStreakSimulator } from "./runStreakSimulator";
import { runWorstCase } from "./runWorstCase";

export function runSimulation(
  subjects: SubjectSimInput[],
  streakN: number,
  recoveryTargetPct: number,
): SimulationOutput {
  const results: SubjectSimulationResult[] = subjects.map((sub) => {
    const currentPct =
      sub.totalClasses > 0
        ? Math.round((sub.present / sub.totalClasses) * 1000) / 10
        : 100;

    return {
      subjectId: sub.subjectId,
      name: sub.name,
      currentPct,
      skipPlanner: runSkipPlanner(sub),
      recoveryPlanner: runRecoveryPlanner(sub, recoveryTargetPct),
      streakSimulator: runStreakSimulator(sub, streakN),
      worstCase: runWorstCase(sub),
    };
  });

  return { subjects: results, streakN, recoveryTargetPct };
}
