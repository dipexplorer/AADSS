// lib/engines/simulation/types.ts

export interface SubjectSimInput {
  subjectId: string;
  name: string;
  present: number;
  absent: number;
  cancelled: number;
  totalClasses: number; // present + absent (not cancelled)
  remainingClasses: number; // estimated classes left in semester
  minAttendanceRequired: number; // e.g. 75
}

// Skip Planner
export interface SkipPlannerResult {
  subjectId: string;
  currentPct: number;
  afterSkipPct: number;
  isSafe: boolean; // still above threshold after skip
  wouldDropBelow: boolean; // crosses threshold
}

// Recovery Planner
export interface RecoveryPlannerResult {
  subjectId: string;
  currentPct: number;
  targetPct: number;
  classesNeeded: number; // consecutive present needed
  isPossible: boolean; // achievable in remaining classes
  classesShortBy: number; // 0 if possible
}

// Streak Simulator
export interface StreakSimulatorResult {
  subjectId: string;
  currentPct: number;
  projectedPct: number; // after N more present
  streakNeeded: number; // input N
  willReachTarget: boolean;
}

// Worst Case
export interface WorstCaseResult {
  subjectId: string;
  currentPct: number;
  maxSkipsAllowed: number; // can skip this many and stay above threshold
  alreadyBreach: boolean; // already below threshold
}

// Full simulation output per subject
export interface SubjectSimulationResult {
  subjectId: string;
  name: string;
  currentPct: number;
  skipPlanner: SkipPlannerResult;
  recoveryPlanner: RecoveryPlannerResult;
  streakSimulator: StreakSimulatorResult;
  worstCase: WorstCaseResult;
}

export interface SimulationOutput {
  subjects: SubjectSimulationResult[];
  streakN: number; // user's chosen N for streak sim
  recoveryTargetPct: number; // user's chosen target %
}
