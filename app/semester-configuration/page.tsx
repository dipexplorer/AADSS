// app/semester-configuration/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStudentProfile } from "@/lib/attendance/getStudentProfile";
import Header from "@/components/common/Header";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const metadata = { title: "My Timetable — Acadence" };

export default async function SemesterConfigurationPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await getStudentProfile();
  if (!profile) redirect("/onboarding");

  // Fetch timetable for this semester
  const { data: slots } = await supabase
    .from("timetable")
    .select("*, subjects(name)")
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

  // Group by day (Mon-Sat only)
  const weekDays = [1, 2, 3, 4, 5, 6];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">My Timetable</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {(profile.programs as any)?.name} · Semester{" "}
              {(profile.semesters as any)?.semester_number}
            </p>
          </div>

          <div className="space-y-4">
            {weekDays.map((dayIdx) => {
              const daySlots = (slots ?? []).filter(
                (s) => s.day_of_week === dayIdx,
              );
              return (
                <div
                  key={dayIdx}
                  className="bg-card border border-border/50 rounded-xl overflow-hidden"
                >
                  <div
                    className={`px-4 py-2.5 border-b border-border/50 ${
                      dayIdx === 6
                        ? "bg-red-50 dark:bg-red-950/10"
                        : "bg-muted/30"
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold ${
                        dayIdx === 6
                          ? "text-red-600 dark:text-red-400"
                          : "text-foreground"
                      }`}
                    >
                      {DAYS[dayIdx]}
                    </span>
                  </div>

                  {daySlots.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-muted-foreground">
                      No classes
                    </p>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="px-4 py-3 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-medium text-foreground text-sm">
                              {(slot.subjects as any)?.name}
                            </span>
                            {slot.room && (
                              <span className="text-xs text-muted-foreground ml-2">
                                · {slot.room}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">
                            {slot.start_time?.slice(0, 5)} –{" "}
                            {slot.end_time?.slice(0, 5)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {(!slots || slots.length === 0) && (
            <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground">
                No timetable configured yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Contact your admin to set up the timetable.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
