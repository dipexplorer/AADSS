// lib/engines/simulation/runSimulation.ts
import {
  SubjectSimInput,
  SimulationOutput,
  SubjectSimulationResult,
  SimAction,
  SimulationSummary,
} from "./types";

export function runSimulation(
  subjects: SubjectSimInput[],
  action: SimAction,
): SimulationOutput {
  let subjectsAffected = 0;
  let hasRisky = false;
  let hasCritical = false;

  const results: SubjectSimulationResult[] = subjects.map((sub) => {
    const currentPct =
      sub.totalClasses > 0
        ? Math.round((sub.present / sub.totalClasses) * 1000) / 10
        : 100;

    let newPresent = sub.present;
    let newTotal = sub.totalClasses;

    if (action.mode === "skip") {
      newTotal += action.count;
    } else {
      newPresent += action.count;
      newTotal += action.count;
    }

    const simulatedPct = newTotal > 0 ? (newPresent / newTotal) * 100 : 100;
    const cleanSimulatedPct = Math.round(simulatedPct * 10) / 10;

    const maxPossibleTotal = sub.totalClasses + sub.remainingClasses;
    const maxPossiblePresent = sub.present + sub.remainingClasses;
    const maxPossiblePct =
      maxPossibleTotal > 0
        ? (maxPossiblePresent / maxPossibleTotal) * 100
        : 100;
    const cleanMaxPossiblePct = Math.round(maxPossiblePct * 10) / 10;

    const minAtt = sub.minAttendanceRequired;
    const alreadyBelowThreshold = currentPct < minAtt;
    const isSafeAfterAction = cleanSimulatedPct >= minAtt;
    const wouldDropBelowThreshold =
      !alreadyBelowThreshold && !isSafeAfterAction;

    let classesNeededToRecover = 0;
    const r = minAtt / 100;
    if (cleanSimulatedPct < minAtt) {
      if (r >= 1) classesNeededToRecover = Infinity;
      else
        classesNeededToRecover = Math.ceil(
          (r * newTotal - newPresent) / (1 - r),
        );
    }

    const simulatedRemainingClasses = Math.max(
      0,
      sub.remainingClasses - action.count,
    );
    const isRecoveryPossible =
      isFinite(classesNeededToRecover) &&
      classesNeededToRecover <= simulatedRemainingClasses;

    if (action.mode === "skip") {
      if (wouldDropBelowThreshold) {
        subjectsAffected++;
        hasRisky = true;
      }
      if (alreadyBelowThreshold) {
        hasCritical = true;
      }
    }

    return {
      subjectId: sub.subjectId,
      name: sub.name,
      currentPct,
      simulatedPct: cleanSimulatedPct,
      maxPossiblePct: cleanMaxPossiblePct,
      minAttendanceRequired: minAtt,
      isSafeAfterAction,
      wouldDropBelowThreshold,
      alreadyBelowThreshold,
      classesNeededToRecover,
      isRecoveryPossible,
      totalClasses: sub.totalClasses,
    };
  });

  let overallDecision: SimulationSummary["overallDecision"] = "Safe";
  if (action.mode === "skip") {
    if (hasCritical) overallDecision = "Not Recommended";
    else if (hasRisky) overallDecision = "Risky";
  }

  const summary: SimulationSummary = {
    overallDecision,
    subjectsAffected,
    action,
  };

  return { summary, subjects: results };
}
