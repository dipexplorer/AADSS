// app/daily-attendance/components/DateNavigator.tsx
"use client";

import { useState } from "react";

interface DateNavigatorProps {
  date: string;
  onDateChange: (date: string) => void;
  semesterStart: string;
  semesterEnd: string;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function isToday(dateStr: string): boolean {
  const today = new Date();
  const t = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return dateStr === t;
}

function todayStr(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

export default function DateNavigator({
  date,
  onDateChange,
  semesterStart,
  semesterEnd,
}: DateNavigatorProps) {
  const [showPicker, setShowPicker] = useState(false);

  const canGoPrev = !semesterStart || date > semesterStart;
  const canGoNext = !semesterEnd || date < semesterEnd;

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Prev / Date / Next */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => canGoPrev && onDateChange(addDays(date, -1))}
            disabled={!canGoPrev}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex-1 sm:flex-initial text-center min-w-[200px]">
            <h2 className="font-semibold text-lg text-foreground">
              {formatDisplay(date)}
            </h2>
            {isToday(date) && (
              <span className="text-xs font-medium text-primary">Today</span>
            )}
          </div>

          <button
            onClick={() => canGoNext && onDateChange(addDays(date, 1))}
            disabled={!canGoNext}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Today + Pick Date */}
        <div className="flex items-center gap-2">
          {!isToday(date) && (
            <button
              onClick={() => onDateChange(todayStr())}
              className="text-sm font-medium px-3 py-1.5 rounded-lg text-primary hover:bg-primary/5 transition-colors"
            >
              Go to Today
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowPicker((p) => !p)}
              className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="hidden sm:inline">Pick Date</span>
            </button>

            {showPicker && (
              <div className="absolute right-0 top-full mt-2 bg-popover border border-border rounded-lg shadow-lg p-3 z-50">
                <input
                  type="date"
                  value={date}
                  min={semesterStart || undefined}
                  max={semesterEnd || undefined}
                  onChange={(e) => {
                    onDateChange(e.target.value);
                    setShowPicker(false);
                  }}
                  className="px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
