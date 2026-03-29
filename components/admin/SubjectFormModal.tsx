"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  semestersContext?: any[];
  selectedSemesterId?: string;
  isPending?: boolean;
}

export function SubjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  semestersContext = [],
  selectedSemesterId,
  isPending,
}: SubjectFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    credits: 3,
    min_attendance_required: 75,
    semester_id: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        code: initialData.code || "",
        credits: initialData.credits || 3,
        min_attendance_required: initialData.min_attendance_required || 75,
        semester_id: initialData.semester_id || "",
      });
    } else {
      setFormData({
        name: "",
        code: "",
        credits: 3,
        min_attendance_required: 75,
        semester_id: selectedSemesterId || "",
      });
    }
  }, [initialData, selectedSemesterId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-xl border border-border/50 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-bold text-foreground">
            {initialData ? "Edit Subject" : "Create New Subject"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Build your curriculum by adding subject constraints.
          </p>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="subject-form" onSubmit={handleSubmit} className="space-y-5">
            {!initialData && semestersContext.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Target Semester Context <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.semester_id}
                  onChange={(e) => setFormData({ ...formData, semester_id: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="" disabled>Select a semester...</option>
                  {semestersContext.map((sem) => (
                    <option key={sem.id} value={sem.id}>Semester {sem.semester_number}</option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground">Select the correct semester context from the dropdown if not pre-populated.</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-medium text-foreground">Subject Name <span className="text-red-500">*</span></label>
                <input
                  required
                  placeholder="e.g. Data Structures and Algorithms"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Subject Code</label>
                <input
                  placeholder="e.g. CS-301"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary font-mono placeholder:font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Credits <span className="text-red-500">*</span></label>
                <input
                  required
                  type="number"
                  min={1}
                  max={10}
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary leading-none"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-medium text-foreground">Minimum Attendance Required (%) <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-3">
                  <input
                    required
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={formData.min_attendance_required}
                    onChange={(e) => setFormData({ ...formData, min_attendance_required: Number(e.target.value) })}
                    className="flex-1 accent-primary"
                  />
                  <div className="w-16 px-3 py-1.5 border border-border rounded-lg text-sm text-center font-medium bg-muted/20">
                    {formData.min_attendance_required}%
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="subject-form" disabled={isPending}>
            {isPending ? "Saving..." : initialData ? "Save Changes" : "Create Subject"}
          </Button>
        </div>
      </div>
    </div>
  );
}
