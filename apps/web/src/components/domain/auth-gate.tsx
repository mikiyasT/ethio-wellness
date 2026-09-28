"use client";

import { routes } from "@ethio-wellness/shared";
import { Button, ButtonLink } from "@/components/ui/button";
import { withNext } from "@/lib/booking";
import { useLocale } from "@/lib/locale";
import { useEffect } from "react";

export function AuthGate({ onClose, next }: { onClose: () => void; next: string }) {
  const { t } = useLocale();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-surface p-7 shadow-xl">
        <h2 className="text-2xl font-semibold text-ink">{t("gate.title")}</h2>
        <p className="mt-3 leading-6 text-ink-2">{t("gate.body")}</p>
        <div className="mt-6 flex flex-col gap-3">
          <ButtonLink href={withNext(routes.login, next)} block>
            {t("gate.signIn")}
          </ButtonLink>
          <ButtonLink href={withNext(routes.register, next)} variant="outline" block>
            {t("gate.create")}
          </ButtonLink>
          <Button variant="text" onClick={onClose}>
            {t("gate.continue")}
          </Button>
        </div>
      </div>
    </div>
  );
}
