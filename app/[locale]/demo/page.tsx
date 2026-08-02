import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import {
  ColorSwatch,
  CountLabel,
  HeartRating,
  SectionHeading,
  Tag,
  Thumb,
  VerdictQuote,
} from "@/components/items/atoms";
import { ItemCard } from "@/components/items/ItemCard";
import { PieceBoxes } from "@/components/items/PieceBoxes";
import { PieceSections } from "@/components/items/PieceSections";
import { StatusTag, statusTone } from "@/components/items/StatusTag";
import { ValueChip } from "@/components/items/ValueChip";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { routing } from "@/i18n/routing";
import { sampleItems } from "@/lib/items/fixtures";
import { heroBrand, heroPrice } from "@/lib/items/resolve";
import type { Condition, Usage } from "@/lib/items/types";

/**
 * Every item component, in every state it has, on one page.
 *
 * **Public and unauthenticated on purpose** — see `publicPaths` in
 * `lib/auth/routes.ts`. Checking a component against light and dark, English and
 * Chinese, and a narrow column should not require a session, and asking for one
 * is exactly the friction that stops anybody looking.
 *
 * The components render real content through the real catalogues, so switching
 * language here switches theirs. The gallery's own captions are English and are
 * not translated: they name components and props, which are code either way, and
 * putting them through `messages/` would bury twenty real strings under thirty
 * developer ones.
 *
 * It ships. If that stops being wanted, `notFound()` on
 * `process.env.NODE_ENV === "production"` is the whole change.
 */
export default async function DemoPage({
  params,
}: PageProps<"/[locale]/demo">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations("fields");
  const tValues = await getTranslations("values");
  const tItem = await getTranslations("item");

  const usages: Usage[] = ["often", "sometimes", "unused", "stored", "lost"];
  const conditions: Condition[] = ["new", "marked", "worn", "unusable"];

  return (
    <div className="min-h-svh bg-bg px-4 pb-20">
      <header className="mx-auto flex max-w-[640px] items-start justify-between gap-4 py-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text">
            Component gallery
          </h1>
          <p className="mt-1 text-sm text-muted">
            Every item component and every state it has. Flip the theme and the
            language — both are the real ones.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <LocaleSwitch current={locale} />
        </div>
      </header>

      <div className="mx-auto flex max-w-[640px] flex-col gap-10">
        <Row
          title="ValueChip"
          note="Three states. An empty field keeps its place: the dashed outline is inset 1px so it stands exactly as tall as a filled one — a mixed row must not go ragged."
        >
          {/* The same flex context PieceSections uses, stretch included: a
              gallery that arranges components differently from the screen is
              testing something the screen never does. */}
          <div className="flex flex-wrap gap-1.5">
            <ValueChip label={t("brand")}>Clarks</ValueChip>
            <ValueChip label={t("color")}>
              <ColorSwatch hex="#7a5230" name="Brown" />
            </ValueChip>
            <ValueChip label={t("price")} state="deferred">
              {tItem("seePieces")}
            </ValueChip>
            <ValueChip label={t("material")} state="empty">
              —
            </ValueChip>
            <ValueChip label={t("size")} state="empty">
              —
            </ValueChip>
          </div>
        </Row>

        <Row
          title="StatusTag"
          note="Tinted by meaning, not by field. No pink anywhere: a status is state, and pink is reserved for things you can press. `held` is the only untinted tone, so it is the only one with an outline — without it, it vanishes on a thumbnail plate."
        >
          <div className="flex flex-wrap gap-1.5">
            {[...usages, ...conditions].map((value) => (
              <span key={value} className="flex items-center gap-1">
                <StatusTag value={value}>{tValues(value)}</StatusTag>
                <code className="text-[10px] text-muted-2">
                  {statusTone[value]}
                </code>
              </span>
            ))}
          </div>
        </Row>

        <Row title="Thumb" note="Card size fills its column; hero size is fixed at 66px.">
          <div className="flex items-end gap-4">
            <div className="w-[120px]">
              <Thumb emoji="🧥" />
            </div>
            <Thumb emoji="🧥" size="hero" />
            <Thumb size="hero" />
          </div>
        </Row>

        <Row
          title="HeartRating"
          note="Read-only. The filled count is the accessible name — five glyphs announce as nothing useful."
        >
          <div className="flex flex-col gap-1">
            {[0, 1, 3, 5].map((value) => (
              <HeartRating
                key={value}
                value={value}
                label={tItem("rating", { value })}
              />
            ))}
          </div>
        </Row>

        <Row
          title="SectionHeading · CountLabel · Tag · ColorSwatch"
          note="A heading is small and heavy against content that is large and light. A count is plain text, never a pill — a pill makes people try to tap it."
        >
          <div className="flex items-baseline justify-between">
            <SectionHeading>{tItem("basics")}</SectionHeading>
            <CountLabel>×3</CountLabel>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text">
            <Tag>winter</Tag>
            <Tag>everyday</Tag>
            <ColorSwatch hex="#7a5230" name="Brown" />
            <ColorSwatch hex="#2b3550" name="Navy" />
          </div>
        </Row>

        <Row
          title="VerdictQuote"
          note="Marked by a quotation mark rather than a filled block — the comments below it are already tinted notes, and two blocks compete."
        >
          <VerdictQuote>
            Goes with everything, rubs a little on a long walk.
          </VerdictQuote>
        </Row>

        <Row
          title="ItemCard"
          note="The real grid: two per row. The third card has no price, the fourth is squeezed to 130px to check that a long name clips and the meta line truncates."
        >
          <ul className="grid grid-cols-2 gap-3">
            {sampleItems.map((item) => (
              <li key={item.id} className="min-w-0">
                <ItemCard item={item} />
              </li>
            ))}
          </ul>

          <div className="mt-4 w-[130px]">
            <ItemCard
              item={{
                ...sampleItems[1],
                id: "narrow",
                name: "A deliberately long name that has to wrap and then stop",
              }}
            />
          </div>
        </Row>

        {sampleItems.map((item) => (
          <Row
            key={item.id}
            title={`Item body · ${item.name}`}
            note={describe(item.id)}
          >
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-extrabold text-text">
                  {tItem("perPiece")}
                </span>
                <span className="text-[11px] text-muted">
                  brand {heroBrand(item) ?? "—"} · price{" "}
                  {heroPrice(item)
                    ? `${heroPrice(item)!.price.amount} (${heroPrice(item)!.kinds} kind${heroPrice(item)!.kinds > 1 ? "s" : ""})`
                    : "—"}
                </span>
              </div>

              <PieceSections item={item} />
              <PieceBoxes item={item} />
            </div>
          </Row>
        ))}
      </div>
    </div>
  );
}

/** Why each fixture is here — the states are the point, not the things. */
function describe(id: string): string {
  switch (id) {
    case "shoes":
      return "Pieces disagree about colour, condition, location, price and how it was acquired. Brand survives to the hero because both pieces say Clarks; price shows the first by sort order and admits there are two.";
    case "sdcard":
      return "Almost nothing filled in — the ordinary case. Every empty field keeps its slot and shows an em dash, so the page cannot reshuffle as data arrives.";
    case "fleece":
      return "One piece, everything filled. Nothing defers and nothing is empty, which is the baseline the other two are read against.";
    default:
      return "One piece, a couple of gaps.";
  }
}

function Row({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-sm font-extrabold tracking-tight text-text">
        {title}
      </h2>
      <p className="mt-1 mb-3 text-xs leading-relaxed text-muted">{note}</p>
      {children}
    </section>
  );
}
