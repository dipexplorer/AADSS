export function calculateClassesNeeded(
  totalClasses: number,
  presentClasses: number,
  requiredPercentage: number = 75,
): number {
  const currentPercentage =
    totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

  if (currentPercentage >= requiredPercentage) return 0;

  if (totalClasses === 0) return 0;

  const r = requiredPercentage / 100;
  const needed = (r * totalClasses - presentClasses) / (1 - r);
  return Math.max(0, Math.ceil(needed));
}
