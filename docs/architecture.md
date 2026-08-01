# Architecture — What I Own

The record of what was decided and why. Sections are written as the
corresponding code lands. See [design.md](./design.md) for the visual system.

Still to write up: the Supabase-direct shape, the data model, row-level
security, the AI seam, the intake and assistant flows, testing, milestones.

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
