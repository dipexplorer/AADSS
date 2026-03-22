// lib/engines/validation/validateGeofence.ts

import type { GeoLocation, ValidationResult } from "./types";

/**
 * Haversine Formula:
 * Earth ki curved surface pe do points ke beech
 * ka straight-line distance calculate karta hai.
 *
 * Formula:
 *   a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
 *   c = 2 × atan2(√a, √(1−a))
 *   d = R × c  (R = 6371000 meters)
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Checks if student is within allowed_radius of classroom.
 *
 * Note: GPS accuracy bhi consider karta hai —
 * agar accuracy bahut poor hai (>100m) toh
 * student ko pass karte hain (benefit of doubt)
 * but server-side log karta hai.
 */
export function validateGeofence(
  studentLocation: GeoLocation,
  classroomLat: number,
  classroomLon: number,
  allowedRadius: number, // meters
): ValidationResult {
  // Agar GPS accuracy bahut kharab hai → soft pass
  // (100m se zyada inaccurate GPS pe strict enforcement nahi)
  if (studentLocation.accuracy > 100) {
    console.warn(
      `[Geofence] Poor GPS accuracy: ${studentLocation.accuracy}m — soft pass`,
    );
    return { valid: true };
  }

  const distance = haversineDistance(
    studentLocation.latitude,
    studentLocation.longitude,
    classroomLat,
    classroomLon,
  );

  // Effective radius = allowed_radius + GPS accuracy buffer
  const effectiveRadius = allowedRadius + studentLocation.accuracy;

  if (distance > effectiveRadius) {
    return {
      valid: false,
      error: "OUTSIDE_GEOFENCE",
    };
  }

  return { valid: true };
}
