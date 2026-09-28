"use client";

import type { UserRole } from "@ethio-wellness/shared";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface SessionUser {
  role: UserRole;
  name?: string;
  email?: string;
  /** Professional applications need manual approval before dashboard access. */
  professionalStatus?: "pending" | "approved";
}

interface SessionContextValue {
  user: SessionUser;
  role: UserRole;
  setSession: (user: SessionUser) => void;
  signOut: () => void;
  ready: boolean;
}

const STORAGE_KEY = "ethio-wellness-session";
const SessionContext = createContext<SessionContextValue | null>(null);

const guest: SessionUser = { role: "guest" };

function readStored(): SessionUser {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return guest;
    const parsed = JSON.parse(raw) as SessionUser;
    if (parsed?.role === "client" || parsed?.role === "professional" || parsed?.role === "guest") {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return guest;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser>(guest);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readStored());
    setReady(true);
  }, []);

  const setSession = useCallback((next: SessionUser) => {
    setUser(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const signOut = useCallback(() => {
    setUser(guest);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, role: user.role, setSession, signOut, ready }),
    [user, setSession, signOut, ready],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
