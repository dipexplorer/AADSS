// lib/engines/validation/validateDuplicateMark.ts

import type { ValidationResult } from "./types";

/**
 * Yeh function check karta hai ki is session ke liye
 * student ne already present mark kiya hai ya nahi.
 *
 * Absent/cancelled pe duplicate check nahi hota —
 * woh override ho sakte hain.
 * Sirf "present" duplicate ban nahi sakta.
 */
export function validateDuplicateMark(
  existingStatus: "present" | "absent" | "cancelled" | null,
): ValidationResult {
  if (existingStatus === "present") {
    return {
      valid: false,
      error: "ALREADY_MARKED",
    };
  }
  return { valid: true };
}
