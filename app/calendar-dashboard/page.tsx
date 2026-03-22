// app/calendar-dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStudentProfile } from "@/lib/attendance/getStudentProfile";
import CalendarDashboardInteractive from "@/app/calendar-dashboard/components/CalendarDashboardInteractive";
import Header from "@/components/common/Header";

export default async function CalendarDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await getStudentProfile();

  if (!profile) redirect("/onboarding");

  return (
    <>
      <Header />
      <CalendarDashboardInteractive profile={profile as any} />
    </>
  );
}
