// app/simulate/components/SimulateClient.tsx
"use client";

import { useState, useMemo } from "react";
import { runSimulation } from "@/lib/engines/simulation/runSimulation";
import {
  SubjectSimInput,
  SubjectSimulationResult,
} from "@/lib/engines/simulation/types";

const TABS = [
  "Skip Planner",
  "Recovery Planner",
  "Streak Simulator",
  "Worst Case",
] as const;
type Tab = (typeof TABS)[number];

interface Props {
  subjects: SubjectSimInput[];
}

export default function SimulateClient({ subjects }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Skip Planner");
  const [streakN, setStreakN] = useState(5);
  const [recoveryTarget, setRecoveryTarget] = useState(75);

  const simulation = useMemo(
    () => runSimulation(subjects, streakN, recoveryTarget),
    [subjects, streakN, recoveryTarget],
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Simulation Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          What-if scenarios for your attendance
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/30 p-1 rounded-xl mb-6 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Controls */}
      {activeTab === "Streak Simulator" && (
        <div className="bg-card border border-border/50 rounded-xl p-4 mb-5 flex items-center gap-4">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">
            Attend next
          </label>
          <input
            type="range"
            min={1}
            max={30}
            value={streakN}
            onChange={(e) => setStreakN(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-sm font-bold text-primary w-16 text-center">
            {streakN} class{streakN !== 1 ? "es" : ""}
          </span>
        </div>
      )}

      {activeTab === "Recovery Planner" && (
        <div className="bg-card border border-border/50 rounded-xl p-4 mb-5 flex items-center gap-4">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">
            Target
          </label>
          <input
            type="range"
            min={60}
            max={100}
            step={1}
            value={recoveryTarget}
            onChange={(e) => setRecoveryTarget(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-sm font-bold text-primary w-16 text-center">
            {recoveryTarget}%
          </span>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {simulation.subjects.map((sub) => (
          <SubjectSimCard key={sub.subjectId} sub={sub} activeTab={activeTab} />
        ))}
      </div>
    </div>
  );
}

// ── Per-subject card ─────────────────────────────────────────────────────────

function SubjectSimCard({
  sub,
  activeTab,
}: {
  sub: SubjectSimulationResult;
  activeTab: Tab;
}) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-4">
      {/* Subject header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-foreground">{sub.name}</span>
        <span
          className={`text-sm font-bold ${
            sub.currentPct >= 75
              ? "text-green-600"
              : sub.currentPct >= 65
                ? "text-amber-500"
                : "text-red-500"
          }`}
        >
          {sub.currentPct}%
        </span>
      </div>

      {/* Tab-specific content */}
      {activeTab === "Skip Planner" && <SkipResult data={sub.skipPlanner} />}
      {activeTab === "Recovery Planner" && (
        <RecoveryResult data={sub.recoveryPlanner} />
      )}
      {activeTab === "Streak Simulator" && (
        <StreakResult data={sub.streakSimulator} />
      )}
      {activeTab === "Worst Case" && <WorstCaseResult data={sub.worstCase} />}
    </div>
  );
}

// ── Skip Planner Result ──────────────────────────────────────────────────────

function SkipResult({
  data,
}: {
  data: SubjectSimulationResult["skipPlanner"];
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-muted/40 rounded-lg p-3">
        <p className="text-xs text-muted-foreground mb-0.5">Current</p>
        <p className="text-lg font-bold text-foreground">{data.currentPct}%</p>
      </div>
      <svg
        className="w-5 h-5 text-muted-foreground shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
      <div
        className={`flex-1 rounded-lg p-3 ${
          data.isSafe
            ? "bg-green-50 dark:bg-green-950/20"
            : "bg-red-50 dark:bg-red-950/20"
        }`}
      >
        <p className="text-xs text-muted-foreground mb-0.5">After skip</p>
        <p
          className={`text-lg font-bold ${data.isSafe ? "text-green-600" : "text-red-500"}`}
        >
          {data.afterSkipPct}%
        </p>
      </div>
      <div className="w-24 text-right">
        {data.wouldDropBelow ? (
          <span className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded-full">
            ⚠ Drops below threshold
          </span>
        ) : data.isSafe ? (
          <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded-full">
            ✓ Safe to skip
          </span>
        ) : (
          <span className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded-full">
            ✗ Already at risk
          </span>
        )}
      </div>
    </div>
  );
}

// ── Recovery Planner Result ──────────────────────────────────────────────────

function RecoveryResult({
  data,
}: {
  data: SubjectSimulationResult["recoveryPlanner"];
}) {
  if (data.currentPct >= data.targetPct) {
    return (
      <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 flex items-center gap-2">
        <span className="text-green-600 text-lg">✓</span>
        <div>
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">
            Already at {data.currentPct}% — target met!
          </p>
          <p className="text-xs text-muted-foreground">
            Target: {data.targetPct}%
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg p-3 ${
        data.isPossible
          ? "bg-amber-50 dark:bg-amber-950/20"
          : "bg-red-50 dark:bg-red-950/20"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-sm font-semibold ${
              data.isPossible
                ? "text-amber-700 dark:text-amber-400"
                : "text-red-600"
            }`}
          >
            {data.isPossible
              ? `Attend ${data.classesNeeded} consecutive classes`
              : `Not achievable this semester`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data.isPossible
              ? `to reach ${data.targetPct}%`
              : `Short by ${data.classesShortBy} classes · Target: ${data.targetPct}%`}
          </p>
        </div>
        <span
          className={`text-2xl font-bold ${
            data.isPossible ? "text-amber-600" : "text-red-500"
          }`}
        >
          {data.isPossible ? data.classesNeeded : "∞"}
        </span>
      </div>
    </div>
  );
}

// ── Streak Simulator Result ──────────────────────────────────────────────────

function StreakResult({
  data,
}: {
  data: SubjectSimulationResult["streakSimulator"];
}) {
  const diff = data.projectedPct - data.currentPct;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-muted/40 rounded-lg p-3">
        <p className="text-xs text-muted-foreground mb-0.5">Current</p>
        <p className="text-lg font-bold text-foreground">{data.currentPct}%</p>
      </div>
      <div className="text-center shrink-0">
        <p
          className={`text-sm font-bold ${diff >= 0 ? "text-green-600" : "text-red-500"}`}
        >
          {diff >= 0 ? "+" : ""}
          {Math.round(diff * 10) / 10}%
        </p>
      </div>
      <div
        className={`flex-1 rounded-lg p-3 ${
          data.projectedPct >= 75
            ? "bg-green-50 dark:bg-green-950/20"
            : "bg-amber-50 dark:bg-amber-950/20"
        }`}
      >
        <p className="text-xs text-muted-foreground mb-0.5">After streak</p>
        <p
          className={`text-lg font-bold ${
            data.projectedPct >= 75 ? "text-green-600" : "text-amber-500"
          }`}
        >
          {data.projectedPct}%
        </p>
      </div>
    </div>
  );
}

// ── Worst Case Result ────────────────────────────────────────────────────────

function WorstCaseResult({
  data,
}: {
  data: SubjectSimulationResult["worstCase"];
}) {
  if (data.alreadyBreach) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3">
        <p className="text-sm font-semibold text-red-600">
          Already below threshold
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          You need to attend classes to recover — no skips allowed.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg p-3 flex items-center justify-between ${
        data.maxSkipsAllowed === 0
          ? "bg-red-50 dark:bg-red-950/20"
          : data.maxSkipsAllowed <= 3
            ? "bg-amber-50 dark:bg-amber-950/20"
            : "bg-green-50 dark:bg-green-950/20"
      }`}
    >
      <div>
        <p
          className={`text-sm font-semibold ${
            data.maxSkipsAllowed === 0
              ? "text-red-600"
              : data.maxSkipsAllowed <= 3
                ? "text-amber-600"
                : "text-green-700 dark:text-green-400"
          }`}
        >
          {data.maxSkipsAllowed === 0
            ? "Cannot skip any more classes"
            : `You can skip up to ${data.maxSkipsAllowed} more classes`}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          and stay above {75}% threshold
        </p>
      </div>
      <span
        className={`text-3xl font-bold ${
          data.maxSkipsAllowed === 0
            ? "text-red-500"
            : data.maxSkipsAllowed <= 3
              ? "text-amber-500"
              : "text-green-600"
        }`}
      >
        {data.maxSkipsAllowed}
      </span>
    </div>
  );
}
