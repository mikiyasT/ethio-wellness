"use client";

import type { UserRole } from "@ethio-wellness/shared";
import { usePathname } from "next/navigation";
import { BottomNav } from "./bottom-nav";
import { Footer } from "./footer";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

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
  const showSidebar = role !== "guest";

  return (
    <div className="flex min-h-full flex-col">
      <Header role={role} />
      {showSidebar ? (
        <div className="mx-auto flex w-full max-w-[1200px] flex-1 gap-8 px-4 py-8 pb-20 lg:pb-8">
          <Sidebar role={role} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      ) : (
        <main className="flex-1">{children}</main>
      )}
      <Footer />
      <BottomNav role={role} />
    </div>
  );
}
