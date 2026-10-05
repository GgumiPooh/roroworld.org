"use client";

import { A_MINUTE, type Nullable } from "@/shared/lib";
import { useQuery } from "@tanstack/react-query";
import { type User } from "../model/types";

const USER_CACHE_KEY = "currentUser";

function getCachedUser(): Nullable<User> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    if (!cached) {
      return null;
    }
    return JSON.parse(cached) as User;
  } catch {
    return null;
  }
}

function setCachedUser(user: Nullable<User>): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_CACHE_KEY);
    }
  } catch {
    // INFO: Silently ignore local storage access failures.
  }
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", {
      credentials: "include",
      method: "POST",
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function fetchCurrentUser(): Promise<Nullable<User>> {
  try {
    const res = await fetch("/api/auth/name", {
      credentials: "include",
    });

    if (res.status === 401) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        const retryRes = await fetch("/api/auth/name", {
          credentials: "include",
        });
        if (retryRes.ok) {
          const data = (await retryRes.json()) as User;
          setCachedUser(data);
          return data;
        }
      }
      setCachedUser(null);
      return null;
    }

    if (!res.ok) {
      return getCachedUser();
    }

    const data = (await res.json()) as User;
    setCachedUser(data);
    return data;
  } catch {
    return getCachedUser();
  }
}

export function useCurrentUser() {
  const { data, error, isFetched, refetch } = useQuery({
    gcTime: A_MINUTE * 10,
    initialData: getCachedUser() ?? undefined,
    queryFn: fetchCurrentUser,
    queryKey: ["currentUser"],
    retry: false,
    staleTime: A_MINUTE * 5,
  });

  const displayName = data?.name || data?.nickname || null;

  return {
    displayName,
    error,
    isLoading: !isFetched && !data,
    refetch,
    user: data ?? null,
  };
}
