"use client";

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createProgram, updateProgram, deleteProgram } from "@/lib/admin/actions";
import { EntityCard } from "@/components/admin/EntityCard";
import { DangerZoneModal } from "@/components/admin/DangerZoneModal";
import { Button } from "@/components/ui/button";

interface Props {
  session: any;
  programs: any[];
}

export default function SessionDetailClient({ session, programs }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Create Form State
  const [programName, setProgramName] = useState("");

  // Delete State
  const [deletingProgram, setDeletingProgram] = useState<any>(null);

  // Edit State
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [editProgramName, setEditProgramName] = useState("");

  function handleCreateProgram() {
    if (!programName.trim()) {
      toast.error("Program name required");
      return;
    }
    startTransition(async () => {
      // Assuming createProgram was updated in actions.ts to take session_id
      const res = await createProgram(programName, session.id); 
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Program created");
        setProgramName("");
      }
    });
  }

  function handleUpdateProgram() {
    if (!editProgramName.trim()) {
      toast.error("Program name required");
      return;
    }
    startTransition(async () => {
      const res = await updateProgram(editingProgram.id, editProgramName);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Program updated");
        setEditingProgram(null);
      }
    });
  }

  function handleDeleteConfirm() {
    if (!deletingProgram) return;
    startTransition(async () => {
      const res = await deleteProgram(deletingProgram.id);
      if (res?.error) toast.error("Cannot delete: Program contains active semesters or failed relational check.");
      else {
        toast.success("Program deleted successfully");
        setDeletingProgram(null);
      }
    });
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Breadcrumbs & Header */}
      <div className="mb-6">
        <Link href="/admin/sessions" className="text-sm text-muted-foreground hover:text-foreground flex items-center mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Sessions
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{session.name}</h1>
            <p className="text-muted-foreground mt-1">
              Academic Session from {session.start_date} to {session.end_date}
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded bg-secondary text-secondary-foreground text-sm font-medium">
            {programs.length} Programs
          </span>
        </div>
      </div>

      {/* Create Section */}
      <div className="bg-card border border-border/50 rounded-xl p-5 mb-8 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-4">Add Program to {session.name}</h2>
        <div className="flex gap-4 items-end">
          <div className="space-y-1.5 flex-1">
            <label className="text-xs font-medium text-muted-foreground">Program Name</label>
            <input
              placeholder="e.g. Master of Computer Applications"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button onClick={handleCreateProgram} disabled={isPending} className="bg-primary text-primary-foreground min-w-[120px]">
            {isPending ? "Creating..." : "Add Program"}
          </Button>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {programs.map((p) => (
          <EntityCard
            key={p.id}
            title={p.name}
            status={p.status || "active"}
            countLabel={p.semesters_count === 1 ? "Semester" : "Semesters"}
            count={p.semesters_count}
            onClick={() => router.push(`/admin/sessions/${session.id}/programs/${p.id}`)}
            onEdit={() => {
              setEditingProgram(p);
              setEditProgramName(p.name);
            }}
            onDelete={() => setDeletingProgram(p)}
          />
        ))}
        {programs.length === 0 && (
          <div className="col-span-full py-12 text-center bg-muted/20 border border-dashed rounded-xl">
            <p className="text-muted-foreground">No programs found in this session.</p>
          </div>
        )}
      </div>

      <DangerZoneModal
        isOpen={!!deletingProgram}
        onClose={() => setDeletingProgram(null)}
        onConfirm={handleDeleteConfirm}
        entityName={deletingProgram?.name || ""}
        entityType="Program"
        warningText="Deleting this program will affect all semesters and subjects beneath it."
        isPending={isPending}
      />

      {/* Edit Modal */}
      {editingProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl border border-border/50 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Edit Program</h2>
              <div className="space-y-4 mb-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Program Name</label>
                  <input
                    value={editProgramName}
                    onChange={(e) => setEditProgramName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setEditingProgram(null)} disabled={isPending}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateProgram} disabled={isPending}>
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
