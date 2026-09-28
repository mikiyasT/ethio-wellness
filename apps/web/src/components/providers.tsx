"use client";

import { LocaleProvider } from "@/lib/locale";
import { SessionProvider } from "@/lib/session";
import { ThemeProvider } from "@/lib/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <SessionProvider>{children}</SessionProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
