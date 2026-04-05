// lib/fingerprint.ts
// Shared utility to generate a FingerprintJS-based unique device fingerprint.
// Used during onboarding (to lock the device) and at attendance time (to verify it).

import FingerprintJS from "@fingerprintjs/fingerprintjs";

let cachedVisitorId: string | null = null;

export async function getDeviceFingerprint(): Promise<string> {
  if (cachedVisitorId) return cachedVisitorId;

  const fp = await FingerprintJS.load();
  const result = await fp.get();
  cachedVisitorId = result.visitorId;
  return cachedVisitorId as string;
}
