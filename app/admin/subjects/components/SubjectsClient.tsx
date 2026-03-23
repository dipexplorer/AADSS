// app/admin/subjects/components/SubjectsClient.tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import {
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/lib/admin/actions";

interface Props {
  subjects: any[];
  semesters: any[];
}

export default function SubjectsClient({ subjects, semesters }: Props) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    semester_id: "",
    name: "",
    min_attendance_required: "75",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    min_attendance_required: "75",
  });

  function handleCreate() {
    if (!form.semester_id || !form.name) {
      toast.error("All fields required");
      return;
    }
    startTransition(async () => {
      const res = await createSubject({
        semester_id: form.semester_id,
        name: form.name,
        min_attendance_required: Number(form.min_attendance_required),
      });
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Subject created");
        setForm({ semester_id: "", name: "", min_attendance_required: "75" });
      }
    });
  }

  function handleUpdate(id: string) {
    startTransition(async () => {
      const res = await updateSubject(id, {
        name: editData.name,
        min_attendance_required: Number(editData.min_attendance_required),
      });
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Updated");
        setEditId(null);
      }
    });
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Subjects</h1>

      {/* Create form */}
      <div className="bg-card border border-border/50 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Add Subject
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={form.semester_id}
            onChange={(e) => setForm({ ...form, semester_id: e.target.value })}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select Semester</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {(s.programs as any)?.name} — Sem {s.semester_number}
              </option>
            ))}
          </select>
          <input
            placeholder="Subject name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex gap-3">
            <input
              type="number"
              min={0}
              max={100}
              placeholder="Min % (default 75)"
              value={form.min_attendance_required}
              onChange={(e) =>
                setForm({ ...form, min_attendance_required: e.target.value })
              }
              className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleCreate}
              disabled={isPending}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Subject
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Semester
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Min %
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {subjects.map((s) => (
              <tr key={s.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  {editId === s.id ? (
                    <input
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="px-2 py-1 border border-border rounded text-sm bg-background w-full"
                    />
                  ) : (
                    <span className="font-medium text-foreground">
                      {s.name}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {(s.semesters as any)?.programs?.name} — Sem{" "}
                  {(s.semesters as any)?.semester_number}
                </td>
                <td className="px-4 py-3">
                  {editId === s.id ? (
                    <input
                      type="number"
                      value={editData.min_attendance_required}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          min_attendance_required: e.target.value,
                        })
                      }
                      className="px-2 py-1 border border-border rounded text-sm bg-background w-20"
                    />
                  ) : (
                    <span className="text-foreground">
                      {s.min_attendance_required}%
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {editId === s.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(s.id)}
                          className="text-green-600 hover:text-green-800 text-xs font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="text-muted-foreground hover:text-foreground text-xs font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditId(s.id);
                            setEditData({
                              name: s.name,
                              min_attendance_required: String(
                                s.min_attendance_required,
                              ),
                            });
                          }}
                          className="text-primary hover:text-primary/80 text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            startTransition(async () => {
                              if (!confirm("Delete subject?")) return;
                              const res = await deleteSubject(s.id);
                              if (res?.error) toast.error(res.error);
                              else toast.success("Deleted");
                            })
                          }
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {subjects.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No subjects yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
