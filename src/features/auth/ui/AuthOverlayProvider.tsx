"use client";

import { useCallback, useState, type PropsWithChildren } from "react";
import { AuthOverlayContext } from "../model/auth-overlay-context";
import { LoginOverlay } from "./LoginOverlay";

export type AuthOverlayProviderProps = PropsWithChildren<{
  className?: string;
}>;

export function AuthOverlayProvider({ children }: AuthOverlayProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <AuthOverlayContext.Provider value={{ close, isOpen, open }}>
      {children}
      {isOpen && <LoginOverlay onClose={close} />}
    </AuthOverlayContext.Provider>
  );
}
