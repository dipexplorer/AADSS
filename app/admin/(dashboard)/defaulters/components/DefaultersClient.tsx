"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DefaulterRecord, SemesterOption } from "@/lib/admin/defaulters";
import {
  Download,
  Search,
  AlertOctagon,
  Printer,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DefaultersClient({
  data,
  error,
  semesters,
  selectedSemesterId,
}: {
  data: DefaulterRecord[];
  error: string | null;
  semesters: SemesterOption[];
  selectedSemesterId: string;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedProgram, setSelectedProgram] = useState("All");

  const uniquePrograms = useMemo(
    () =>
      Array.from(
        new Set(
          data
            .filter((d) => d.program_name)
            .map((d) => `${d.program_name} - Sem ${d.semester_number}`),
        ),
      ),
    [data],
  );

  const uniqueSubjects = useMemo(() => {
    let contextData = data;
    if (selectedProgram !== "All") {
      contextData = data.filter(
        (d) =>
          `${d.program_name} - Sem ${d.semester_number}` === selectedProgram,
      );
    }
    return Array.from(
      new Set(contextData.map((d) => d.subject_name || "")),
    ).filter(Boolean);
  }, [data, selectedProgram]);

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

      const matchSubject =
        selectedSubject === "All" || subjectName === selectedSubject;
      const matchProgram =
        selectedProgram === "All" || progSemName === selectedProgram;

      return matchSearch && matchSubject && matchProgram;
    });
  }, [data, searchQuery, selectedSubject, selectedProgram]);

  // Pivot the data: Group by Student, creating dedicated columns for exact active subjects
  const { groupedStudents, activeSubjectCols } = useMemo(() => {
    const activeSubjectCols = Array.from(
      new Set(filteredData.map((d) => d.subject_name)),
    );

    const map = new Map<
      string,
      {
        student_id: string;
        student_name: string;
        student_email: string;
        program_name: string;
        semester_number: number;
        subjects: Record<
          string,
          { actual: number; required: number; deficit: string }
        >;
      }
    >();

    filteredData.forEach((d) => {
      if (!map.has(d.student_id)) {
        const fallBackName =
          d.student_name ||
          (d.student_email ? d.student_email.split("@")[0] : "Student");
        map.set(d.student_id, {
          student_id: d.student_id,
          student_name: fallBackName,
          student_email: d.student_email || "",
          program_name: d.program_name,
          semester_number: d.semester_number,
          subjects: {},
        });
      }

      const deficit = (d.min_required_percent - d.actual_percent).toFixed(1);
      map.get(d.student_id)!.subjects[d.subject_name] = {
        actual: d.actual_percent,
        required: d.min_required_percent,
        deficit,
      };
    });

    return {
      groupedStudents: Array.from(map.values()),
      activeSubjectCols,
    };
  }, [filteredData]);

  const handleExportCSV = () => {
    if (groupedStudents.length === 0) return;

    const headers = [
      "Student Name",
      "Email",
      "Program & Sem",
      ...activeSubjectCols,
    ];

    const rows = groupedStudents.map((s) => {
      const rowData = [
        `"${s.student_name}"`,
        `"${s.student_email}"`,
        `"${s.program_name} - Sem ${s.semester_number}"`,
      ];

      activeSubjectCols.forEach((col) => {
        const subj = s.subjects[col];
        if (subj) {
          rowData.push(`"-${subj.deficit}% (Act: ${subj.actual}%)"`);
        } else {
          rowData.push(`"SAFE / NA"`);
        }
      });
      return rowData;
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const filename = `Eligibility_Report_${new Date().toISOString().split("T")[0]}.csv`;
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
      {/* HEADER */}
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
          <Button
            onClick={handleExportCSV}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="print:hidden flex items-center gap-3 p-3 bg-muted/30 border border-border/50 rounded-xl">
        <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
          Semester Report:
        </span>
        <div className="flex flex-wrap gap-2">
          {semesters.map((sem) => (
            <button
              key={sem.id}
              onClick={() =>
                router.push(`/admin/defaulters?semester=${sem.id}`)
              }
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                selectedSemesterId === sem.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:bg-muted"
              }`}
            >
              {sem.program_name} — Sem {sem.semester_number}
            </button>
          ))}
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
          {uniquePrograms.map((prog) => (
            <option key={prog} value={prog}>
              {prog}
            </option>
          ))}
        </select>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm appearance-none"
        >
          <option value="All">All Subjects</option>
          {uniqueSubjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>

      {/* PRINT HEADER FOR PDF ONLY */}
      <div className="hidden print:flex flex-col items-center justify-center mb-8 text-center border-b pb-6 border-black mx-auto w-full max-w-4xl">
        {selectedProgram !== "All" && (
          <h3 className="text-xl font-bold text-black mb-1">
            Program: {selectedProgram.replace(" - Sem", " with semester")}
          </h3>
        )}
        {selectedSubject !== "All" && (
          <h3 className="text-lg font-bold text-gray-800">
            Subject: {selectedSubject}
          </h3>
        )}

        <p className="text-base font-semibold text-red-600 mt-4">
          Confidential: Candidate wise shortfall analysis
        </p>
      </div>

      {/* DYNAMIC PIPVOT TABLE */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none print:w-[90%] print:mx-auto">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-sm text-left print:text-center whitespace-nowrap">
            <thead className="bg-accent/50 text-muted-foreground font-medium border-b border-border print:bg-transparent print:border-b-2 print:border-black print:text-black">
              <tr>
                <th className="px-4 py-4 print:text-center sticky left-0 bg-card/90 backdrop-blur z-10 print:static print:bg-transparent border-r border-border/50">
                  Student Details
                </th>

                {/* Dynamically Generate Columns for EACH Subject */}
                {activeSubjectCols.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-center border-r border-border/50 last:border-r-0 min-w-[120px]"
                  >
                    <div className="font-semibold text-foreground print:text-black whitespace-normal line-clamp-2 leading-tight">
                      {col}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupedStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeSubjectCols.length + 2}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-green-100/50 dark:bg-green-900/20 p-3 rounded-full mb-3">
                        <AlertOctagon className="w-6 h-6 text-green-500" />
                      </div>
                      <p className="text-base font-medium text-foreground">
                        No Shortfalls Found!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        All tracked students meet their minimum attendance
                        thresholds.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                groupedStudents.map((s, idx) => (
                  <tr
                    key={s.student_id}
                    className="border-b border-border/50 hover:bg-accent/20 transition-colors group print:border-black/40"
                  >
                    {/* Student Identity */}
                    <td className="px-4 py-4 print:text-center sticky left-0 bg-card group-hover:bg-accent/20 z-10 print:static print:bg-transparent border-r border-border/50">
                      <div className="font-bold text-foreground print:text-black print:text-lg">
                        {s.student_name}
                      </div>
                      <div className="text-[11px] text-muted-foreground print:text-gray-600 print:text-sm">
                        {s.student_email}
                      </div>
                    </td>

                    {/* Dedicated Cells for each subject column */}
                    {activeSubjectCols.map((col) => {
                      const subj = s.subjects[col];
                      return (
                        <td
                          key={col}
                          className="px-4 py-4 text-center border-r border-border/50 last:border-r-0"
                        >
                          {subj ? (
                            <div className="flex flex-col items-center justify-center gap-1">
                              <span className="font-bold text-red-600 text-[15px] leading-none print:text-black print:text-base">
                                -{subj.deficit}%
                              </span>
                              <span className="text-[11px] text-muted-foreground font-medium print:hidden leading-none">
                                Act: {subj.actual}%
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground/30 print:text-gray-400">
                              -
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
