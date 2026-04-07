// app/semester-configuration/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStudentProfile } from "@/lib/attendance/getStudentProfile";
import Header from "@/components/common/Header";
import TimetableClient from "./TimetableClient";

export const metadata = { title: "My Timetable — Acadence" };

export default async function SemesterConfigurationPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await getStudentProfile();
  if (!profile) redirect("/onboarding");

  // Fetch timetable for this semester with subject code
  const { data: slots } = await supabase
    .from("timetable")
    .select("*, subjects(name, code)")
    .in(
      "subject_id",
      (
        await supabase
          .from("subjects")
          .select("id")
          .eq("semester_id", profile.semester_id)
      ).data?.map((s) => s.id) ?? [],
    )
    .order("day_of_week")
    .order("start_time");

  const programName = (profile.programs as any)?.name ?? "—";
  const semesterNumber = (profile.semesters as any)?.semester_number ?? "—";

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-8">
        <TimetableClient
          slots={(slots ?? []) as any}
          programName={programName}
          semesterNumber={semesterNumber}
        />
      </div>
    </>
  );
}
