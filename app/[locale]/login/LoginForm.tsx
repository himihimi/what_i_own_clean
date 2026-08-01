"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Email OTP in two steps: the code field only appears once an address has been
 * submitted, because a verification code cannot be typed before it is sent.
 *
 * Nothing is sent anywhere yet — Supabase Auth is wired at M1. The step state
 * is local so the shape of the flow is visible while the design is reviewed.
 */
export function LoginForm() {
  const t = useTranslations("login");
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const inputClass =
    "w-full rounded-md border border-border bg-surface px-4 py-3.5 text-[15px] text-text placeholder:text-disabled";

  return (
    <form
      className="mt-8 flex w-full flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setCodeSent(true);
      }}
    >
      <label className="sr-only" htmlFor="email">
        {t("email")}
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder={t("emailPlaceholder")}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className={inputClass}
      />

      {codeSent && (
        <>
          <p className="text-left text-xs text-muted">
            {t("codeSent", { email })}
          </p>
          <label className="sr-only" htmlFor="code">
            {t("code")}
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            placeholder={t("codePlaceholder")}
            className={inputClass}
          />
        </>
      )}

      <button
        type="submit"
        className="w-full rounded-md bg-accent px-4 py-4 text-base font-bold text-on-accent transition-transform duration-150 active:scale-[0.98]"
      >
        {codeSent ? t("logIn") : t("sendCode")}
      </button>

      <button
        type="button"
        className="w-full rounded-md border border-border bg-surface px-4 py-3.5 text-sm font-semibold text-muted transition-transform duration-150 active:scale-[0.98]"
      >
        {t("google")}
      </button>
    </form>
  );
}
