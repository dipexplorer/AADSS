// app/simulate/components/SimulateClient.tsx
"use client";

import { useState, useMemo } from "react";
import { runSimulation } from "@/lib/engines/simulation/runSimulation";
import { SubjectSimInput, SubjectSimulationResult } from "@/lib/engines/simulation/types";

interface Props {
  subjects: SubjectSimInput[];
}

export default function SimulateClient({ subjects }: Props) {
  const [actionMode, setActionMode] = useState<"skip" | "attend">("skip");
  const [count, setCount] = useState(1);

  const simulation = useMemo(
    () => runSimulation(subjects, { mode: actionMode, count }),
    [subjects, actionMode, count],
  );

  if (subjects.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">
          No subjects found. Complete onboarding first.
        </p>
      </div>
    );
  }

  const { overallDecision, subjectsAffected, action } = simulation.summary;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Simulation Engine</h1>
        <p className="text-muted-foreground mt-1">
          Make data-driven decisions about your attendance
        </p>
      </div>

      {/* Action Selector */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex bg-muted/50 p-1.5 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActionMode("skip")}
              className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                actionMode === "skip"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Skip
            </button>
            <button
              onClick={() => setActionMode("attend")}
              className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                actionMode === "attend"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Attend
            </button>
          </div>
          <div className="flex items-center gap-4 w-full sm:flex-1 bg-muted/30 px-4 py-2 rounded-xl">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              classes:
            </span>
            <input
              type="range"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="flex-1 accent-primary h-2 bg-muted rounded-full appearance-none cursor-pointer"
            />
            <span className="font-bold text-xl text-primary w-6 text-center tabular-nums">
              {count}
            </span>
          </div>
        </div>
      </div>

      {/* Top Level Decision Summary */}
      <div
        className={`mb-8 p-5 rounded-2xl border ${
          actionMode === "skip"
            ? overallDecision === "Safe"
              ? "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900/50"
              : overallDecision === "Risky"
                ? "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50"
                : "bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50"
            : "bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="mt-1">
            {actionMode === "skip" ? (
              overallDecision === "Safe" ? (
                <div className="bg-green-500/20 p-2 rounded-full hidden sm:block">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : overallDecision === "Risky" ? (
                <div className="bg-amber-500/20 p-2 rounded-full hidden sm:block">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              ) : (
                <div className="bg-red-500/20 p-2 rounded-full hidden sm:block">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )
            ) : (
              <div className="bg-blue-500/20 p-2 rounded-full hidden sm:block">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <h2
              className={`text-xl font-bold ${
                actionMode === "skip"
                  ? overallDecision === "Safe"
                    ? "text-green-700 dark:text-green-500"
                    : overallDecision === "Risky"
                      ? "text-amber-700 dark:text-amber-500"
                      : "text-red-700 dark:text-red-500"
                  : "text-blue-700 dark:text-blue-500"
              }`}
            >
              {actionMode === "attend"
                ? "Excellent Effort"
                : overallDecision === "Safe"
                  ? "Safe to Skip"
                  : overallDecision === "Risky"
                    ? "Risky Decision"
                    : "Not Recommended"}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {actionMode === "attend"
                ? `Attending ${count} class${count > 1 ? "es" : ""} will significantly boost your attendance and provide a safety buffer for future.`
                : overallDecision === "Safe"
                  ? `Skipping ${count} class${count > 1 ? "es" : ""} won't drop any subject below the required threshold.`
                  : overallDecision === "Risky"
                    ? `Warning: Skipping will cause ${subjectsAffected} subject${subjectsAffected > 1 ? "s" : ""} to drop below the threshold.`
                    : "You are already below the threshold in one or more subjects. Skipping is highly discouraged."}
            </p>
          </div>
        </div>
      </div>

      {/* Subject Results */}
      <h3 className="font-semibold text-lg text-foreground mb-4 pl-1">Impact Analysis</h3>
      <div className="space-y-4">
        {simulation.subjects.map((sub) => (
          <SubjectSimCard key={sub.subjectId} sub={sub} action={action.mode} count={action.count} />
        ))}
      </div>
    </div>
  );
}

// ── Per-subject card ─────────────────────────────────────────────────────────

function SubjectSimCard({ sub, action, count }: { sub: SubjectSimulationResult; action: "skip" | "attend"; count: number }) {
  const isDanger = action === "skip" && (sub.wouldDropBelowThreshold || sub.alreadyBelowThreshold);
  const diffPct = sub.simulatedPct - sub.currentPct;

  return (
    <div className={`bg-card border rounded-2xl p-5 overflow-hidden relative shadow-sm hover:shadow-md transition-shadow ${isDanger ? 'border-red-200 dark:border-red-900/50' : 'border-border'}`}>
      {/* Danger Line Indicator */}
      {isDanger && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
      )}

      {/* Header Row: Subject Name & Status Badge */}
      <div className="flex items-center justify-between mb-5 pl-1">
        <div>
          <h4 className="font-bold text-foreground text-lg">{sub.name}</h4>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Min. Req: {sub.minAttendanceRequired}%
            </span>
            <span className="text-border mx-0.5">•</span>
            <span>Total classes so far: {sub.totalClasses}</span>
          </p>
        </div>
        <div>
          {action === "skip" ? (
             sub.alreadyBelowThreshold ? (
               <span className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-full text-xs font-bold">
                 <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                 Already at Risk
               </span>
             ) : sub.wouldDropBelowThreshold ? (
               <span className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full text-xs font-bold">
                 <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                 Drops below threshold
               </span>
             ) : (
               <span className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-bold">
                 <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                 Safe to Skip
               </span>
             )
          ) : (
             <span className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-full text-xs font-bold">
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
               Building Buffer
             </span>
          )}
        </div>
      </div>

      {/* Main Metric Row */}
      <div className="flex items-center gap-3 sm:gap-6 ml-1 mb-5">
        <div className="flex-1 bg-muted/40 rounded-xl p-4 transition-colors">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Current</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">{sub.currentPct}%</p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className={`text-xs font-bold mb-1 ${diffPct >= 0 ? "text-green-600" : "text-red-500"}`}>
            {diffPct >= 0 ? "+" : ""}{(Math.round(diffPct * 10) / 10).toFixed(1)}%
          </div>
          <svg className="w-6 h-6 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>

        <div className={`flex-1 rounded-xl p-4 transition-colors ${
          action === "skip" && sub.simulatedPct < sub.minAttendanceRequired
            ? "bg-red-50 dark:bg-red-950/20 shadow-sm shadow-red-500/10"
            : action === "attend" && sub.simulatedPct >= sub.minAttendanceRequired 
              ? "bg-blue-50 dark:bg-blue-950/20 shadow-sm shadow-blue-500/10"
              : "bg-green-50 dark:bg-green-950/20 shadow-sm shadow-green-500/10"
        }`}>
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold opacity-80">
            {action === "skip" ? "If you skip" : "If you attend"}
          </p>
          <p className={`text-2xl font-bold tabular-nums ${
            sub.simulatedPct < sub.minAttendanceRequired ? "text-red-600 dark:text-red-500" : "text-green-600 dark:text-green-500"
          }`}>
            {sub.simulatedPct}%
          </p>
        </div>
      </div>

      {/* Actionable Insights Footer */}
      <div className="bg-muted/30 border border-muted rounded-xl p-4 ml-1 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        {/* Recovery Section */}
        {sub.simulatedPct < sub.minAttendanceRequired ? (
          <div className="flex items-start gap-3">
             <div className="bg-red-100 dark:bg-red-950 p-1.5 rounded-md mt-0.5 shrink-0">
               <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
               </svg>
             </div>
             <div>
               <p className="text-sm font-semibold text-foreground">Recovery Action Required</p>
               {sub.isRecoveryPossible ? (
                 <p className="text-sm text-muted-foreground mt-0.5">
                   You must attend the <strong className="text-foreground">next {sub.classesNeededToRecover} classes</strong> to recover to {sub.minAttendanceRequired}%.
                 </p>
               ) : (
                 <p className="text-sm text-red-500 mt-0.5 font-medium">
                   Cannot recover. Not enough classes left in the semester.
                 </p>
               )}
             </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
             <div className="bg-primary/10 p-1.5 rounded-md mt-0.5 shrink-0">
               <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
               </svg>
             </div>
             <div>
               <p className="text-sm font-semibold text-foreground">Current standing is solid</p>
               <p className="text-sm text-muted-foreground mt-0.5">
                 Attendance remains above eligibility requirement.
               </p>
             </div>
          </div>
        )}

        {/* Max Possible Constraint */}
        <div className="sm:text-right shrink-0 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-muted">
          <p className="text-xs text-muted-foreground tracking-wide uppercase mb-1">Max Possible</p>
          <p className="text-sm font-bold text-foreground">
            {sub.maxPossiblePct}% <span className="font-normal text-muted-foreground whitespace-nowrap ml-1">(if no more skips)</span>
          </p>
        </div>
      </div>
    </div>
  );
}
