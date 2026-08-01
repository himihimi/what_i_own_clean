"use client";

import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { updatePassword } from "@/lib/auth/client";
import { authErrorKeys } from "@/lib/auth/messages";
import {
  PASSWORD_MIN,
  fieldErrors,
  updatePasswordSchema,
} from "@/lib/validation/auth";

export function UpdatePasswordForm() {
  const t = useTranslations("updatePassword");
  const tAuth = useTranslations("auth");
  const tErrors = useTranslations("authErrors");
  const router = useRouter();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const parsed = updatePasswordSchema({
      passwordShort: tErrors("passwordShort", { min: PASSWORD_MIN }),
      passwordMismatch: tErrors("passwordMismatch"),
    }).safeParse({
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

    const result = await updatePassword(parsed.data.password);

    if (!result.ok) {
      setPending(false);
      setFormError(
        result.retryAfterSeconds !== undefined && result.reason === "rate-limited"
          ? tErrors("rateLimitedSeconds", { seconds: result.retryAfterSeconds })
          : tErrors(authErrorKeys[result.reason]),
      );
      return;
    }

    // Already signed in — the recovery link established the session — so this
    // goes straight in rather than back to a login form.
    router.replace("/welcome");
    router.refresh();
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

        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="password" className="sr-only">
            {t("newPassword")}
          </FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder={t("newPassword")}
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
