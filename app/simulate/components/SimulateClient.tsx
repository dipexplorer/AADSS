// app/simulate/components/SimulateClient.tsx
"use client";

import { useState, useMemo } from "react";
import { runSimulation } from "@/lib/engines/simulation/runSimulation";
import { SubjectSimInput, SubjectSimulationResult, SimAction } from "@/lib/engines/simulation/types";

interface Props {
  subjects: SubjectSimInput[];
}

export default function SimulateClient({ subjects }: Props) {
  const [action, setAction] = useState<SimAction>({ mode: "skip", count: 1 });

  const simulation = useMemo(
    () => runSimulation(subjects, action),
    [subjects, action],
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

  const {
    overallDecision,
    subjectsAffected,
    subjectsBecomeUnrecoverable,
    action: simAction
  } = simulation.summary;

  // Extract which subjects are explicitly affected for a smarter summary
  const affectedSubjectsNames = simulation.subjects
    .filter(s => s.wouldDropBelowThreshold)
    .map(s => s.name);
    
  const fatalSubjectsNames = simulation.subjects
    .filter(s => s.isMathematicallyUnrecoverable && !s.alreadyBelowThreshold)
    .map(s => s.name);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground tracking-tight">Simulation Engine</h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Make data-driven decisions about your attendance.
        </p>
      </div>

      {/* Premium Action Configuration Panel */}
      <div className="bg-card border border-border/80 rounded-[2rem] p-6 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 w-full">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-muted-foreground ml-1">What is your intent?</h3>
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted/40 rounded-2xl border border-muted">
            <button
              onClick={() => setAction({ mode: "skip", count: action.mode === 'skip' ? action.count : 1 })}
              className={`py-3 text-sm font-bold rounded-xl transition-all ${
                action.mode === "skip"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              Want to Skip
            </button>
            <button
              onClick={() => setAction({ mode: "attend", count: action.mode === 'attend' ? action.count : 1 })}
              className={`py-3 text-sm font-bold rounded-xl transition-all ${
                action.mode === "attend"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              Plan to Attend
            </button>
          </div>
        </div>

        <div className="w-full md:w-auto mt-2 md:mt-0 flex flex-col items-center md:border-l border-border md:pl-10">
          <p className="text-sm font-bold uppercase tracking-wider mb-3 text-muted-foreground">How many classes?</p>
          <div className="flex items-center gap-4 bg-muted/40 px-6 py-3 rounded-2xl border border-muted">
            <button
              onClick={() => setAction(prev => ({ ...prev, count: Math.max(1, prev.count - 1) }))}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-background border shadow-sm text-foreground hover:bg-muted transition-colors font-medium text-lg"
            >
              −
            </button>
            <div className="flex flex-col items-center w-8">
               <span className="text-3xl font-black tabular-nums leading-none">{action.count}</span>
            </div>
            <button
              onClick={() => setAction(prev => ({ ...prev, count: Math.min(20, prev.count + 1) }))}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-background border shadow-sm text-foreground hover:bg-muted transition-colors font-medium text-lg"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Upgraded Global Impact Banner */}
      <div
        className={`mb-10 p-6 rounded-[2rem] border-2 transition-colors duration-300 ${
          simAction.mode === "skip"
            ? overallDecision === "Safe"
              ? "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900/50"
              : overallDecision === "Risky"
                ? "bg-amber-50/50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700/50"
                : "bg-red-50/50 border-red-300 dark:bg-red-950/30 dark:border-red-700/50"
            : "bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/50"
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Status Icon */}
          <div className="mt-1 shrink-0 hidden sm:block">
            {simAction.mode === "skip" ? (
              overallDecision === "Safe" ? (
                <div className="bg-green-500/20 p-3 rounded-2xl border border-green-500/20"><span className="text-2xl">✅</span></div>
              ) : overallDecision === "Risky" ? (
                <div className="bg-amber-500/20 p-3 rounded-2xl border border-amber-500/20"><span className="text-2xl">⚠️</span></div>
              ) : (
                <div className="bg-red-500/20 p-3 rounded-2xl border border-red-500/20"><span className="text-2xl">❌</span></div>
              )
            ) : (
              <div className="bg-blue-500/20 p-3 rounded-2xl border border-blue-500/20"><span className="text-2xl">📈</span></div>
            )}
          </div>
          
          <div className="flex-1 w-full">
            <h2 className={`text-2xl font-black tracking-tight mb-2 ${
                simAction.mode === "skip"
                  ? overallDecision === "Safe"
                    ? "text-green-800 dark:text-green-400"
                    : overallDecision === "Risky"
                      ? "text-amber-800 dark:text-amber-400"
                      : "text-red-800 dark:text-red-400"
                  : "text-blue-800 dark:text-blue-400"
            }`}>
              {simAction.mode === "attend"
                ? "Decision: Keep Attending"
                : overallDecision === "Safe"
                  ? "Decision: Safe to Skip"
                  : overallDecision === "Risky"
                    ? "Decision: High Risk - Reconsider"
                    : "Decision: Absolutely Do Not Skip"}
            </h2>
            
            <p className="text-foreground/80 font-medium text-lg leading-relaxed">
              If you {simAction.mode === "skip" ? "skip" : "attend"} exactly <strong className="text-foreground">{simAction.count} class{simAction.count !== 1 ? 'es' : ''}</strong> right now across all subjects:
            </p>

            {/* Smart Contextual Impact Boxes */}
            {simAction.mode === "skip" && (subjectsAffected > 0 || subjectsBecomeUnrecoverable > 0) && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjectsAffected > 0 && (
                  <div className="bg-amber-100/50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-900">
                    <h4 className="font-bold text-amber-900 dark:text-amber-400 flex items-center gap-2 mb-1">
                       <span className="bg-amber-300 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-xs w-5 h-5 flex items-center justify-center rounded-full">{subjectsAffected}</span> Drop below minimum
                    </h4>
                    <p className="text-sm font-medium text-amber-800/80 dark:text-amber-500/90 leading-tight">
                      {affectedSubjectsNames.join(", ")} will require immediate back-to-back recovery.
                    </p>
                  </div>
                )}
                
                {subjectsBecomeUnrecoverable > 0 && (
                  <div className="bg-red-100/50 dark:bg-red-950/40 p-4 rounded-xl border border-red-200 dark:border-red-900">
                    <h4 className="font-bold text-red-900 dark:text-red-400 flex items-center gap-2 mb-1">
                      <span className="bg-red-300 dark:bg-red-800 text-red-900 dark:text-red-100 text-xs w-5 h-5 flex items-center justify-center rounded-full">{subjectsBecomeUnrecoverable}</span> Become unrecoverable
                    </h4>
                    <p className="text-sm font-medium text-red-800/80 dark:text-red-500/90 leading-tight">
                      {fatalSubjectsNames.join(", ")} will become medically irrecoverable for the semester.
                    </p>
                  </div>
                )}
              </div>
            )}

            {simAction.mode === "skip" && subjectsAffected === 0 && subjectsBecomeUnrecoverable === 0 && (
               <div className="mt-4 bg-green-100/50 dark:bg-green-950/40 p-4 rounded-xl border border-green-200 dark:border-green-900 max-w-md">
                 <h4 className="font-bold text-green-900 dark:text-green-400">Zero Dependencies Broken</h4>
                 <p className="text-sm font-medium text-green-800/80 dark:text-green-500/90 leading-tight mt-1">
                   All your subjects have enough buffer to absorb this skip without dropping below the threshold.
                 </p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Subject Results Grid */}
      <h3 className="font-black text-xl text-foreground mb-5 pl-1 tracking-tight">Detailed Breakdown</h3>
      <div className="space-y-5">
        {simulation.subjects.map((sub) => (
          <SubjectSimCard key={sub.subjectId} sub={sub} action={action.mode} count={action.count} />
        ))}
      </div>
    </div>
  );
}

// ── Per-subject card ─────────────────────────────────────────────────────────

function SubjectSimCard({ sub, action, count }: { sub: SubjectSimulationResult; action: "skip" | "attend"; count: number }) {
  const isDanger = sub.wouldDropBelowThreshold || sub.alreadyBelowThreshold;
  const isFatal = sub.isMathematicallyUnrecoverable && sub.simulatedPct < sub.minAttendanceRequired;
  const diffPct = sub.simulatedPct - sub.currentPct;

  return (
    <div className={`bg-card border-2 rounded-[2rem] p-6 overflow-hidden relative shadow-sm hover:shadow-md transition-all ${
      isFatal ? 'border-red-400 dark:border-red-800 bg-red-50/10' : isDanger ? 'border-amber-300 dark:border-amber-900/50 bg-amber-50/10' : 'border-border'
    }`}>
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4 pl-1">
        <div>
          <h4 className="font-black text-foreground text-xl tracking-tight mb-2">{sub.name}</h4>
          
          <div className="flex flex-wrap items-center gap-3">
             <div className="bg-foreground text-background px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
               Target: {sub.minAttendanceRequired}%
             </div>
             
             {/* Dynamic Confidence Meter */}
             <div className="group relative flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-lg border border-border cursor-help pointer-events-auto">
               <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confidence</span>
               <div className="w-16 h-2 bg-muted rounded-full overflow-hidden border border-border/50">
                 <div className={`h-full ${sub.confidenceLevel === "High" ? "bg-green-500" : sub.confidenceLevel === "Medium" ? "bg-amber-500" : "bg-red-500"}`} 
                      style={{width: sub.confidenceLevel === "High" ? '100%' : sub.confidenceLevel === "Medium" ? '66%' : '33%'}} />
               </div>
               {/* Tooltip */}
               <div className="absolute top-full left-0 mt-2 w-56 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs p-3 rounded-xl shadow-xl pointer-events-none z-10 font-medium">
                 Based on {sub.totalClasses} classes elapsed. {sub.confidenceLevel === 'Low' ? 'High volatility—single absences will cause massive swings.' : 'Stable—the percentage is a strong reflection of reality.'}
               </div>
             </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-start sm:items-end gap-2">
             {sub.alreadyBelowThreshold ? (
               <span className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 px-4 py-2 rounded-xl text-sm font-black border border-red-200 dark:border-red-800 shadow-sm">
                 <span className="text-base leading-none">❌</span> Already Below Threshold
               </span>
             ) : sub.wouldDropBelowThreshold ? (
               <span className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 px-4 py-2 rounded-xl text-sm font-black border border-amber-200 dark:border-amber-800 shadow-sm">
                 <span className="text-base leading-none">⚠️</span> At Risk of Breaching
               </span>
             ) : (
               <span className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400 px-4 py-2 rounded-xl text-sm font-black border border-green-200 dark:border-green-800 shadow-sm">
                 <span className="text-base leading-none">✅</span> Comfortable Buffer
               </span>
             )}
             
             {sub.bufferPct >= 0 && !sub.alreadyBelowThreshold && (
               <div className="text-xs font-bold text-muted-foreground mr-1">
                 Current margin: <span className="text-green-600 dark:text-green-500">+{sub.bufferPct}%</span> extra
               </div>
             )}
        </div>
      </div>

      {/* Main Metric Row (Current -> Future) */}
      <div className="flex items-center gap-4 sm:gap-6 ml-1 mb-6">
        <div className="flex-1 bg-muted/30 rounded-2xl p-5 border border-transparent">
          <p className="text-xs text-muted-foreground mb-1 font-bold uppercase tracking-widest opacity-80">Current status</p>
          <p className="text-3xl font-black text-foreground tabular-nums tracking-tight">{sub.currentPct}%</p>
        </div>
        
        <div className="flex flex-col items-center justify-center -mt-2">
          <div className={`text-sm font-black mb-1 bg-background px-3 py-1 rounded-full shadow-sm border ${diffPct >= 0 ? "text-green-600 border-green-100" : "text-red-600 border-red-100"}`}>
            {diffPct >= 0 ? "+" : ""}{(Math.round(diffPct * 10) / 10).toFixed(1)}%
          </div>
          <svg className="w-8 h-8 text-muted-foreground/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </div>

        <div className={`flex-1 rounded-2xl p-5 border shadow-sm transition-all ${
          sub.simulatedPct < sub.minAttendanceRequired
            ? "bg-red-50 dark:bg-red-950/20 shadow-red-500/10 border-red-200 dark:border-red-900/50"
            : action === "attend" && sub.simulatedPct >= sub.minAttendanceRequired 
              ? "bg-blue-50 dark:bg-blue-950/20 shadow-blue-500/10 border-blue-200 dark:border-blue-900/50"
              : "bg-green-50 dark:bg-green-950/20 shadow-green-500/10 border-green-200 dark:border-green-900/50"
        }`}>
          <p className={`text-xs mb-1 font-bold uppercase tracking-widest ${sub.simulatedPct < sub.minAttendanceRequired ? 'text-red-600/80' : 'text-muted-foreground/80'}`}>
            If you {action} {count}
          </p>
          <p className={`text-3xl font-black tabular-nums tracking-tight ${
            sub.simulatedPct < sub.minAttendanceRequired ? "text-red-700 dark:text-red-500" : "text-green-700 dark:text-green-500"
          }`}>
            {sub.simulatedPct}%
          </p>
        </div>
      </div>

      {/* Constraints Footer */}
      <div className="bg-muted/30 border border-muted/80 rounded-2xl p-5 flex flex-col sm:flex-row gap-6 sm:items-center justify-between ml-1">
        {/* Recovery Instructions */}
        {sub.simulatedPct < sub.minAttendanceRequired ? (
             <div className="flex-1">
               <p className="text-sm font-black text-red-700 dark:text-red-400 mb-1 flex items-center gap-2">
                 <span>🚨</span> Remediation Required
               </p>
               {sub.isMathematicallyUnrecoverable ? (
                 <p className="text-sm font-bold text-red-600 leading-tight">
                   Mathematically impossible. Even if you attend all future classes, your max cap is strictly {sub.maxPossiblePct}% (&lt; {sub.minAttendanceRequired}%).
                 </p>
               ) : sub.isRecoveryPossible ? (
                 <p className="text-sm text-foreground font-medium leading-tight">
                   To survive, you will need to actively attend the <strong className="text-amber-600 font-bold bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">next {sub.classesNeededToRecover} class{sub.classesNeededToRecover > 1 ? 'es' : ''}</strong> without fail.
                 </p>
               ) : (
                 <p className="text-sm font-bold text-red-600 leading-tight">
                   Cannot recover. Only {Math.max(0, sub.remainingClasses - (action === 'skip' ? count : 0))} classes left, but you need {sub.classesNeededToRecover}.
                 </p>
               )}
             </div>
        ) : (
             <div className="flex-1 pl-1">
               <p className="text-sm font-black text-foreground mb-1 flex items-center gap-2">
                 <span>🛡️</span> Security Verified
               </p>
               <p className="text-sm text-muted-foreground font-medium">
                 Your attendance is resilient against this change. No immediate threat.
               </p>
             </div>
        )}

        {/* Hard Limits */}
        <div className="sm:text-right shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border">
          <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase mb-1.5 flex items-center justify-start sm:justify-end gap-1.5 cursor-help" title="Highest attendance technically achievable this semester.">
            Max Potential Cap
            <svg className="w-4 h-4 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </p>
          <div className={`inline-flex items-center justify-center px-4 py-2 rounded-xl border ${sub.maxPossiblePct < sub.minAttendanceRequired ? 'bg-red-50 border-red-200 text-red-700 font-black' : 'bg-background border-border text-foreground font-bold'}`}>
            <span className="text-lg">{sub.maxPossiblePct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
