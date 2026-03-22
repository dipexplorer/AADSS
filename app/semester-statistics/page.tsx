// app/semester-statistics/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStudentProfile } from "@/lib/attendance/getStudentProfile";
import { getSemesterStats } from "@/lib/attendance/getSemesterStats";
import SemesterStatisticsClient from "./components/SemesterStatisticsClient";
import Header from "@/components/common/Header";

export const metadata = {
  title: "Semester Statistics - Acadence",
};

export default async function SemesterStatisticsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await getStudentProfile();
  if (!profile) redirect("/onboarding");

  const { data: stats, error } = await getSemesterStats(
    profile.semester_id,
    profile.id,
  );

  return (
    <>
      <Header />
      <SemesterStatisticsClient
        stats={stats}
        error={error}
        programName={(profile.programs as any)?.name ?? ""}
        semesterNumber={(profile.semesters as any)?.semester_number ?? ""}
        sessionName={(profile.academic_sessions as any)?.name ?? ""}
      />
    </>
  );
}
