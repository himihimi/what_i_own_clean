/**
 * Authentication state, stubbed.
 *
 * Everything that needs to know whether someone is signed in asks this one
 * function, so there is a single place to replace when Supabase Auth lands at
 * M1 — where it becomes a session read from the server client built on the
 * caller's JWT.
 *
 * Returns false for now, so every visit lands on the login screen.
 */
export async function isAuthenticated(): Promise<boolean> {
  return false;
}
