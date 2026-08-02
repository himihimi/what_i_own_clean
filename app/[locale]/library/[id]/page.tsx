import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/app-shell/AppShell";
import { TopBar } from "@/components/app-shell/TopBar";
import {
  CountLabel,
  HeartRating,
  SectionHeading,
  Tag,
  Thumb,
  VerdictQuote,
} from "@/components/items/atoms";
import { PieceBoxes } from "@/components/items/PieceBoxes";
import { PieceSections } from "@/components/items/PieceSections";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { sampleItem } from "@/lib/items/fixtures";
import { heroBrand, heroPrice } from "@/lib/items/resolve";
import { totalQuantity } from "@/lib/items/types";

/**
 * One thing, read.
 *
 * The page is two consecutive runs: what is true of the thing, then what is true
 * of each of them. Because they are consecutive rather than interleaved, the
 * boundary is marked once — by the band that begins the per-piece half — instead
 * of being badged onto every section. See docs/components.md §1.
 */
export default async function ItemPage({
  params,
}: PageProps<"/[locale]/library/[id]">) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const item = sampleItem(id);
  if (!item) {
    notFound();
  }

  const t = await getTranslations("item");
  const tLibrary = await getTranslations("library");
  const format = await getFormatter();

  const brand = heroBrand(item);
  const price = heroPrice(item);
  const total = totalQuantity(item);

  return (
    <AppShell
      header={
        <TopBar
          title={tLibrary("title")}
          actions={
            <Link
              href={`/library/${item.id}/edit`}
              className="px-2 text-sm font-semibold text-accent-ink"
            >
              {t("edit")}
            </Link>
          }
        />
      }
    >
      {/* Centred against the plate: with only a name and a count beside it,
          text hung from the top of a 66px image is top-heavy. */}
      <div className="flex items-center gap-3 pt-4">
        <Thumb emoji={item.emoji} size="hero" />

        <div className="min-w-0 flex-1">
          {brand && (
            <div className="truncate text-xs font-semibold text-muted">
              {brand}
            </div>
          )}

          <div className="flex items-baseline justify-between gap-2">
            <h1 className="min-w-0 truncate text-xl font-extrabold tracking-tight text-text">
              {item.name}
            </h1>
            <CountLabel>×{total}</CountLabel>
          </div>

          {price && (
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-text">
                {format.number(price.price.amount, {
                  style: "currency",
                  currency: price.price.currency,
                })}
              </span>
              {/* Not "from" and not "lowest" — first by sort order need not be
                  the cheapest, so either word could be a lie. */}
              {price.kinds > 1 && (
                <span className="text-[11px] text-muted">
                  {t("priceKinds", { count: price.kinds })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {(item.rating || item.verdict || item.tags.length > 0) && (
        <section>
          <SectionHeading>{t("feeling")}</SectionHeading>

          {item.rating !== undefined && (
            <div className="mb-2">
              <HeartRating
                value={item.rating}
                label={t("rating", { value: item.rating })}
              />
            </div>
          )}

          {item.verdict && <VerdictQuote>{item.verdict}</VerdictQuote>}

          {item.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          )}
        </section>
      )}

      {/* The per-piece half. Full-bleed background, text still on the same rail:
          hierarchy by rule and fill, never by another box. */}
      <div className="-mx-4 mt-6 border-t border-border bg-surface px-4 pt-4 pb-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold tracking-tight text-text">
            {t("perPiece")}
          </h2>
          <span className="text-[13px] font-semibold text-muted">
            {item.pieces.length > 1
              ? t("piecesAndKinds", { count: total, kinds: item.pieces.length })
              : t("pieceCount", { count: total })}
          </span>
        </div>

        <PieceSections item={item} />
        <PieceBoxes item={item} />
      </div>

      {item.comments.length > 0 && (
        <section className="mt-6">
          <SectionHeading>{t("comments")}</SectionHeading>

          <ul className="flex flex-col gap-2">
            {item.comments.map((comment) => (
              <li
                key={comment.id}
                className="rounded-md bg-amber-soft p-3 text-sm leading-relaxed text-text"
              >
                {comment.text}
                <div className="mt-1.5 text-[11px] text-muted">
                  {format.dateTime(new Date(comment.at), { dateStyle: "medium" })}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
