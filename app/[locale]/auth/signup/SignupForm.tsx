"use client";

import { MailCheck, TriangleAlert } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";
import { signUp } from "@/lib/auth/client";
import { authErrorKeys } from "@/lib/auth/messages";
import {
  PASSWORD_MIN,
  fieldErrors,
  signupSchema,
} from "@/lib/validation/auth";

export function SignupForm() {
  const t = useTranslations("signup");
  const tAuth = useTranslations("auth");
  const tErrors = useTranslations("authErrors");
  const router = useRouter();
  const locale = useLocale();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  /** Set when the project wants the address confirmed before first sign-in. */
  const [awaitingEmail, setAwaitingEmail] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const parsed = signupSchema({
      email: tErrors("email"),
      passwordShort: tErrors("passwordShort", { min: PASSWORD_MIN }),
      nameRequired: tErrors("nameRequired"),
      passwordMismatch: tErrors("passwordMismatch"),
    }).safeParse({
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      confirmPassword: form.get("confirmPassword"),
    });

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      setFormError(null);
      return;
    }

    setErrors({});
    setFormError(null);
    setPending(true);

    const { confirmPassword: _confirm, ...values } = parsed.data;
    const result = await signUp({ ...values, locale });

    if (!result.ok) {
      setPending(false);
      setFormError(
        result.retryAfterSeconds !== undefined && result.reason === "rate-limited"
          ? tErrors("rateLimitedSeconds", { seconds: result.retryAfterSeconds })
          : tErrors(authErrorKeys[result.reason]),
      );
      return;
    }

    // No session means the address has to be confirmed first. The account exists
    // either way, so this is a step in the flow, not a failure.
    if (result.confirmationRequired) {
      setPending(false);
      setAwaitingEmail(values.email);
      return;
    }

    // Stays pending through the navigation: re-enabling the button here would
    // invite a second submit while the next screen is still rendering.
    router.replace("/welcome");
    router.refresh();
  }

  /*
   * Deliberately says a link was sent, not that an account was created. Supabase
   * returns this same outcome for an address that already has one, so that
   * sign-up cannot be used to find out who is registered — and this screen must
   * not give that away either.
   */
  if (awaitingEmail) {
    return (
      <div className="mt-8 w-full text-left">
        <Alert>
          <MailCheck aria-hidden="true" />
          <AlertDescription>
            {t("checkInbox", { email: awaitingEmail })}
          </AlertDescription>
        </Alert>
        <p className="mt-3 text-xs text-muted">{t("inboxHint")}</p>
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

        {/* The label doubles as the placeholder, so it is visually hidden
            rather than removed: a placeholder disappears as soon as there is
            text in the field, and is not an accessible name. */}
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="name" className="sr-only">
            {tAuth("name")}
          </FieldLabel>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder={tAuth("name")}
            aria-invalid={Boolean(errors.name)}
          />
          <FieldError>{errors.name}</FieldError>
        </Field>

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
            autoComplete="new-password"
            placeholder={tAuth("password")}
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password ? (
            <FieldError>{errors.password}</FieldError>
          ) : (
            <FieldDescription>
              {tAuth("passwordHint", { min: PASSWORD_MIN })}
            </FieldDescription>
          )}
        </Field>

        <Field data-invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel htmlFor="confirmPassword" className="sr-only">
            {tAuth("confirmPassword")}
          </FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder={tAuth("confirmPassword")}
            aria-invalid={Boolean(errors.confirmPassword)}
          />
          <FieldError>{errors.confirmPassword}</FieldError>
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? t("submitting") : t("submit")}
        </Button>
      </FieldGroup>
    </form>
  );
}
