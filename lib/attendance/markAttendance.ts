// lib/attendance/markAttendance.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { validateAttendanceTiming } from "@/lib/engines/validation/validateAttendanceTiming";
import { validateGeofence } from "@/lib/engines/validation/validateGeofence";
import { validateDuplicateMark } from "@/lib/engines/validation/validateDuplicateMark";
import type { GeoLocation } from "@/lib/engines/validation/types";

export interface MarkAttendanceResult {
  error: string | null;
  validationError?: string;
}

/**
 * Present mark karne ka flow:
 *
 * 1. Session details fetch (start_time, date, lat/lon, radius)
 * 2. Existing attendance check (duplicate guard)
 * 3. Time window validate (10 min rule)
 * 4. Geo-fence validate (agar classroom coordinates hain)
 * 5. Upsert attendance with lat/lon
 *
 * Absent/Cancelled ke liye: validations skip, direct upsert
 */
export async function markAttendance(
  sessionId: string,
  studentProfileId: string,
  status: "present" | "absent" | "cancelled",
  location?: GeoLocation,
): Promise<MarkAttendanceResult> {
  const supabase = createClient();

  // Absent/Cancelled — no validation needed
  if (status !== "present") {
    const { error } = await supabase.from("attendance").upsert(
      {
        class_session_id: sessionId,
        student_id: studentProfileId,
        status,
        marked_at: new Date().toISOString(),
      },
      { onConflict: "student_id,class_session_id" },
    );
    return { error: error?.message ?? null };
  }

  // ── Present mark flow ──────────────────────────────────────────

  // 1. Session details fetch
  const { data: session, error: sessionError } = await supabase
    .from("class_sessions")
    .select(
      `
      id,
      date,
      start_time,
      timetable (
        latitude,
        longitude,
        allowed_radius
      )
    `,
    )
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    return { error: "Session not found", validationError: "SESSION_NOT_FOUND" };
  }

  // 2. Existing attendance check
  const { data: existing } = await supabase
    .from("attendance")
    .select("status")
    .eq("class_session_id", sessionId)
    .eq("student_id", studentProfileId)
    .single();

  const duplicateCheck = validateDuplicateMark(
    existing?.status as "present" | "absent" | "cancelled" | null,
  );
  if (!duplicateCheck.valid) {
    return {
      error: "Already marked as present",
      validationError: duplicateCheck.error,
    };
  }

  // 3. Time window validation
  const timingCheck = validateAttendanceTiming(
    session.date,
    session.start_time,
    10, // 10 minute window
  );
  if (!timingCheck.valid) {
    const errorMessage =
      timingCheck.error === "TOO_EARLY"
        ? "Class has not started yet. You can mark attendance once the class begins."
        : "Attendance window has expired. You can only mark present within 10 minutes of class start.";
    return {
      error: errorMessage,
      validationError: timingCheck.error,
    };
  }

  // 4. Geo-fence validation (only if classroom has coordinates)
  const timetable = session.timetable as unknown as {
    latitude?: number;
    longitude?: number;
    allowed_radius?: number;
    room?: string;
  } | null;
  if (
    timetable?.latitude &&
    timetable?.longitude &&
    timetable?.allowed_radius
  ) {
    if (!location) {
      return {
        error: "Location required to mark attendance for this class.",
        validationError: "LOCATION_UNAVAILABLE",
      };
    }

    const geoCheck = validateGeofence(
      location,
      timetable.latitude,
      timetable.longitude,
      timetable.allowed_radius,
    );

    if (!geoCheck.valid) {
      return {
        error: "You are not within the classroom premises.",
        validationError: geoCheck.error,
      };
    }
  }

  // 5. All checks passed — upsert
  const { error } = await supabase.from("attendance").upsert(
    {
      class_session_id: sessionId,
      student_id: studentProfileId,
      status: "present",
      marked_at: new Date().toISOString(),
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
    },
    { onConflict: "student_id,class_session_id" },
  );

  return { error: error?.message ?? null };
}

export async function clearAttendance(
  sessionId: string,
  studentProfileId: string,
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("class_session_id", sessionId)
    .eq("student_id", studentProfileId);

  return { error: error?.message ?? null };
}
