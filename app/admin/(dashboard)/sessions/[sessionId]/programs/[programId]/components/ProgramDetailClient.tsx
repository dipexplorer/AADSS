"use client";

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createSemester, deleteSemester, updateSemester } from "@/lib/admin/actions";
import { EntityCard } from "@/components/admin/EntityCard";
import { DangerZoneModal } from "@/components/admin/DangerZoneModal";
import { Button } from "@/components/ui/button";

interface Props {
  program: any;
  semesters: any[];
  sessionId: string;
}

export default function ProgramDetailClient({ program, semesters, sessionId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Create Form State
  const [semesterNumber, setSemesterNumber] = useState<number | "">("");

  // Delete State
  const [deletingSemester, setDeletingSemester] = useState<any>(null);

  // Edit State
  const [editingSemester, setEditingSemester] = useState<any>(null);
  const [editSemesterNumber, setEditSemesterNumber] = useState<number | "">("");

  function handleCreateSemester() {
    if (!semesterNumber) {
      toast.error("Semester number required");
      return;
    }
    startTransition(async () => {
      const res = await createSemester(program.id, Number(semesterNumber));
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Semester created");
        setSemesterNumber("");
      }
    });
  }

  function handleUpdateSemester() {
    if (!editSemesterNumber) {
      toast.error("Semester number required");
      return;
    }
    startTransition(async () => {
      const res = await updateSemester(editingSemester.id, { semester_number: Number(editSemesterNumber) });
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Semester updated");
        setEditingSemester(null);
      }
    });
  }

  function handleDeleteConfirm() {
    if (!deletingSemester) return;
    startTransition(async () => {
      const res = await deleteSemester(deletingSemester.id);
      if (res?.error) toast.error("Cannot delete: Semester contains active subjects or failed relational check.");
      else {
        toast.success("Semester deleted");
        setDeletingSemester(null);
      }
    });
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Breadcrumbs & Header */}
      <div className="mb-6">
        <Link 
          href={`/admin/sessions/${sessionId}`} 
          className="text-sm text-muted-foreground hover:text-foreground flex items-center mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to {program.academic_sessions?.name || 'Session'}
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{program.name}</h1>
            <p className="text-muted-foreground mt-1">
              Manage semesters for this program.
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded bg-secondary text-secondary-foreground text-sm font-medium">
            {semesters.length} Semesters
          </span>
        </div>
      </div>

      {/* Create Section */}
      <div className="bg-card border border-border/50 rounded-xl p-5 mb-8 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-4">Add Semester to {program.name}</h2>
        <div className="flex gap-4 items-end max-w-sm">
          <div className="space-y-1.5 flex-1">
            <label className="text-xs font-medium text-muted-foreground">Semester Number</label>
            <input
              type="number"
              min={1}
              max={10}
              placeholder="e.g. 1"
              value={semesterNumber}
              onChange={(e) => setSemesterNumber(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button onClick={handleCreateSemester} disabled={isPending} className="bg-primary text-primary-foreground min-w-[120px]">
            {isPending ? "Creating..." : "Add Semester"}
          </Button>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {semesters.map((s) => (
          <EntityCard
            key={s.id}
            title={`Semester ${s.semester_number}`}
            status={s.status || "active"}
            countLabel={s.subjects_count === 1 ? "Subject" : "Subjects"}
            count={s.subjects_count}
            onClick={() => router.push(`/admin/subjects`)}
            onEdit={() => {
              setEditingSemester(s);
              setEditSemesterNumber(s.semester_number);
            }}
            onDelete={() => setDeletingSemester(s)}
          />
        ))}
        {semesters.length === 0 && (
          <div className="col-span-full py-12 text-center bg-muted/20 border border-dashed rounded-xl">
            <p className="text-muted-foreground">No semesters found in this program.</p>
          </div>
        )}
      </div>

      <DangerZoneModal
        isOpen={!!deletingSemester}
        onClose={() => setDeletingSemester(null)}
        onConfirm={handleDeleteConfirm}
        entityName={`Semester ${deletingSemester?.semester_number || ""}`}
        entityType="Semester"
        warningText="Deleting this semester will permanently wipe it. However, if this semester contains active subjects, deletion will be blocked by system safeguards."
        isPending={isPending}
      />

      {/* Edit Modal */}
      {editingSemester && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl border border-border/50 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Edit Semester</h2>
              <div className="space-y-4 mb-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Semester Number</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editSemesterNumber}
                    onChange={(e) => setEditSemesterNumber(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setEditingSemester(null)} disabled={isPending}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateSemester} disabled={isPending}>
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
