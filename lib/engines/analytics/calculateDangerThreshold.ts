export interface DangerThreshold {
  subjectId: string;
  subjectName: string;
  currentPercentage: number;
  missesUntilDanger: number; // kitne aur miss karne pe 75% se neeche jaoge
}

/**
 * Yeh function sirf SAFE subjects ke liye kaam karta hai.
 *
 * Math:
 *   Agar X aur classes miss karo (total bhi X badhta hai):
 *   (present) / (total + X) < required/100
 *   present < required/100 × (total + X)
 *   present × 100 < required × (total + X)
 *   present × 100 - required × total < required × X
 *   X > (present × 100 - required × total) / required
 *
 *   Toh danger mein jaoge jab X > above value
 *   missesUntilDanger = ceil(above) — yeh woh point hai
 */
export function calculateDangerThreshold(
  subjectId: string,
  subjectName: string,
  totalClasses: number,
  presentClasses: number,
  requiredPercentage: number,
): DangerThreshold | null {
  const currentPercentage =
    totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  // Sirf safe subjects ke liye
  if (currentPercentage < requiredPercentage) return null;
  if (totalClasses === 0) return null;

  const r = requiredPercentage / 100;
  const missesUntilDanger = Math.ceil((presentClasses - r * totalClasses) / r);

  return {
    subjectId,
    subjectName,
    currentPercentage,
    missesUntilDanger: Math.max(0, missesUntilDanger),
  };
}
