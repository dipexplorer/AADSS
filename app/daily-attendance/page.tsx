// app/daily-attendance/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStudentProfile } from "@/lib/attendance/getStudentProfile";
import { Suspense } from "react";
import { getAnalyticsSummary } from "@/lib/engines/analytics/getAnalyticsSummary";
import DailyAttendanceClient from "@/app/daily-attendance/components/DailyAttendanceClient";
import Header from "@/components/common/Header";

export default async function DailyAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string, holiday?: string }>;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await getStudentProfile();
  if (!profile) redirect("/onboarding");

  const resolvedParams = await searchParams;
  const today = new Date();
  const dateStr =
    resolvedParams.date ??
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const sessionId = (profile.academic_sessions as any)?.id ?? "";
  const { data: analytics } = await getAnalyticsSummary(
    profile.semester_id,
    profile.id,
    sessionId
  );

  return (
    <>
      <Header />
      <Suspense fallback={<DailyAttendanceSkeleton />}>
        <DailyAttendanceClient 
          profile={profile} 
          initialDate={dateStr} 
          isHoliday={resolvedParams.holiday === 'true'} 
          subjects={analytics?.subjects ?? []}
        />
      </Suspense>
    </>
  );
}

function DailyAttendanceSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted/30 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
