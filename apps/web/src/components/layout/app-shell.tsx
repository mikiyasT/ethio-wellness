"use client";

import { routes } from "@ethio-wellness/shared";
import { useSession } from "@/lib/session";
import { AUTO_APPROVE_PROFESSIONALS } from "@/lib/pro-approval";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BottomNav } from "./bottom-nav";
import { Footer } from "./footer";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

const PRO_ONBOARDING_PATHS = [
  "/professional/onboarding",
  "/professional/specialties",
  "/professional/availability",
  "/professional/pending",
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, user, ready } = useSession();

  const isClientArea =
    pathname === "/client" || pathname.startsWith("/client/") || pathname.startsWith("/account");
  const isProArea = pathname === "/professional" || pathname.startsWith("/professional/");
  const isProOnboardingFlow = PRO_ONBOARDING_PATHS.some(
    (path) => pathname === path || (path !== "/professional/pending" && pathname.startsWith(path)),
  );

  useEffect(() => {
    if (!ready) return;
    if ((isClientArea || isProArea) && role === "guest") {
      // Don't bounce login back to Account — dashboards are the post-login home.
      if (pathname === routes.account || pathname.startsWith(`${routes.account}/`)) {
        router.replace(routes.login);
        return;
      }
      const next = `${window.location.pathname}${window.location.search}`;
      router.replace(`${routes.login}?next=${encodeURIComponent(next)}`);
      return;
    }
    if (isClientArea && role === "professional" && pathname.startsWith("/client")) {
      router.replace(routes.professionalHome);
      return;
    }
    if (isProArea && role === "client" && !isProOnboardingFlow) {
      router.replace(routes.clientHome);
      return;
    }
    if (
      !AUTO_APPROVE_PROFESSIONALS &&
      role === "professional" &&
      user.professionalStatus === "pending" &&
      isProArea &&
      !isProOnboardingFlow &&
      pathname !== routes.professionalPending &&
      pathname !== routes.professionalProfile
    ) {
      router.replace(routes.professionalPending);
    }
  }, [ready, isClientArea, isProArea, isProOnboardingFlow, role, user, pathname, router]);

  const chromeRole = role !== "guest" ? role : "guest";
  const showSidebar = chromeRole !== "guest" && !pathname.startsWith("/professional/pending");

  if ((isClientArea || isProArea) && (!ready || role === "guest")) {
    return (
      <div className="flex min-h-full flex-col">
        <Header role="guest" />
        <main className="flex flex-1 items-center justify-center px-4 py-16 text-ink-2">Redirecting…</main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <Header role={chromeRole} />
      {showSidebar ? (
        <div className="mx-auto flex w-full max-w-[1200px] flex-1 gap-8 px-4 py-8 pb-20 lg:pb-8">
          <Sidebar role={chromeRole} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      ) : (
        <main className="flex-1">{children}</main>
      )}
      <Footer />
      <BottomNav role={chromeRole} />
    </div>
  );
}
