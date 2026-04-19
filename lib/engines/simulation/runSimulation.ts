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
  let subjectsAlreadyAtRisk = 0;
  let subjectsBecomeUnrecoverable = 0;

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

    const minAtt = sub.minAttendanceRequired;
    const bufferPct = Math.round((cleanSimulatedPct - minAtt) * 10) / 10;

    // Remaining classes after the action
    const simulatedRemainingClasses = Math.max(
      0,
      sub.remainingClasses - action.count,
    );

    const maxPossibleTotal = newTotal + simulatedRemainingClasses;
    const maxPossiblePresent = newPresent + simulatedRemainingClasses;
    const maxPossiblePct =
      maxPossibleTotal > 0
        ? (maxPossiblePresent / maxPossibleTotal) * 100
        : 100;
    const cleanMaxPossiblePct = Math.round(maxPossiblePct * 10) / 10;
    const isMathematicallyUnrecoverable = cleanMaxPossiblePct < minAtt;

    // Was it unrecoverable before?
    const currentMaxTotal = sub.totalClasses + sub.remainingClasses;
    const currentMaxPresent = sub.present + sub.remainingClasses;
    const currentMaxPct =
      currentMaxTotal > 0 ? (currentMaxPresent / currentMaxTotal) * 100 : 100;
    const wasUnrecoverable = Math.round(currentMaxPct * 10) / 10 < minAtt;

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

    const isRecoveryPossible =
      isFinite(classesNeededToRecover) &&
      classesNeededToRecover <= simulatedRemainingClasses;

    // Confidence Level
    let confidenceLevel: "Low" | "Medium" | "High" = "Low";
    if (sub.totalClasses >= 5 && sub.totalClasses < 15) confidenceLevel = "Medium";
    else if (sub.totalClasses >= 15) confidenceLevel = "High";

    if (alreadyBelowThreshold) {
      subjectsAlreadyAtRisk++;
    }

    if (action.mode === "skip") {
      if (wouldDropBelowThreshold) {
        subjectsAffected++;
      }
      if (!wasUnrecoverable && isMathematicallyUnrecoverable) {
        subjectsBecomeUnrecoverable++;
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
      isMathematicallyUnrecoverable,
      totalClasses: sub.totalClasses,
      remainingClasses: sub.remainingClasses,
      confidenceLevel,
      bufferPct,
    };
  });

  let overallDecision: SimulationSummary["overallDecision"] =
    action.mode === "attend" ? "Keep Attending" : "Safe";

  if (action.mode === "skip") {
    if (subjectsAlreadyAtRisk > 0 || subjectsBecomeUnrecoverable > 0) {
      overallDecision = "Do Not Skip";
    } else if (subjectsAffected > 0) {
      overallDecision = "Risky";
    }
  }

  const summary: SimulationSummary = {
    overallDecision,
    subjectsAffected,
    subjectsAlreadyAtRisk,
    subjectsBecomeUnrecoverable,
    action,
  };

  return { summary, subjects: results };
}
