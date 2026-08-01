"use client";

import { MailCheck, TriangleAlert } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/auth/client";
import { authErrorKeys } from "@/lib/auth/messages";
import { fieldErrors, forgotPasswordSchema } from "@/lib/validation/auth";

export function ForgotPasswordForm({ linkError }: { linkError?: string }) {
  const t = useTranslations("forgotPassword");
  const tAuth = useTranslations("auth");
  const tErrors = useTranslations("authErrors");
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
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const parsed = forgotPasswordSchema({ email: tErrors("email") }).safeParse({
      email: form.get("email"),
    });

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      setFormError(null);
      return;
    }

    setErrors({});
    setFormError(null);
    setPending(true);

    const result = await requestPasswordReset({
      email: parsed.data.email,
      locale,
    });

    setPending(false);
    if (!result.ok) {
      setFormError(
        result.retryAfterSeconds !== undefined && result.reason === "rate-limited"
          ? tErrors("rateLimitedSeconds", { seconds: result.retryAfterSeconds })
          : tErrors(authErrorKeys[result.reason]),
      );
      return;
    }

    setSent(true);
  }

  /*
   * Confirmed without saying whether the address has an account — the wording is
   * conditional on purpose. Anything more specific would make this form a way to
   * find out who is registered.
   */
  if (sent) {
    return (
      <div className="mt-8 w-full text-left">
        <Alert>
          <MailCheck aria-hidden="true" />
          <AlertDescription>{t("sent")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <form className="mt-8 w-full text-left" onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        {formError && (
          <Alert variant="destructive">
            <TriangleAlert aria-hidden="true" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

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

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? t("submitting") : t("submit")}
        </Button>
      </FieldGroup>
    </form>
  );
}
