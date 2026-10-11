"use client";

import { LANGUAGES, routes } from "@ethio-wellness/shared";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { AuthRequestError, changeAccountPassword } from "@/lib/auth-api";
import { useLocale } from "@/lib/locale";
import { useSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AccountSettingsPage() {
  const { t, setLocale, locale } = useLocale();
  const { signOut, user } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [language, setLanguage] = useState(
    locale === "am" ? "amharic" : locale === "ti" ? "tigrinya" : locale === "om" ? "afaan-oromoo" : "english",
  );

  function closePasswordForm() {
    setPasswordOpen(false);
    setPasswordError("");
    setPasswordSaved(false);
  }

  async function onChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get("currentPassword") ?? "");
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");
    if (password.length < 8) {
      setPasswordError("Use at least 8 characters.");
      setPasswordSaved(false);
      return;
    }
    if (password !== confirm) {
      setPasswordError("Those passwords do not match.");
      setPasswordSaved(false);
      return;
    }
    setPasswordError("");
    try {
      await changeAccountPassword(currentPassword, password);
      form.reset();
      setPasswordSaved(true);
      setPasswordOpen(false);
    } catch (error) {
      setPasswordSaved(false);
      if (error instanceof AuthRequestError && error.code === "invalid_password") {
        setPasswordError("That current password is not right.");
        return;
      }
      setPasswordError("Could not update the password. Please try again.");
    }
  }

  return (
    <div className="max-w-[560px]">
      <h1 className="text-3xl font-bold text-ink">{t("account.title")}</h1>
      <p className="mt-2 text-ink-2">{t("account.sub")}</p>
      {saved ? (
        <div className="mt-4">
          <Alert tone="success">{t("prefs.saved")}</Alert>
        </div>
      ) : null}
      <div className="mt-6 space-y-6 rounded-2xl border border-border bg-surface p-6">
        <div>
          <p className="font-medium">Signed in as</p>
          <p className="mt-1 text-ink">{user.name ?? "Member"}</p>
          <p className="text-sm capitalize text-ink-3">{user.role}</p>
        </div>
        <label className="block">
          <span className="font-medium">{t("account.language")}</span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-[10px] border border-border bg-surface px-3"
          >
            {LANGUAGES.filter((item) => item.id === "english" || item.id === "amharic").map((item) => (
              <option key={item.id} value={item.id}>
                {item.nativeLabel}
              </option>
            ))}
            {LANGUAGES.filter((item) => item.id === "tigrinya" || item.id === "afaan-oromoo").map((item) => (
              <option key={item.id} value={item.id} disabled>
                {item.nativeLabel} ({t("chrome.comingSoon")})
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-ink-3">{t("account.languageHint")}</p>
        </label>
        <div>
          <p className="font-medium">{t("account.email")}</p>
          <input
            readOnly
            value={user.email ?? ""}
            className="mt-2 min-h-12 w-full rounded-[10px] border border-border bg-surface-warm px-3 text-ink-2"
          />
          <p className="mt-2 text-sm text-ink-3">{t("account.emailNote")}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={() => {
              const map = { amharic: "am", english: "en" } as const;
              if (language === "amharic" || language === "english") {
                setLocale(map[language]);
                setSaved(true);
              }
            }}
          >
            {t("account.save")}
          </Button>
          {passwordSaved ? <Alert tone="success">{t("account.passwordSaved")}</Alert> : null}
          {passwordOpen ? (
            <form className="space-y-3 border-t border-border pt-4" onSubmit={(event) => void onChangePassword(event)}>
              <p className="font-medium">{t("account.changePassword")}</p>
              {passwordError ? <Alert tone="error">{passwordError}</Alert> : null}
              <TextField label={t("account.currentPassword")} name="currentPassword" type="password" autoComplete="current-password" required />
              <TextField label={t("account.newPassword")} name="password" type="password" autoComplete="new-password" required />
              <TextField label={t("account.confirmPassword")} name="confirm" type="password" autoComplete="new-password" required />
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" variant="secondary">
                  {t("reset.submit")}
                </Button>
                <Button type="button" variant="text" onClick={closePasswordForm}>
                  {t("account.cancel")}
                </Button>
              </div>
            </form>
          ) : (
            <Button type="button" variant="secondary" onClick={() => setPasswordOpen(true)}>
              {t("account.changePassword")}
            </Button>
          )}
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              signOut();
              router.push(routes.home);
            }}
          >
            {t("account.signOut")}
          </Button>
        </div>
      </div>
    </div>
  );
}
