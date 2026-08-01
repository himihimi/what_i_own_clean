# Architecture — What I Own

The record of what was decided and why. Sections are written as the
corresponding code lands. See [design.md](./design.md) for the visual system.

Still to write up: the Supabase-direct shape, the data model, row-level
security, the AI seam, the intake and assistant flows, testing, milestones.

---

## UI stack

| Concern | Choice | Note |
|---|---|---|
| Styling | Tailwind v4 | tokens as CSS variables, mapped with `@theme inline` |
| Components | shadcn, Radix base | generated into `components/ui`, then adapted to our tokens |
| Icons | Lucide | brand marks are local assets; Lucide carries none |
| Animation | Motion | five duration tokens in `lib/motion.ts` |
| i18n | next-intl | locale in the URL |

The design tokens in `app/globals.css` are the single palette. shadcn's semantic names are aliases
onto it rather than a second set of values, so there is one place to change a colour and dark mode
needs no parallel palette. Two of its names collide with ours and must be fixed by hand on every
`shadcn add` — see [design.md](./design.md) §6.

## Entry point and auth gate

`/` is not a page. The proxy resolves a locale, then `/[locale]` decides where the
visit goes and renders nothing itself:

| Signed in | Lands on |
|---|---|
| yes | `/[locale]/welcome` |
| no | `/[locale]/login` |

The redirect comes from next-intl's navigation rather than `next/navigation`, so
the locale prefix survives and someone on `/zh` is not bounced to the English
login.

**`isAuthenticated()` in `lib/auth.ts` is a stub returning false**, so every visit
currently lands on login. It is the single place every auth question goes through,
so wiring Supabase at M1 means replacing one function — where it becomes a session
read from a client built on the caller's JWT.

One consequence to expect: `/[locale]` is statically prerenderable today because
the stub is constant. Reading a real session makes it dynamic, which is correct —
the answer depends on the request.

`welcome` is a placeholder. The real signed-in screen is the library grid at M2.

### Connecting to Supabase

**Local development runs the whole stack in Docker.** `pnpm db:start` brings up Postgres, Auth,
Storage and Studio; `db:stop`, `db:status`, `db:reset` and `db:types` drive the rest. Migrations and
the RLS test suite run against a database that can be thrown away, which is the only way the
"user A cannot read user B's rows" suite is safe to write.

| Env var | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | project URL — `http://127.0.0.1:54321` locally |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | the `sb_publishable_…` key |

**The publishable key, not the legacy `anon` JWT.** Supabase replaced the anon/service_role pair
with publishable/secret keys; the old ones still work but are being retired, and the publishable key
rotates without reissuing tokens.

**The secret key is absent by design and must stay absent.** It is the service_role replacement and
bypasses every policy. `lib/supabase/env.ts` reads exactly two values and there is no third.

Three clients, all on the publishable key:

| Where | File | Notes |
|---|---|---|
| Browser | `lib/supabase/client.ts` | `createBrowserClient` — session in cookies, not localStorage, so the server can read it |
| Server | `lib/supabase/server.ts` | built per request from its cookies, so it acts as the caller and RLS applies |
| Proxy | `proxy.ts` | refreshes expiring sessions |

**The proxy is the subtle part.** next-intl runs first and may answer with a redirect (`/` → `/en`);
Supabase's refreshed auth cookies are then written onto **that** response, not a fresh one. Write
them to a new response and they are dropped on every locale redirect — which is every visit to the
root. They are also written back onto the request, so server components rendering the same pass see
the new tokens. The refresh call is `getUser`, not `getSession`: only `getUser` revalidates with the
auth server, and revalidating is the whole reason to do it there.

`minimum_password_length` in `supabase/config.toml` is set to 8 to match the zod schema. Client
validation is a courtesy; the service is what enforces it. Verified: a 7-character password is
rejected with `weak_password` even when the client is bypassed.

Error codes are mapped in `lib/auth/types.ts` from `AuthApiError.code`, which auth-js populates from
the response's `error_code`. Confirmed against the running stack: `invalid_credentials`,
`user_already_exists`, `weak_password`. Unrecognised codes become `unknown` rather than surfacing
provider text, which is unlocalised and occasionally discloses which accounts exist.

### Email and password, no third-party identity provider

**Decided: email and password.** Google sign-in has been removed. Login takes email and password;
signup takes name, email, password and confirm password. The name goes to user metadata on sign-up.

**Wired, not stubbed.** `lib/auth/` is the whole surface, split because the server half imports
`next/headers` and a client component cannot:

| File | Holds |
|---|---|
| `lib/auth/client.ts` | `signIn`, `signUp`, `signOut` — called from the browser |
| `lib/auth/server.ts` | `currentUser`, `isAuthenticated` — reads the request's session |
| `lib/auth/types.ts` | the failure union and the Supabase error-code mapping |

The name given at sign-up goes to `user_metadata.name` on the identity, not to a table of ours — it
belongs to the user, not the inventory.

`/[locale]/welcome` checks the session itself rather than trusting the redirect at `/[locale]`: the
URL can be typed directly, and a screen that greets someone by name should not render without
knowing whose name it is.

**Validation is zod**, in `lib/validation/auth.ts`. The schemas are built by factories taking already
translated messages rather than reading them, so validation text is localised without handing the
translator into the schema and casting next-intl's typed keys away. Client-side validation is a
courtesy only — as with every other rule in this architecture, the database and the auth service are
what actually enforce anything.

Sign-in deliberately has **no minimum-length rule**: an existing password predates whatever the
current rule is, and "too short" would be a lie. Length is enforced on sign-up.

Still to build: email verification, password reset, and rate limiting on both forms.

#### Why no provider is required

Supabase Auth is not a wrapper around Google. It issues its own identities, and the first-party
options need no other vendor:

| Method | Third party needed |
|---|---|
| Email + password | none |
| Email OTP / magic link | none for identity — only an SMTP sender for the email itself |
| Anonymous, upgraded later | none |
| Phone OTP | an SMS provider |
| Google, Apple, GitHub… | that provider — **optional, not required** |

Google was dropped on exactly that basis: it removed password handling, but nothing depended on it.

**The one thing to plan for with email:** Supabase's built-in SMTP is heavily rate-limited and
meant for development, so production email needs your own sender configured on the project. That is
a delivery vendor, not an identity one — the accounts stay ours.

**What is genuinely load-bearing is Supabase Auth issuing the JWT**, because every RLS policy is
`user_id = auth.uid()` and `auth.uid()` reads a claim from that token. A hand-rolled auth service
would have to sign tokens with the project's JWT secret to keep RLS working — possible, and a poor
trade: it puts the security model's foundation in code we maintain, for no gain over email+password
that Supabase already implements.


---

## Internationalization

`next-intl`, with the **locale carried in the URL** — `/en/library`, `/zh/library`.

The alternative was a cookie-based locale with unprefixed paths, which needs no
route nesting. Prefixed routing won because it keeps localized URLs shareable,
allows each locale to be prerendered as static HTML, and works for public pages
later. It also costs almost nothing to adopt now and would touch every route if
deferred.

| File | Role |
|---|---|
| `i18n/routing.ts` | the locale list and default — single source of truth |
| `i18n/request.ts` | resolves messages per request; wired up by the plugin in `next.config.ts` |
| `i18n/navigation.ts` | locale-aware `Link`, `redirect`, `usePathname`, `useRouter` |
| `proxy.ts` | negotiates the locale and redirects `/` to `/en` or `/zh` |
| `messages/{locale}.json` | the catalogues |
| `global.d.ts` | augments next-intl so `Locale` is a union and message keys are typechecked |

Notes worth keeping:

- **The file is `proxy.ts`, not `middleware.ts`.** Next.js 16 renamed
  Middleware to Proxy. next-intl still exports its handler as
  `next-intl/middleware` — same function, older name.
- **Locale negotiation** reads the URL, then next-intl's cookie, then
  `Accept-Language`. `/` with `Accept-Language: zh` lands on `/zh`.
- **Adding a locale** means one entry in `i18n/routing.ts` plus a file in
  `messages/`. `global.d.ts` types the locale union off that list, so a locale
  with no display name in the switcher is a compile error, not a blank label.
- **`params` arrives as a plain `string`** and must be narrowed with
  `hasLocale` before it can be passed to next-intl. Layouts and pages call
  `notFound()` on a miss, so a hand-typed `/fr` cannot render with fallback
  messages under a wrong `lang` attribute.
- **`setRequestLocale` is called in every statically rendered layout and page.**
  Without it, reading the locale from the request forces dynamic rendering.
- **Message keys are typed against `messages/en.json`**, so English is the
  reference catalogue and a key missing from it is a compile error.
- **Chinese needs its own font stack.** Geist carries no CJK glyphs, so
  `app/globals.css` names the system faces for `html:lang(zh)`. System fonts
  only — a web font for CJK is 2–5 MB per script.

Not done yet: a locale switcher that preserves the current path (needs
`usePathname` in a client component), persisting the choice to the user's
profile row, and localized date and currency formatting.
