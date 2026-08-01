import { createClient } from "@/lib/supabase/server";

/**
 * Server-side auth reads. Separate from the client half because this imports
 * `next/headers`, which a client component cannot pull in.
 */

/**
 * The signed-in user, or null.
 *
 * `getUser` rather than `getSession`: getSession trusts whatever is in the
 * cookie, while getUser revalidates it with the auth server. For deciding what
 * someone may see, only the revalidated answer is worth having.
 */
export async function currentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/** Reading a session makes the calling route dynamic. That is correct here. */
export async function isAuthenticated(): Promise<boolean> {
  return (await currentUser()) !== null;
}
