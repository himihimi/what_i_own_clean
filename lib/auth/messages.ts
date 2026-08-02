import type { AuthFailure } from "./types";

/**
 * Failure reason to message key. Every form uses this, so a new reason cannot be
 * added without every screen learning how to say it.
 */
export const authErrorKeys = {
  "invalid-credentials": "invalidCredentials",
  "email-taken": "emailTaken",
  "email-not-confirmed": "emailNotConfirmed",
  "weak-password": "weakPassword",
  "rate-limited": "rateLimited",
  unreachable: "unreachable",
  unknown: "unknown",
} as const satisfies Record<AuthFailure, string>;

export type AuthErrorKey = (typeof authErrorKeys)[AuthFailure];
