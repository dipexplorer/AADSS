// app/admin/classes/components/ClassSessionsClient.tsx
"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  cancelClassAndCascade,
  restoreClassAndCascade,
  rescheduleClassSession,
  updateClassSessionStatus,
} from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Calendar as CalendarIcon,
  Users,
  MapPin,
  AlertTriangle,
  RotateCcw,
  Search,
  CheckCircle2,
  XOctagon,
  X,
  Save,
  Filter,
  User,
  Info,
  Edit,
  Copy,
  Check as CheckIcon,
} from "lucide-react";

interface Props {
  sessions: any[];
  targetDate: string;
  todayStr: string;
}

const STATUS_CONFIG = {
  scheduled: {
    icon: Clock,
    colors:
      "bg-blue-100/50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50",
    dot: "bg-blue-500",
    label: "Scheduled",
  },
  completed: {
    icon: CheckCircle2,
    colors:
      "bg-green-100/50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800/50",
    dot: "bg-green-500",
    label: "Completed",
  },
  cancelled: {
    icon: XOctagon,
    colors:
      "bg-red-100/50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/50",
    dot: "bg-red-500",
    label: "Cancelled",
  },
};

export default function ClassSessionsClient({
  sessions,
  targetDate,
  todayStr,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isPastDate = targetDate < todayStr;
  const isFutureDate = targetDate > todayStr;

  // Active UI States
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [confirmBatchCancel, setConfirmBatchCancel] = useState(false);
  const [recentlyCancelledNode, setRecentlyCancelledNode] = useState<
    string | null
  >(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "scheduled" | "cancelled" | "completed"
  >("all");

  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    start_time: "",
    end_time: "",
  });

  // Action: Reschedule
  function handleReschedule(id: string) {
    if (
      !rescheduleData.date ||
      !rescheduleData.start_time ||
      !rescheduleData.end_time
    ) {
      toast.error("All fields required");
      return;
    }

    if (rescheduleData.end_time <= rescheduleData.start_time) {
      toast.error("End time must be after the start time");
      return;
    }

    startTransition(async () => {
      const res = await rescheduleClassSession(id, rescheduleData);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Session rescheduled");
        setRescheduleId(null);
      }
    });
  }

  // Action: Cancel with Cascade
  function handleCancelWithCascade(id: string) {
    startTransition(async () => {
      const res = await cancelClassAndCascade(id);
      if (res?.error) toast.error(res.error);
      else {
        const count = (res as any).cascaded ?? 0;
        toast.success(
          `Class cancelled — ${count} student record${count !== 1 ? "s" : ""} cascaded.`,
        );
        setConfirmCancelId(null);
        setRecentlyCancelledNode(id);
        // Toast for quick undo
        toast(
          (t) => (
            <div className="flex items-center gap-4">
              <span className="text-sm">Action completed.</span>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  handleRestore(id);
                }}
                className="text-xs font-semibold bg-foreground text-background px-2 py-1 rounded"
              >
                Undo
              </button>
            </div>
          ),
          { duration: 5000 },
        );
        setTimeout(() => setRecentlyCancelledNode(null), 6000);
      }
    });
  }

  // Action: Batch Cancel (Holiday)
  function handleBatchCancel() {
    const activeSessions = sessions.filter((s) => s.status !== "cancelled");
    if (activeSessions.length === 0) {
      toast.success("No active sessions to cancel.");
      setConfirmBatchCancel(false);
      return;
    }

    startTransition(async () => {
      let successCount = 0;
      let impactedStudents = 0;
      for (const s of activeSessions) {
        const res = await cancelClassAndCascade(s.id);
        if (!res?.error) {
          successCount++;
          impactedStudents += (res as any).cascaded ?? 0;
        }
      }
      toast.success(
        `Holiday Marked: ${successCount} classes cancelled (${impactedStudents} students impacted).`,
      );
      setConfirmBatchCancel(false);
    });
  }

  // Action: Restore
  function handleRestore(id: string) {
    startTransition(async () => {
      const res = await restoreClassAndCascade(id);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Session restored & attendance un-cancelled!");
        setRecentlyCancelledNode(null);
      }
    });
  }

  // Action: Mark Completed
  function handleMarkCompleted(id: string) {
    startTransition(async () => {
      const res = await updateClassSessionStatus(id, "completed");
      if (res?.error) toast.error(res.error);
      else toast.success("Session marked as completed.");
    });
  }

  // Filtering Logic
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesSearch = (s.subjects?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sessions, searchQuery, statusFilter]);

  // Derived Context Info
  const uniquePrograms = new Set(
    sessions.map((s) => s.subjects?.semesters?.programs?.name),
  ).size;
  const totalClasses = sessions.length;
  const activeClasses = sessions.filter((s) => s.status === "scheduled").length;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-[calc(100vh-4rem)]">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2 tracking-tight">
            Daily Control Panel
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
            <CalendarIcon className="w-4 h-4" />
            {new Date(targetDate).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            <span className="text-border">|</span>
            <span className="font-medium text-foreground">
              {totalClasses} Sessions across {uniquePrograms} Programs
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="date"
            value={targetDate}
            onChange={(e) =>
              router.push(`/admin/classes?date=${e.target.value}`)
            }
            className="w-full sm:w-auto px-4 py-2 border border-border rounded-xl text-sm bg-card hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          />
          {!isPastDate && (
            <Button
              variant="destructive"
              className="w-full sm:w-auto shadow-sm"
              onClick={() => setConfirmBatchCancel(true)}
              disabled={activeClasses === 0 || isPending}
            >
              Mark as Holiday
            </Button>
          )}
        </div>
      </div>

      {/* ── BATCH CANCEL MODAL ── */}
      {confirmBatchCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-destructive/20 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 text-destructive">
                <div className="p-2 bg-destructive/10 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Declare Holiday?</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                You are about to cancel{" "}
                <strong className="text-foreground">
                  {activeClasses} scheduled classes
                </strong>{" "}
                for today. This action will automatically mark all enrolled
                students as "absent/cancelled" ensuring it does not negatively
                impact their attendance percentages.
              </p>
              <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={() => setConfirmBatchCancel(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBatchCancel}
                  disabled={isPending}
                >
                  {isPending ? "Applying..." : "Confirm Holiday"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTROLS: SEARCH & FILTER ── */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 bg-card p-2 rounded-2xl shadow-sm border border-border/50">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by subject name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-transparent text-sm focus:outline-none focus:ring-0"
          />
        </div>
        <div className="h-6 w-px bg-border hidden sm:block"></div>
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 px-2 sm:px-0">
          <Filter className="w-4 h-4 text-muted-foreground ml-1 mr-2 shrink-0" />
          {(["all", "scheduled", "completed", "cancelled"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {status}
              </button>
            ),
          )}
        </div>
      </div>

      {/* ── TIMELINE ── */}
      <div className="relative">
        <div className="absolute top-0 bottom-0 left-[21px] md:left-[39px] w-0.5 bg-border rounded-full" />

        <div className="space-y-6">
          {filteredSessions.length === 0 ? (
            <div className="ml-12 md:ml-20 bg-card border border-border border-dashed rounded-2xl p-10 text-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-base font-medium text-foreground">
                No sessions found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {sessions.length === 0
                  ? "Classes are auto-generated when students open their apps for the day."
                  : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            filteredSessions.map((s, index) => {
              const statusConf =
                STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG] ||
                STATUS_CONFIG.scheduled;
              const StatusIcon = statusConf.icon;
              const isCancelled = s.status === "cancelled";
              const isJustCancelled = recentlyCancelledNode === s.id;

              return (
                <div key={s.id} className="relative flex items-start group">
                  {/* Timeline Node */}
                  <div className="w-11 md:w-20 shrink-0 flex flex-col items-center pt-5">
                    <div className="text-xs font-semibold text-foreground bg-background py-1 relative z-10 w-full text-center">
                      {s.start_time?.slice(0, 5)}
                    </div>
                  </div>

                  {/* Dot */}
                  <div
                    className={`absolute left-[17px] md:left-[35px] top-[26px] z-10 w-[10px] h-[10px] rounded-full ring-4 ring-background ${statusConf.dot} transition-colors duration-300`}
                  />

                  {/* Card content */}
                  <div className="flex-1 ml-4 md:ml-6 mt-2 relative">
                    <div
                      className={`rounded-2xl p-5 border transition-all duration-300 ${
                        isJustCancelled
                          ? "scale-[0.98] opacity-90 ring-2 ring-red-500/50"
                          : "hover:border-primary/30 hover:shadow-md"
                      } ${isCancelled ? "bg-card border-red-200 dark:border-red-900/50" : "bg-card border-border/50"}`}
                    >
                      {/* Sub-bg for cancelled visual effect */}
                      {isCancelled && (
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.03)_10px,rgba(239,68,68,0.03)_20px)] rounded-2xl pointer-events-none" />
                      )}

                      <div className="relative">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3
                                className={`text-lg font-bold ${isCancelled ? "text-foreground/60 line-through" : "text-foreground"}`}
                              >
                                {(s.subjects as any)?.name}
                              </h3>
                              <span
                                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${statusConf.colors}`}
                              >
                                <StatusIcon className="w-3.5 h-3.5" />
                                {statusConf.label}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(s.id);
                                  setCopiedId(s.id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                  toast.success("Session ID Copied!");
                                }}
                                className="ml-auto sm:ml-2 flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary px-2 py-1 rounded-lg transition-colors border border-border/50"
                                title="Copy Session ID"
                              >
                                {copiedId === s.id ? (
                                  <CheckIcon className="w-3 h-3 text-green-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                {copiedId === s.id ? "Copied ID" : "Copy ID"}
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-1 text-medium">
                              <div className="flex items-center gap-1.5">
                                <CalendarIcon className="w-4 h-4 text-primary/70" />
                                <span>
                                  Semester{" "}
                                  {
                                    (s.subjects as any)?.semesters
                                      ?.semester_number
                                  }
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-primary/70" />
                                <span>
                                  {
                                    (s.subjects as any)?.semesters?.programs
                                      ?.name
                                  }
                                </span>
                              </div>
                              {/* If timetable room was here, we'd add it, but using placeholder block to fit prompt constraints */}
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-primary/70" />
                                <span>Assigned Room</span>
                              </div>
                            </div>

                            {/* Audit Trail for Cancellation */}
                            {isCancelled && s.cancelled_at && (
                              <div className="mt-4 bg-red-50/50 dark:bg-red-950/20 rounded-lg p-3 border border-red-100 dark:border-red-900/30 flex items-start gap-3">
                                <Info className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                                    Cancelled at{" "}
                                    {new Date(
                                      s.cancelled_at,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                    {s.cancelled_by ? " by administration" : ""}
                                    .
                                  </p>
                                  <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5">
                                    Attendance requirements waived for enrolled
                                    students.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Controls */}
                          <div className="flex flex-col sm:items-end sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-border/50 min-w-[140px]">
                            {isPastDate ? (
                              <div className="w-full text-center sm:text-right px-3 py-1.5 bg-muted/50 rounded-lg border border-border text-xs text-muted-foreground font-medium flex items-center justify-center sm:justify-end gap-1.5 h-[32px]">
                                <Info className="w-3.5 h-3.5" />
                                {statusConf.label} (Read-Only)
                              </div>
                            ) : (
                              <>
                                {s.status === "scheduled" && (
                                  <>
                                    {confirmCancelId === s.id ? (
                                      <div className="flex flex-col gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-3 shadow-sm animate-in zoom-in-95 duration-200">
                                        <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-300 font-semibold mb-1">
                                          <AlertTriangle className="w-4 h-4" />
                                          Impact Warning
                                        </div>
                                        <p className="text-xs text-red-700/80 dark:text-red-400/80 leading-relaxed max-w-[200px]">
                                          This will cascade absent/cancelled
                                          status to all students, waiving their
                                          attendance requirement.
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            className="h-7 text-xs w-full"
                                            onClick={() =>
                                              handleCancelWithCascade(s.id)
                                            }
                                            disabled={isPending}
                                          >
                                            {isPending
                                              ? "Processing..."
                                              : "Confirm"}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs px-2"
                                            onClick={() =>
                                              setConfirmCancelId(null)
                                            }
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col gap-2 w-full">
                                        {!isFutureDate && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-full justify-start text-xs font-medium text-muted-foreground hover:text-green-600 hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-950/30 dark:hover:border-green-900/50"
                                            onClick={() =>
                                              handleMarkCompleted(s.id)
                                            }
                                          >
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                            Complete Class
                                          </Button>
                                        )}
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 w-full justify-start text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/20"
                                          onClick={() => {
                                            setRescheduleId(s.id);
                                            setRescheduleData({
                                              date: s.date,
                                              start_time: s.start_time?.slice(
                                                0,
                                                5,
                                              ),
                                              end_time: s.end_time?.slice(0, 5),
                                            });
                                          }}
                                        >
                                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                                          Reschedule
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 w-full justify-start text-xs font-medium text-muted-foreground hover:text-red-600 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:border-red-900/50"
                                          onClick={() =>
                                            setConfirmCancelId(s.id)
                                          }
                                        >
                                          <XOctagon className="w-3.5 h-3.5 mr-1.5" />
                                          Cancel Class
                                        </Button>
                                      </div>
                                    )}
                                  </>
                                )}

                                {s.status === "cancelled" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRestore(s.id)}
                                    disabled={isPending}
                                    className="h-8 gap-1.5 text-xs font-medium w-full justify-start bg-card hover:bg-green-50 hover:text-green-700 hover:border-green-200 dark:hover:bg-green-950/30 dark:hover:border-green-800"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Restore Session
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Interactive Reschedule Panel */}
                        {rescheduleId === s.id && (
                          <div className="mt-5 pt-4 border-t border-border/50 bg-muted/30 -mx-5 px-5 -mb-5 pb-5 rounded-b-2xl">
                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                              <Edit className="w-4 h-4 text-primary" />{" "}
                              Reschedule Session
                            </h4>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                  New Date
                                </label>
                                <input
                                  type="date"
                                  value={rescheduleData.date}
                                  onChange={(e) =>
                                    setRescheduleData({
                                      ...rescheduleData,
                                      date: e.target.value,
                                    })
                                  }
                                  className="block w-full px-3 py-1.5 border border-border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                  Start
                                </label>
                                <input
                                  type="time"
                                  value={rescheduleData.start_time}
                                  onChange={(e) =>
                                    setRescheduleData({
                                      ...rescheduleData,
                                      start_time: e.target.value,
                                    })
                                  }
                                  className="block w-full px-3 py-1.5 border border-border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                  End
                                </label>
                                <input
                                  type="time"
                                  value={rescheduleData.end_time}
                                  onChange={(e) =>
                                    setRescheduleData({
                                      ...rescheduleData,
                                      end_time: e.target.value,
                                    })
                                  }
                                  className="block w-full px-3 py-1.5 border border-border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                              </div>

                              <div className="flex items-center gap-2 mt-5">
                                <Button
                                  onClick={() => handleReschedule(s.id)}
                                  disabled={isPending}
                                  size="sm"
                                  className="h-8 gap-1.5"
                                >
                                  <Save className="w-3.5 h-3.5" /> Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setRescheduleId(null)}
                                  className="h-8"
                                >
                                  Discard
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
