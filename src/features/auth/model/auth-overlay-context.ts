"use client";

import { assert, type Nullable } from "@/shared/lib";
import { createContext, useContext } from "react";

export type AuthOverlayContextValue = {
  close: () => void;
  isOpen: boolean;
  open: () => void;
};

export const AuthOverlayContext = createContext<Nullable<AuthOverlayContextValue>>(null);

export function useAuthOverlay(): AuthOverlayContextValue {
  const context = useContext(AuthOverlayContext);
  assert(context, "useAuthOverlay must be used within AuthOverlayProvider");
  return context;
}
