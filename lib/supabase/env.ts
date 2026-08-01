/**
 * The two values every Supabase client needs, read once and checked once.
 *
 * The **publishable key** (`sb_publishable_…`), not the legacy `anon` JWT.
 * Supabase replaced the anon/service_role JWT pair with publishable/secret keys;
 * the old ones still work but are on their way out, and the publishable key can
 * be rotated without reissuing every token.
 *
 * Both values are public by design: the URL is a hostname, and the publishable
 * key only grants what row-level security allows. The **secret key** — the
 * service_role replacement — is deliberately absent from this project. It
 * bypasses every policy, so nothing here should be able to reach for it. See
 * docs/architecture.md.
 *
 * Throwing on a missing value is better than a client that constructs fine and
 * then fails every request with an opaque error.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env.local and fill it in — ` +
        `\`pnpm db:status\` prints the local values.`,
    );
  }

  return value;
}

export const supabaseUrl = () =>
  required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);

export const supabasePublishableKey = () =>
  required(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
