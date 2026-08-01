import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { supabasePublishableKey, supabaseUrl } from "./env";

/**
 * The server client, for server components, route handlers and server actions.
 *
 * It is built from the request's cookies, so it acts **as the caller** and RLS
 * applies exactly as it does in the browser. There is one of these and it takes
 * no service-role key, which is the single most important property of this
 * architecture: no code path can bypass a policy.
 *
 * Must be constructed per request — never hoisted to a module constant, since
 * cookies belong to a request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server components cannot set cookies. That is fine: the proxy
          // refreshes the session on every request, so the only thing lost here
          // is a redundant write.
        }
      },
    },
  });
}
