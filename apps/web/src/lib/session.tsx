"use client";

import type { UserRole } from "@ethio-wellness/shared";
import { db, type DbUser } from "@/lib/db";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface SessionUser {
  userId?: string;
  role: UserRole;
  name?: string;
  email?: string;
  professionalId?: string;
  /** Professional applications need manual approval before dashboard access. */
  professionalStatus?: "pending" | "approved";
}

interface SessionContextValue {
  user: SessionUser;
  role: UserRole;
  setSession: (user: SessionUser) => void;
  setSessionFromUser: (dbUser: DbUser) => Promise<void>;
  signOut: () => void;
  ready: boolean;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const guest: SessionUser = { role: "guest" };

async function resolveSession(userId: string | null): Promise<SessionUser> {
  if (!userId) return guest;
  const dbUser = await db.users.getById(userId);
  if (!dbUser) return guest;
  if (dbUser.role === "professional") {
    const pro = dbUser.professionalId
      ? await db.professionals.getById(dbUser.professionalId)
      : await db.professionals.getByUserId(dbUser.id);
    return {
      userId: dbUser.id,
      role: "professional",
      name: dbUser.name,
      email: dbUser.email,
      professionalId: pro?.id ?? dbUser.professionalId,
      professionalStatus: pro?.status ?? "pending",
    };
  }
  return {
    userId: dbUser.id,
    role: "client",
    name: dbUser.name,
    email: dbUser.email,
  };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser>(guest);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const userId = await db.session.getUserId();
    setUser(await resolveSession(userId));
  }, []);

  useEffect(() => {
    void (async () => {
      await refresh();
      setReady(true);
    })();
  }, [refresh]);

  const setSessionFromUser = useCallback(async (dbUser: DbUser) => {
    await db.session.setUserId(dbUser.id);
    setUser(await resolveSession(dbUser.id));
  }, []);

  const setSession = useCallback((next: SessionUser) => {
    setUser(next);
    void db.session.setUserId(next.userId ?? null);
  }, []);

  const signOut = useCallback(() => {
    setUser(guest);
    void db.session.clear();
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
