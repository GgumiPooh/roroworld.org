"use client";

import { type PropsWithChildren, useCallback, useState } from "react";
import { BackgroundContext } from "../model/background-context";
import type { BackgroundState } from "../model/types";

export type BackgroundProviderProps = PropsWithChildren;

export function BackgroundProvider({ children }: BackgroundProviderProps) {
  const [pageState, setPageState] = useState<BackgroundState>({});

  const setBackground = useCallback((state: BackgroundState) => {
    setPageState(state);
  }, []);

  return (
    <BackgroundContext.Provider value={{ pageState, setBackground }}>
      {children}
    </BackgroundContext.Provider>
  );
}
