// app/calendar-dashboard/components/YearProgressCard.tsx
"use client";

import { useState, useEffect } from "react";

interface YearProgressCardProps {
  semesterStart: string;
  semesterEnd: string;
  className?: string;
}

export default function YearProgressCard({
  semesterStart,
  semesterEnd,
  className = "",
}: YearProgressCardProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div
        className={`bg-card/50 border border-border/50 rounded-xl p-6 animate-pulse ${className}`}
      >
        <div className="h-6 bg-muted/20 rounded w-24 mb-2" />
        <div className="h-10 bg-muted/20 rounded w-16 mb-3" />
        <div className="h-4 bg-muted/20 rounded w-32" />
      </div>
    );
  }

  const startDate = new Date(semesterStart);
  const endDate = new Date(semesterEnd);
  const today = new Date();

  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const elapsedDays = Math.ceil(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
  const currentYear = startDate.getFullYear();

  return (
    <div
      className={`bg-linear-to-br from-card/80 to-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all ${className}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Academic Year
        </span>
      </div>

      <div className="mb-4">
        <h3 className="text-4xl font-bold text-foreground tracking-tight">
          {currentYear}
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Semester Progress</span>
          <span className="font-semibold text-foreground">
            {progress.toFixed(0)}%
          </span>
        </div>

        <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-primary to-primary/80 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Day {Math.max(0, elapsedDays)} of {totalDays}
          </span>
          <span>{Math.max(0, totalDays - elapsedDays)} days left</span>
        </div>
      </div>
    </div>
  );
}
