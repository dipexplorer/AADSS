"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import {
  getClassSessionRoster,
  overrideStudentAttendance,
} from "@/lib/admin/actions";
import { Check, X, User } from "lucide-react";

export default function ClassRosterView({
  classSessionId,
}: {
  classSessionId: string;
}) {
  const [roster, setRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function loadRoster() {
    setLoading(true);
    setError(null);
    const res = await getClassSessionRoster(classSessionId);
    if (res?.error) {
      setError(res.error);
    } else {
      setRoster(res.data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadRoster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classSessionId]);

  function handleOverride(studentId: string, newStatus: "present" | "absent") {
    startTransition(async () => {
      const res = await overrideStudentAttendance(
        studentId,
        classSessionId,
        newStatus,
        "System Admin Manual Override",
      );
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Marked ${newStatus}`);
        loadRoster(); // Silently reload data to update the UI correctly
      }
    });
  }

  if (loading) {
    return (
      <div className="p-5 text-sm text-muted-foreground animate-pulse">
        Loading enrolled students...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 text-sm text-red-500">
        Failed to load roster: {error}
      </div>
    );
  }

  if (roster.length === 0) {
    return (
      <div className="p-5 text-sm text-muted-foreground">
        No students enrolled in this semester.
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-border/50 pt-4 px-2 pb-2">
      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
        Enrolled Students & Attendance Override
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/40 text-[11px] text-muted-foreground uppercase tracking-wider font-semibold border-b border-border/50">
            <tr>
              <th className="px-3 py-2 rounded-tl-lg">Student</th>
              <th className="px-3 py-2">Roll No.</th>
              <th className="px-3 py-2">Current Status</th>
              <th className="px-3 py-2text-right rounded-tr-lg">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {roster.map((s) => {
              // The status comes from s.attendance.status (if marked)
              const status = s.attendance?.status || "absent";
              const isPresent = status === "present";
              // We treat missing attendance visually as absent since geofencing marks 'absent' on timeout anyway

              return (
                <tr key={s.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                        <User className="w-3 h-3" />
                      </div>
                      <span className="font-medium text-foreground">
                        {s.full_name || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                    {s.roll_number || "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        isPresent
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                      }`}
                    >
                      {isPresent ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      {status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOverride(s.id, "present")}
                        disabled={isPending || isPresent}
                        className={`text-[11px] font-semibold px-2 py-1.5 rounded transition-colors ${
                          isPresent
                            ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                        }`}
                      >
                        Set Present
                      </button>
                      <button
                        onClick={() => handleOverride(s.id, "absent")}
                        disabled={isPending || !isPresent}
                        className={`text-[11px] font-semibold px-2 py-1.5 rounded transition-colors ${
                          !isPresent
                            ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                            : "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/40"
                        }`}
                      >
                        Set Absent
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
