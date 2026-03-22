// app/semester-statistics/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStudentProfile } from "@/lib/attendance/getStudentProfile";
import { getAnalyticsSummary } from "@/lib/engines/analytics/getAnalyticsSummary";
import Header from "@/components/common/Header";
import SemesterStatisticsClient from "./components/SemesterStatisticsClient";

export const metadata = { title: "Statistics — Acadence" };

export default async function SemesterStatisticsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await getStudentProfile();
  if (!profile) redirect("/onboarding");

  const sessionId = (profile.academic_sessions as any)?.id ?? "";

  const { data: analytics, error } = await getAnalyticsSummary(
    profile.semester_id,
    profile.id,
    sessionId,
  );

  return (
    <>
      <Header />
      <SemesterStatisticsClient
        analytics={analytics}
        error={error}
        programName={(profile.programs as any)?.name ?? ""}
        semesterNumber={(profile.semesters as any)?.semester_number ?? ""}
        sessionName={(profile.academic_sessions as any)?.name ?? ""}
      />
    </>
  );
}
