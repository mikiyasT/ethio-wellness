"use client";

import type { UserRole } from "@ethio-wellness/shared";
import { usePathname } from "next/navigation";
import { BottomNav } from "./bottom-nav";
import { Footer } from "./footer";
import { Header } from "./header";

function roleFromPath(pathname: string): UserRole {
  if (pathname === "/professional" || pathname.startsWith("/professional/")) return "professional";
  if (pathname === "/client" || pathname.startsWith("/client/") || pathname.startsWith("/account")) {
    return "client";
  }
  return "guest";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const role = roleFromPath(pathname);

  return (
    <div className="flex min-h-full flex-col">
      <Header role={role} />
      <main className={role === "guest" ? "flex-1" : "flex-1 pb-16 md:pb-0"}>{children}</main>
      <Footer />
      <BottomNav role={role} />
    </div>
  );
}
