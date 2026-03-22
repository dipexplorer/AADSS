// app/daily-attendance/components/DailyAttendanceClient.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getDailySchedule,
  ClassPeriod,
} from "@/lib/attendance/getDailySchedule";
import {
  markAttendance,
  clearAttendance,
} from "@/lib/attendance/markAttendance";
import { toast } from "react-hot-toast";
import DateNavigator from "@/app/daily-attendance/components/DateNavigator";
import ScheduleTimeline from "@/app/daily-attendance/components/ScheduleTimeline";

interface Profile {
  id: string;
  semester_id: string;
  academic_sessions: {
    start_date: string | null;
    end_date: string | null;
  } | null;
}

interface Props {
  profile: Profile;
  initialDate: string;
}

export default function DailyAttendanceClient({ profile, initialDate }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [periods, setPeriods] = useState<ClassPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data, error } = await getDailySchedule(
          date,
          profile.semester_id,
          profile.id,
        );
        if (error) {
          toast.error(error);
          setPeriods([]);
        } else {
          setPeriods(data ?? []);
        }
      } catch {
        toast.error("Failed to load schedule");
        setPeriods([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [date, profile.semester_id, profile.id]);

  function handleDateChange(newDate: string) {
    setDate(newDate);
    router.push(`/daily-attendance?date=${newDate}`, { scroll: false });
  }

  function handleStatusChange(
    sessionId: string,
    status: "present" | "absent" | "cancelled" | null,
  ) {
    // Optimistic update
    setPeriods((prev) =>
      prev.map((p) =>
        p.sessionId === sessionId ? { ...p, attendanceStatus: status } : p,
      ),
    );

    startTransition(async () => {
      try {
        if (status === null) {
          const { error } = await clearAttendance(sessionId, profile.id);
          if (error) {
            toast.error(error);
            // Revert
            setPeriods((prev) =>
              prev.map((p) =>
                p.sessionId === sessionId
                  ? { ...p, attendanceStatus: null }
                  : p,
              ),
            );
          }
        } else {
          const { error } = await markAttendance(sessionId, profile.id, status);
          if (error) {
            toast.error(error);
            // Revert
            setPeriods((prev) =>
              prev.map((p) =>
                p.sessionId === sessionId
                  ? { ...p, attendanceStatus: null }
                  : p,
              ),
            );
          }
        }
      } catch {
        toast.error("Something went wrong");
      }
    });
  }

  const semesterStart = profile.academic_sessions?.start_date ?? "";
  const semesterEnd = profile.academic_sessions?.end_date ?? "";

  return (
    <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Date Navigator */}
        <DateNavigator
          date={date}
          onDateChange={handleDateChange}
          semesterStart={semesterStart}
          semesterEnd={semesterEnd}
        />

        {/* Schedule */}
        <ScheduleTimeline
          periods={periods}
          loading={loading}
          date={date}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
