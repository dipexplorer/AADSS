"use client";

/*
 * ─────────────────────────────────────────────────────────────────────────────
 *  PromotionClient.tsx — Interactive Bulk Promotion UI
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  TEACHING NOTES:
 *
 *  "use client" kyun likhte hain?
 *  Jab bhi hume user ke interactions handle karne hon (onClick, useState, etc.)
 *  tab "use client" likhna zaroori hai. Ye Next.js ko batata hai: "ye component
 *  browser mein chala, server par nahi."
 *
 *  Pattern Recap:
 *  page.tsx (server) → data fetch karta hai → PromotionClient ko deta hai
 *  PromotionClient (client) → data display karta hai + user actions handle karta hai
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { promoteStudents } from "@/lib/admin/promotionActions";
import {
  GraduationCap,
  ChevronRight,
  Users,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface Semester {
  id: string;
  semester_number: number;
  enrolledCount: number;
}

interface Program {
  id: string;
  name: string;
  semesters: Semester[];
}

interface Props {
  programs: Program[];
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function PromotionClient({ programs }: Props) {
  // "useTransition" — React 18 ka feature. Server action chalte waqt UI ko
  // freeze nahi hone deta. `isPending` = true jab action run ho raha ho.
  const [isPending, startTransition] = useTransition();

  // Admin ki selection track karna
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedFromSemId, setSelectedFromSemId] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [lastResult, setLastResult] = useState<{
    promoted: number;
    nextSemNumber: number;
  } | null>(null);

  // ── Derived values ───────────────────────────────────────────────────────
  const selectedProgram = programs.find((p) => p.id === selectedProgramId);
  const selectedSem = selectedProgram?.semesters.find(
    (s) => s.id === selectedFromSemId
  );
  const nextSemNumber = selectedSem ? selectedSem.semester_number + 1 : null;

  // ── Handler: Execute Promotion ─────────────────────────────────────────
  function handlePromote() {
    if (!selectedProgramId || !selectedFromSemId || !nextSemNumber) return;

    // TEACHING: startTransition wraps the async Server Action call.
    // While it runs, `isPending` = true (we use this to show a spinner).
    startTransition(async () => {
      const result = await promoteStudents(
        selectedProgramId,
        selectedFromSemId,
        nextSemNumber
      );

      setShowConfirm(false);

      if (result?.error) {
        toast.error(result.error);
      } else {
        setLastResult({
          promoted: result.promoted!,
          nextSemNumber: result.nextSemNumber!,
        });
        setSelectedFromSemId(""); // Reset selection
        toast.success(
          `✅ ${result.promoted} student(s) promoted to Semester ${result.nextSemNumber}!`
        );
      }
    });
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto min-h-[calc(100vh-4rem)]">
      {/* ── HEADER ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 tracking-tight">
          <GraduationCap className="w-6 h-6 text-primary" />
          Bulk Semester Promotion
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-xl">
          Move all enrolled students from one semester to the next in a single
          click. This updates their academic profile — attendance history is{" "}
          <span className="font-semibold text-foreground">preserved</span> and
          linked to their old semester sessions.
        </p>
      </div>

      {/* ── SUCCESS BANNER ── */}
      {lastResult && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Promotion Successful!
            </p>
            <p className="text-xs text-emerald-700/70 dark:text-emerald-400/60">
              {lastResult.promoted} student(s) moved to Semester{" "}
              {lastResult.nextSemNumber}.
            </p>
          </div>
          <button
            onClick={() => setLastResult(null)}
            className="ml-auto text-emerald-600 hover:text-emerald-800 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── PROMOTION CARD ── */}
      <div className="bg-card border border-border/60 rounded-2xl shadow-sm divide-y divide-border/50">
        {/* Step 1: Select Program */}
        <div className="p-5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Step 1 — Select Program
          </label>
          <select
            value={selectedProgramId}
            onChange={(e) => {
              setSelectedProgramId(e.target.value);
              setSelectedFromSemId(""); // Reset semester when program changes
              setShowConfirm(false);
              setLastResult(null);
            }}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Choose a program...</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Select Source Semester */}
        {selectedProgram && (
          <div className="p-5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Step 2 — Select Semester to Promote From
            </label>

            {selectedProgram.semesters.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No semesters found for this program.
              </p>
            ) : (
              <div className="grid gap-3">
                {selectedProgram.semesters.map((sem) => {
                  const isActive = selectedFromSemId === sem.id;
                  const hasStudents = sem.enrolledCount > 0;

                  return (
                    <button
                      key={sem.id}
                      onClick={() => {
                        setSelectedFromSemId(sem.id);
                        setShowConfirm(false);
                        setLastResult(null);
                      }}
                      className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                        isActive
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border/50 hover:border-primary/40 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {sem.semester_number}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Semester {sem.semester_number}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {hasStudents
                              ? `${sem.enrolledCount} student(s) enrolled`
                              : "No students enrolled"}
                          </p>
                        </div>
                      </div>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Preview + Confirm */}
        {selectedSem && nextSemNumber && (
          <div className="p-5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Step 3 — Preview & Confirm
            </label>

            {/* Visual Preview Arrow */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 p-3 bg-muted/40 rounded-xl text-center">
                <p className="text-xs text-muted-foreground">From</p>
                <p className="text-lg font-bold text-foreground">
                  Sem {selectedSem.semester_number}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 p-3 bg-primary/5 border border-primary/20 rounded-xl text-center">
                <p className="text-xs text-muted-foreground">To</p>
                <p className="text-lg font-bold text-primary">
                  Sem {nextSemNumber}
                </p>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                This will move{" "}
                <span className="font-bold">
                  {selectedSem.enrolledCount} student(s)
                </span>{" "}
                from Semester {selectedSem.semester_number} to Semester{" "}
                {nextSemNumber}. Attendance history is{" "}
                <span className="font-semibold">not affected</span> — only
                their current semester tag changes. This action cannot be
                undone from the UI.
              </p>
            </div>

            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={selectedSem.enrolledCount === 0}
                className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {selectedSem.enrolledCount === 0
                  ? "No students to promote"
                  : `Promote ${selectedSem.enrolledCount} Student(s) →`}
              </button>
            ) : (
              /* Double Confirm Step — Safety UX Pattern */
              <div className="space-y-2">
                <p className="text-xs font-medium text-center text-foreground">
                  Are you sure? This will immediately update all records.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-2 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePromote}
                    disabled={isPending}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Promoting...
                      </>
                    ) : (
                      "Yes, Promote Now"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── NO PROGRAMS FALLBACK ── */}
      {programs.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No programs found in the system.</p>
        </div>
      )}
    </div>
  );
}
