"use client";

import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth/client";
import type { AuthFailure } from "@/lib/auth/types";
import { fieldErrors, loginSchema } from "@/lib/validation/auth";
import { useRouter } from "@/i18n/navigation";

/** Maps a failure reason to its message key, so no reason renders as raw text. */
const errorKeys = {
  "invalid-credentials": "invalidCredentials",
  "email-taken": "emailTaken",
  "weak-password": "weakPassword",
  "rate-limited": "rateLimited",
  unknown: "unknown",
} as const satisfies Record<AuthFailure, string>;

export function LoginForm() {
  const t = useTranslations("login");
  const tAuth = useTranslations("auth");
  const tErrors = useTranslations("authErrors");

  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
    setPending(true);

    const result = await signIn(parsed.data);

    if (!result.ok) {
      setPending(false);
      setFormError(tErrors(errorKeys[result.reason]));
      return;
    }

    // Stays pending through the navigation: re-enabling the button here would
    // invite a second submit while the next screen is still rendering.
    router.replace("/welcome");
    // The session arrived after any prefetch of /welcome, so drop that cache.
    router.refresh();
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

        {/* Pink filled: this is the screen's action, and nothing else competes
            for it now. */}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? t("submitting") : t("submit")}
        </Button>
      </FieldGroup>
    </form>
  );
}
