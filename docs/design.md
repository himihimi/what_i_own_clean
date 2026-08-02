# Design System — What I Own

The visual system. See [architecture.md](./architecture.md) for technical decisions.

---

## 1. Mobile first, and mobile only for now

**Every screen is designed at a phone width and built that way first.** The mockups are 390 px
wide, and that is the only width that has been designed. Tablet and desktop layouts do not exist
yet and are not being guessed at.

What this means in practice:

- **Build for a narrow viewport, then let it grow.** Layouts are single-column and full-width, with
  content capped by a `max-width` and centred so a laptop shows a phone-shaped column rather than a
  stretched one. That is a holding position, not a desktop design.
- **No device chrome.** The mockups wrap every screen in a 390×820 rounded rectangle with a shadow,
  sitting on a sage-and-pink gradient. That frame is presentation for the mockup — a way to show a
  phone on a desktop page. The real app fills the viewport and never draws a phone.
- **Touch is the primary input.** 44×44 minimum tap targets, and press feedback on everything
  tappable, because `-webkit-tap-highlight-color: transparent` removes the only feedback mobile
  browsers give for free.
- **Fixed pixel heights from the mockups are suspect.** They were written against one viewport.
  Prefer intrinsic sizing and `min-height`.

Breakpoints will be designed when there is a reason to. Until then, one column.

## 2. The two-accent rule

The most distinctive thing in the mockups is not a colour, it is that **two accents do two
different jobs**:

| Colour | Means | Used for |
|---|---|---|
| **Lime** `#aec658` | *state* — what the system knows | in-use dot, tags, logo, item names the assistant references |
| **Pink** `#ff70a9` | *action* — what you can do | FAB, primary button, active filter, links |
| **Amber** `#c79a2e` | *attention* — needs you | idle dot, expiring soon |

Everything else is the green-grey scale. The discipline: **never pink for a state, never lime for a
control.** Most apps have one accent and use it for everything, so colour stops carrying
information; here it carries information.

## 3. Colour tokens

Implemented in `app/globals.css`. CSS variables hold the values; Tailwind's `@theme inline` maps
them to utilities, so `bg-surface`, `text-muted`, and `rounded-lg` come from this table.

Dark mode follows `prefers-color-scheme` by default and can be forced with `data-theme` on
`:root`, so a "follow system" setting works later.

| Token | Light | Dark |
|---|---|---|
| `bg` | `#f4f7ee` | `#0f1310` |
| `surface` | `#ffffff` | `#191d18` |
| `surface-2` | `#eaefe0` | `#262c25` |
| `border` | `#dde3d1` | `#2b3129` |
| `text` | `#16310c` | `#f1f4ec` |
| `muted` | `#6b7860` | `#97a28e` |
| `muted-2` | `#8a9280` | `#7d8874` |
| `disabled` | `#b7c0ab` | `#3a4237` |
| `accent` | `#ff70a9` | `#ff70a9` |
| `accent-soft` | `#ffe1ec` | `rgba(255,112,169,.16)` |
| `accent-ink` | `#cf3d80` | `#ff9ec6` |
| `on-accent` | `#16310c` | `#16310c` |
| `lime` / `lime-soft` / `lime-ink` | `#aec658` / `#eef3d9` / `#5c6e1e` | `#aec658` / `rgba(174,198,88,.16)` / `#c4de73` |
| `lime-glow` | `0 12px 26px rgba(174,198,88,.5)` | same at `.22` — a bright glow reads too strong on dark |
| `amber` / `amber-soft` / `amber-ink` | `#c79a2e` / `#fdf0d4` / `#8a6410` | `#d8b24a` / `rgba(216,178,74,.16)` / `#e8c977` |
| `danger` / `danger-soft` | `#c0392b` / `#fbe6e3` | `#e57668` / `rgba(229,118,104,.16)` |

Three roles carry the text scale: `text` for primary, `muted` for secondary text and ghost-button
labels, `muted-2` for the terms and privacy line.

Measured against `bg` `#f4f7ee`:

| Pairing | Ratio | AA (4.5:1) |
|---|---|---|
| `text` `#16310c` on `bg` | 13.1:1 | passes |
| `text` `#16310c` on `lime` `#aec658` | 7.45:1 | passes |
| `on-accent` `#16310c` on `accent` `#ff70a9` | 5.29:1 | passes |
| white on `accent` `#ff70a9` | 2.58:1 | fails — why `on-accent` is green ink |
| `muted` `#6b7860` on `bg` | **4.32:1** | **fails** |
| `muted-2` `#8a9280` on `bg` | **2.98:1** | **fails** |

**`muted` and `muted-2` are chosen values, kept knowingly below AA.** They come from the mockups and
are what gives the interface its soft, domestic feel; raising them to `#5f6c55` and `#6f7a64` would
clear 4.5:1 but flatten that. Recorded here rather than silently fixed, so the trade is visible.
`muted-2` is at 11 px on the terms line, where it is furthest from the floor — that line is the
first thing to darken if this is revisited.

**Text on filled pink is `#16310c`, not white**, which is the one contrast departure from the
mockups that was taken.

Shadows carry a green tint in light mode (`rgba(30,50,15,…)`) and go neutral-black in dark, where
the mockup left the tinted shadow in place and it rendered as a haze.

**No component hardcodes a colour.** The one exception is Google's G mark, which must keep its own
four colours in every theme. Where a surface keeps its colour across themes — the lime logo plate —
its ink is `on-accent`, not `text`, because `text` inverts in dark mode and light ink on lime is
about 1.9:1.

## 4. Radius

Six steps, down from fourteen distinct values across the mockups.

| Token | Value | Used for |
|---|---|---|
| `xs` | 6px | tags |
| `sm` | 10px | mini fields, small buttons |
| `md` | 14px | inputs, buttons, thumbnail plates, icon tiles |
| `lg` | 18px | item cards, module cards, dropdown panels |
| `xl` | 26px | bottom sheet, hero image |
| `full` | 999px | pills, chips, avatars |

## 5. Type

System fonts only, composed per locale — a web font for CJK is 2–5 MB per script.

Latin runs the Geist stack loaded by `next/font`. `html:lang(zh)` switches to
`"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC"`.

**CJK display weight is capped at 700.** PingFang SC tops out at Semibold, and Windows synthesises
the rest as an uneven, slightly blurry bold. Latin headings may use 800.

**11 px is the floor**, everywhere. The mockups render tags at 10 px.

## 6. Components: shadcn on our tokens

Components come from **shadcn** (`components/ui`, Radix base, Nova preset — Lucide and Geist, which
is already our stack). They are generated into the repo, so they are ours to edit, and they get
edited on arrival.

**Our palette stays the source of truth.** `shadcn init` wrote its own neutral palette into
`globals.css` and overwrote three of our tokens — `--accent`, `--muted` and `--border`. What is
there now instead: our values, plus shadcn's semantic names defined as *aliases* onto them, so
generated components inherit our colours and dark mode keeps working through the one set of
variables rather than a second `.dark` palette.

| shadcn name | resolves to |
|---|---|
| `background` / `foreground` | `bg` / `text` |
| `card`, `popover` | `surface` |
| `primary` / `primary-foreground` | `accent` / `on-accent` |
| `secondary` | `surface-2` |
| `muted-foreground` | `muted` |
| `input` | `border` |
| `ring` | `accent-ink` |
| `destructive` | `danger` |

**Two names collide and are deliberately left undefined:** shadcn's `accent` means a hover surface
where ours means the pink action colour, and shadcn's `muted` is a background where ours is
secondary text. A generated component using `bg-accent` or `bg-muted` would therefore paint pink or
dark green where it wanted a light grey. **Every `shadcn add` needs a pass for those two classes** —
both become `bg-surface-2`. It has already been done for Button and DropdownMenu.

**Check the registry before writing a component.** `pnpm dlx shadcn@latest search @shadcn -q <term>`
lists what exists; the `@shadcn/` namespace prefix is required. Two traps found so far: `@shadcn/form`
is an **empty stub** in this registry version — `@shadcn/field` replaced it, and it is deliberately
form-library-agnostic, taking errors as props — and plain `add form` silently succeeds while creating
nothing.

In use: `button`, `dropdown-menu`, `input`, `label`, `alert`, `field`, `separator`.

Also changed from the generated files:

- **Sizes move up to a 44px floor** (`default`, `icon`, `Input`). shadcn ships a 32px pointer-first
  scale. `Input` also keeps `text-base` instead of shadcn's `md:text-sm`, because 16px is what stops
  iOS Safari zooming the viewport on focus, and it gets `surface` rather than a transparent fill,
  since fields sit on the tinted auth backdrop.
- **Press feedback is `scale(.98)`** in CSS rather than a 1px nudge, so it applies to every button
  without a client boundary. The Motion `press` tokens stay for surfaces that animate for other
  reasons, like cards.
- **`dark:` is retargeted.** shadcn writes `&:is(.dark *)`; the theme is set with `data-theme` here,
  so the custom variant points at that instead. Our own code should not need `dark:` — the tokens
  flip.
- **Geist is finally applied.** `--font-sans` now maps to the `next/font` variable, which shadcn's
  `html { @apply font-sans }` revealed was never wired up: the font was being loaded and ignored.

Buttons use radius `md`.

## 7. Icons

**Lucide** (`lucide-react`) is the icon set. Every icon comes from it — no hand-drawn SVG paths in
components, so stroke weight, corner style, and optical size stay consistent as screens are added.

Defaults: `size={18}` inside a control, stroke width 2, `currentColor` so icons inherit the text
token beside them. Icons that only decorate get `aria-hidden="true"`, with the accessible name
coming from the control's own label.

Lucide dropped brand marks, so a Google or Apple logo has to be a local asset rather than an
import.

## 8. The app shell

Every signed-in screen sits in `components/app-shell/`. The auth screens deliberately do not — there
is no navigation to offer someone who is not signed in.

| Part | Spec |
|---|---|
| `AppShell` | `min-h-svh` column, body capped at 480px and centred, bottom padding clearing the tab bar |
| `TopBar` | sticky, `bg` at 94% + `blur(12px)`, hairline bottom border, optional 34px lime plate at radius 11, title 23px/800, actions slot pushed right |
| `BottomNav` | fixed, 78px, `bg` at 94% + `blur(12px)`, hairline top border, tabs 52px wide with a 24px icon and an 11px label |
| FAB | 52×52, radius **18 — a squircle, not a circle**, pink gradient at 135°, no shadow |

`min-h-svh`, not `min-h-screen`: on mobile browsers `vh` is the height with the toolbars *hidden*, so
a screen sized in `vh` is taller than the visible area and the page opens slightly scrolled. Both
bars pad for `env(safe-area-inset-*)`, so the nav clears the iOS home indicator rather than sitting
under it, and the body's bottom padding clears the nav — otherwise the last card in a list is
unreachable.

Three departures from the mockup, all forced:

- **The active tab is `lime-ink`, not pink.** An active tab says *where you are* — state, which is
  lime here; pink is for things you can press. And `lime-ink` rather than raw `lime`, because raw lime
  on the page colour is **1.76:1** — unreadable as a label. (§3's table gives lime as a fill, not as
  text; this is what `lime-ink` exists for.)
- **Labels are 11px**, not the mockup's 10px, which is below the floor in §5.
- **The FAB's icon is `on-accent`**, not the mockup's white. White on the pink is 2.58:1, failing even
  the 3:1 floor that applies to icons.

**Unbuilt destinations render as visibly disabled tabs** rather than links that 404 — `aria-disabled`
and `disabled` colour, driven by a `ready` flag in `navItems.ts`. Building a screen means adding the
route and flipping the flag. Collections is in the mockups and absent here on purpose: the
architecture defers it.

The top bar's actions are a slot, because which belong there differs per screen — the mockup shows
search and profile on the feed, search only on collections, nothing on a detail page. Welcome
currently passes the theme toggle and locale switch, which are real, instead of buttons with no
screens behind them.

## 9. Controls: theme and locale

Both live on the login screen, top right, before sign-in — someone who cannot read the current
language cannot go looking for a setting inside an account they do not have yet. They are absolutely
positioned so they never shift the centred column, and sit below `env(safe-area-inset-top)`.

**Theme toggle.** A 44×44 round button on `surface` with a 1px `border`, cycling
**system → light → dark**. Three states, not two, because "follow system" has to be reachable.
Icons are Lucide `SunMoon`, `Sun`, `Moon`.

The choice is stored in `localStorage` and applied by a small inline script in `<head>` **before
first paint** — a React effect runs after paint, which would show the wrong theme first and flash.
`system` stores nothing and leaves `data-theme` off, so the `prefers-color-scheme` block decides.
Because the script mutates `<html>` before hydration, that element carries `suppressHydrationWarning`.

The button reads the theme through `useSyncExternalStore`, so it renders from browser state
directly instead of correcting itself in an effect, and a change in another tab moves this one too.

**Locale switch.** A dropdown whose trigger is the *same* round icon button as the theme toggle —
Lucide `Languages` — so the two read as one cluster rather than two unrelated controls. Items name
each language in its own language, with a `Check` against the current one.

This replaced the segmented pill from `demo.html`'s `.lang-switch`. The pill showed both choices at
once, which is nicer for two locales, but it grows with every locale added and it sat visually
apart from the toggle beside it. A menu does neither.

Switching goes through next-intl's router with the **current pathname**, so it preserves the page
you are on. It uses `replace`, so the back button means "the page before" rather than "this page in
the other language".

## 10. Motion

**Motion** (`motion/react`, formerly Framer Motion) drives animation. Tokens live in
`lib/motion.ts`; anything that animates picks one of five durations rather than inventing its own.

| Token | Timing | Used for |
|---|---|---|
| `instant` | 120ms ease-out | chip and tag toggles, dot colour changes |
| `quick` | 180ms ease-out | press feedback, a field appearing |
| `screen` | 260ms ease-out | screen entrance: opacity 0→1 with translateY 8px→0 |
| `sheet` | 300ms `cubic-bezier(.3,.8,.3,1)` | bottom sheet in and out |
| `toast` | 250ms ease-out | scale .9→1 with opacity |

Rules:

- **Press feedback is owed on everything tappable.** The mockups set
  `-webkit-tap-highlight-color: transparent`, which removes the only feedback mobile browsers give
  for free. `scale(.97)` for cards, `scale(.98)` for rows and buttons.
- **Reduced motion is honoured twice.** `globals.css` collapses CSS transitions, and
  `<MotionProvider>` sets Motion's `reducedMotion="user"`, which drops transform and layout
  animations while keeping opacity. Motion runs through the Web Animations API and does not see the
  CSS rule.
- **Motion ships no `"use client"` directives**, so every import of it sits behind a client
  boundary — `components/MotionProvider.tsx`, `components/Reveal.tsx`, or a screen's own form.
- **Entrances wrap, they do not absorb.** `<Reveal>` takes children as a prop, so server-rendered
  text stays server-rendered and only the wrapper ships as client JS. Stagger a group with `delay`.

Screens assemble top-down: 60ms between elements, which reads as intentional rather than as lag.

## 11. Auth screens

**Five screens** share one shell in `components/AuthScreen.tsx`: backdrop, logo plate, heading, the
theme and locale controls, and the terms line. They differ only in heading, form, and the link at the
bottom. Full-viewport, single column, centred, capped at 420 px on wider screens.

| Screen | Job |
|---|---|
| login | email and password |
| signup | name, email, password, confirm |
| forgot-password | request a reset link |
| update-password | choose a new one, reached from that link |
| confirmed | say the address is confirmed, reached from that link |

The first three are `/{locale}/auth/*`; the last two are `/{locale}/challenge/*`, because an emailed
link is what gets you there. See [architecture.md](./architecture.md) for why that distinction exists.

**Confirmed is the one screen with no form.** An `<Alert>` with `CircleCheck`, a full-width accent
button — *Continue* into the app, or *Log in* if the link did not also produce a session — and, in
the footer line, a live countdown that moves on after 30 seconds. The countdown is visible rather
than silent because a screen that navigates on its own with no warning is disorienting, and 30 real
seconds beats "shortly". It is not a live region: announcing a number every second would bury the
rest of the screen.

| Element | Spec |
|---|---|
| Backdrop | `linear-gradient(165deg, #f4f7ee, #e9f0dc)`, with a dark-mode counterpart |
| Logo plate | 74×74, radius 22, `lime` fill, `on-accent` glyph at 36px/800, `lime-glow` shadow |
| Title | 26px/800 (700 for CJK), `text` |
| Subtitle | 14px, `muted` |
| Fields | `<Field>` + `<Input>`, 44px tall, radius `md`, `surface` fill, label as placeholder |
| Submit | `<Button size="lg">` — pink filled, full width |
| Form error | `<Alert variant="destructive">` with `TriangleAlert`, above the fields |
| Notice | `<Alert>` with `MailCheck` — replaces the form once a link is on its way |
| Cross link | `accent-ink`, underlined |
| Terms | 11px, `muted-2` |

**Email and password.** Login takes email and password; signup takes name, email, password and
confirm password. There is no third-party sign-in — nothing about the architecture needs one, and
Supabase Auth issues its own identities. See [architecture.md](./architecture.md).

**The pink filled button is back.** While Google's button was the only way in it had to be a light
surface, because their branding terms do not allow a pink fill. With that gone, the submit button is
the screen's action and takes the accent, as the two-accent rule says it should.

**The label is the placeholder**, following the mockup, which shows `邮箱` inside the field rather
than above it. The `<label>` still exists and is still bound to its input — it is `sr-only`, not
removed. A placeholder is not an accessible name, and it disappears the moment there is text in the
field, so a placeholder-only input leaves nothing to identify it by. No example values: a sample
name or address in a field is one more thing to read and mistake for real content.

Departures from the mockup:

- **A separate signup screen**, rather than the mockup's "register" button next to "log in" on one
  form. Four fields do not belong on a screen whose job is two.
- **Validation messages sit under their field**, from zod, and are localised like everything else.
  A wrong password is not a field error though — it is a form-level `Alert`, because the server, not
  the shape of the input, is what rejected it.
- **The guest link is dropped.** "先随便看看" implies browsing without an account, but every row is
  scoped to a user by RLS, so there is nothing for a guest to read.
- **The terms line links out**, via next-intl rich text rather than string concatenation: the two
  links sit mid-sentence and fall in different places in each language.

**Forgot password** sits under the password field, right-aligned, in `text` rather than `accent-ink`.
It is an escape hatch, not the action being offered, so it does not compete with the submit button.

### States beyond "filled in correctly"

A form that only knows success and field errors is not finished. These are the rest, and each replaces
or joins the form rather than navigating away — losing what someone typed to show them a message is
its own small insult.

| State | Where | Shows |
|---|---|---|
| Link sent | forgot-password | notice: *"If that address has an account, a reset link is on its way."* Deliberately conditional — see below |
| Check your inbox | signup, when confirmation is required | notice naming the address, plus a spam-folder hint |
| Address confirmed | confirmed | *"Your email address is confirmed."*, a button on, and a 30-second countdown |
| Address unconfirmed | login | error, **plus a "Send a new confirmation link" button** |
| New link sent | login, after that resend | notice naming the address |
| Link expired | login or forgot-password | error: *"That link has expired. Request a new one."* |
| Link invalid | same | error: *"That link is not valid."* — a different thing to the reader |
| Rate limited | any | *"Try again in 44 seconds"* — the real number, per the copy rules below |

Two of these are shaped by what the server is allowed to reveal:

- **"If that address has an account"** — Supabase answers a reset request identically whether or not
  the address is registered, and so must the screen. "No such account" would turn the form into a way
  to find out who has one.
- **Sign-up says a link was sent, never that an account was created**, for the same reason: an
  address that already has one produces the same response.

**The unconfirmed case earns its extra button.** Telling someone to open a link that has expired is a
dead end — they cannot sign in and the link is dead. The resend appears exactly where the refusal
happened, and nowhere else.

### Copy rules

These apply everywhere, not only here. They were in the mockup notes and had not been written down.

- **No apologies, no "oops", no exclamation marks.** State what happened, then what to do about it.
- **Numbers are real numbers**, never "a while" or "shortly". "Try again in 44 seconds" — which is
  why the wait is parsed out of the provider's message rather than rounded off.
- **An empty screen ends in a button**, not a shrug: it is an invitation to act.
- **Action labels stay constant through a flow.** The button that says *Save* produces a toast that
  says *Saved* — never *Success*.
- **Never surface provider text.** It is unlocalised, written for developers, and occasionally
  discloses which accounts exist. Unrecognised failures say "Something went wrong. Try again."

### Legal pages

`/[locale]/privacy` and `/[locale]/terms`, prerendered per locale. A plainer layout than the auth
screens — `bg` instead of the tinted backdrop, a 640px measure, no gradient. They are pages to read,
so measure matters more than atmosphere.

Copy lives in `content/legal/*.ts` as typed documents rather than in `messages/`, which is for
interface strings: these are paragraphs, they change on their own schedule, and they carry an
effective date. **They are a draft and need legal review in both languages.** A contact address and
the governing law are deliberately unstated rather than filled with something that reads as real —
see architecture.md.

### Favicon

Per locale, matching the logo plate: `public/icon-en.svg` carries `W`, `public/icon-zh.svg` carries
`物`, both on the lime plate at radius 9 of 32. Selected in the layout's `generateMetadata`.

SVG with a `<text>` element rather than a generated PNG: `ImageResponse` ships no CJK font, so `物`
would render as an empty box unless a font file were bundled, while an SVG favicon resolves the
glyph against the reader's own system fonts. The trade is that a very old browser gets no icon —
`favicon.ico` and `apple-touch-icon.png` still need making from real brand assets.

## 12. Accessibility floor

Non-negotiable, and mostly missing from the mockups.

- **Contrast** measured and recorded in §3. `muted` and `muted-2` sit below AA by choice; every new pairing is checked at 4.5:1.
- **Tap targets** 44×44 minimum, grown with padding rather than the visual.
- **Focus** on every interactive element: 2px `accent-ink` outline at 2px offset. The mockups have
  no focus style anywhere.
- **Labels always exist**, even where the design puts the text inside the field. `sr-only`, bound
  with `htmlFor` — never a placeholder alone.
- **Motion** honours `prefers-reduced-motion`.
- **Theme** via `data-theme` on `:root`, defaulting from `prefers-color-scheme`.

## 13. Still to write

Space scale, elevation, motion tokens, component specs beyond login (item card, status pill, tag,
chip, bottom sheet, tab bar, chat bubbles, module card), empty and error states, the thumbnail
crop rules, and breakpoints beyond 390.
