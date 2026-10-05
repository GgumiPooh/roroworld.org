"use client";

import { cn } from "@/shared/lib";
import { useMemo } from "react";

const EARLIEST_ALBUM_YEAR = 2022;

export type YearFilterProps = {
  className?: string;
  year: string;
  onChange: (year: string) => void;
};

export function YearFilter({ className, year, onChange }: YearFilterProps) {
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearCount = currentYear - EARLIEST_ALBUM_YEAR + 1;

    return Array.from({ length: yearCount }, (_, index) => String(currentYear - index));
  }, []);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <select
        className={cn(
          "rounded-2xl bg-plum-200/20 p-1 text-plum-100 md:p-2",
          "transition outline-none",
        )}
        value={year}
        onChange={(e) => onChange(e.target.value)}
      >
        <option className="font-bold" value="">
          전체
        </option>
        {yearOptions.map((yearValue) => (
          <option key={yearValue} value={yearValue}>
            {yearValue}
          </option>
        ))}
      </select>
      <label className="font-bold text-plum-100">년도</label>
    </div>
  );
}
