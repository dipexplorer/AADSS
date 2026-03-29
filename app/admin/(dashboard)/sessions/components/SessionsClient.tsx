"use client";

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createSession, updateSession, deleteSession } from "@/lib/admin/actions";
import { EntityCard } from "@/components/admin/EntityCard";
import { DangerZoneModal } from "@/components/admin/DangerZoneModal";
import { Button } from "@/components/ui/button";

interface Props {
  sessions: any[];
}

export default function SessionsClient({ sessions }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Create Form State
  const [sessionForm, setSessionForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });

  // Delete State
  const [deletingSession, setDeletingSession] = useState<any>(null);

  // Edit State
  const [editingSession, setEditingSession] = useState<any>(null);
  const [editSessionForm, setEditSessionForm] = useState({
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

  function handleUpdateSession() {
    if (!editSessionForm.name || !editSessionForm.start_date || !editSessionForm.end_date) {
      toast.error("All fields required");
      return;
    }
    startTransition(async () => {
      const res = await updateSession(editingSession.id, editSessionForm);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Session updated");
        setEditingSession(null);
      }
    });
  }

  function handleDeleteConfirm() {
    if (!deletingSession) return;
    startTransition(async () => {
      const res = await deleteSession(deletingSession.id);
      if (res?.error) toast.error("Cannot delete: Session contains active programs or failed relational check.");
      else {
        toast.success("Session deleted successfully");
        setDeletingSession(null);
      }
    });
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Academic Sessions</h1>
          <p className="text-muted-foreground mt-1">Manage global academic years and terms.</p>
        </div>
      </div>

      {/* Create Section */}
      <div className="bg-card border border-border/50 rounded-xl p-5 mb-8 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-4">Create New Session</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Session Name</label>
            <input
              placeholder="e.g. 2025-2026"
              value={sessionForm.name}
              onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Start Date</label>
            <input
              type="date"
              value={sessionForm.start_date}
              onChange={(e) => setSessionForm({ ...sessionForm, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">End Date</label>
            <input
              type="date"
              value={sessionForm.end_date}
              onChange={(e) => setSessionForm({ ...sessionForm, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button onClick={handleCreateSession} disabled={isPending} className="w-full bg-primary text-primary-foreground">
            {isPending ? "Creating..." : "Create Session"}
          </Button>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sessions.map((s) => (
          <EntityCard
            key={s.id}
            title={s.name}
            subtitle={`${s.start_date} to ${s.end_date}`}
            status={s.status}
            countLabel={s.programs_count === 1 ? "Program" : "Programs"}
            count={s.programs_count}
            onClick={() => router.push(`/admin/sessions/${s.id}`)}
            onEdit={() => {
              setEditingSession(s);
              setEditSessionForm({ name: s.name, start_date: s.start_date, end_date: s.end_date });
            }}
            onDelete={() => setDeletingSession(s)}
          />
        ))}
        {sessions.length === 0 && (
          <div className="col-span-full py-12 text-center bg-muted/20 border border-dashed rounded-xl">
            <p className="text-muted-foreground">No sessions created yet.</p>
          </div>
        )}
      </div>

      <DangerZoneModal
        isOpen={!!deletingSession}
        onClose={() => setDeletingSession(null)}
        onConfirm={handleDeleteConfirm}
        entityName={deletingSession?.name || ""}
        entityType="Session"
        warningText="Deleting this session will permanently wipe it. However, if this session contains programs, deletion will be blocked by system safeguards."
        isPending={isPending}
      />

      {/* Edit Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl border border-border/50 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Edit Session</h2>
              <div className="space-y-4 mb-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Session Name</label>
                  <input
                    value={editSessionForm.name}
                    onChange={(e) => setEditSessionForm({ ...editSessionForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                  <input
                    type="date"
                    value={editSessionForm.start_date}
                    onChange={(e) => setEditSessionForm({ ...editSessionForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">End Date</label>
                  <input
                    type="date"
                    value={editSessionForm.end_date}
                    onChange={(e) => setEditSessionForm({ ...editSessionForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setEditingSession(null)} disabled={isPending}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateSession} disabled={isPending}>
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
