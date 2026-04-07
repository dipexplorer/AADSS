"use client";

import { useState } from "react";
import { Clock, BookOpen, MapPin } from "lucide-react";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// day_of_week: 1=Mon ... 7=Sun
const DAY_INDICES = [1, 2, 3, 4, 5, 6, 7];

interface Slot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  subjects: { name: string; code: string | null } | null;
}

interface Props {
  slots: Slot[];
  programName: string;
  semesterNumber: number;
}

function fmt(t: string | null) {
  return t?.slice(0, 5) ?? "--:--";
}

export default function TimetableClient({ slots, programName, semesterNumber }: Props) {
  const today = new Date().getDay(); // 0=Sun,1=Mon...
  // Map JS day (0=Sun) to our day_of_week (1=Mon...7=Sun)
  const todayDow = today === 0 ? 7 : today;
  // Default active tab to today if in Mon-Sat range, else Mon
  const defaultTab = DAY_INDICES.includes(todayDow) ? todayDow : 1;
  // Only show days that have at least one class
  const activeDays = DAY_INDICES.filter((dow) =>
    slots.some((s) => s.day_of_week === dow)
  );
  const [activeDay, setActiveDay] = useState(
    activeDays.includes(todayDow) ? todayDow : activeDays[0] ?? 1
  );

  const daySlots = slots
    .filter((s) => s.day_of_week === activeDay)
    .sort((a, b) => (a.start_time > b.start_time ? 1 : -1));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-primary" />
          <h1 className="text-base font-semibold text-muted-foreground tracking-wide uppercase text-[11px]">
            Weekly Schedule Preview
          </h1>
        </div>
        <p className="text-xs text-muted-foreground">
          {programName} · Semester {semesterNumber}
        </p>
      </div>

      {/* Day Tabs */}
      <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1 scrollbar-none">
        {DAY_INDICES.filter((dow) => slots.some((s) => s.day_of_week === dow)).map((dow, _i, arr) => {
          const isActive = activeDay === dow;
          const isToday = dow === todayDow;
          return (
            <button
              key={dow}
              onClick={() => setActiveDay(dow)}
              className={`relative shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {DAY_LABELS[DAY_INDICES.indexOf(dow)]}
              {isToday && !isActive && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Day Panel */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        {/* Panel Header */}
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/50 bg-muted/30">
          <div className="w-1 h-4 rounded-full bg-primary" />
          <span className="text-sm font-bold text-foreground">
            {DAY_LABELS[DAY_INDICES.indexOf(activeDay)]}
            {activeDay === todayDow && (
              <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 bg-primary/10 text-primary rounded-md">
                Today
              </span>
            )}
          </span>
          <span className="ml-auto text-[11px] text-muted-foreground">
            {daySlots.length > 0 ? `${daySlots.length} class${daySlots.length > 1 ? "es" : ""}` : "Free day"}
          </span>
        </div>

        {/* Slots */}
        {daySlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No classes scheduled</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Enjoy your free day!</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {daySlots.map((slot) => (
              <div key={slot.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                {/* Time column */}
                <div className="shrink-0 w-16 text-center">
                  <p className="text-xs font-bold font-mono text-primary leading-tight">
                    {fmt(slot.start_time)}
                  </p>
                  <div className="my-1 mx-auto w-px h-3 bg-border" />
                  <p className="text-[10px] font-mono text-muted-foreground leading-tight">
                    {fmt(slot.end_time)}
                  </p>
                </div>

                {/* Icon */}
                <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>

                {/* Subject info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {slot.subjects?.code
                      ? `${slot.subjects.code} - ${slot.subjects.name}`
                      : slot.subjects?.name ?? "Unknown Subject"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Theory Class</p>
                </div>

                {/* Room */}
                {slot.room && (
                  <div className="shrink-0 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {slot.room}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
}
