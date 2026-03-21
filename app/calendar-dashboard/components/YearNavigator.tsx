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
    <div className={`flex items-center justify-center gap-6 ${className}`}>
      <button
        onClick={handlePrev}
        className="w-12 h-12 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-muted transition-colors shadow-sm flex items-center justify-center"
        aria-label="Previous year"
      >
        <svg
          className="w-5 h-5"
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

      <div className="bg-card/50 backdrop-blur-sm border border-border/50 px-8 py-2 rounded-xl shadow-sm">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">
          {currentYear}
        </h2>
      </div>

      <button
        onClick={handleNext}
        className="w-12 h-12 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-muted transition-colors shadow-sm flex items-center justify-center"
        aria-label="Next year"
      >
        <svg
          className="w-5 h-5"
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
  );
}
