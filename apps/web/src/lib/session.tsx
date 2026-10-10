"use client";

import type { UserRole } from "@ethio-wellness/shared";
import { fetchCurrentUser, logoutAccount, type AuthUser } from "@/lib/auth-api";
import type { DbUser } from "@/lib/db";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface SessionUser {
  userId?: string;
  role: UserRole;
  name?: string;
  email?: string;
  professionalId?: string;
  /** Professional applications need manual approval before dashboard access. */
  professionalStatus?: "pending" | "approved" | "rejected";
}

interface SessionContextValue {
  user: SessionUser;
  role: UserRole;
  setSession: (user: SessionUser) => void;
  setSessionFromUser: (dbUser: DbUser) => Promise<void>;
  signOut: () => Promise<void>;
  ready: boolean;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const guest: SessionUser = { role: "guest" };

function sessionFromAuth(user: AuthUser): SessionUser {
  return {
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    professionalId: user.professionalId,
    professionalStatus: user.professionalStatus,
  };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser>(guest);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const current = await fetchCurrentUser();
    setUser(current ? sessionFromAuth(current) : guest);
  }, []);

  useEffect(() => {
    void (async () => {
      await refresh();
      setReady(true);
    })();
  }, [refresh]);

  const setSessionFromUser = useCallback(async (dbUser: DbUser) => {
    setUser({
      userId: dbUser.id,
      role: dbUser.role,
      name: dbUser.name,
      email: dbUser.email,
      professionalId: dbUser.professionalId,
    });
  }, []);

  const setSession = useCallback((next: SessionUser) => {
    setUser(next);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logoutAccount();
    } catch {
      // Clearing the local view still signs the tab out if the API is unreachable.
    }
    setUser(guest);
  }, []);

  const value = useMemo(
    () => ({ user, role: user.role, setSession, setSessionFromUser, signOut, ready, refresh }),
    [user, setSession, setSessionFromUser, signOut, ready, refresh],
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
