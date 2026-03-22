// lib/engines/analytics/calculateRiskScore.ts

import type { SubjectAnalytics } from "./types";

/**
 * Risk Score Logic:
 *
 * Safe   (0–30):  attendance >= requiredPercentage
 * Warning(31–69): attendance < required but >= 65%
 * Danger (70–100): attendance < 65%
 *
 * Score is proportional — jitna neeche, utna zyada score
 */
export function calculateRiskScore(
  attendancePercentage: number,
  requiredPercentage: number,
): {
  riskScore: number;
  riskLevel: "safe" | "warning" | "danger";
} {
  if (attendancePercentage >= requiredPercentage) {
    // Safe zone: 0–30
    // Jitna zyada attendance, utna kam risk
    const margin = attendancePercentage - requiredPercentage;
    const maxMargin = 100 - requiredPercentage;
    const riskScore = Math.round(30 * (1 - margin / maxMargin));
    return { riskScore: Math.max(0, riskScore), riskLevel: "safe" };
  }

  if (attendancePercentage >= 65) {
    // Warning zone: 31–69
    const range = requiredPercentage - 65;
    const gap = requiredPercentage - attendancePercentage;
    const riskScore = 31 + Math.round(38 * (gap / range));
    return { riskScore: Math.min(69, riskScore), riskLevel: "warning" };
  }

  // Danger zone: 70–100
  const riskScore = 70 + Math.round(30 * (1 - attendancePercentage / 65));
  return { riskScore: Math.min(100, riskScore), riskLevel: "danger" };
}

/**
 * riskLevel derive karne ka shortcut (score ke bina)
 */
export function getRiskLevel(
  attendancePercentage: number,
  requiredPercentage: number,
): "safe" | "warning" | "danger" {
  if (attendancePercentage >= requiredPercentage) return "safe";
  if (attendancePercentage >= 65) return "warning";
  return "danger";
}
