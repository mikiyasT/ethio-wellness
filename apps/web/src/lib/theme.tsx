"use client";

import type { ThemePref } from "@/lib/db";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = ThemePref;

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function applyTheme(_theme?: Theme) {
  const root = document.documentElement;
  // App is night-only — no light mode switcher.
  root.setAttribute("data-theme", "dark");
  root.style.colorScheme = "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    applyTheme("dark");
    setThemeState("dark");
  }, []);

  const setTheme = useCallback((_next: Theme) => {
    // Night-only: ignore requests for light mode.
    setThemeState("dark");
    applyTheme("dark");
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
