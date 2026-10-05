"use client";

import { type Sort } from "@/entities/activity";
import { cn, useBreakpoint } from "@/shared/lib";
import { Button } from "@/shared/ui";

export type SortOptionsProps = {
  className?: string;
  sort: Sort;
  onChange: (sort: Sort) => void;
};

export function SortOptions({ className, sort, onChange }: SortOptionsProps) {
  const isSmallBreakpoint = useBreakpoint("sm");

  return (
    <div className={cn("flex gap-2 text-nowrap sm:gap-8", className)}>
      <Button
        className={cn(
          "w-full cursor-default font-bold ring-1 sm:w-auto",
          sort === "latest"
            ? "text-plum-100 ring-plum-300"
            : "bg-black/10 text-plum-200 ring-black/10",
        )}
        size={isSmallBreakpoint ? "md" : "sm"}
        variant="ghost"
        onClick={() => onChange("latest")}
      >
        최신순
      </Button>
      <Button
        className={cn(
          "w-full cursor-default font-bold ring-1 sm:w-auto",
          sort === "oldest"
            ? "text-plum-100 ring-plum-300"
            : "bg-black/10 text-plum-200 ring-black/10",
        )}
        size={isSmallBreakpoint ? "md" : "sm"}
        variant="ghost"
        onClick={() => onChange("oldest")}
      >
        오래된순
      </Button>
    </div>
  );
}
