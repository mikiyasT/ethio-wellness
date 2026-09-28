"use client";

import { NativeSelect } from "@/components/ui/native-select";
import { useLocale } from "@/lib/locale";
import { useTheme, type Theme } from "@/lib/theme";

export function ModeSwitcher() {
  const { t } = useLocale();
  const { theme, setTheme } = useTheme();

  return (
    <NativeSelect chrome="theme" label={t("chrome.mode")} value={theme} onChange={(value) => setTheme(value as Theme)}>
      <option value="light">{t("chrome.bright")}</option>
      <option value="dark">{t("chrome.night")}</option>
    </NativeSelect>
  );
}
