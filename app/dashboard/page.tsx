import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStudentProfile } from "@/lib/attendance/getStudentProfile";
import { getAnalyticsSummary } from "@/lib/engines/analytics/getAnalyticsSummary";
import { getDailySchedule } from "@/lib/attendance/getDailySchedule";
import Header from "@/components/common/Header";
import DashboardClient from "./components/DashboardClient";

export const metadata = { title: "Home Dashboard — Acadence" };

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await getStudentProfile();

  if (!profile) redirect("/onboarding");

  const sessionId = (profile.academic_sessions as any)?.id ?? "";
  
  // 1. Fetch Analytics Summary (for tactical safe zone / general percentage)
  const { data: analytics, error: analyticsError } = await getAnalyticsSummary(
    profile.semester_id,
    profile.id,
    sessionId,
  );

  // 2. Fetch Today's Classes
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const { data: todaysClasses } = await getDailySchedule(
    dateStr,
    profile.semester_id,
    profile.id
  );

  // Calculate Skip Today Impact (Hypothetical skip of all unmarked classes today)
  let skipImpactPercentage = analytics?.overall.overallPercentage ?? 0;
  const unmarkedClassesToday = todaysClasses?.filter(c => !c.attendanceStatus).length ?? 0;
  
  // 3. Streak Calculation
  let streak = 0;
  try {
     const { data: recentAttendance } = await supabase
       .from("attendance")
       .select("status")
       .eq("student_id", profile.id)
       .order("marked_at", { ascending: false })
       .limit(20);
     
     if (recentAttendance) {
        for (const record of recentAttendance) {
           if (record.status === "present") streak++;
           else if (record.status === "absent") break; 
        }
     }
  } catch (e) { console.error(e); }

  const overallPercentage = analytics?.overall.overallPercentage ?? 0;
  
  let riskLevel = "Safe";
  if (overallPercentage < 75) riskLevel = "Critical";
  else if (overallPercentage < 80) riskLevel = "Warning";

  return (
    <>
      <Header />
      <DashboardClient 
        profile={profile}
        todaysClasses={todaysClasses ?? []}
        streak={streak}
        overallPercentage={overallPercentage}
        riskLevel={riskLevel}
        subjects={analytics?.subjects ?? []}
        unmarkedCount={unmarkedClassesToday}
        currentDate={dateStr}
      />
    </>
  );
}
