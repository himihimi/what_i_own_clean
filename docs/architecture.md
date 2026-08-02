# Architecture — What I Own

The record of what was decided and why. Sections are written as the
corresponding code lands. See [design.md](./design.md) for the visual system,
and [components.md](./components.md) for the component inventory.

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

## Route groups and the auth guard

Three groups, defined once in `lib/auth/routes.ts` and enforced once in `proxy.ts`.

| Group | Paths | Rule |
|---|---|---|
| `auth` | `/{locale}/auth/*` — login, signup, forgot-password | for signed-out visitors; a signed-in one is sent to `/welcome` |
| `challenge` | `/challenge/callback`, `/{locale}/challenge/*` | reached from an emailed link, so allowed in either state |
| `public` | `/{locale}/privacy`, `/terms`, `/demo` | readable by anyone |
| `protected` | everything else under `/{locale}` | needs a session, or it redirects to login |

| | signed out | signed in |
|---|---|---|
| `/en` | → `/en/auth/login` | → `/en/welcome` |
| `/en/welcome` | → `/en/auth/login` | renders |
| `/en/auth/login` | renders | → `/en/welcome` |
| `/en/challenge/update-password` | → `/en/auth/forgot-password` | renders |
| `/en/privacy` | renders | renders |

**`challenge` is a group of its own for one reason:** setting a new password happens *while signed
in* — the emailed link is what created the session. Treating it as a signed-out screen would bounce
the visitor to the app before they could finish; treating it as protected would be wrong for a link
that has expired. Its own guard is the session check inside `/challenge/update-password`.

**The guard lives in the proxy** because the session is already being revalidated there for the
refresh, so it costs nothing extra, and one rule in one place beats a check at the top of every page.
It is a redirect for the visitor's benefit, **not** the security boundary — that is row-level security
in Postgres, which does not care what the proxy decides.

Two ordering constraints that are easy to get wrong, both found by testing:

- **Stray emailed links are caught before the guard.** A link whose `redirect_to` was not
  allow-listed lands on the Site URL with its one-time `code` in the query. The visitor has no
  session yet, so guarding first would send them to sign-in and spend the code for nothing.
- **Only the locale root and challenge routes are treated as landing spots.** Reading `?error` on
  every path loops: the auth screens are where a dead link's error is *displayed*, so re-reading it
  there redirects the request to itself.

## Entry point

`/` is not a page: the proxy resolves a locale, then the guard above decides. `/[locale]` renders
nothing and only forwards to `/welcome` — reached in practice only with a session, since the guard
has already turned a signed-out visitor away.

Redirects inside the app come from next-intl's navigation rather than `next/navigation`, so the
locale prefix survives and someone on `/zh` is not bounced to an English screen. The exception is
`/challenge/callback`, the locale-less forwarder, which has none to preserve.

Reading the session makes these routes dynamic, which is correct — the answer depends on who is
asking.

`welcome` is a placeholder. The real signed-in screen is `/library`, which now exists — the grid, the
cards and the item page are built against `lib/items/fixtures.ts` until there are tables to read. See
[components.md](./components.md).

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
| Email links | `lib/supabase/emailLinks.ts` | the one exception: not `createBrowserClient`, persists nothing, and used only to ask Supabase to send an email — see [How an emailed link is redeemed](#how-an-emailed-link-is-redeemed) |

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
| `lib/auth/messages.ts` | failure reason to message key, shared by all four forms |
| `lib/auth/routes.ts` | every auth path, and which group each route belongs to |
| `lib/auth/redirect.ts` | resolving and validating an emailed link's destination |
| `lib/auth/recoveryLanding.ts` | reading a session, a stray `code`, or an error out of a query string or a URL fragment |

The name given at sign-up goes to `user_metadata.name` on the identity, not to a table of ours — it
belongs to the user, not the inventory.

`/[locale]/welcome` still reads the session itself, because it needs the user to greet them — the
guard in the proxy decides *whether* they may be there, not *who* they are.

**Validation is zod**, in `lib/validation/auth.ts`. The schemas are built by factories taking already
translated messages rather than reading them, so validation text is localised without handing the
translator into the schema and casting next-intl's typed keys away. Client-side validation is a
courtesy only — as with every other rule in this architecture, the database and the auth service are
what actually enforce anything.

Sign-in deliberately has **no minimum-length rule**: an existing password predates whatever the
current rule is, and "too short" would be a lie. Length is enforced on sign-up.

#### How an emailed link is redeemed

**The session arrives in the URL fragment, and the callback is a client page that reads it.** No
`token_hash` to verify, no PKCE `code` to exchange — the tokens are handed over whole.

That shape is forced by two constraints meeting, and it is worth writing down which:

- **A PKCE `code` can only be redeemed in the browser that requested the email.** Exchanging it needs
  a verifier held in that browser's cookies. Sign up on a laptop, open the mail on a phone, and the
  exchange fails — reported to the reader as *"That link has expired"*, because the callback mapped
  every exchange failure to expiry. For an app designed at phone width that is the ordinary case.
- **The email templates cannot be changed.** Customising them is a paid feature of the hosted
  project, so `{{ .ConfirmationURL }}` is what goes out and every link runs through
  `/auth/v1/verify` first. `emailRedirectTo` sets only the `redirect_to` parameter on that URL; it
  does not change the link's shape. A one-time `token_hash` the server could verify was the other way
  out of the PKCE problem, and it needs a template.

What is left is the flow type. Ask for the email **without** a PKCE challenge and `/auth/v1/verify`
answers with the session in the fragment instead of a code in the query:

```
/challenge/callback?next=%2Fen%2Fchallenge%2Fupdate-password
  #access_token=…&refresh_token=…&type=recovery&expires_in=3600
```

| | with a PKCE challenge | without one |
|---|---|---|
| Comes back as | `?code=…` in the query | `#access_token=…` in the fragment |
| Redeemed with | `exchangeCodeForSession` | `setSession` |
| Needs the requesting browser | **yes** — its stored verifier | no |
| Readable by the server | yes | **no** — a fragment is never sent |

Three things follow, and all three are load-bearing:

- **The client that requests the email is not `createBrowserClient`.** `@supabase/ssr` hard-codes
  `flowType: "pkce"` *after* spreading the caller's options, so it cannot be turned off there.
  `lib/supabase/emailLinks.ts` is a plain `supabase-js` client on `flowType: "implicit"`, used by
  `signUp`, `resendConfirmation` and `requestPasswordReset` and nothing else. It persists nothing, so
  when sign-up does come back with a session — confirmations off — that session is handed to the
  app's own client with `setSession`, or the browser would hold one no server component could see.
- **The callback is a page, not a route handler**, because only the browser can see a fragment. It
  writes the session with the app's own client, whose storage is cookies, so the page it forwards to
  is already signed in when the server renders it. It navigates with `location.replace`, which both
  guarantees the server sees the new cookies and keeps a URL carrying tokens out of the back button.
- **The callback carries a locale**, `/{locale}/challenge/callback`, because `emailRedirectTo` is
  built in the browser where the language is known. That is what lets it be an ordinary page with the
  app's layout and translations. The locale-less `/challenge/callback` survives as a forwarder for a
  link that could not carry one — a redirect URL typed into the dashboard, or a link sent before the
  move. A redirect preserves the fragment, so forwarding does not lose the session.

**The trade this makes is tokens in the URL.** A fragment is never transmitted to a server, is not
sent in a `Referer`, and this one is replaced in history the moment it is read — but it is briefly in
the address bar, which a `token_hash` verified server-side would have avoided. That is the cost of
the template constraint, and it is the same flow Supabase itself shipped for years.

**The hosted project needs the callback allow-listed**, `https://<site>/**` under **Authentication →
URL Configuration → Redirect URLs**. Without it the auth service substitutes the Site URL and the
session lands on the site root, where nothing reads it.

`exchangeCodeForSession` is still handled, for a link sent while the app was on PKCE and still
sitting in an inbox. It can go once those have expired.

The failure branch logs the provider's error code. The reader still gets one localised sentence, but
an expired token and a rejected one are no longer indistinguishable from outside.

#### Sign-up confirmation

`/challenge/callback` serves both emailed links. A dead confirmation link goes to **login** with
"That link has expired", not to the reset screen — signing in is where that person needs to end up,
and it is where a still-unconfirmed address is offered a fresh link. A dead reset link goes to
`/forgot-password`, which is the screen that sends a new one; the callback picks the destination from
the link's `type`, falling back to what `next` was aiming at.

**A confirmed address lands on `/challenge/confirmed`, not in the app.** Verifying the token both
confirms the address and signs the reader in, so continuing straight to `/welcome` would work — but it
would also be the only step in the flow that never says it succeeded. The screen says the address is
confirmed, offers *Continue*, and moves on by itself after 30 seconds. If no session came back the
same screen offers *Log in* instead: the address is confirmed either way, which is the thing worth
saying.

**An unconfirmed address cannot sign in.** Supabase enforces it — `signInWithPassword` returns
`email_not_confirmed` — so all that was needed was to say so instead of showing "Something went
wrong". Verified against a stack with confirmations on: 400, `email_not_confirmed`, no session.

**And that refusal offers a way out.** Telling someone to "open the link we sent you" is useless once
that link has expired: they cannot sign in, and the link is dead. So a refusal for an unconfirmed
address reveals a **resend** on the sign-in screen, at the moment it happens, and the confirmation
redirect is built by one shared helper so a resent link cannot land somewhere different from the
original. Verified: resend returns a fresh `type=signup` link whose `redirect_to` is the callback.

`lib/auth/recoveryLanding.ts` is the one reader of what a link left in the query, and the callback
acts on what it returns:

| Callback receives | Lands on |
|---|---|
| `#access_token` + `#type=signup` | `/challenge/confirmed`, signed in |
| `#access_token` + `#type=recovery` | `/challenge/update-password`, signed in |
| a session that `setSession` rejects | `…?error=expired`, and the provider's code is logged |
| `code` that exchanges | the destination, signed in |
| `error_code=otp_expired` | `…?error=expired` — "That link has expired" |
| any other error, or nothing | `…?error=link` — "That link is not valid" |

**A dead link is reported by Supabase in the query, not as a failing code.** It arrives as
`error=access_denied` with an `error_code`, so a callback that only looked for `code` called every
expired link "invalid" — a different thing to the person holding it. That shape only reaches us from
a link the auth service redirected, which since the template change means one built elsewhere: an
older link, or one sent from the dashboard. Our own links fail at `verifyOtp` instead, and the row
above is chosen from its error code.

One detail worth keeping: Supabase's rate-limit message can say **"after 0 seconds"** when the window
has just closed. `retryAfterSeconds` discards a zero, so the UI falls back to the generic wait rather
than telling someone to try again in no time at all.

#### Locale for links that cannot carry one

Links this app builds set the locale themselves — the browser knows it when the email is requested —
so `next` normally arrives already localised. Resolution exists for links it did not build: a redirect
URL registered in the Supabase dashboard is one fixed string for everybody and cannot contain `/en`
or `/zh`. `resolveNext` in `lib/auth/redirect.ts`:

| `next` | Resolves to |
|---|---|
| `/en/welcome` | used as-is |
| `/welcome` | prefixed with the resolved locale |
| missing, or not a same-site path | `/{locale}/welcome` |

The locale comes from next-intl's `NEXT_LOCALE` cookie when the reader has chosen one, and English
otherwise. An unrecognised cookie value falls back to English rather than being trusted. Anything
that is not a same-site path — `//host`, `/\host`, an absolute URL — is discarded in favour of
`/{locale}/welcome`.

#### Password reset

`/auth/forgot-password` → email → `/challenge/callback` → `/challenge/update-password`.

**The callback carries the locale**, because `emailRedirectTo` is built in the browser, where the
language is known. The locale-less `/challenge/callback` remains as a forwarder for links that could
not carry one, and `proxy.ts` excludes it from the matcher so next-intl does not rewrite it.

`next` is validated by `isSafeNext` in `lib/auth/redirect.ts` rather than trusted. It arrives from a
URL anyone can craft, and an unchecked redirect target turns a reset link into a way to land someone
on a convincing copy of this app. Only a same-site path starting with a configured locale is
accepted; `//host` and `/\host` are rejected explicitly, since both leave the site despite starting
with a slash. The function takes its locales as an argument so it has no module graph and can be
tested on its own.

**`/challenge/update-password` requires a session**, which is what the emailed link establishes. Without one
there is nothing to update, so it redirects to `/forgot-password` — which is also what happens when
the URL is opened directly or the link has already been spent.

**A link does not always land on `/challenge/callback`.** If `redirect_to` is not on the project's
allow-list, Supabase falls back to the Site URL and the one-time `code` arrives at the site root
instead. `lib/auth/recoveryLanding.ts` reads it wherever it lands — the locale entry point and
`/challenge/update-password` both check — and forwards it to the callback, which owns the exchange. Without
that the code was silently dropped and the visitor got the login screen, with no hint that their
reset link had been spent for nothing.

The same read catches Supabase's failure parameters (`error`, `error_code`), so an expired link ends
on `/forgot-password` showing *"That link has expired. Request a new one."* rather than a blank
login screen. `otp_expired` reads as expired; anything else reads as malformed, because those are
different things to the person holding the link.

Two things learned the hard way while testing this against the local stack, both of which look like
application bugs and are not:

- **`redirect_to` is a query parameter on `/auth/v1/recover`, not a body field.** Put it in the body
  and GoTrue ignores it and falls back to `site_url`, stripping the path and query.
- **`redirect_to` is validated against the allow-list at click time**, not when the email is sent.
  If the callback URL is not on it, GoTrue substitutes the Site URL and the session lands on the site
  root, where nothing reads it. `https://<site>/**` under **Authentication → URL Configuration →
  Redirect URLs** is what keeps that from happening.
- **Dropping the PKCE challenge is what puts the session in the fragment**, and that is deliberate
  here rather than a side effect. The auth service redirects and has nowhere else to put the tokens;
  a fragment never reaches a server, which is why the callback has to be a client page.

Reset requests answer identically whether or not the address has an account, and the UI matches:
saying "no such account" would turn the form into a way to discover who is registered.

Still to build: rate limiting on the auth forms.

### Legal pages

`/[locale]/privacy` and `/[locale]/terms`, with copy in `content/legal/*.ts` — typed documents per
locale, prerendered, linked from the terms line on every auth screen.

**They are a draft.** Written to describe honestly what the app actually does — that inventory rows
are scoped per user by the database, that photographs go to Gemini only when an AI feature is
invoked, that the AI's output is a draft to confirm and not a record of value — and reviewed by
nobody qualified.

**Two things are deliberately unstated rather than invented:** a contact address, and the governing
law and venue. Both documents say those will be published before the app opens beyond its first
users, which is honest and leaves the gap visible instead of shipping a placeholder that reads as
real.

Before this is public: supply those two, have both languages read by a lawyer, and confirm the
precedence clause — the terms currently state the English version governs where the two differ.

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
