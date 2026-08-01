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

## 4. Radius

Six steps, down from fourteen distinct values across the mockups.

| Token | Value | Used for |
|---|---|---|
| `xs` | 6px | tags |
| `sm` | 10px | mini fields, small buttons |
| `md` | 14px | inputs, thumbnail plates, icon tiles |
| `lg` | 18px | item cards, module cards, buttons |
| `xl` | 26px | bottom sheet, hero image |
| `full` | 999px | pills, chips, avatars |

## 5. Type

System fonts only, composed per locale — a web font for CJK is 2–5 MB per script.

Latin runs the Geist stack loaded by `next/font`. `html:lang(zh)` switches to
`"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC"`.

**CJK display weight is capped at 700.** PingFang SC tops out at Semibold, and Windows synthesises
the rest as an uneven, slightly blurry bold. Latin headings may use 800.

**11 px is the floor**, everywhere. The mockups render tags at 10 px.

## 6. Icons

**Lucide** (`lucide-react`) is the icon set. Every icon comes from it — no hand-drawn SVG paths in
components, so stroke weight, corner style, and optical size stay consistent as screens are added.

Defaults: `size={18}` inside a control, stroke width 2, `currentColor` so icons inherit the text
token beside them. Icons that only decorate get `aria-hidden="true"`, with the accessible name
coming from the control's own label.

Lucide dropped brand marks, so a Google or Apple logo has to be a local asset rather than an
import.

## 7. Controls: theme and locale

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

**Locale switch.** A segmented pill following `demo.html`'s `.lang-switch`: `surface` fill, 1px
`border`, `full` radius, 44px tall buttons, each language named in its own language (`EN`, `中文`).
The active segment is `accent` fill with `on-accent` text. Two locales fit in a pill; a dropdown
would hide half the choice behind a tap.

Switching goes through next-intl's router with the **current pathname**, so it preserves the page
you are on. It uses `replace`, so the back button means "the page before" rather than "this page in
the other language".

## 8. Motion

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

## 9. Login screen

Built from `demo.html`'s `.login` block. Full-viewport, single column, centred, capped at 420 px on
wider screens.

| Element | Spec |
|---|---|
| Backdrop | `linear-gradient(165deg, #f4f7ee, #e9f0dc)`, with a dark-mode counterpart |
| Logo plate | 74×74, radius 22, `lime` fill, `#16310c` glyph at 36px/800, lime glow shadow |
| Title | 26px/800 (700 for CJK), `text` |
| Subtitle | 14px, `muted` |
| Google button | full width, padding 16, radius `md`, 1px `border`, `surface` fill, `text` at 15px/600, G mark at 18px, gap 12 |
| Terms | 11px, `muted-2` |

**One way in: Continue with Google.** The mockup's email and verification-code fields, its "create
an account" button, and its guest link are all gone from the screen. Their strings stay translated,
because email OTP is still the plan — but a second path is not worth showing until one of them
actually signs somebody in.

Departures from the mockup, and why:

- **The Google button is a light surface, not the pink primary fill.** Google's branding terms are
  specific about how their sign-in button may look, and pink is not among the options. This is the
  one control that does not follow the two-accent rule, and the accent returns to this screen when
  email OTP does — as the primary action, with Google beneath it.
- **The G mark is a hand-written SVG**, in `components/icons/GoogleLogo.tsx`. Lucide carries no brand
  marks, so this is the one place a raw path is right. It keeps Google's four colours in every theme;
  a brand mark does not inherit our tokens.
- **No "create an account".** With OAuth, and with email OTP later, a first sign-in creates the
  account. A separate registration button would lead to the same place.
- **The guest link is dropped.** "先随便看看" implies browsing without an account, but every row is
  scoped to a user by RLS, so there is nothing for a guest to read.
- **The terms line is plain text, not links.** There are no terms or privacy pages yet, and a link
  to nowhere is worse than no link.

The button does nothing yet; auth is wired at M1.

### Favicon

Per locale, matching the logo plate: `public/icon-en.svg` carries `W`, `public/icon-zh.svg` carries
`物`, both on the lime plate at radius 9 of 32. Selected in the layout's `generateMetadata`.

SVG with a `<text>` element rather than a generated PNG: `ImageResponse` ships no CJK font, so `物`
would render as an empty box unless a font file were bundled, while an SVG favicon resolves the
glyph against the reader's own system fonts. The trade is that a very old browser gets no icon —
`favicon.ico` and `apple-touch-icon.png` still need making from real brand assets.

## 10. Accessibility floor

Non-negotiable, and mostly missing from the mockups.

- **Contrast** measured and recorded in §3. `muted` and `muted-2` sit below AA by choice; every new pairing is checked at 4.5:1.
- **Tap targets** 44×44 minimum, grown with padding rather than the visual.
- **Focus** on every interactive element: 2px `accent-ink` outline at 2px offset. The mockups have
  no focus style anywhere.
- **Labels**, not placeholders alone. Visually hidden where the design has no room.
- **Motion** honours `prefers-reduced-motion`.
- **Theme** via `data-theme` on `:root`, defaulting from `prefers-color-scheme`.

## 11. Still to write

Space scale, elevation, motion tokens, component specs beyond login (item card, status pill, tag,
chip, bottom sheet, tab bar, chat bubbles, module card), empty and error states, the thumbnail
crop rules, and breakpoints beyond 390.
