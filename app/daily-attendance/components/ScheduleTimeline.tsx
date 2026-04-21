// app/daily-attendance/components/ScheduleTimeline.tsx
"use client";

import { ClassPeriod } from "@/lib/attendance/getDailySchedule";
import type { GeoLocation } from "@/lib/engines/validation/types";
import { useState, useEffect } from "react";
import { SubjectAnalytics } from "@/lib/engines/analytics/types";

interface ScheduleTimelineProps {
  periods: ClassPeriod[];
  loading: boolean;
  date: string;
  onStatusChange: (
    sessionId: string,
    status: "present",
  ) => void;
  subjects: SubjectAnalytics[];
}

const WINDOW_MINUTES = 10; // must match server-side window

type WindowState = "before" | "open" | "closed";

function getWindowState(
  dateStr: string,
  startTime: string,
  now: Date,
): WindowState {
  const [h, m, s] = startTime.split(":").map(Number);
  const classStart = new Date(`${dateStr}T00:00:00`);
  classStart.setHours(h, m, s ?? 0, 0);

  const windowEnd = new Date(classStart.getTime() + WINDOW_MINUTES * 60 * 1000);

  if (now < classStart) return "before";
  if (now <= windowEnd) return "open";
  return "closed";
}

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00").getDay();
  return d === 0 || d === 6;
}

// Countdown helper: returns "2:45" format
function formatCountdown(dateStr: string, startTime: string, now: Date): string {
  const [h, m, s] = startTime.split(":").map(Number);
  const classStart = new Date(`${dateStr}T00:00:00`);
  classStart.setHours(h, m, s ?? 0, 0);
  const diff = Math.max(0, Math.floor((classStart.getTime() - now.getTime()) / 1000));
  const mins = Math.floor(diff / 60);
  const secs = diff % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ScheduleTimeline({
  periods,
  loading,
  date,
  onStatusChange,
  subjects,
}: ScheduleTimelineProps) {
  const [now, setNow] = useState(new Date());

  // Tick every second to update time-window states
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-5 border border-border/50 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted/50 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-muted/50 rounded w-1/3" />
                <div className="h-4 bg-muted/30 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isWeekend(date)) {
    return (
      <div className="bg-card/50 border border-border/50 rounded-xl p-12 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          It's a Weekend!
        </h3>
        <p className="text-muted-foreground text-sm">
          No classes today. Enjoy your day off!
        </p>
      </div>
    );
  }

  if (periods.length === 0) {
    return (
      <div className="bg-card/50 border border-border/50 border-dashed rounded-xl p-12 text-center">
        <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-primary/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No Classes Scheduled
        </h3>
        <p className="text-muted-foreground text-sm">Enjoy your free time!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {periods.map((period, index) => (
        <PeriodCard
          key={period.sessionId}
          period={period}
          periodNumber={index + 1}
          date={date}
          now={now}
          onMarkPresent={() => onStatusChange(period.sessionId, "present")}
          subjects={subjects}
        />
      ))}
    </div>
  );
}

function PeriodCard({
  period,
  periodNumber,
  date,
  now,
  onMarkPresent,
  subjects,
}: {
  period: ClassPeriod;
  periodNumber: number;
  date: string;
  now: Date;
  onMarkPresent: () => void;
  subjects: SubjectAnalytics[];
}) {
  const [locating, setLocating] = useState(false);

  const isCancelled = period.status === "cancelled";
  const isCompleted = period.status === "completed";
  const attendanceStatus = period.attendanceStatus;

  // Time window state (only relevant for scheduled sessions)
  const windowState: WindowState =
    isCancelled || isCompleted
      ? "closed"
      : getWindowState(date, period.startTime, now);

  const isToday = date === new Date().toISOString().split("T")[0];
  // For past dates, always show closed if no attendance
  const effectiveWindowState =
    !isToday && windowState !== "closed" ? "closed" : windowState;

  // Border accent
  const borderColor =
    isCancelled
      ? "border-l-yellow-400"
      : attendanceStatus === "present"
        ? "border-l-green-500"
        : attendanceStatus === "absent"
          ? "border-l-red-400"
          : effectiveWindowState === "open"
            ? "border-l-blue-500"
            : "border-l-transparent";

  async function handlePresentClick() {
    setLocating(true);
    try {
      await getCurrentLocation(); // just to confirm location works
    } catch {
      // silently continue — server validates
    } finally {
      setLocating(false);
    }
    onMarkPresent();
  }

  return (
    <div
      className={`bg-card rounded-xl p-5 border border-border/50 border-l-[6px] shadow-sm hover:shadow-md transition-all ${borderColor}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Period Number */}
        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-primary/5 shrink-0">
          <span className="text-[10px] uppercase text-primary/60 font-bold tracking-wider">
            Period
          </span>
          <span className="text-2xl font-bold text-primary">{periodNumber}</span>
        </div>

        {/* Subject Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-lg text-foreground uppercase tracking-tight truncate">
              {period.subjectName}
            </h3>
            {/* Tactical Hint Badge */}
            {(() => {
              const sub = subjects.find(s => s.subjectId === period.subjectId);
              if (!sub) return null;
              
              const currentPct = sub.attendancePercentage;
              const skipPct = (sub.presentClasses / (sub.totalClasses + 1)) * 100;
              const isCritical = currentPct < 75 || skipPct < 75;

              return isCritical ? (
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200 uppercase tracking-tighter">
                  🚨 Critical
                </span>
              ) : (
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-700 border border-green-200 uppercase tracking-tighter">
                  🛡️ Safe
                </span>
              );
            })()}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(period.startTime)} — {formatTime(period.endTime)}
            </span>
            {period.room && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {period.room}
              </span>
            )}
          </div>
        </div>

        {/* Right side — action area */}
        <div className="shrink-0 flex flex-col items-end gap-1.5 min-w-[140px]">
          {/* ── CANCELLED ── */}
          {isCancelled && (
            <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 rounded-lg text-sm font-semibold">
              🚫 Class Cancelled
            </span>
          )}

          {/* ── ALREADY MARKED ── */}
          {!isCancelled && attendanceStatus === "present" && (
            <span className="px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 rounded-lg text-sm font-semibold flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Present ✓
            </span>
          )}

          {!isCancelled && attendanceStatus === "absent" && (
            <span className="px-3 py-1.5 bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 rounded-lg text-sm font-semibold flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Absent
            </span>
          )}

          {/* ── NO ATTENDANCE YET ── */}
          {!isCancelled && !attendanceStatus && (
            <>
              {effectiveWindowState === "before" && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1">Starts in</div>
                  <div className="tabular-nums font-mono text-sm font-semibold text-primary">
                    {formatCountdown(date, period.startTime, now)}
                  </div>
                  <button
                    disabled
                    className="mt-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-muted/40 text-muted-foreground cursor-not-allowed"
                  >
                    Mark Present
                  </button>
                </div>
              )}

              {effectiveWindowState === "open" && (
                <div className="text-right">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1 flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
                    Window open
                  </div>
                  <button
                    onClick={handlePresentClick}
                    disabled={locating}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    {locating ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {locating ? "Locating..." : "Mark Present"}
                  </button>
                </div>
              )}

              {effectiveWindowState === "closed" && (
                <div className="text-right">
                  <span className="px-3 py-1.5 bg-muted/50 text-muted-foreground rounded-lg text-sm font-medium inline-block">
                    {isCompleted ? "Absent (window closed)" : "Window Closed"}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper — browser se location maango
function getCurrentLocation(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}
