// lib/engines/validation/validateAttendanceTiming.ts

import type { ValidationResult } from "./types";

/**
 * Rule: Present sirf tab mark ho sakta hai jab
 * current time >= class_start_time AND
 * current time <= class_start_time + 10 minutes
 *
 * Example:
 *   Class 9:00 AM se start hoti hai
 *   Window: 9:00 AM - 9:10 AM
 *   9:11 AM pe mark karna → REJECTED
 */
export function validateAttendanceTiming(
  classDate: string, // YYYY-MM-DD
  classStartTime: string, // "HH:MM:SS" format
  windowMinutes: number = 10,
): ValidationResult {
  // Class ka exact start datetime banao
  const [hours, minutes, seconds] = classStartTime.split(":").map(Number);
  const classStart = new Date(`${classDate}T00:00:00`);
  classStart.setHours(hours, minutes, seconds ?? 0, 0);

  // Window end = start + windowMinutes
  const windowEnd = new Date(classStart.getTime() + windowMinutes * 60 * 1000);

  const now = new Date();

  if (now < classStart) {
    return {
      valid: false,
      error: "TOO_EARLY",
    };
  }

  if (now > windowEnd) {
    return {
      valid: false,
      error: "TIME_WINDOW_EXPIRED",
    };
  }

  return { valid: true };
}
