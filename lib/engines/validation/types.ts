// lib/engines/validation/types.ts

export interface ValidationResult {
  valid: boolean;
  error?: ValidationError;
}

export type ValidationError =
  | "TIME_WINDOW_EXPIRED" // 10 min window khatam
  | "OUTSIDE_GEOFENCE" // Location match nahi
  | "ALREADY_MARKED" // Duplicate
  | "LOCATION_UNAVAILABLE" // Browser ne location nahi diya
  | "SESSION_NOT_FOUND"; // Class session exist nahi karta

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number; // meters mein
}
