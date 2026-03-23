// app/admin/students/page.tsx
import { createClient } from "@/lib/supabase/server";

export default async function AdminStudentsPage() {
  const supabase = createClient();

  const { data: students } = await supabase
    .from("student_profiles")
    .select(
      `
      id,
      created_at,
      academic_sessions(name),
      programs(name),
      semesters(semester_number)
    `,
    )
    .order("created_at", { ascending: false });

  // Get attendance counts per student
  const studentIds = (students ?? []).map((s) => s.id);
  let attendanceCounts: Record<string, { present: number; total: number }> = {};

  if (studentIds.length > 0) {
    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("student_id, status")
      .in("student_id", studentIds);

    (attendanceData ?? []).forEach((a) => {
      if (!attendanceCounts[a.student_id]) {
        attendanceCounts[a.student_id] = { present: 0, total: 0 };
      }
      attendanceCounts[a.student_id].total++;
      if (a.status === "present") attendanceCounts[a.student_id].present++;
    });
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        Students
        <span className="text-sm font-normal text-muted-foreground ml-3">
          {students?.length ?? 0} enrolled
        </span>
      </h1>

      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Profile ID
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Program
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Semester
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Session
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Attendance
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Enrolled
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {(students ?? []).map((s) => {
              const counts = attendanceCounts[s.id] ?? { present: 0, total: 0 };
              const pct =
                counts.total > 0
                  ? Math.round((counts.present / counts.total) * 100)
                  : 0;
              return (
                <tr key={s.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {s.id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {(s.programs as any)?.name}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    Sem {(s.semesters as any)?.semester_number}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {(s.academic_sessions as any)?.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold ${pct >= 75 ? "text-green-600" : pct >= 65 ? "text-yellow-600" : "text-red-600"}`}
                    >
                      {pct}%
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({counts.present}/{counts.total})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {s.created_at ? new Date(s.created_at).toLocaleDateString() : "N/A"}
                  </td>
                </tr>
              );
            })}
            {(students ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No students enrolled
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
