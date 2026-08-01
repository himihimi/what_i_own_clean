import { z } from "zod";

/**
 * Auth form schemas.
 *
 * The messages are passed in already translated rather than looked up here, so
 * validation text comes out of `messages/` in the reader's locale. Taking
 * resolved strings rather than a translator function keeps next-intl's typed
 * message keys intact at the call site — handing the translator over would mean
 * casting its key type away.
 *
 * These validate shape only. Whether an email is already registered, or a
 * password is right, is the server's answer and arrives as a form-level error.
 */

export const PASSWORD_MIN = 8;

export type AuthMessages = {
  email: string;
  passwordRequired: string;
  passwordShort: string;
  nameRequired: string;
  passwordMismatch: string;
};

export function loginSchema(m: Pick<AuthMessages, "email" | "passwordRequired">) {
  return z.object({
    email: z.email({ error: m.email }),
    // Deliberately no length rule on sign-in: an existing password predates
    // whatever the current rule is, and "too short" here would be a lie.
    password: z.string().min(1, { error: m.passwordRequired }),
  });
}

export function signupSchema(
  m: Pick<
    AuthMessages,
    "email" | "passwordShort" | "nameRequired" | "passwordMismatch"
  >,
) {
  return z
    .object({
      name: z.string().trim().min(1, { error: m.nameRequired }),
      email: z.email({ error: m.email }),
      password: z.string().min(PASSWORD_MIN, { error: m.passwordShort }),
      confirmPassword: z.string(),
    })
    .refine((values) => values.password === values.confirmPassword, {
      error: m.passwordMismatch,
      // Reported on the confirm field, which is the one to correct.
      path: ["confirmPassword"],
    });
}

export function forgotPasswordSchema(m: Pick<AuthMessages, "email">) {
  return z.object({ email: z.email({ error: m.email }) });
}

/** Same rules as sign-up: this is where a new password is chosen. */
export function updatePasswordSchema(
  m: Pick<AuthMessages, "passwordShort" | "passwordMismatch">,
) {
  return z
    .object({
      password: z.string().min(PASSWORD_MIN, { error: m.passwordShort }),
      confirmPassword: z.string(),
    })
    .refine((values) => values.password === values.confirmPassword, {
      error: m.passwordMismatch,
      path: ["confirmPassword"],
    });
}

export type LoginValues = z.infer<ReturnType<typeof loginSchema>>;
export type SignupValues = z.infer<ReturnType<typeof signupSchema>>;

/** One message per field, in the shape `<FieldError>` takes. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in result)) {
      result[field] = issue.message;
    }
  }

  return result;
}
