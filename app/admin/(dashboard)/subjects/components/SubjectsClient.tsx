"use client";

import { useState, useMemo, useTransition } from "react";
import { toast } from "react-hot-toast";
import {
  createSubject,
  deleteSubject,
  updateSubject,
} from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { DangerZoneModal } from "@/components/admin/DangerZoneModal";
import { SubjectFormModal } from "@/components/admin/SubjectFormModal";
import { SubjectsDataTable } from "@/components/admin/SubjectsDataTable";

interface Props {
  sessions: any[];
  programs: any[];
  semesters: any[];
  subjects: any[];
}

export default function SubjectsClient({
  sessions,
  programs,
  semesters,
  subjects,
}: Props) {
  const [isPending, startTransition] = useTransition();

  // Context Filters State
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    sessions[0]?.id || "",
  );
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [deletingSubject, setDeletingSubject] = useState<any>(null);

  // Derived lists for dropdowns based on selections
  const filteredPrograms = useMemo(() => {
    if (!selectedSessionId) return [];
    return programs.filter((p) => p.session_id === selectedSessionId);
  }, [programs, selectedSessionId]);

  const filteredSemesters = useMemo(() => {
    if (!selectedProgramId) return [];
    return semesters.filter((s) => s.program_id === selectedProgramId);
  }, [semesters, selectedProgramId]);

  // If a session changes, reset lower selections if invalid
  useMemo(() => {
    if (
      selectedSessionId &&
      !filteredPrograms.find((p) => p.id === selectedProgramId)
    ) {
      setSelectedProgramId("");
      setSelectedSemesterId("");
    }
  }, [selectedSessionId, filteredPrograms, selectedProgramId]);

  useMemo(() => {
    if (
      selectedProgramId &&
      !filteredSemesters.find((s) => s.id === selectedSemesterId)
    ) {
      setSelectedSemesterId("");
    }
  }, [selectedProgramId, filteredSemesters, selectedSemesterId]);

  // Derived subjects to display in table
  const displayedSubjects = useMemo(() => {
    let filtered = subjects;
    if (selectedSemesterId) {
      filtered = filtered.filter((s) => s.semester_id === selectedSemesterId);
    } else if (selectedProgramId) {
      filtered = filtered.filter((s) => {
        const progId = s.semesters?.program_id;
        return progId === selectedProgramId;
      });
    } else if (selectedSessionId) {
      filtered = filtered.filter((s) => {
        const sessId = s.semesters?.programs?.session_id;
        return sessId === selectedSessionId;
      });
    }
    return filtered;
  }, [subjects, selectedSessionId, selectedProgramId, selectedSemesterId]);

  // Handlers
  function handleSaveSubject(data: any) {
    startTransition(async () => {
      // Create or Update depending on `editingSubject`
      if (editingSubject) {
        // Assume updateSubject exists in actions.ts and accepts id + partial data
        const res = await updateSubject(editingSubject.id, {
          name: data.name,
          code: data.code,
          credits: data.credits,
          min_attendance_required: data.min_attendance_required,
        });
        if (res?.error) toast.error(res.error);
        else {
          toast.success("Subject updated");
          setIsFormOpen(false);
          setEditingSubject(null);
        }
      } else {
        // Needs a semester_id to create
        if (!selectedSemesterId && !data.semester_id) {
          toast.error(
            "Please select a semester context below to add a subject to it.",
          );
          return;
        }
        const res = await createSubject(
          data.semester_id || selectedSemesterId,
          data.name,
          data.code,
          data.credits,
          data.min_attendance_required,
        );
        if (res?.error) toast.error(res.error);
        else {
          toast.success("Subject created");
          setIsFormOpen(false);
        }
      }
    });
  }

  function handleDeleteConfirm() {
    if (!deletingSubject) return;
    startTransition(async () => {
      const res = await deleteSubject(deletingSubject.id);
      if (res?.error)
        toast.error("Cannot delete: Subnet contains dependent records.");
      else {
        toast.success("Subject deleted successfully");
        setDeletingSubject(null);
      }
    });
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Academic Subjects
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage subjects, credits, and minimum attendance thresholds.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            className="bg-primary text-primary-foreground"
            onClick={() => {
              setEditingSubject(null);
              setIsFormOpen(true);
            }}
          >
            Create Subject
          </Button>
        </div>
      </div>

      {/* Context Filters */}
      <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Hierarchical Context Filter
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Session
            </label>
            <select
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
            >
              <option value="">All Sessions</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.status === "active" ? "(Active)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Program
            </label>
            <select
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              disabled={!selectedSessionId}
            >
              <option value="">
                {selectedSessionId ? "All Programs" : "Select a Session first"}
              </option>
              {filteredPrograms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Semester
            </label>
            <select
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              disabled={!selectedProgramId}
            >
              <option value="">
                {selectedProgramId ? "All Semesters" : "Select a Program first"}
              </option>
              {filteredSemesters.map((s) => (
                <option key={s.id} value={s.id}>
                  Semester {s.semester_number}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <SubjectsDataTable
        data={displayedSubjects}
        onEdit={(subj: any) => {
          setEditingSubject(subj);
          setIsFormOpen(true);
        }}
        onDelete={(subj: any) => setDeletingSubject(subj)}
      />

      {/* Modals */}
      {isFormOpen && (
        <SubjectFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSaveSubject}
          initialData={editingSubject}
          semestersContext={filteredSemesters}
          selectedSemesterId={selectedSemesterId} // prefill
          isPending={isPending}
        />
      )}

      <DangerZoneModal
        isOpen={!!deletingSubject}
        onClose={() => setDeletingSubject(null)}
        onConfirm={handleDeleteConfirm}
        entityName={deletingSubject?.name || deletingSubject?.code || ""}
        entityType="Subject"
        warningText="Deleting this subject will remove all associated timetable slots and attendance records."
        isPending={isPending}
      />
    </div>
  );
}
