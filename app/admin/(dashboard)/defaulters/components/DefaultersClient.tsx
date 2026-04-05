"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DefaulterRecord } from "@/lib/admin/defaulters";
import {
  Download,
  Search,
  ExternalLink,
  AlertOctagon,
  Printer,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DefaultersClient({
  data,
  error,
}: {
  data: DefaulterRecord[];
  error: string | null;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedProgram, setSelectedProgram] = useState("All");

  const uniqueSubjects = useMemo(() => Array.from(new Set(data.map((d) => d.subject_name || ""))).filter(Boolean), [data]);
  const uniquePrograms = useMemo(() => Array.from(new Set(data.filter(d => d.program_name).map((d) => `${d.program_name} - Sem ${d.semester_number}`))), [data]);

  const filteredData = useMemo(() => {
    return data.filter((d) => {
      const studentName = d.student_name || "";
      const subjectName = d.subject_name || "";
      const progName = d.program_name || "";

      const matchSearch = 
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        progName.toLowerCase().includes(searchQuery.toLowerCase());
        
      const progSemName = `${progName} - Sem ${d.semester_number}`;
        
      const matchSubject = selectedSubject === "All" || subjectName === selectedSubject;
      const matchProgram = selectedProgram === "All" || progSemName === selectedProgram;

      return matchSearch && matchSubject && matchProgram;
    });
  }, [data, searchQuery, selectedSubject, selectedProgram]);

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    const headers = [
      "Student Name",
      "Email",
      "Current %",
    ];

    const rows = filteredData.map((d) => [
      `"${d.student_name || "Unknown"}"`,
      `"${d.student_email || ""}"`,
      d.actual_percent,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const filename = `Eligibility_Report${selectedSubject !== "All" ? `_${selectedSubject.replace(/\s+/g, '_')}` : ''}_${new Date().toISOString().split("T")[0]}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center text-red-500 font-medium">
        Error loading report: {error}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      {/* HEADER -> Using print:hidden to hide it in PDF prints */}
      <div className="print:hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-8 h-8 text-red-500" />
            Decision Support System
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Exam Eligibility & Shortfall Tracking
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Print PDF
          </Button>
          <Button onClick={handleExportCSV} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="print:hidden grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>

        <select 
          value={selectedProgram} 
          onChange={(e) => setSelectedProgram(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm appearance-none"
        >
          <option value="All">All Programs & Semesters</option>
          {uniquePrograms.map(prog => <option key={prog} value={prog}>{prog}</option>)}
        </select>

        <select 
          value={selectedSubject} 
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm appearance-none"
        >
          <option value="All">All Subjects</option>
          {uniqueSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
        </select>
      </div>

      {/* PRINT HEADER FOR PDF ONLY */}
      <div className="hidden print:flex flex-col items-center justify-center mb-10 text-center border-b pb-6 border-black">
        {selectedProgram !== "All" ? (
          <h2 className="text-3xl font-bold uppercase tracking-widest text-black mb-2">{selectedProgram}</h2>
        ) : (
          <h2 className="text-2xl font-bold uppercase tracking-widest text-black mb-2">Overal Attendance Report</h2>
        )}
        
        {selectedSubject !== "All" && (
          <h3 className="text-xl font-bold text-gray-800">Subject: {selectedSubject}</h3>
        )}
        
        <p className="text-base font-semibold text-red-600 mt-4">
          Confidential: List of candidates falling below mandated attendance threshold
        </p>
      </div>

      {/* DATA TABLE */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none print:w-[80%] print:mx-auto">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-sm text-left print:text-center">
            <thead className="bg-accent/50 text-muted-foreground font-medium border-b border-border print:bg-transparent print:border-b-2 print:border-black print:text-black">
              <tr>
                <th className="px-4 py-4 print:text-center">Student Details</th>
                <th className="px-4 py-3 print:hidden">Program / Sem</th>
                <th className="px-4 py-3 print:hidden">Subject Offending</th>
                <th className="px-4 py-3 text-center print:hidden">Required %</th>
                <th className="px-4 py-3 text-center">Actual %</th>
                <th className="px-4 py-3 text-right print:hidden">Deficit</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-green-100/50 dark:bg-green-900/20 p-3 rounded-full mb-3">
                        <AlertOctagon className="w-6 h-6 text-green-500" />
                      </div>
                      <p className="text-base font-medium text-foreground">No Shortfalls Found!</p>
                      <p className="text-sm text-muted-foreground">All tracked students meet their minimum attendance thresholds.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((d, idx) => {
                  const deficit = (d.min_required_percent - d.actual_percent).toFixed(1);
                  return (
                    <tr
                      key={`${d.student_id}-${d.subject_code}-${idx}`}
                      className="border-b border-border/50 hover:bg-accent/20 transition-colors group print:border-black/30"
                    >
                      <td className="px-4 py-4 print:text-center">
                        <div className="font-semibold text-foreground print:text-black print:text-base">{d.student_name}</div>
                        <div className="text-[11px] text-muted-foreground print:text-gray-600 print:text-sm">{d.student_email}</div>
                      </td>
                      <td className="px-4 py-3 print:hidden">
                        <div className="text-foreground shrink-0">{d.program_name}</div>
                        <div className="text-xs text-muted-foreground">Sem {d.semester_number}</div>
                      </td>
                      <td className="px-4 py-3 print:hidden">
                        <div className="text-foreground shrink-0">{d.subject_name}</div>
                        <div className="text-xs font-mono text-muted-foreground">{d.subject_code}</div>
                      </td>
                      <td className="px-4 py-3 text-center print:hidden">
                        <span className="font-medium">{d.min_required_percent}%</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 print:bg-transparent print:text-red-700 print:text-base print:font-bold">
                          {d.actual_percent}%
                        </span>
                        <div className="text-[10px] text-muted-foreground mt-0.5 print:hidden">
                          ({d.present_count}/{d.total_count})
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right print:hidden">
                        <span className="text-red-600 font-bold">
                          -{deficit}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
