"use client";

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { createTimetableSlot, deleteTimetableSlot } from "@/lib/admin/actions";
import {
  Calendar,
  Clock,
  Move,
  ChevronRight,
  Trash2,
  AlertCircle,
  Maximize2,
  Plus,
  GripVertical,
  Settings2,
} from "lucide-react";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const WORK_DAYS = [1, 2, 3, 4, 5, 6]; // Mon - Sat

interface Props {
  slots: any[];
  subjects: any[];
}

export default function TimetableClient({ slots, subjects }: Props) {
  const [isPending, startTransition] = useTransition();
  // We keep a simple Add Slot state for now, but integrated into the sidebar
  const [form, setForm] = useState({
    subject_id: "",
    day_of_week: "1",
    start_time: "09:00",
    end_time: "10:00",
    room: "",
    latitude: "",
    longitude: "",
    allowed_radius: "100",
  });
  const [showGeo, setShowGeo] = useState(false);

  // Administrative grid settings (Schedule start, end, and break)
  const [gridSettings, setGridSettings] = useState({
    startHour: 8,
    endHour: 18,
    breakStart: 13,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const HOURS = Array.from(
    { length: gridSettings.endHour - gridSettings.startHour + 1 },
    (_, i) => i + gridSettings.startHour,
  );

  function handleCreate() {
    if (!form.subject_id || !form.start_time || !form.end_time) {
      toast.error("Required fields missing");
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
        allowed_radius: form.allowed_radius ? Number(form.allowed_radius) : 100,
      });
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Slot added to grid");
        setForm((f) => ({
          ...f,
          start_time: f.end_time,
          end_time:
            String(Number(f.end_time.split(":")[0]) + 1).padStart(2, "0") +
            ":00",
        }));
      }
    });
  }

  // Calculate position for absolute positioned slots on the grid
  const getSlotStyle = (slot: any) => {
    const startHour = parseInt(slot.start_time.split(":")[0]);
    const startMin = parseInt(slot.start_time.split(":")[1]);
    const endHour = parseInt(slot.end_time.split(":")[0]);
    const endMin = parseInt(slot.end_time.split(":")[1]);

    // Ensure within visible bounds
    if (startHour < gridSettings.startHour || startHour > gridSettings.endHour)
      return { display: "none" };

    const topOffset =
      ((startHour - gridSettings.startHour) * 60 + startMin) * (60 / 60); // 60px per hour
    
    // Exact height based on time duration
    const exactHeight = ((endHour - startHour) * 60 + (endMin - startMin)) * (60 / 60);
    
    // Day index in WORK_DAYS (0 to 5)
    const dayIndex = WORK_DAYS.indexOf(slot.day_of_week);
    if (dayIndex === -1) return { display: "none" };

    return {
      top: `${topOffset}px`,
      height: `${exactHeight}px`,
      minHeight: `48px`, // Ensure short slots (e.g. 40mins) don't get visually squished
      left: `calc(${dayIndex} * (100% / 6))`,
      width: `calc(100% / 6 - 8px)`, // 8px for gap/padding
      marginLeft: "4px",
    };
  };

  return (
    <div className="h-[calc(100vh-(--spacing(16)))] flex flex-col p-4 md:p-6 gap-6 max-w-[1600px] mx-auto overflow-hidden">
      {/* Header & Global Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Timetable Matrix
          </h1>
          <div className="flex items-center text-sm text-muted-foreground mt-1 gap-2">
            <span className="bg-muted px-2 py-0.5 rounded text-foreground font-medium">
              2026-27
            </span>
            <ChevronRight className="w-3 h-3" />
            <span>B.Tech CS</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary font-medium">Semester 6</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-muted text-foreground border border-border/50 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors flex items-center gap-2"
          >
            <Settings2 className="w-4 h-4" />
            Schedule Breaks
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Copy Previous
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-colors">
            Publish Changes
          </button>
        </div>
      </div>

      {/* Split Workspace */}
      <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
        {/* Left Sidebar: Staging & Forms */}
        <div className="w-80 shrink-0 bg-card border rounded-xl flex-col overflow-hidden shadow-sm hidden lg:flex">
          <div className="p-4 border-b bg-muted/30">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Move className="w-4 h-4" /> Scheduling Bucket
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Subjects to be mapped to the grid
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Draggable Subject Cards representing active semester subjects */}
            {subjects.map((sub) => {
              const mappedCount = slots.filter(
                (s) => s.subject_id === sub.id,
              ).length;
              const requiredCount = sub.credits || 3; // Fallback to 3 if credits not defined
              const isFulfilled = mappedCount >= requiredCount;

              return (
                <div
                  key={sub.id}
                  className={`p-3 border rounded-lg cursor-grab active:cursor-grabbing group transition-all ${
                    isFulfilled
                      ? "bg-primary/5 border-primary/30"
                      : "bg-background hover:border-primary/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100" />
                      <span
                        className={`font-semibold text-sm ${isFulfilled ? "text-primary" : "text-foreground"}`}
                      >
                        {sub.name}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isFulfilled
                          ? "bg-primary/20 text-primary font-bold"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {mappedCount}/{requiredCount} mapped
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    {sub.code ? `${sub.code}` : "Subject"} • {requiredCount}{" "}
                    Credits
                  </p>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t bg-muted/10 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Manual Entry
            </h3>
            {showSettings && (
              <div className="p-3 bg-card border rounded-lg shadow-sm mb-4 space-y-3 relative">
                <h4 className="text-xs font-semibold text-foreground">
                  Schedule Configuration
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-muted-foreground mb-1 block">
                      Start Hour (24h)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={gridSettings.startHour}
                      onChange={(e) =>
                        setGridSettings({
                          ...gridSettings,
                          startHour: Number(e.target.value),
                        })
                      }
                      className="w-full px-2 py-1.5 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block">
                      End Hour (24h)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={gridSettings.endHour}
                      onChange={(e) =>
                        setGridSettings({
                          ...gridSettings,
                          endHour: Number(e.target.value),
                        })
                      }
                      className="w-full px-2 py-1.5 border rounded"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-muted-foreground mb-1 block">
                      Lunch/Break Hour (24h)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={gridSettings.breakStart}
                      onChange={(e) =>
                        setGridSettings({
                          ...gridSettings,
                          breakStart: Number(e.target.value),
                        })
                      }
                      className="w-full px-2 py-1.5 border rounded"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    toast.success("Configuration saved and applied");
                    setShowSettings(false);
                  }}
                  className="w-full py-1.5 bg-muted text-foreground border border-border/50 rounded hover:bg-muted/80 transition-colors text-xs font-medium"
                >
                  Save Configuration
                </button>
              </div>
            )}

            <select
              value={form.subject_id}
              onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
            >
              <option value="">Select Subject...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={form.day_of_week}
                onChange={(e) =>
                  setForm({ ...form, day_of_week: e.target.value })
                }
                className="px-3 py-2 border rounded-lg text-sm bg-background"
              >
                {WORK_DAYS.map((d) => (
                  <option key={d} value={d}>
                    {DAYS[d]}
                  </option>
                ))}
              </select>
              <input
                placeholder="Room..."
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                value={form.start_time}
                onChange={(e) =>
                  setForm({ ...form, start_time: e.target.value })
                }
                className="px-3 py-2 border rounded-lg text-sm bg-background"
              />
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm bg-background"
              />
            </div>

            <button
              onClick={() => setShowGeo((p) => !p)}
              className="text-xs text-primary hover:underline block"
            >
              {showGeo ? "Hide" : "Add"} Geo-fence coordinates
            </button>
            {showGeo && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={form.latitude}
                  onChange={(e) =>
                    setForm({ ...form, latitude: e.target.value })
                  }
                  className="px-3 py-2 border rounded-lg text-xs bg-background"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={form.longitude}
                  onChange={(e) =>
                    setForm({ ...form, longitude: e.target.value })
                  }
                  className="px-3 py-2 border rounded-lg text-xs bg-background"
                />
                <input
                  type="number"
                  placeholder="Radius (m)"
                  value={form.allowed_radius}
                  onChange={(e) =>
                    setForm({ ...form, allowed_radius: e.target.value })
                  }
                  className="col-span-2 px-3 py-2 border rounded-lg text-xs bg-background"
                />
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={isPending}
              className="w-full py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Inject Slot
            </button>
          </div>
        </div>

        {/* Main Grid Canvas */}
        <div className="flex-1 bg-card border rounded-xl shadow-sm flex flex-col overflow-hidden relative">
          {/* Days Header */}
          <div className="flex border-b bg-muted/30 shrink-0">
            <div className="w-16 shrink-0 border-r flex items-center justify-center text-xs text-muted-foreground font-medium">
              Time
            </div>
            {WORK_DAYS.map((dayIdx) => (
              <div
                key={dayIdx}
                className="flex-1 min-w-[120px] py-3 text-center border-r last:border-r-0"
              >
                <span className="text-sm font-semibold text-foreground">
                  {DAYS[dayIdx]}
                </span>
              </div>
            ))}
          </div>

          {/* Grid Scrollable Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="relative w-full pb-8">
              {/* Background Grid Lines */}
              <div className="z-0 w-full">
                {HOURS.map((hour) => {
                  const isBreak = hour === gridSettings.breakStart;
                  return (
                    <div
                      key={hour}
                      className={`flex h-[60px] border-b border-border/40 ${isBreak ? "bg-stripes-diagonal opacity-50 bg-muted/40" : ""}`}
                    >
                      <div
                        className={`w-16 shrink-0 border-r border-border/60 flex items-start justify-center pt-2 text-[11px] font-medium ${isBreak ? "text-destructive" : "text-muted-foreground"} bg-card`}
                      >
                        {isBreak && (
                          <span className="mr-1 mt-[2px] w-2 h-2 rounded-full bg-destructive/50" />
                        )}
                        {hour === 12
                          ? "12 PM"
                          : hour > 12
                            ? `${hour - 12} PM`
                            : `${hour} AM`}
                      </div>
                      {WORK_DAYS.map((d) => (
                        <div
                          key={d}
                          className={`flex-1 border-r border-border/40 last:border-r-0 border-dashed transition-colors ${!isBreak && "hover:bg-muted/10"}`}
                        >
                          {isBreak &&
                            d === 3 && ( // Only render text in middle column
                              <div className="w-full text-center mt-4 text-xs tracking-widest text-muted-foreground uppercase opacity-50 font-bold mix-blend-multiply">
                                Break Period
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Absolute Positioned Slots Container */}
              <div className="absolute top-0 bottom-0 right-0 left-16 z-10 pointer-events-none">
                {slots.map((slot) => {
                const style = getSlotStyle(slot);
                if (style.display === "none") return null;

                return (
                  <div
                    key={slot.id}
                    style={style}
                    onClick={() => setSelectedSlot(slot)}
                    className="absolute bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-md px-2 py-1.5 shadow-sm pointer-events-auto overflow-hidden group hover:z-20 hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-blue-900 dark:text-blue-100 truncate pr-2">
                        {(slot.subjects as any)?.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startTransition(() => {
                            if (confirm("Delete slot?"))
                              deleteTimetableSlot(slot.id);
                          });
                        }}
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-red-700 bg-background/50 rounded-sm p-0.5 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] font-medium text-blue-700 dark:text-blue-300">
                      <Clock className="w-3 h-3" />
                      {slot.start_time.slice(0, 5)} -{" "}
                      {slot.end_time.slice(0, 5)}
                    </div>
                    {slot.room && (
                      <div className="text-[10px] text-blue-600/80 dark:text-blue-400 mt-0.5 truncate">
                        Rm: {slot.room}
                      </div>
                    )}

                    {/* Visual resize handle bottom */}
                    <div className="absolute bottom-0 left-0 w-full h-1.5 cursor-ns-resize opacity-0 group-hover:opacity-100 bg-blue-300 dark:bg-blue-600" />
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slot Details Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border/50 shadow-xl rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border/50">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {(selectedSlot.subjects as any)?.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Detailed Slot Information
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Maximize2 className="w-5 h-5 rotate-45" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Schedule
                  </span>
                  <div className="mt-1 flex items-center gap-2 text-foreground font-medium">
                    <Calendar className="w-4 h-4 text-primary" />{" "}
                    {DAYS[selectedSlot.day_of_week]}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-foreground font-medium">
                    <Clock className="w-4 h-4 text-primary" />{" "}
                    {selectedSlot.start_time.slice(0, 5)} –{" "}
                    {selectedSlot.end_time.slice(0, 5)}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Room Allocation
                  </span>
                  <div className="mt-1 text-foreground font-medium">
                    {selectedSlot.room || "Not Assigned"}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Geo-Fencing Data
                </span>
                {selectedSlot.latitude && selectedSlot.longitude ? (
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">
                        Latitude
                      </span>
                      <span className="font-mono">{selectedSlot.latitude}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">
                        Longitude
                      </span>
                      <span className="font-mono">
                        {selectedSlot.longitude}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground block text-xs">
                        Allowed Radius
                      </span>
                      <span className="font-mono">
                        {selectedSlot.allowed_radius} meters
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-muted-foreground italic">
                    No geographic restrictions applied.
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-muted/30 border-t border-border/50 flex justify-end">
              <button
                onClick={() => setSelectedSlot(null)}
                className="px-5 py-2 bg-secondary text-secondary-foreground font-medium rounded-lg text-sm hover:bg-secondary/80 transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
