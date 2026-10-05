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

/** Guest booking funnel — no account required (Phase 1 differentiator). */
const GUEST_BOOKING_PATHS = [
  "/client/book",
  "/client/payment",
  "/client/booking-confirmation",
];

function isGuestBookingPath(pathname: string) {
  return GUEST_BOOKING_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, user, ready } = useSession();
  const guestBooking = isGuestBookingPath(pathname);

  const isClientArea =
    pathname === "/client" || pathname.startsWith("/client/") || pathname.startsWith("/account");
  const isProArea = pathname === "/professional" || pathname.startsWith("/professional/");
  const isProOnboardingFlow = PRO_ONBOARDING_PATHS.some(
    (path) => pathname === path || (path !== "/professional/pending" && pathname.startsWith(path)),
  );
  const requiresAuth =
    ((isClientArea && !guestBooking) || isProArea) && role === "guest";

  useEffect(() => {
    if (!ready) return;
    if (requiresAuth) {
      if (pathname === routes.account || pathname.startsWith(`${routes.account}/`)) {
        router.replace(routes.login);
        return;
      }
      const next = `${window.location.pathname}${window.location.search}`;
      router.replace(`${routes.login}?next=${encodeURIComponent(next)}`);
      return;
    }
    if (
      isClientArea &&
      !guestBooking &&
      role === "professional" &&
      pathname.startsWith("/client")
    ) {
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
  }, [
    ready,
    requiresAuth,
    isClientArea,
    isProArea,
    isProOnboardingFlow,
    guestBooking,
    role,
    user,
    pathname,
    router,
  ]);

  const chromeRole = role !== "guest" ? role : "guest";
  const showSidebar =
    chromeRole !== "guest" &&
    !pathname.startsWith("/professional/pending") &&
    !guestBooking;

  if (requiresAuth && (!ready || role === "guest")) {
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
        <main className={guestBooking ? "mx-auto w-full max-w-[1200px] flex-1 px-4 py-8" : "flex-1"}>
          {children}
        </main>
      )}
      <Footer />
      {!guestBooking ? <BottomNav role={chromeRole} /> : null}
    </div>
  );
}
