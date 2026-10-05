"use client";

import { LANGUAGES, categories, routes } from "@ethio-wellness/shared";
import { Alert } from "@/components/ui/alert";
import { Chip } from "@/components/ui/chip";
import { useLocale } from "@/lib/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function ClientOnboardingPreferencesPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [languages, setLanguages] = useState<string[]>(["amharic"]);
  const [support, setSupport] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function toggle(list: string[], id: string, setter: (value: string[]) => void) {
    setter(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (languages.length === 0) {
      setError("Please pick at least one language.");
      return;
    }
    if (support.length === 0) {
      setError("Please choose at least one type of support.");
      return;
    }
    setSaved(true);
    setTimeout(() => router.push(routes.clientHome), 600);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">{t("prefs.title")}</h1>
      <p className="mt-2 text-ink-2">{t("prefs.sub")}</p>
      {saved ? <div className="mt-4"><Alert tone="success">{t("prefs.saved")}</Alert></div> : null}
      {error ? <div className="mt-4"><Alert tone="error">{error}</Alert></div> : null}
      <form className="mt-6 space-y-6" onSubmit={onSubmit}>
        <div>
          <p className="font-medium">{t("prefs.languages")}</p>
          <p className="text-sm text-ink-3">{t("prefs.carried")}</p>
          <p className="mt-1 text-sm text-ink-2">{t("prefs.pickLang")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {LANGUAGES.map((item) => (
              <Chip key={item.id} selected={languages.includes(item.id)} onClick={() => toggle(languages, item.id, setLanguages)}>
                {item.nativeLabel}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="font-medium">{t("prefs.support")}</p>
          <p className="text-sm text-ink-2">{t("prefs.supportHint")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Chip key={category.id} selected={support.includes(category.id)} onClick={() => toggle(support, category.id, setSupport)}>
                {category.name}
              </Chip>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-3">{t("prefs.growing")}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={routes.clientOnboarding} className="inline-flex min-h-12 items-center justify-center rounded-[10px] border border-border px-4">
            {t("prefs.back")}
          </Link>
          <Link href={routes.clientHome} className="inline-flex min-h-12 items-center justify-center px-4 text-primary">
            {t("prefs.skip")}
          </Link>
          <button type="submit" className="inline-flex min-h-12 flex-1 items-center justify-center rounded-[10px] bg-primary font-semibold text-on-primary">
            {t("onboard.continue")}
          </button>
        </div>
      </form>
    </div>
  );
}
