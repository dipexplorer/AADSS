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
 * Student self-mark flow (PRESENT only):
 *
 * 1. Validate status — students can ONLY mark "present". Any other status is rejected.
 * 2. Session details fetch (start_time, date, status, lat/lon, radius)
 * 3. Session status check — reject if session is cancelled
 * 4. Existing attendance check (duplicate guard)
 * 5. Time window validate (10 min rule)
 * 6. Geo-fence validate (if classroom coordinates exist)
 * 7. Upsert attendance with lat/lon
 *
 * absent / cancelled are ONLY set by the system or admin via dedicated functions.
 */
export async function markAttendance(
  sessionId: string,
  studentProfileId: string,
  status: "present",
  location?: GeoLocation,
  deviceFingerprint?: string
): Promise<MarkAttendanceResult> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Authentication failed. Please log in again.", validationError: "AUTH_ERROR" };
  }

  // ── Guard: Device Fingerprint Verification ────────────────────────
  if (user.user_metadata?.device_id && user.user_metadata.device_id !== deviceFingerprint) {
    return {
      error: "Proxy Detected: You must use your registered primary attendance device.",
      validationError: "PROXY_DETECTED",
    };
  }

  // ── Guard: Students can ONLY mark themselves present ──────────────
  // absent / cancelled are system/admin responsibilities.
  if (status !== "present") {
    return {
      error: "You can only mark yourself as present.",
      validationError: "INVALID_STATUS",
    };
  }

  // ── 1. Session details fetch ──────────────────────────────────────
  const { data: session, error: sessionError } = await supabase
    .from("class_sessions")
    .select(
      `
      id,
      date,
      start_time,
      status,
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

  // ── 2. Session status check ───────────────────────────────────────
  // If the class was cancelled by admin, attendance cannot be marked.
  if (session.status === "cancelled") {
    return {
      error: "This class has been cancelled. Attendance cannot be marked.",
      validationError: "SESSION_CANCELLED",
    };
  }

  if (session.status === "completed") {
    return {
      error:
        "This class has already ended. The attendance window is closed.",
      validationError: "SESSION_COMPLETED",
    };
  }

  // ── 3. Duplicate check ────────────────────────────────────────────
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
      error: "You have already marked attendance for this class.",
      validationError: duplicateCheck.error,
    };
  }

  // ── 4. Time window validation ─────────────────────────────────────
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

  // ── 5. Geo-fence validation (only if classroom has coordinates) ────
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

  // ── 6. All checks passed — upsert ─────────────────────────────────
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
