"use client";

import { routes } from "@ethio-wellness/shared";
import { Button, ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";

export function AuthGate({ onClose }: { onClose: () => void }) {
  const { t } = useLocale();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
        <h2 className="text-2xl font-semibold text-ink">{t("gate.title")}</h2>
        <p className="mt-3 text-ink-2">{t("gate.body")}</p>
        <div className="mt-6 flex flex-col gap-3">
          <ButtonLink href={routes.login} block>
            {t("gate.signIn")}
          </ButtonLink>
          <ButtonLink href={routes.register} variant="secondary" block>
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
