"use client";

import { routes } from "@ethio-wellness/shared";
import { Button, ButtonLink } from "@/components/ui/button";
import { withNext } from "@/lib/booking";
import { useLocale } from "@/lib/locale";
import { useEffect } from "react";

export function BookChoiceDialog({
  nextHref,
  busy,
  onContinueAsGuest,
  onClose,
}: {
  /** Path to return to after register/login (book URL with pro + slot). */
  nextHref: string;
  busy?: boolean;
  onContinueAsGuest: () => void;
  onClose: () => void;
}) {
  const { t } = useLocale();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-choice-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface p-7 shadow-xl">
        <h2 id="book-choice-title" className="text-2xl font-semibold text-ink">
          {t("bookChoice.title")}
        </h2>
        <p className="mt-3 leading-6 text-ink-2">{t("bookChoice.body")}</p>
        <div className="mt-6 flex flex-col gap-3">
          <Button disabled={busy} onClick={onContinueAsGuest} block>
            {busy ? t("bookChoice.holding") : t("bookChoice.guest")}
          </Button>
          <p className="text-center text-xs text-ink-3">{t("bookChoice.guestHint")}</p>
          <ButtonLink
            href={withNext(routes.register, nextHref)}
            variant="outline"
            block
            className={busy ? "pointer-events-none opacity-50" : undefined}
          >
            {t("bookChoice.account")}
          </ButtonLink>
          <p className="text-center text-xs text-ink-3">{t("bookChoice.accountHint")}</p>
          <p className="pt-1 text-center text-sm">
            <ButtonLink
              href={withNext(routes.login, nextHref)}
              variant="text"
              className={busy ? "pointer-events-none opacity-50" : undefined}
            >
              {t("bookChoice.signIn")}
            </ButtonLink>
          </p>
          <Button variant="text" disabled={busy} onClick={onClose}>
            {t("bookChoice.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}
