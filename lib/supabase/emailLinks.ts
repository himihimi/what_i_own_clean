import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { supabasePublishableKey, supabaseUrl } from "./env";

/**
 * The client used **only** to ask Supabase to send an email — sign-up
 * confirmation, a resend of it, and a password reset.
 *
 * It exists because of one property: `flowType: "implicit"`, which means no PKCE
 * challenge is generated and no code verifier is stored.
 *
 * `createBrowserClient` cannot be used for these calls. It hard-codes
 * `flowType: "pkce"` *after* spreading the caller's options, so the setting
 * cannot be overridden. PKCE binds an emailed link to the browser that requested
 * it: the verifier lives in that browser's cookies, and `exchangeCodeForSession`
 * fails without it. Signing up on a laptop and opening the mail on a phone — the
 * ordinary case for an app built at phone width — then produces a link that
 * cannot be redeemed, reported to the reader as "that link has expired".
 *
 * Without the challenge, `{{ .TokenHash }}` in the email templates renders a
 * plain one-time token instead of a `pkce_…` one, and the callback verifies it
 * server-side with `verifyOtp`. Nothing about the reader's browser is involved,
 * so the link works wherever it is opened.
 *
 * It does not persist anything: the session cookies belong to the app's own
 * client. Sign-up hands any session it receives over to that one — see
 * lib/auth/client.ts.
 */
export function createEmailLinkClient() {
  return createSupabaseClient(supabaseUrl(), supabasePublishableKey(), {
    auth: {
      flowType: "implicit",
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
