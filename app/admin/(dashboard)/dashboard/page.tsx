import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  AlertCircle,
  Calendar,
  BookOpen,
  Users,
  GraduationCap,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const todayStr = new Date().toLocaleDateString("en-CA");

  // Fetch active session and basic stats
  const [
    { data: activeSessions },
    { count: studentCount },
    { count: programCount },
    { count: subjectCount },
    { count: classCount },
    { data: todayClasses },
  ] = await Promise.all([
    // @ts-ignore - Suppressing TS error as types are out of sync with DB (status column exists)
    supabase
      .from("academic_sessions")
      .select("id, name, status")
      .order("start_date", { ascending: false }),
    supabase
      .from("student_profiles")
      .select("*", { count: "exact", head: true }),
    supabase.from("programs").select("*", { count: "exact", head: true }),
    supabase.from("subjects").select("*", { count: "exact", head: true }),
    supabase
      .from("class_sessions")
      .select("*", { count: "exact", head: true })
      .eq("date", todayStr)
      .neq("status", "cancelled"),
    supabase
      .from("class_sessions")
      .select(
        "id, status, start_time, end_time, subjects(name, semesters(semester_number, programs(name)))",
      )
      .eq("date", todayStr)
      .neq("status", "cancelled")
      .order("start_time"),
  ]);

  const currentSession =
    (activeSessions as any[])?.find((s) => s.status === "active") || (activeSessions as any[])?.[0];

  // Quick Actions
  const quickActions = [
    {
      title: "Manage Users",
      icon: Users,
      href: "/admin/students",
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    },
    {
      title: "Eligibility Report",
      icon: AlertCircle,
      href: "/admin/defaulters",
      color: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",
    },
    {
      title: "Schedule Classes",
      icon: Calendar,
      href: "/admin/classes",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    },
    {
      title: "Academic Setup",
      icon: BookOpen,
      href: "/admin/sessions",
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Premium Header & Context Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-2">
            <LayoutDashboard className="w-4 h-4" />
            <span>Admin Center</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Overview
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm flex items-center gap-2">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Global Context Selector */}
          <div className="bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-medium flex items-center gap-3 shadow-inner">
            <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-700 dark:text-zinc-300">
              Session:{" "}
              <span className="font-bold text-zinc-900 dark:text-white">
                {currentSession?.name || "Not Set"}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics - Premium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-16 h-16 text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
            Total Students
          </p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-50">
              {studentCount ?? 0}
            </h2>
            <span className="text-xs font-medium text-emerald-600 flex items-center mb-1 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> Active
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <GraduationCap className="w-16 h-16 text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
            Programs
          </p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-50">
              {programCount ?? 0}
            </h2>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen className="w-16 h-16 text-purple-600" />
          </div>
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
            Subjects Map
          </p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-50">
              {subjectCount ?? 0}
            </h2>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className="w-16 h-16 text-amber-500" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wider mb-2 text-emerald-600">
            Classes Today
          </p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-50">
              {classCount ?? 0}
            </h2>
            <span className="text-xs font-medium text-amber-600 flex items-center mb-1 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
              Scheduled
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Pulse */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Today's Pulse
            </h2>
            <Link
              href="/admin/classes"
              className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              View Tracking <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            {todayClasses && todayClasses.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {todayClasses.map((cls, i) => {
                  const subj = cls.subjects as any;
                  // Map statuses to clean UI tags
                  const statusColors: any = {
                    scheduled:
                      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                    completed:
                      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                  };
                  const colorClass =
                    statusColors[cls.status || ""] ||
                    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";

                  return (
                    <div
                      key={cls.id || i}
                      className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-xl shrink-0">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">
                            {subj?.name || "Class Session"}
                          </p>
                          <p className="text-xs font-medium text-zinc-500 mt-0.5 uppercase tracking-wide">
                            {subj?.semesters?.programs?.name} • Sem{" "}
                            {subj?.semesters?.semester_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 font-mono">
                            {cls.start_time.slice(0, 5)} -{" "}
                            {cls.end_time.slice(0, 5)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colorClass}`}
                        >
                          {cls.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="bg-zinc-100 dark:bg-zinc-900 p-5 rounded-full mb-4">
                  <Clock className="w-8 h-8 text-zinc-400" />
                </div>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  No classes scheduled
                </p>
                <p className="text-sm text-zinc-500 mt-1 max-w-sm">
                  There are no active classes for today in the current academic
                  session.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Center array */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Action Center
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-primary/50 hover:shadow-md transition-all group flex flex-col items-center text-center gap-3"
              >
                <div
                  className={`p-3.5 rounded-2xl ${action.color} group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 group-hover:text-primary transition-colors">
                  {action.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
