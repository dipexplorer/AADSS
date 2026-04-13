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

  // Filter students who have at least ONE shortfall for the Print Notice
  const printStudents = useMemo(() => {
    return groupedStudents.filter((s) => {
      return Object.values(s.subjects).some(
        (stats) => stats.actual < stats.required,
      );
    });
  }, [groupedStudents]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 print:p-0 print:m-0 print:max-w-none print:bg-white pb-20">
      {/* ── DASHBOARD-ONLY UI ── */}
      <div className="print:hidden space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-200 pb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Exam Eligibility & Attendance Dashboard
            </h1>
            <p className="text-sm text-zinc-500">
              Subject-wise Attendance Snapshot
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={!!error || groupedStudents.length === 0}
              className="gap-2 shadow-none border-zinc-300"
            >
              <Printer className="w-4 h-4" />
              Print Official Notice
            </Button>
            <Button
              onClick={handleExportCSV}
              disabled={!!error || groupedStudents.length === 0}
              className="gap-2 bg-zinc-900 border-zinc-900 text-white shadow-none hover:bg-zinc-800"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </Button>
          </div>
        </div>

        {/* SEMESTER STRIP */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {semesters.map((sem) => (
            <button
              key={sem.id}
              onClick={() =>
                router.push(`/admin/defaulters?semester=${sem.id}`)
              }
              className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-semibold border transition-none ${
                selectedSemesterId === sem.id
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"
              }`}
            >
              {sem.program_name} — S{sem.semester_number}
            </button>
          ))}
        </div>

        {error ? (
          <div className="p-12 mt-8 border border-red-200 bg-red-50/50 rounded-xl flex flex-col items-center justify-center text-center">
            <AlertOctagon className="w-8 h-8 text-red-500 mb-3" />
            <h3 className="text-lg font-semibold text-red-700">No Data Available</h3>
            <p className="text-sm text-red-600/80 mt-1">{error}</p>
          </div>
        ) : groupedStudents.length === 0 ? (
          <div className="p-12 mt-8 border border-zinc-200 bg-zinc-50/50 rounded-xl flex flex-col items-center justify-center text-center">
            <GraduationCap className="w-8 h-8 text-zinc-400 mb-3" />
            <h3 className="text-lg font-semibold text-zinc-700">No Candidates Found</h3>
            <p className="text-sm text-zinc-500 mt-1">Try adjusting your filters or changing the active semester.</p>
          </div>
        ) : (
          <>
            {/* FILTERS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search candidate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-zinc-400"
                />
              </div>
              <select
                value={selectedProgram}
                onChange={(e) => {
                  setSelectedProgram(e.target.value);
                  setSelectedSubject("All");
                }}
                className="px-3 py-2 border border-zinc-200 rounded-md text-sm bg-white outline-none"
              >
                <option value="All">All Programs</option>
                {uniquePrograms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-2 border border-zinc-200 rounded-md text-sm bg-white outline-none"
              >
                <option value="All">All Subjects</option>
                {uniqueSubjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* ── OFFICIAL ACADEMIC NOTICE (PRINT ONLY) ── */}
      <div
        className="hidden print:block text-black bg-white print:p-8"
        style={{ fontFamily: "sans-serif", lineHeight: "1.2" }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: "@page { size: auto; margin: 0mm; }",
          }}
        />

        <div className="text-center mb-3">
          <h2 className="text-sm font-normal mb-3">
            Attendance Eligibility Report
          </h2>

          <div className="text-xs text-left mb-2">
            <span>
              Program:{" "}
              {selectedProgram === "All"
                ? semesters.find((s) => s.id === selectedSemesterId)
                    ?.program_name
                : selectedProgram}
            </span>
            {selectedSubject !== "All" && (
              <span className="ml-4">Subject: {selectedSubject}</span>
            )}
          </div>
        </div>

        <table
          className="w-full text-center border-collapse"
          style={{ fontSize: "10px" }}
        >
          <thead>
            <tr className="border-b border-black">
              <th className="py-1 px-1 text-left w-8 font-normal">#</th>
              <th className="py-1 px-2 text-left font-normal">Student Name</th>
              {activeSubjectCols.map((col) => (
                <th key={col} className="py-1 px-1 font-normal">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {printStudents.length === 0 ? (
              <tr>
                <td colSpan={activeSubjectCols.length + 2} className="py-2">
                  No shortfalls reported.
                </td>
              </tr>
            ) : (
              printStudents.map((s, idx) => (
                <tr key={s.student_id}>
                  <td className="py-1 px-1 text-left">{idx + 1}</td>
                  <td className="py-1 px-2 text-left">{s.student_name}</td>
                  {activeSubjectCols.map((col) => {
                    const subj = s.subjects[col];
                    return (
                      <td key={col} className="py-1 px-1">
                        {subj ? `${subj.actual}%` : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── DASHBOARD TABLE (NON-PRINT) ── */}
      {!error && groupedStudents.length > 0 && (
        <div className="print:hidden bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                <tr>
                  <th className="px-3 py-3 font-bold border-r border-zinc-100 min-w-[150px]">
                    Candidate Profile
                  </th>
                  {activeSubjectCols.map((col) => (
                    <th
                      key={col}
                      className="px-1 py-3 text-center font-bold border-r border-zinc-100 last:border-r-0"
                    >
                      <div
                        className="truncate w-24 mx-auto text-[10px]"
                        title={col}
                      >
                        {col}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {groupedStudents.map((s) => (
                  <tr
                    key={s.student_id}
                    className="hover:bg-zinc-50 border-b border-zinc-100"
                  >
                    <td className="px-3 py-2 border-r border-zinc-100">
                      <div className="font-bold text-zinc-800 uppercase text-xs">
                        {s.student_name}
                      </div>
                      <div className="text-[9px] text-zinc-400">
                        {s.student_email}
                      </div>
                    </td>
                    {activeSubjectCols.map((col) => {
                      const subj = s.subjects[col];
                      const isShortfall = subj && subj.actual < subj.required;
                      return (
                        <td
                          key={col}
                          className="px-1 py-2 text-center border-r border-zinc-100 last:border-r-0"
                        >
                          {subj ? (
                            <div
                              className={`font-bold text-xs ${isShortfall ? "text-red-600 bg-red-50 rounded py-0.5" : "text-zinc-600"}`}
                            >
                              {subj.actual}%
                              <div className="text-[7px] opacity-50 font-normal">
                                Min: {subj.required}%
                              </div>
                            </div>
                          ) : (
                            <span className="text-zinc-200">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
