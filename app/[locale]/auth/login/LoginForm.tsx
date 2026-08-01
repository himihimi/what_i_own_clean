"use client";

import { MailCheck, TriangleAlert } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resendConfirmation, signIn } from "@/lib/auth/client";
import { authErrorKeys } from "@/lib/auth/messages";
import { fieldErrors, loginSchema } from "@/lib/validation/auth";
import { Link, useRouter } from "@/i18n/navigation";

/**
 * `linkError` is set when a confirmation link has expired or was already spent —
 * the callback sends those here, since signing in is where that person needs to
 * end up anyway.
 */
export function LoginForm({ linkError }: { linkError?: string }) {
  const t = useTranslations("login");
  const tAuth = useTranslations("auth");
  const tErrors = useTranslations("authErrors");

  const router = useRouter();
  const locale = useLocale();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(
    linkError === "expired"
      ? tErrors("linkExpired")
      : linkError === "link"
        ? tErrors("linkInvalid")
        : null,
  );
  const [pending, setPending] = useState(false);
  /**
   * The address to resend a confirmation to. Set only when sign-in was refused
   * because the address is unconfirmed — the one case where the person is stuck
   * unless a fresh link can be sent, since the one they hold may have expired.
   */
  const [unconfirmed, setUnconfirmed] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    if (!unconfirmed) return;

    setPending(true);
    const result = await resendConfirmation({ email: unconfirmed, locale });
    setPending(false);

    if (!result.ok) {
      setFormError(
        result.retryAfterSeconds !== undefined && result.reason === "rate-limited"
          ? tErrors("rateLimitedSeconds", { seconds: result.retryAfterSeconds })
          : tErrors(authErrorKeys[result.reason]),
      );
      return;
    }

    setFormError(null);
    setResent(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const parsed = loginSchema({
      email: tErrors("email"),
      passwordRequired: tErrors("passwordRequired"),
    }).safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      setFormError(null);
      return;
    }

    setErrors({});
    setFormError(null);
    setUnconfirmed(null);
    setResent(false);
    setPending(true);

    const result = await signIn(parsed.data);

    if (!result.ok) {
      setPending(false);
      setFormError(
        result.retryAfterSeconds !== undefined && result.reason === "rate-limited"
          ? tErrors("rateLimitedSeconds", { seconds: result.retryAfterSeconds })
          : tErrors(authErrorKeys[result.reason]),
      );

      // Refused because the address is unconfirmed: offer a fresh link, since
      // the one they were sent has very likely expired.
      if (result.reason === "email-not-confirmed") {
        setUnconfirmed(parsed.data.email);
      }
      return;
    }

    // Stays pending through the navigation: re-enabling the button here would
    // invite a second submit while the next screen is still rendering.
    router.replace("/welcome");
    // The session arrived after any prefetch of /welcome, so drop that cache.
    router.refresh();
  }

  // A fresh link is on its way, so the form has nothing more to offer.
  if (resent && unconfirmed) {
    return (
      <div className="mt-8 w-full text-left">
        <Alert>
          <MailCheck aria-hidden="true" />
          <AlertDescription>
            {t("linkSent", { email: unconfirmed })}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <form className="mt-8 w-full text-left" onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        {formError && (
          <Alert variant="destructive">
            {/* Decorative: the Alert's role already announces the message. */}
            <TriangleAlert aria-hidden="true" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {/* Only route out of an unconfirmed address: the link they hold may be
            dead, so offer a new one right where the refusal happened. */}
        {unconfirmed && (
          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            disabled={pending}
            className="w-full"
          >
            {pending ? t("resending") : t("resend")}
          </Button>
        )}

        {/* The label doubles as the placeholder, so it is visually hidden
            rather than removed: a placeholder disappears as soon as there is
            text in the field, and is not an accessible name. */}
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email" className="sr-only">
            {tAuth("email")}
          </FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={tAuth("email")}
            aria-invalid={Boolean(errors.email)}
          />
          <FieldError>{errors.email}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="password" className="sr-only">
            {tAuth("password")}
          </FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder={tAuth("password")}
            aria-invalid={Boolean(errors.password)}
          />
          <FieldError>{errors.password}</FieldError>
        </Field>

        {/* Under the password, right-aligned, in normal text colour rather than
            the accent — it is an escape hatch, not the action being offered. */}
        <div className="-mt-3 text-right">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-text underline-offset-4 hover:underline"
          >
            {t("forgotPasswordLink")}
          </Link>
        </div>

        {/* Pink filled: this is the screen's action, and nothing else competes
            for it now. */}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? t("submitting") : t("submit")}
        </Button>
      </FieldGroup>
    </form>
  );
}
