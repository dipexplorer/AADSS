"use server";

import { getSubjectsWithStats } from "./getSubjectsWithStats";

export async function getOverallAttendanceStats(
  semesterId: string,
  studentProfileId: string,
) {
  const { data: subjects, error } = await getSubjectsWithStats(
    semesterId,
    studentProfileId,
  );

  if (error || !subjects) {
    return { percentage: 0, attended: 0, total: 0, error };
  }

  const totalClasses = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
  const attendedClasses = subjects.reduce(
    (sum, s) => sum + s.attendedClasses,
    0,
  );
  const percentage =
    totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

  return {
    percentage,
    attended: attendedClasses,
    total: totalClasses,
    error: null,
  };
}
