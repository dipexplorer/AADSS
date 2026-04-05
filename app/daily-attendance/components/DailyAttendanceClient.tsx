// app/daily-attendance/components/DailyAttendanceClient.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getDailySchedule,
  ClassPeriod,
} from "@/lib/attendance/getDailySchedule";
import { markAttendance } from "@/lib/attendance/markAttendance";
import { toast } from "react-hot-toast";
import DateNavigator from "@/app/daily-attendance/components/DateNavigator";
import ScheduleTimeline from "@/app/daily-attendance/components/ScheduleTimeline";
import dynamic from "next/dynamic";
import type { GeoLocation } from "@/lib/engines/validation/types";

const NotesEditor = dynamic(
  () => import("@/app/daily-attendance/components/NotesEditor"),
  { ssr: false }
);

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

  /**
   * Students can only mark themselves PRESENT.
   * Absent and cancelled are handled by system/admin.
   * Location is fetched here for geo-fence validation.
   */
  function handleMarkPresent(sessionId: string, status: "present") {
    // Optimistic update
    setPeriods((prev) =>
      prev.map((p) =>
        p.sessionId === sessionId ? { ...p, attendanceStatus: "present" } : p,
      ),
    );

    startTransition(async () => {
      try {
        // Attempt to fetch GPS location (best effort)
        let userLocation: GeoLocation | undefined;
        try {
          userLocation = await new Promise<GeoLocation>((resolve, reject) => {
            if (!navigator.geolocation) {
              return reject(new Error("Geolocation not supported"));
            }
            navigator.geolocation.getCurrentPosition(
              (pos) =>
                resolve({
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  accuracy: pos.coords.accuracy,
                }),
              (err) => reject(err),
              { enableHighAccuracy: true, timeout: 10000 },
            );
          });
        } catch {
          // No location — server will decide if geo-fence is required
        }

        // Generate the device fingerprint (must match onboarding logic)
        const deviceFingerprint = btoa(navigator.userAgent + window.screen.width + "ACADENCE_SECURE_GEO");

        const result = await markAttendance(
          sessionId,
          profile.id,
          "present",
          userLocation,
          deviceFingerprint
        );

        if (result.error) {
          toast.error(result.error);
          // Revert optimistic update
          setPeriods((prev) =>
            prev.map((p) =>
              p.sessionId === sessionId
                ? { ...p, attendanceStatus: null }
                : p,
            ),
          );
        } else {
          toast.success("Attendance marked — Present ✓");
        }
      } catch {
        toast.error("Something went wrong");
        setPeriods((prev) =>
          prev.map((p) =>
            p.sessionId === sessionId ? { ...p, attendanceStatus: null } : p,
          ),
        );
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
          onStatusChange={handleMarkPresent}
        />

        {/* Daily Notes Editor */}
        <NotesEditor profile={profile} date={date} />
      </div>
    </div>
  );
}
