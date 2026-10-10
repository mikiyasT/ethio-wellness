import { apiBase } from "@/lib/public-api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "client" | "professional";
  professionalId?: string;
  professionalStatus?: "pending" | "approved" | "rejected";
};

export class AuthRequestError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}

async function authRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) {
    throw new AuthRequestError(response.status, body.error || "request_failed");
  }
  return body;
}

export function loginAccount(email: string, password: string) {
  return authRequest<{ user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registerAccount(input: {
  name: string;
  email: string;
  password: string;
  role: "client" | "professional";
}) {
  return authRequest<{ user: AuthUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchCurrentUser() {
  try {
    const body = await authRequest<{ user: AuthUser }>("/auth/me");
    return body.user;
  } catch (error) {
    if (error instanceof AuthRequestError && error.status === 401) return null;
    throw error;
  }
}

export function logoutAccount() {
  return authRequest<{ ok: true }>("/auth/logout", { method: "POST" });
}

export function requestPasswordReset(email: string) {
  return authRequest<{ ok: true }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetAccountPassword(token: string, password: string) {
  return authRequest<{ ok: true }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export const REGISTER_DRAFT_KEY = "ayzon-register-draft";
