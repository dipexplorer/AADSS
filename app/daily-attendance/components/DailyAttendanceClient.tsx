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
import { getDeviceFingerprint } from "@/lib/fingerprint";

const NotesEditor = dynamic(
  () => import("@/app/daily-attendance/components/NotesEditor"),
  { ssr: false },
);

interface Profile {
  id: string;
  semester_id: string;
  academic_sessions: {
    start_date: string | null;
    end_date: string | null;
  } | null;
}

import { SubjectAnalytics } from "@/lib/engines/analytics/types";

interface Props {
  profile: Profile;
  initialDate: string;
  isHoliday?: boolean;
  subjects: SubjectAnalytics[];
}

export default function DailyAttendanceClient({
  profile,
  initialDate,
  isHoliday,
  subjects,
}: Props) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [periods, setPeriods] = useState<ClassPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Sync state with URL params during client-side navigation
  useEffect(() => {
    setDate(initialDate);
  }, [initialDate]);

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

  function handleMarkPresent(sessionId: string, status: "present") {
    // 1. First get location BEFORE server transition
    toast.loading("Acquiring GPS... Please wait", { id: "gps-toast" });

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.", {
        id: "gps-toast",
      });
      return; // Stop right here
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        toast.success("Location acquired! Processing...", { id: "gps-toast" });

        // Update UI optimistically ONLY after location grabbed easily
        setPeriods((prev) =>
          prev.map((p) =>
            p.sessionId === sessionId
              ? { ...p, attendanceStatus: "present" }
              : p,
          ),
        );

        const userLocation: GeoLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };

        startTransition(async () => {
          try {
            const deviceFingerprint = await getDeviceFingerprint();
            const result = await markAttendance(
              sessionId,
              profile.id,
              "present",
              userLocation,
              deviceFingerprint,
            );

            if (result.error) {
              toast.error(result.error); // E.g., "GPS signal very weak" or "You are too far"
              setPeriods((prev) =>
                prev.map((p) =>
                  p.sessionId === sessionId
                    ? { ...p, attendanceStatus: null }
                    : p,
                ),
              );
            } else {
              toast.success("Attendance strictly verified & marked Present ✓");
            }
          } catch {
            toast.error("Something went wrong on the server.");
            setPeriods((prev) =>
              prev.map((p) =>
                p.sessionId === sessionId
                  ? { ...p, attendanceStatus: null }
                  : p,
              ),
            );
          }
        });
      },
      (geoError) => {
        // Here we handle cases like user denying location permissions
        if (geoError.code === geoError.PERMISSION_DENIED) {
          toast.error(
            "Location Permission Denied! Attendance requires precise location.",
            { id: "gps-toast" },
          );
        } else {
          toast.error("Failed to acquire GPS. Please turn on location.", {
            id: "gps-toast",
          });
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }, // STRICT BROWSER TIMEOUT
    );
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

        {/* Holiday Banner / Schedule */}
        {isHoliday ? (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h2 className="text-xl font-bold text-amber-800 dark:text-amber-500 mb-2">
              Global Academic Holiday
            </h2>
            <p className="text-amber-700/80 dark:text-amber-600/80 text-sm max-w-md mx-auto">
              This date is marked as an institute holiday. No classes are
              scheduled and attendance will not be counted.
            </p>
          </div>
        ) : (
          <ScheduleTimeline
            periods={periods}
            loading={loading}
            date={date}
            onStatusChange={handleMarkPresent}
            subjects={subjects}
          />
        )}

        {/* Daily Notes Editor */}
        <NotesEditor profile={profile} date={date} />
      </div>
    </div>
  );
}
