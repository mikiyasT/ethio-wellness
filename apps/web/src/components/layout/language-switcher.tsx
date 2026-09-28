"use client";

import { LOCALES, type Locale } from "@ethio-wellness/shared";
import { NativeSelect } from "@/components/ui/native-select";
import { useLocale } from "@/lib/locale";

/** Full UI translations ship for EN + Amharic draft. TI/OM await native review. */
const AVAILABLE: Locale[] = ["en", "am"];

export function LanguageSwitcher() {
  const { t, locale, setLocale } = useLocale();

  return (
    <NativeSelect
      chrome="locale"
      label="Language"
      value={AVAILABLE.includes(locale) ? locale : "en"}
      onChange={(value) => {
        if (AVAILABLE.includes(value as Locale)) setLocale(value as Locale);
      }}
    >
      {LOCALES.filter((item) => AVAILABLE.includes(item.id)).map((item) => (
        <option key={item.id} value={item.id} className={item.eth ? "eth" : undefined}>
          {item.name}
        </option>
      ))}
      {LOCALES.filter((item) => !AVAILABLE.includes(item.id)).map((item) => (
        <option key={item.id} value={item.id} disabled>
          {item.name} ({t("chrome.comingSoon")})
        </option>
      ))}
    </NativeSelect>
  );
}
