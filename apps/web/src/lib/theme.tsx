"use client";

import { db, type ThemePref } from "@/lib/db";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = ThemePref;

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    void (async () => {
      const stored = await db.prefs.getTheme();
      const attr = document.documentElement.getAttribute("data-theme");
      const next: Theme = stored === "dark" || attr === "dark" ? "dark" : "light";
      setThemeState(next);
      applyTheme(next);
    })();
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    void db.prefs.setTheme(next);
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
