"use client";

import { useEffect } from "react";
import { useBackgroundContext } from "./background-context";
import type { BackgroundState } from "./types";

export function usePageBackground(state: BackgroundState) {
  const { setBackground } = useBackgroundContext();
  const { imgClassName, overlayClassName, alt, hidden, overlay, src } = state;

  useEffect(() => {
    setBackground({ alt, hidden, imgClassName, overlay, overlayClassName, src });
    return () => {
      // INFO: Page-level cleanup is handled conditionally to prevent flashing during route transitions
    };
  }, [setBackground, alt, hidden, imgClassName, overlay, overlayClassName, src]);
}
