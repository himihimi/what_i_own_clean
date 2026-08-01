import { createBrowserClient } from "@supabase/ssr";

import { supabasePublishableKey, supabaseUrl } from "./env";

/**
 * The browser client. This is the one that does almost all the work: the app
 * reads and writes Postgres directly from here, under row-level security.
 *
 * `createBrowserClient` from @supabase/ssr rather than the plain
 * `createClient`, because it stores the session in cookies rather than
 * localStorage — which is what lets server components see it too.
 *
 * Safe to call repeatedly; the underlying client is memoised per browser.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl(), supabasePublishableKey());
}
