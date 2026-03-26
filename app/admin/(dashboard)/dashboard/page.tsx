import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  // Parallel stats fetch
  const [
    { count: studentCount },
    { count: sessionCount },
    { count: subjectCount },
    { count: classCount },
  ] = await Promise.all([
    supabase.from("student_profiles").select("*", { count: "exact", head: true }),
    supabase.from("academic_sessions").select("*", { count: "exact", head: true }),
    supabase.from("subjects").select("*", { count: "exact", head: true }),
    supabase.from("class_sessions")
      .select("*", { count: "exact", head: true })
      .gte("date", new Date().toISOString().split("T")[0]),
  ]);

  const stats = [
    { label: "Total Students", value: studentCount ?? 0, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/20" },
    { label: "Academic Sessions", value: sessionCount ?? 0, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/20" },
    { label: "Total Subjects", value: subjectCount ?? 0, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/20" },
    { label: "Upcoming Classes", value: classCount ?? 0, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/20" },
  ];

  const quickLinks = [
    { title: "Manage Timetable", desc: "Add or edit class schedules", href: "/admin/timetable" },
    { title: "Manage Subjects", desc: "Add subjects to semesters", href: "/admin/subjects" },
    { title: "View Students", desc: "See all enrolled students", href: "/admin/students" },
    { title: "Class Sessions", desc: "Cancel or reschedule classes", href: "/admin/classes" },
    { title: "Sessions & Programs", desc: "Academic structure setup", href: "/admin/sessions" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date().toLocaleDateString("en-US", { 
            weekday: "long", 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-xl p-5 ${stat.bg}`}>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-card border border-border/50 rounded-xl p-5 hover:shadow-md transition-all hover:border-primary/30 group"
          >
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}