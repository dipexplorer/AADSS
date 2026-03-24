// app/calendar-dashboard/components/YearNavigator.tsx
"use client";

import { useState } from "react";

interface YearNavigatorProps {
  initialYear: number;
  onYearChange: (year: number) => void;
  className?: string;
}

export default function YearNavigator({
  initialYear,
  onYearChange,
  className = "",
}: YearNavigatorProps) {
  const [currentYear, setCurrentYear] = useState(initialYear);

  const handlePrev = () => {
    const newYear = currentYear - 1;
    setCurrentYear(newYear);
    onYearChange(newYear);
  };

  const handleNext = () => {
    const newYear = currentYear + 1;
    setCurrentYear(newYear);
    onYearChange(newYear);
  };

  return (
    <div className={`inline-flex items-center gap-1.5 p-1.5 bg-background border border-border/50 rounded-full shadow-sm ${className}`}>
      <button
        onClick={handlePrev}
        className="w-11 h-11 rounded-2xl bg-card border border-border/40 hover:bg-muted transition-colors flex items-center justify-center text-foreground"
        aria-label="Previous year"
      >
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="px-6 h-11 bg-card border border-border/40 rounded-2xl flex items-center justify-center">
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          {currentYear}
        </h2>
      </div>

      <button
        onClick={handleNext}
        className="w-11 h-11 rounded-2xl bg-card border border-border/40 hover:bg-muted transition-colors flex items-center justify-center text-foreground"
        aria-label="Next year"
      >
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
