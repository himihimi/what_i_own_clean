# Components — What I Own

What to build, and what to take from shadcn instead. Drawn from the design drafts for the library
grid, the item page, the item editor and the field console.

See [design.md](./design.md) for the visual system these are built from, and
[architecture.md](./architecture.md) for the technical decisions around them.

**`/{locale}/demo` is all of it on one page**, in every state, with the theme and language switches on
it. Public and unauthenticated on purpose: needing a session to look at a chip is the friction that
stops anyone looking. It renders through the real catalogues, so switching language there switches
the components'.

`.claude/skills/existing-components/` points here before any new screen is built, so this file is
read rather than rediscovered.

---

## 1. The item screens are field-driven

**The item page and the item editor are not hand-written markup.** They are a field registry and two
renderers. Every field declares where it appears when read and what it is edited with, and the
screens are assembled from that.

This is the single decision that decides how much there is to build. Hand-written, each field is a
block of markup on two screens, and adding one means editing both. Registry-driven, a field is a row
in a table, and the screens never change.

| Field | Category | Level | Read as | Edited with |
|---|---|---|---|---|
| `image` | general | product | hero image | image upload |
| `name` | general | product | hero title | text |
| `quantity` | general | product | hero, top right | stepper |
| `rating` | feeling | product | hearts | hearts |
| `verdict` | feeling | product | quote | text |
| `tags` | feeling | product | tag row | tag input |
| `comments` | feeling | product | sticky notes | **not in the form** |
| `brand` | basics | piece | chip | text |
| `color` | basics | piece | swatch | colour picker |
| `size` | basics | piece | chip | text |
| `material` | basics | piece | chip | text |
| `date` | purchase | piece | chip | date pair — bought / expires |
| `price` | purchase | piece | chip | amount + currency |
| `channel` | purchase | piece | chip | text |
| `acquire` | purchase | piece | chip | segmented |
| `giftFrom` | purchase | piece | chip, paired with `acquire` | text |
| `location` | storage | piece | status card | text |
| `usage` | storage | piece | status tag | segmented |
| `condition` | storage | piece | status tag | segmented |

**Two levels, and the boundary is quantity.** `product` fields describe the thing; `piece` fields
describe one of them. Below a quantity of one they are indistinguishable. Above it, a piece field can
be filled once for all pieces or split per piece, and that split is what the editor's *fill
separately* / *merge* pair does.

**The levels are two consecutive runs, not an alternation** — product first, piece second. So the
boundary is marked once, by a heading over the per-piece band, rather than badged on every section.
An earlier draft labelled all five sections and read as six restatements of one fact.

**Comments are not a form field.** They are written on the item page as they occur to someone, with a
timestamp, and never appear in the editor.

---

## 2. Taken from shadcn

| Need | Component | Adjustment |
|---|---|---|
| General / per-piece switch in the editor | `tabs` | 44px targets, our tokens |
| Segmented fields, preference chips | `toggle-group` | single and multiple; pill shape |
| The add sheet | `sheet`, side bottom | radius `xl`, the `sheet` motion token |
| Destructive confirmations | `alert-dialog` | tokens |
| Currency, field-console dropdowns | `select` | tokens |
| Long notes | `textarea` | 16px text, so iOS does not zoom on focus |
| "Saved 3 things" | `sonner` | tokens, and the copy rules in design.md §11 |
| Library grid while loading | `skeleton` | tokens |
| Already generated | `button`, `input`, `label`, `field`, `alert`, `separator`, `dropdown-menu` | — |

Every `shadcn add` needs the `bg-accent` / `bg-muted` pass described in design.md §6. Both resolve to
colours we mean differently, and a generated component using either paints pink or dark green where
it wanted a light grey.

**Dates use the native input**, not `calendar`. The drafts use `<input type="date">`; a phone renders
its own picker, which is better than anything we would ship and costs nothing. `calendar` pulls in
react-day-picker for a field that is a native control on the only viewport we design for.

---

## 3. Atoms

Ordered by how many screens they land on.

| Component | Job |
|---|---|
| **ValueChip** | A field's value, in one of three states. This is the most reused thing in the app |
| **StatusTag** | A state word, tinted by meaning |
| **Thumb** | The image plate — library card, hero, editor row, piece box |
| **SectionHeading** | A section's name |
| **ColorSwatch** | Colour dot plus its name |
| **HeartRating** | One to five, read-only on the item page and editable in the form |
| **CountLabel** | `×3`, `3 pieces · 2 kinds` |
| **SeasonTag** | Spring, summer, autumn, winter, each its own colour |

**ValueChip carries three states and they are the point:**

| State | Means | Looks like |
|---|---|---|
| filled | a value, the same on every piece | solid, on `surface-2` |
| deferred | the pieces disagree — *see pieces* | solid, muted |
| empty | not filled in | dashed outline, an em dash |

An empty field **keeps its place and loses its value**. Hiding it makes the page reshuffle as data
arrives, and someone scanning for a field they filled last week should find it where they left it.
The dashed outline is a real border, so its padding is inset 1px — otherwise empty chips stand 2px
taller than filled ones and a mixed row goes ragged.

The empty value is an em dash and not *+ add*. Most fields on most things are legitimately empty — an
SD card has no size and no material — and a page of prompts reads as perpetually unfinished. Prompting
belongs in the editor.

**StatusTag tints by meaning, never by decoration:**

| Meaning | Values | Token |
|---|---|---|
| good | new, in use | `lime` |
| attention | worn, marked, occasional, unused | `amber` |
| bad | unusable, lost | `danger` |
| held | in storage | `muted` |

Pink appears nowhere in this table. A status is something the system knows, and design.md §2 gives
state to lime and amber; pink is for things you can press.

**CountLabel is plain text, not a pill.** A count is a measurement, not a filter — giving it a pill
background makes people try to tap it.

---

## 4. Composites

| Component | Job |
|---|---|
| **ItemCard** | One thing in the library grid: thumb, name, price, brand, tags |
| **ItemHero** | Thumb, name, count, and conditionally brand and price |
| **ScopePanel** | The per-piece band, with its count on the right |
| **PieceBox** | One group of identical pieces — a 2×2 grid of values, with `×N` outside it |
| **VerdictQuote** | The one-line opinion |
| **CommentNote** | A dated note, with add, edit and delete in place |
| **FieldRow** | An editor field's label, with an action slot on the right |
| **InlineField** | Label left, input right, inside a piece |
| **PieceGroup** | A piece's badge, its count, and its fields |
| **Stepper** | Minus, number, plus |
| **TagInput** | Chips with a remove, and a new one on Enter |
| **ImageRow** | Thumbnails with a remove, and an add tile |
| **DateRangeRow** | Bought and expires, side by side |
| **AiButton** | Full width, accent-soft — "ask the assistant about this" |
| **CollectionChips** | Which collections this is in, and a way to add it to another |

Notes worth keeping:

- **`ScopePanel` bleeds to the screen edge, its text does not.** The band is full width via negative
  margin while the content stays on the same 16px rail as everything above it. Hierarchy comes from a
  rule and a background — no borders, no cards, no vertical lines. The whole page uses only those two.
- **`PieceBox` puts `×N` outside the box.** A box is one group of identical pieces, and the multiplier
  applies to the whole box. Put it inside and it reads as a field, ranked alongside colour and
  condition.
- **`SectionHeading` and body text run opposite.** Headings are small and heavy — 13px/800; content is
  larger and lighter — 16px/500. When both were heavy and dark, the eye read a sentence of content as
  another heading.
- **`VerdictQuote` is marked by a quotation mark, not a background.** The comments below it are
  already tinted notes; a second filled block turns the page into competing panels.
- **`TopBar` exists** in `components/app-shell/` and needs two more shapes: back / title / action for
  reading, and cancel / title / save for editing.

---

## 5. Rules, not components

Two fields behave conditionally in the hero. This belongs in a `summarise(field, pieces)` helper, not
inside a component — it is a question about data, and the components should only be handed an answer.

| Field | Pieces agree | Pieces differ | Not filled |
|---|---|---|---|
| `brand` | shown | **hidden entirely** | hidden |
| `price` | shown, no suffix | first by sort order, plus *2 prices* | hidden |

**Brand disappears when the pieces disagree** because there is no honest summary of three brands.
Picking one would be wrong information, and wrong is worse than absent.

**Price always resolves**, because there is always a defensible representative — the first by sort
order. The suffix exists so a single figure is not read as the price of all of them. It does not say
*from* and does not say *lowest*: first-by-sort need not be the cheapest, and either word could be a
lie.

**The hero summarises; it never relocates.** Both fields keep their normal place further down the
page whatever the hero does, so a field never moves depending on the data in it.

---

## 6. Build order

| | Step | State |
|---|---|---|
| 1 | **The field registry** — the table in §1 as data, in `lib/items/fields.ts` | built |
| 2 | **The read atoms** — `ValueChip`, `StatusTag`, `Thumb`, `SectionHeading`, `CountLabel`, `ColorSwatch`, `HeartRating`, `VerdictQuote`, `Tag` | built |
| 3 | **The read renderer** — `PieceSections`, walking the registry. The item page falls out of it | built |
| 4 | **`ItemCard` and the library grid** | built |
| 5 | **The edit atoms and the edit renderer** — `FieldRow`, `InlineField`, `Stepper`, `TagInput`, `ImageRow`, `DateRangeRow`, `PieceGroup` | not started |
| 6 | **More than one piece** — the per-piece band and `PieceBoxes` | built |

The screens read `lib/items/fixtures.ts`, which exists so the interface could be built and looked at
before the data model. The grid, the cards, the chips and the summary rules are real; only where the
items come from is not. Every fixture is deliberately awkward — pieces that disagree, an item with
almost nothing filled in, two prices — because a tidy fixture set proves nothing.

---

## 7. Decided while building

**The library card is the vertical one**: plate, name, price and brand, then tags. The status tag
overlays the plate's top corner and the count its bottom corner. It follows the drafts' own note —
small thumbnail, status in the corner, name, total — and it is one layout rather than a prop with
five branches.

**`held` is the only status tone with an outline.** Its fill is `surface-2`, and it labels a
thumbnail that is also `surface-2`, so on a card it vanished where every tinted tone read fine. The
hairline is what makes an untinted tag legible on any surface.

## 8. Still to decide

**Season colours.** Four hues that do not exist in the palette, needing dark-mode counterparts and a
contrast check at 4.5:1 like everything in design.md §3. Nothing renders them yet. The drafts also
set tags at 10px, below the 11px floor in §5.
