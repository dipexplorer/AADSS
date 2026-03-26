// app/admin/timetable/components/TimetableClient.tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import {
  createTimetableSlot,
  updateTimetableSlot,
  deleteTimetableSlot,
} from "@/lib/admin/actions";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface Props {
  slots: any[];
  subjects: any[];
}

export default function TimetableClient({ slots, subjects }: Props) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    subject_id: "",
    day_of_week: "1",
    start_time: "",
    end_time: "",
    room: "",
    latitude: "",
    longitude: "",
    allowed_radius: "100",
  });
  const [showGeo, setShowGeo] = useState(false);

  function handleCreate() {
    if (!form.subject_id || !form.start_time || !form.end_time) {
      toast.error("Subject, start time and end time required");
      return;
    }
    startTransition(async () => {
      const res = await createTimetableSlot({
        subject_id: form.subject_id,
        day_of_week: Number(form.day_of_week),
        start_time: form.start_time,
        end_time: form.end_time,
        room: form.room || undefined,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        allowed_radius: Number(form.allowed_radius),
      });
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Slot added");
        setForm({
          subject_id: "",
          day_of_week: "1",
          start_time: "",
          end_time: "",
          room: "",
          latitude: "",
          longitude: "",
          allowed_radius: "100",
        });
      }
    });
  }

  // Group by day
  const slotsByDay = DAYS.map((day, i) => ({
    day,
    dayIndex: i,
    slots: slots.filter((s) => s.day_of_week === i),
  })).filter((d) => d.slots.length > 0 || d.dayIndex >= 1);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Timetable</h1>

      {/* Add slot form */}
      <div className="bg-card border border-border/50 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Add Timetable Slot
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          <select
            value={form.subject_id}
            onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
            className="col-span-2 sm:col-span-1 px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({(s.semesters as any)?.programs?.name} Sem{" "}
                {(s.semesters as any)?.semester_number})
              </option>
            ))}
          </select>
          <select
            value={form.day_of_week}
            onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {DAYS.slice(1).map((d, i) => (
              <option key={i + 1} value={i + 1}>
                {d}
              </option>
            ))}
          </select>
          <input
            placeholder="Room (optional)"
            value={form.room}
            onChange={(e) => setForm({ ...form, room: e.target.value })}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            type="time"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            type="time"
            value={form.end_time}
            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Optional geo */}
        <button
          onClick={() => setShowGeo((p) => !p)}
          className="text-xs text-primary hover:underline mb-3 block"
        >
          {showGeo ? "Hide" : "Add"} Geo-fence coordinates (optional)
        </button>
        {showGeo && (
          <div className="grid grid-cols-3 gap-3 mb-3">
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="number"
              placeholder="Radius (meters)"
              value={form.allowed_radius}
              onChange={(e) =>
                setForm({ ...form, allowed_radius: e.target.value })
              }
              className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={isPending}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          Add Slot
        </button>
      </div>

      {/* Timetable grid */}
      <div className="space-y-4">
        {DAYS.slice(1).map((day, idx) => {
          const daySlots = slots.filter((s) => s.day_of_week === idx + 1);
          return (
            <div
              key={day}
              className="bg-card border border-border/50 rounded-xl overflow-hidden"
            >
              <div className="px-4 py-2.5 bg-muted/30 border-b border-border/50 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  {day}
                </span>
                <span className="text-xs text-muted-foreground">
                  {daySlots.length} class{daySlots.length !== 1 ? "es" : ""}
                </span>
              </div>
              {daySlots.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  No classes
                </p>
              ) : (
                <div className="divide-y divide-border/50">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="px-4 py-3 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-medium text-foreground text-sm">
                          {(slot.subjects as any)?.name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-3">
                          {slot.start_time.slice(0, 5)} –{" "}
                          {slot.end_time.slice(0, 5)}
                          {slot.room && ` · ${slot.room}`}
                          {slot.latitude && ` · 📍 geo-fenced`}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          startTransition(async () => {
                            if (!confirm("Delete this slot?")) return;
                            const res = await deleteTimetableSlot(slot.id);
                            if (res?.error) toast.error(res.error);
                            else toast.success("Deleted");
                          })
                        }
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
