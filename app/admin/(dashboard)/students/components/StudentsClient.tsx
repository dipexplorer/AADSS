"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Users,
} from "lucide-react";

interface StudentProps {
  students: any[];
}

function getRiskStatus(pct: number, hasData: boolean): "safe" | "warning" | "critical" | "pending" {
  if (!hasData) return "pending";
  if (pct >= 75) return "safe";
  if (pct >= 65) return "warning";
  return "critical";
}

export default function StudentsClient({ students }: StudentProps) {
  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const studentsWithMeta = useMemo(() => {
    return students.map((s) => {
      const { present, total } = s.attendance_metrics;
      const hasData = total > 0;
      const pct = hasData ? Math.round((present / total) * 100) : 0;
      const riskStatus = getRiskStatus(pct, hasData);
      return { ...s, pct, riskStatus };
    });
  }, [students]);

  const filtered = useMemo(() => {
    return studentsWithMeta.filter((s) => {
      const idMatch = s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.user_id?.toLowerCase().includes(search.toLowerCase());
      const riskMatch = filterRisk === "all" || s.riskStatus === filterRisk;
      return idMatch && riskMatch;
    });
  }, [studentsWithMeta, search, filterRisk]);

  const kpi = {
    total: studentsWithMeta.length,
    safe: studentsWithMeta.filter((s) => s.riskStatus === "safe").length,
    warning: studentsWithMeta.filter((s) => s.riskStatus === "warning").length,
    critical: studentsWithMeta.filter((s) => s.riskStatus === "critical").length,
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Students Roster
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {kpi.total} enrolled — live attendance monitoring
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-xl bg-card shadow-sm flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Enrolled</p>
            <p className="text-xl font-bold">{kpi.total}</p>
          </div>
        </div>

        <div className="p-4 border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-950/20 rounded-xl shadow-sm flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-green-700/70 dark:text-green-400/70 uppercase tracking-wide">Safe</p>
            <p className="text-xl font-bold text-green-700 dark:text-green-400">{kpi.safe}</p>
          </div>
        </div>

        <div className="p-4 border border-yellow-200 dark:border-yellow-900/40 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl shadow-sm flex items-center gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-yellow-700/70 dark:text-yellow-400/70 uppercase tracking-wide">Warning</p>
            <p className="text-xl font-bold text-yellow-700 dark:text-yellow-400">{kpi.warning}</p>
          </div>
        </div>

        <div className="p-4 border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 rounded-xl shadow-sm flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-red-700/70 dark:text-red-400/70 uppercase tracking-wide">Critical</p>
            <p className="text-xl font-bold text-red-700 dark:text-red-400">{kpi.critical}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by profile ID or user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="pl-9 pr-8 py-2 border rounded-lg bg-card text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="safe">Safe (≥75%)</option>
            <option value="warning">Warning (65–74%)</option>
            <option value="critical">Critical (&lt;65%)</option>
            <option value="pending">No Attendance Data</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 border-b text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3 w-8"></th>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Program</th>
                <th className="px-5 py-3">Semester</th>
                <th className="px-5 py-3">Session</th>
                <th className="px-5 py-3 w-[220px]">Attendance</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground text-sm">
                    {kpi.total === 0 ? "No students enrolled yet." : "No students match your filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <StudentRow
                    key={s.id}
                    student={s}
                    isExpanded={expandedId === s.id}
                    onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentRow({
  student: s,
  isExpanded,
  onToggle,
}: {
  student: any;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { present, total } = s.attendance_metrics;

  const barColor =
    s.riskStatus === "safe" ? "bg-green-500" :
    s.riskStatus === "warning" ? "bg-yellow-500" :
    s.riskStatus === "critical" ? "bg-red-500" : "bg-muted-foreground/30";

  const badge =
    s.riskStatus === "safe" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
    s.riskStatus === "warning" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
    s.riskStatus === "critical" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
    "bg-muted text-muted-foreground";

  return (
    <>
      <tr className={`hover:bg-muted/10 transition-colors ${isExpanded ? "bg-muted/5" : ""}`}>
        <td className="px-5 py-3">
          <button
            onClick={onToggle}
            className="w-6 h-6 flex items-center justify-center border rounded hover:bg-muted transition-colors text-muted-foreground"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </td>

        <td className="px-5 py-3">
          <div>
            <p className="font-medium text-foreground text-sm">
              {s.user_info?.full_name || s.user_info?.email?.split("@")[0] || "Unknown User"}
            </p>
            {s.user_info?.email && (
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{s.user_info.email}</p>
            )}
          </div>
        </td>

        <td className="px-5 py-3 font-medium text-foreground text-sm">
          {(s.programs as any)?.name ?? "—"}
        </td>

        <td className="px-5 py-3 text-sm text-foreground">
          Sem {(s.semesters as any)?.semester_number ?? "—"}
        </td>

        <td className="px-5 py-3 text-sm text-muted-foreground">
          {(s.academic_sessions as any)?.name ?? "—"}
        </td>

        <td className="px-5 py-3">
          <div className="flex items-center justify-between text-xs mb-1 font-medium">
            <span>{s.riskStatus === "pending" ? "N/A" : `${s.pct}%`}</span>
            <span className="text-muted-foreground">{present} / {total}</span>
          </div>
          <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
            <div
              style={{ width: `${s.riskStatus === "pending" ? 0 : s.pct}%` }}
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            />
          </div>
        </td>

        <td className="px-5 py-3 text-center">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${badge}`}>
            {s.riskStatus === "safe" && <ShieldCheck className="w-3 h-3" />}
            {s.riskStatus === "warning" && <AlertTriangle className="w-3 h-3" />}
            {s.riskStatus === "critical" && <ShieldAlert className="w-3 h-3" />}
            {s.riskStatus === "pending" ? "No Data" : s.riskStatus}
          </span>
        </td>

        <td className="px-5 py-3 text-xs text-muted-foreground">
          {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
        </td>
      </tr>

      {/* Expanded: show real breakdown info */}
      {isExpanded && (
        <tr>
          <td colSpan={8} className="p-0 border-b bg-muted/5">
            <div className="px-6 py-4 text-sm text-muted-foreground space-y-1">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Breakdown</p>
              {s.user_info?.email && <p><span className="text-foreground font-medium">Email:</span> {s.user_info.email}</p>}
              <p><span className="text-foreground font-medium">Profile ID:</span> <span className="font-mono text-xs">{s.id}</span></p>
              <p><span className="text-foreground font-medium">User ID:</span> <span className="font-mono text-xs">{s.user_id}</span></p>
              <p><span className="text-foreground font-medium">Classes Present:</span> {present}</p>
              <p><span className="text-foreground font-medium">Total Classes:</span> {total}</p>
              <p><span className="text-foreground font-medium">Attendance:</span> {s.riskStatus === "pending" ? "No data recorded" : `${s.pct}%`}</p>
              <p><span className="text-foreground font-medium">Enrolled On:</span> {s.created_at ? new Date(s.created_at).toLocaleString() : "—"}</p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
