import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { 
  AlertCircle, 
  Calendar, 
  BookOpen, 
  Users, 
  GraduationCap,
  TrendingDown,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight
} from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  // Parallel basic stats fetch
  const [
    { count: studentCount },
    { count: sessionCount },
    { count: subjectCount },
    { count: classCount },
    { data: todayClasses }
  ] = await Promise.all([
    supabase.from("student_profiles").select("*", { count: "exact", head: true }),
    supabase.from("academic_sessions").select("*", { count: "exact", head: true }),
    supabase.from("subjects").select("*", { count: "exact", head: true }),
    supabase.from("class_sessions")
      .select("*", { count: "exact", head: true })
      .gte("date", new Date().toISOString().split("T")[0]),
    supabase.from("class_sessions")
      .select("id, status, start_time, end_time, subjects(name)")
      .eq("date", new Date().toISOString().split("T")[0])
      .limit(5)
  ]);

  // Mocked Insights for Decision Support
  const atRiskStudents = Math.floor((studentCount ?? 100) * 0.12); // 12% at risk
  const attendanceTrend = -2.4; // downward trend
  
  // Quick Actions mapped to existing or planned routes
  const quickActions = [
    { title: "Schedule Class", icon: Calendar, href: "/admin/classes", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    { title: "Add Subject", icon: BookOpen, href: "/admin/subjects", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
    { title: "Manage Users", icon: Users, href: "/admin/students", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { title: "Academic Setup", icon: GraduationCap, href: "/admin/sessions", color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString("en-US", { 
              weekday: "long", year: "numeric", month: "long", day: "numeric" 
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Future: Context Selector Dropdown (Session -> Program) */}
          <div className="bg-muted/50 px-4 py-2 rounded-lg border text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span>Active Session: 2026-2027</span>
          </div>
        </div>
      </div>

      {/* Section A: Critical Alerts */}
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start sm:items-center gap-4">
        <div className="bg-destructive/20 p-2 rounded-full shrink-0">
          <AlertCircle className="w-5 h-5 text-destructive" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-destructive dark:text-red-400">Critical Attention Required</h3>
          <p className="text-sm text-destructive/80 dark:text-red-300/80 mt-1">
            {atRiskStudents} students have dropped below the 75% attendance threshold this week. 
            3 subjects have incomplete timetable mappings.
          </p>
        </div>
        <Link href="/admin/students" className="hidden sm:block px-4 py-2 bg-destructive text-destructive-foreground text-sm font-medium rounded-lg hover:bg-destructive/90 transition-colors">
          Review Now
        </Link>
      </div>

      {/* Section B & C: KPI Metrics & Trends */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Metric 1: At-Risk */}
        <div className="bg-card border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-muted-foreground">At-Risk Students</p>
            <div className={`flex items-center text-xs font-semibold ${attendanceTrend < 0 ? 'text-destructive' : 'text-emerald-600'}`}>
              <TrendingDown className="w-3 h-3 mr-1" />
              {Math.abs(attendanceTrend)}%
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-foreground">{atRiskStudents}</h2>
            <span className="text-sm text-muted-foreground">/ {studentCount ?? 0} total</span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-destructive/20 group-hover:bg-destructive/40 transition-colors" />
        </div>

        {/* Metric 2: Today's Classes */}
        <div className="bg-card border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-muted-foreground">Classes Today</p>
            <div className="flex items-center text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              On Track
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-foreground">{classCount ?? 0}</h2>
            <span className="text-sm text-muted-foreground">scheduled</span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500/20 group-hover:bg-blue-500/40 transition-colors" />
        </div>

        {/* Metric 3: Active Subjects */}
        <div className="bg-card border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors relative overflow-hidden group">
          <p className="text-sm font-medium text-muted-foreground mb-4">Mappable Subjects</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-foreground">{subjectCount ?? 0}</h2>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500/20 group-hover:bg-purple-500/40 transition-colors" />
        </div>

        {/* Metric 4: Academic Sessions */}
        <div className="bg-card border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors relative overflow-hidden group">
          <p className="text-sm font-medium text-muted-foreground mb-4">Total Sessions</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-foreground">{sessionCount ?? 0}</h2>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500/20 group-hover:bg-amber-500/40 transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section D: Today's Pulse */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Today&apos;s Pulse</h2>
            <Link href="/admin/timetable" className="text-sm text-primary hover:underline flex items-center gap-1">
              View Full Timetable <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-card border rounded-xl shadow-sm divide-y">
            {todayClasses && todayClasses.length > 0 ? (
              todayClasses.map((cls, i) => (
                <div key={cls.id || i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{(cls.subjects as { name: string } | null)?.name || 'Regular Class'}</p>
                      <p className="text-sm text-muted-foreground">
                        {cls.start_time} - {cls.end_time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {cls.status || 'Scheduled'}
                    </span>
                    <button className="text-sm text-primary hover:underline">Manage</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="bg-muted p-4 rounded-full mb-3">
                  <BookOpen className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium">No classes scheduled today</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Enjoy the quiet day, or get ahead on planning the upcoming weeks.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section E: Quick Actions & Activity */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link 
                  key={action.title} 
                  href={action.href}
                  className="bg-card border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all group flex flex-col items-center text-center gap-3"
                >
                  <div className={`p-3 rounded-full ${action.color}`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* System Health / Data Completeness Hook */}
          <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" /> System Health
            </h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-foreground">Timetable Completeness</span>
                  <span className="text-muted-foreground">85%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                3 subjects in the active semester lack a scheduled faculty.
              </p>
              <Link href="/admin/timetable" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2">
                Fix Configuration <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}