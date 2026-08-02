---
name: existing-components
description: Use before building any new screen, feature, or UI in this project - reads the component inventory first so existing components get reused and their rules are not re-litigated. Triggers on new pages, new routes, new forms, "add a screen", "build the X page", or any styling of new markup.
---

# Know what already exists

This project has a component inventory and a live gallery. Read them **before** writing markup.
Nearly every visual problem in a new screen is already solved, and the solutions have reasons
attached that are not obvious from the code.

## Do this first, in this order

1. **Read `docs/components.md`.** It is the map: which components exist, what each is for, what comes
   from shadcn instead, and what is still undecided. Ten minutes here saves rebuilding a chip that
   already has three states.
2. **Open `/{locale}/demo`.** Every component in every state, live, with the theme and language
   switches on it. It is public, so it needs no session — `pnpm dev` and go.
3. **Skim the directories**, which are small:
   - `components/items/` — the item atoms and composites
   - `components/ui/` — generated shadcn, already adapted to our tokens
   - `components/app-shell/` — the frame every signed-in screen sits in
   - `lib/items/` — the field registry, the value resolution, the fixtures
4. **Then check `docs/design.md`** for the token, radius, type and accessibility rules the new screen
   has to obey.

## What you are looking for

| Before you write | Ask |
|---|---|
| a chip, tag, pill | `ValueChip` or `StatusTag` already? |
| a value that might be missing | `ValueChip state="empty"` — do not invent a hidden field |
| a state word | `StatusTag`, and is the tone in `statusTone`? |
| an image placeholder | `Thumb` |
| a heading inside a screen | `SectionHeading` |
| a count | `CountLabel` — plain text, never a pill |
| a form control | check shadcn's registry before writing one, per components.md §2 |
| a new item field | a row in `lib/items/fields.ts`, not markup on two screens |

## Rules that are decisions, not preferences

Breaking these silently undoes work. If one is wrong for what you are doing, say so and change it
deliberately — in the docs too.

- **Pink is for what you can press. Lime and amber are for what the system knows.** A status must
  never be pink. `docs/design.md` §2.
- **Empty fields keep their place.** A missing value renders as a dashed chip with an em dash, not as
  a hidden row — otherwise the page reshuffles as data arrives.
- **The item screens are registry-driven.** Adding a field means editing `lib/items/fields.ts`. If you
  find yourself writing per-field markup on a screen, stop.
- **Everything user-facing is in `messages/en.json` and `messages/zh.json`**, both of them. English is
  the typed reference; a key missing from it is a compile error, and a key missing from Chinese is
  not — so check.
- **44px minimum tap targets, 11px minimum type.** Phone width is the only width designed.
- **Server components by default.** A `"use client"` boundary needs a reason: state, an effect, or an
  event handler.

## Finishing

- `pnpm typecheck` and `pnpm lint` both clean.
- Look at the screen — light **and** dark, `en` **and** `zh`, at 390px wide. Half the defects in this
  codebase were invisible to typechecking and obvious on screen.
- Add anything genuinely new to `docs/components.md` and to `/demo`, or the next person rebuilds it.
- **Never run `pnpm build` while `pnpm dev` is running.** They share `.next`, and the build leaves the
  dev server's worker pool broken in a way whose error message names neither.
