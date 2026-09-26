"use client";

import { LANGUAGES, categories, routes } from "@ethio-wellness/shared";
import { Chip } from "@/components/ui/chip";
import { TextAreaField, TextField } from "@/components/ui/field";
import { useLocale } from "@/lib/locale";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function ProfessionalOnboardingPage() {
  const { t } = useLocale();
  const router = useRouter();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(routes.professionalHome);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">{t("proOnboard.title")}</h1>
      <p className="mt-2 text-ink-2">{t("proOnboard.sub")}</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <TextField label={t("register.name")} name="name" defaultValue="Hana Tesfaye" />
        <TextField label={t("proOnboard.titleField")} name="title" defaultValue="Clinical Psychologist" />
        <TextField label={t("proOnboard.city")} name="city" defaultValue="Addis Ababa" />
        <TextField label={t("proOnboard.credentials")} name="credentials" />
        <TextAreaField label="Bio" name="bio" placeholder={t("proOnboard.bio")} />
        <div>
          <p className="mb-2 text-sm font-medium">{t("detail.specialties")}</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Chip key={category.id}>{category.name}</Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">{t("detail.languages")}</p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((language) => (
              <Chip key={language.id} eth={language.id === "amharic" || language.id === "tigrinya"}>
                {language.nativeLabel}
              </Chip>
            ))}
          </div>
        </div>
        <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] bg-primary font-semibold text-white">
          {t("onboard.continue")}
        </button>
      </form>
    </div>
  );
}
