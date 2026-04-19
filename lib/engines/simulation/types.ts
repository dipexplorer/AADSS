// lib/engines/simulation/types.ts

export interface SubjectSimInput {
  subjectId: string;
  name: string;
  present: number;
  absent: number;
  cancelled: number;
  totalClasses: number; // present + absent
  remainingClasses: number; // estimated classes left in semester
  minAttendanceRequired: number; // e.g. 75
}

export interface SimAction {
  mode: "skip" | "attend";
  count: number;
}

export interface SubjectSimulationResult {
  subjectId: string;
  name: string;
  currentPct: number;
  simulatedPct: number;
  maxPossiblePct: number;
  minAttendanceRequired: number;
  
  isSafeAfterAction: boolean;
  wouldDropBelowThreshold: boolean;
  alreadyBelowThreshold: boolean;
  
  // Recovery
  classesNeededToRecover: number;
  isRecoveryPossible: boolean;
  
  // Confidence
  totalClasses: number;
}

export interface SimulationSummary {
  overallDecision: "Safe" | "Risky" | "Not Recommended";
  subjectsAffected: number; // How many drop below threshold because of this action
  action: SimAction;
}

export interface SimulationOutput {
  summary: SimulationSummary;
  subjects: SubjectSimulationResult[];
}
