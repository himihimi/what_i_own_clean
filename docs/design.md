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
| `bg` | `#f6f8f2` | `#0f1310` |
| `surface` | `#ffffff` | `#191d18` |
| `surface-2` | `#eaefe0` | `#262c25` |
| `border` | `#dde3d1` | `#2b3129` |
| `text` | `#16310c` | `#f1f4ec` |
| `muted` | `#5f6c55` | `#97a28e` |
| `disabled` | `#b7c0ab` | `#3a4237` |
| `accent` | `#ff70a9` | `#ff70a9` |
| `accent-soft` | `#ffe1ec` | `rgba(255,112,169,.16)` |
| `accent-ink` | `#cf3d80` | `#ff9ec6` |
| `on-accent` | `#16310c` | `#16310c` |
| `lime` / `lime-soft` / `lime-ink` | `#aec658` / `#eef3d9` / `#5c6e1e` | `#aec658` / `rgba(174,198,88,.16)` / `#c4de73` |
| `amber` / `amber-soft` / `amber-ink` | `#c79a2e` / `#fdf0d4` / `#8a6410` | `#d8b24a` / `rgba(216,178,74,.16)` / `#e8c977` |
| `danger` / `danger-soft` | `#c0392b` / `#fbe6e3` | `#e57668` / `rgba(229,118,104,.16)` |

Two contrast fixes are baked in, both departures from the mockups:

- **Text on filled pink is `#16310c`, not white.** White on `#ff70a9` is 2.58:1, which fails AA and
  even large-text AA. Deep green ink is 5.29:1.
- **`muted` is `#5f6c55`, not `#6b7860`.** The mockup value is 4.38:1 on `bg` and used at 11–13 px.

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

## 6. Login screen

Built from `demo.html`'s `.login` block. Full-viewport, single column, centred, capped at 420 px on
wider screens.

| Element | Spec |
|---|---|
| Backdrop | `linear-gradient(165deg, #f6f8f2, #e9f0dc)`, with a dark-mode counterpart |
| Logo plate | 74×74, radius 22, `lime` fill, `#16310c` glyph at 36px/800, lime glow shadow |
| Title | 26px/800 (700 for CJK), `text` |
| Subtitle | 14px, `muted` |
| Inputs | full width, padding 14/16, 1px `border`, radius `md`, `surface` fill, 15px |
| Primary button | full width, padding 15, radius `md`, `accent` fill, `on-accent` text, 16px/700 |
| Ghost button | full width, padding 13, 1px `border`, `surface` fill, `muted` text, 14px/600 |
| Terms | 11px, `muted` |

Four deliberate departures from the mockup:

- **Email and code are two steps, not one form.** The mockup shows both fields at once, but a
  verification code cannot be typed before it has been sent. The code field appears after the email
  is submitted.
- **The second button is "Continue with Google", not "Create an account".** With email OTP there is
  no separate registration — a first sign-in creates the account. Google is the other auth path the
  architecture calls for, and it takes the slot.
- **The guest link is dropped.** "先随便看看" implies browsing without an account, but every row is
  scoped to a user by RLS, so there is nothing for a guest to read.
- **The terms line is plain text, not links.** There are no terms or privacy pages yet, and a link
  to nowhere is worse than no link.

The form does not submit anywhere yet; auth is wired at M1.

## 7. Accessibility floor

Non-negotiable, and mostly missing from the mockups.

- **Contrast** checked at 4.5:1 for text under 18px. The two fixes in §3.
- **Tap targets** 44×44 minimum, grown with padding rather than the visual.
- **Focus** on every interactive element: 2px `accent-ink` outline at 2px offset. The mockups have
  no focus style anywhere.
- **Labels**, not placeholders alone. Visually hidden where the design has no room.
- **Motion** honours `prefers-reduced-motion`.
- **Theme** via `data-theme` on `:root`, defaulting from `prefers-color-scheme`.

## 8. Still to write

Space scale, elevation, motion tokens, component specs beyond login (item card, status pill, tag,
chip, bottom sheet, tab bar, chat bubbles, module card), empty and error states, the thumbnail
crop rules, and breakpoints beyond 390.
