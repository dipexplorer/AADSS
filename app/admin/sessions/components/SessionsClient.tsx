// app/admin/sessions/components/SessionsClient.tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import {
  createSession,
  updateSession,
  deleteSession,
  createProgram,
  deleteProgram,
  createSemester,
  deleteSemester,
} from "@/lib/admin/actions";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
  sessions: any[];
  programs: any[];
  semesters: any[];
}

export default function SessionsClient({
  sessions,
  programs,
  semesters,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<
    "sessions" | "programs" | "semesters"
  >("sessions");

  // ── Session Form ──
  const [sessionForm, setSessionForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });

  function handleCreateSession() {
    if (!sessionForm.name || !sessionForm.start_date || !sessionForm.end_date) {
      toast.error("All fields required");
      return;
    }
    startTransition(async () => {
      const res = await createSession(sessionForm);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Session created");
        setSessionForm({ name: "", start_date: "", end_date: "" });
      }
    });
  }

  // ── Program Form ──
  const [programName, setProgramName] = useState("");

  function handleCreateProgram() {
    if (!programName.trim()) {
      toast.error("Program name required");
      return;
    }
    startTransition(async () => {
      const res = await createProgram(programName);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Program created");
        setProgramName("");
      }
    });
  }

  // ── Semester Form ──
  const [semesterForm, setSemesterForm] = useState({
    program_id: "",
    semester_number: "",
  });

  function handleCreateSemester() {
    if (!semesterForm.program_id || !semesterForm.semester_number) {
      toast.error("All fields required");
      return;
    }
    startTransition(async () => {
      const res = await createSemester(
        semesterForm.program_id,
        Number(semesterForm.semester_number),
      );
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Semester created");
        setSemesterForm({ program_id: "", semester_number: "" });
      }
    });
  }

  const tabs = ["sessions", "programs", "semesters"] as const;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        Sessions & Programs
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/30 p-1 rounded-lg w-fit mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sessions Tab */}
      {activeTab === "sessions" && (
        <div className="space-y-6">
          {/* Create form */}
          <div className="bg-card border border-border/50 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Create Academic Session
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                placeholder="Session name (e.g. 2025-2026)"
                value={sessionForm.name}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, name: e.target.value })
                }
                className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="date"
                value={sessionForm.start_date}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, start_date: e.target.value })
                }
                className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="date"
                value={sessionForm.end_date}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, end_date: e.target.value })
                }
                className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              onClick={handleCreateSession}
              disabled={isPending}
              className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              Create Session
            </button>
          </div>

          {/* List */}
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Start
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    End
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {s.start_date}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {s.end_date}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          startTransition(async () => {
                            if (!confirm("Delete this session?")) return;
                            const res = await deleteSession(s.id);
                            if (res?.error) toast.error(res.error);
                            else toast.success("Deleted");
                          })
                        }
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No sessions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Programs Tab */}
      {activeTab === "programs" && (
        <div className="space-y-6">
          <div className="bg-card border border-border/50 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Create Program
            </h2>
            <div className="flex gap-3">
              <input
                placeholder="Program name (e.g. B.Tech CSE)"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleCreateProgram}
                disabled={isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Program Name
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {programs.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {p.name}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          startTransition(async () => {
                            if (!confirm("Delete this program?")) return;
                            const res = await deleteProgram(p.id);
                            if (res?.error) toast.error(res.error);
                            else toast.success("Deleted");
                          })
                        }
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {programs.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No programs yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Semesters Tab */}
      {activeTab === "semesters" && (
        <div className="space-y-6">
          <div className="bg-card border border-border/50 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Create Semester
            </h2>
            <div className="flex gap-3">
              <select
                value={semesterForm.program_id}
                onChange={(e) =>
                  setSemesterForm({
                    ...semesterForm,
                    program_id: e.target.value,
                  })
                }
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select Program</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={8}
                placeholder="Sem No."
                value={semesterForm.semester_number}
                onChange={(e) =>
                  setSemesterForm({
                    ...semesterForm,
                    semester_number: e.target.value,
                  })
                }
                className="w-24 px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleCreateSemester}
                disabled={isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Program
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Semester
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {semesters.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 text-foreground">
                      {(s.programs as any)?.name}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      Semester {s.semester_number}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          startTransition(async () => {
                            if (!confirm("Delete?")) return;
                            const res = await deleteSemester(s.id);
                            if (res?.error) toast.error(res.error);
                            else toast.success("Deleted");
                          })
                        }
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {semesters.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No semesters yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
