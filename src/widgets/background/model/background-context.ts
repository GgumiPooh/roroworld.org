"use client";

import { assert, type Nullable } from "@/shared/lib";
import { createContext, useContext } from "react";
import type { BackgroundContextValue } from "./types";

export const BackgroundContext = createContext<Nullable<BackgroundContextValue>>(null);

export function useBackgroundContext(): BackgroundContextValue {
  const context = useContext(BackgroundContext);
  assert(context, "useBackgroundContext must be used within BackgroundProvider");
  return context;
}
