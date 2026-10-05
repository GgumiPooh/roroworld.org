"use client";

import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { type KeyboardEvent, useState } from "react";

export type SearchBarProps = {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
};

export function SearchBar({
  className,
  placeholder = "검색어를 입력하세요...",
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (!query.trim()) {
      return;
    }
    onSearch?.(query.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) {
      return;
    }
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={cn("flex w-full items-center gap-3 px-4", className)}>
      <MagnifyingGlassIcon className="size-5 shrink-0 text-[#c4bda8]" />
      <input
        className="h-8 min-w-0 flex-1 rounded-2xl border border-[#ffffff76] bg-[#b9b7b410] px-4 text-sm text-[#e5e2e2] placeholder-[#838382b9] outline-none focus:border-[#c4bda8] disabled:opacity-50 md:h-9 md:text-base"
        placeholder={placeholder}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button
        className="h-8 shrink-0 border border-gray-300/30 bg-[#b9b9b978] px-4 text-sm font-medium text-gray-300 transition-colors hover:border-plum-400/50 md:h-9"
        size="sm"
        variant="icon"
        onClick={handleSearch}
      >
        검색
      </Button>
    </div>
  );
}
