"use client";

import { useEffect } from "react";
import { useMedia } from "react-use";

export type ViewportBreakpoint = "2xl" | "lg" | "md" | "sm" | "xl" | "xs";

export const BREAKPOINTS = {
  "2xl": 1536,
  lg: 1024,
  md: 768,
  sm: 640,
  xl: 1280,
  xs: 480,
} as const satisfies Record<ViewportBreakpoint, number>;

export function useBreakpoint(
  breakpoint: ViewportBreakpoint,
  callback?: (isMatch: boolean) => void,
): boolean {
  const isMatch = useMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`, true);

  useEffect(() => {
    callback?.(isMatch);
  }, [isMatch, callback]);

  return isMatch;
}
