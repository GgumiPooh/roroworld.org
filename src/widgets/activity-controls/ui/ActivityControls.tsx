"use client";

import { type Sort } from "@/entities/activity";
import { cn } from "@/shared/lib";
import { SortOptions } from "./SortOptions";
import { YearFilter } from "./YearFilter";

export type ActivityControlsProps = {
  className?: string;
  sort: Sort;
  year: string;
  onSortChange: (sort: Sort) => void;
  onYearChange: (year: string) => void;
};

export function ActivityControls({
  className,
  sort,
  year,
  onSortChange,
  onYearChange,
}: ActivityControlsProps) {
  return (
    <div className={cn("flex items-center gap-6", className)}>
      <YearFilter year={year} onChange={onYearChange} />
      <SortOptions sort={sort} onChange={onSortChange} />
    </div>
  );
}
