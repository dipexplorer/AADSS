// lib/engines/analytics/calculateRiskScore.ts

import type { SubjectAnalytics } from "./types";

/**
 * Risk Score Logic:
 *
 * Safe   (0–30):  attendance >= requiredPercentage
 * Warning(31–69): attendance < required but >= dangerLine
 * Danger (70–100): attendance < dangerLine
 *
 * dangerLine = requiredPercentage - 10 (minimum 0)
 * This ensures the warning zone is always valid even if
 * requiredPercentage is low (e.g. 60%).
 */
export function calculateRiskScore(
  attendancePercentage: number,
  requiredPercentage: number,
): {
  riskScore: number;
  riskLevel: "safe" | "warning" | "danger";
} {
  // Dynamic danger line — 10 percentage points below required
  const dangerLine = Math.max(0, requiredPercentage - 10);

  if (attendancePercentage >= requiredPercentage) {
    // Safe zone: 0–30
    const margin = attendancePercentage - requiredPercentage;
    const maxMargin = 100 - requiredPercentage;
    const riskScore =
      maxMargin > 0 ? Math.round(30 * (1 - margin / maxMargin)) : 0;
    return { riskScore: Math.max(0, riskScore), riskLevel: "safe" };
  }

  if (attendancePercentage >= dangerLine) {
    // Warning zone: 31–69
    const range = requiredPercentage - dangerLine;
    const gap = requiredPercentage - attendancePercentage;
    const riskScore =
      range > 0 ? 31 + Math.round(38 * (gap / range)) : 50;
    return { riskScore: Math.min(69, riskScore), riskLevel: "warning" };
  }

  // Danger zone: 70–100
  const riskScore =
    dangerLine > 0
      ? 70 + Math.round(30 * (1 - attendancePercentage / dangerLine))
      : 100;
  return { riskScore: Math.min(100, riskScore), riskLevel: "danger" };
}

/**
 * riskLevel derive karne ka shortcut (score ke bina)
 */
export function getRiskLevel(
  attendancePercentage: number,
  requiredPercentage: number,
): "safe" | "warning" | "danger" {
  const dangerLine = Math.max(0, requiredPercentage - 10);
  if (attendancePercentage >= requiredPercentage) return "safe";
  if (attendancePercentage >= dangerLine) return "warning";
  return "danger";
}
