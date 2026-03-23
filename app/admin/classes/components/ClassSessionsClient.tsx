// app/admin/classes/components/ClassSessionsClient.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  updateClassSessionStatus,
  rescheduleClassSession,
} from "@/lib/admin/actions";

interface Props {
  sessions: any[];
  targetDate: string;
}

const STATUS_COLORS = {
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
  completed:
    "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300",
};

export default function ClassSessionsClient({ sessions, targetDate }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    start_time: "",
    end_time: "",
  });

  function handleReschedule(id: string) {
    if (
      !rescheduleData.date ||
      !rescheduleData.start_time ||
      !rescheduleData.end_time
    ) {
      toast.error("All fields required");
      return;
    }
    startTransition(async () => {
      const res = await rescheduleClassSession(id, rescheduleData);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Rescheduled");
        setRescheduleId(null);
      }
    });
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Class Sessions</h1>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => router.push(`/admin/classes?date=${e.target.value}`)}
          className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="space-y-3">
        {sessions.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
            <p className="text-muted-foreground">No classes on {targetDate}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Classes are auto-generated when students visit that date
            </p>
          </div>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              className="bg-card border border-border/50 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-foreground">
                      {(s.subjects as any)?.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[s.status as keyof typeof STATUS_COLORS]}`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}
                    {" · "}
                    {(s.subjects as any)?.semesters?.programs?.name} Sem{" "}
                    {(s.subjects as any)?.semesters?.semester_number}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {s.status !== "cancelled" && (
                    <button
                      onClick={() =>
                        startTransition(async () => {
                          const res = await updateClassSessionStatus(
                            s.id,
                            "cancelled",
                          );
                          if (res?.error) toast.error(res.error);
                          else toast.success("Class cancelled");
                        })
                      }
                      className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  {s.status === "cancelled" && (
                    <button
                      onClick={() =>
                        startTransition(async () => {
                          const res = await updateClassSessionStatus(
                            s.id,
                            "scheduled",
                          );
                          if (res?.error) toast.error(res.error);
                          else toast.success("Restored to scheduled");
                        })
                      }
                      className="px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition-colors"
                    >
                      Restore
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setRescheduleId(s.id);
                      setRescheduleData({
                        date: s.date,
                        start_time: s.start_time?.slice(0, 5),
                        end_time: s.end_time?.slice(0, 5),
                      });
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    Reschedule
                  </button>
                </div>
              </div>

              {/* Reschedule form */}
              {rescheduleId === s.id && (
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-3">
                  <input
                    type="date"
                    value={rescheduleData.date}
                    onChange={(e) =>
                      setRescheduleData({
                        ...rescheduleData,
                        date: e.target.value,
                      })
                    }
                    className="px-2 py-1.5 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="time"
                    value={rescheduleData.start_time}
                    onChange={(e) =>
                      setRescheduleData({
                        ...rescheduleData,
                        start_time: e.target.value,
                      })
                    }
                    className="px-2 py-1.5 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="time"
                    value={rescheduleData.end_time}
                    onChange={(e) =>
                      setRescheduleData({
                        ...rescheduleData,
                        end_time: e.target.value,
                      })
                    }
                    className="px-2 py-1.5 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={() => handleReschedule(s.id)}
                    disabled={isPending}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setRescheduleId(null)}
                    className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
