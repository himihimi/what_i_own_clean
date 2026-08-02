import { getFormatter, getTranslations } from "next-intl/server";

import { Tag, Thumb } from "@/components/items/atoms";
import { StatusTag } from "@/components/items/StatusTag";
import { Link } from "@/i18n/navigation";
import { heroBrand, heroPrice, resolveField } from "@/lib/items/resolve";
import { totalQuantity, type Item } from "@/lib/items/types";

/**
 * One thing in the library grid.
 *
 * The same summary rules as the item page's hero, for the same reason: a brand
 * is only shown when every piece agrees, because picking one of three would be
 * wrong information. A card has even less room to explain itself than a hero
 * does — see docs/components.md §5.
 *
 * Two per row at phone width, so everything here has to survive being narrow:
 * the name wraps to two lines and then clips, and the meta line truncates.
 */
export async function ItemCard({ item }: { item: Item }) {
  const t = await getTranslations("library");
  const tValues = await getTranslations("values");
  const format = await getFormatter();

  const brand = heroBrand(item);
  const price = heroPrice(item);
  const total = totalQuantity(item);
  const usage = resolveField(item, "usage");

  return (
    <Link
      href={`/library/${item.id}`}
      className="group flex flex-col rounded-lg border border-border bg-surface p-2.5 transition-transform active:scale-[.97]"
    >
      <div className="relative">
        <Thumb emoji={item.emoji} />

        {/* Only when every piece agrees: a card cannot caveat itself. */}
        {usage.kind === "value" && usage.piece.usage && (
          <span className="absolute top-1.5 right-1.5">
            <StatusTag value={usage.piece.usage}>
              {tValues(usage.piece.usage)}
            </StatusTag>
          </span>
        )}

        {total > 1 && (
          <span className="absolute bottom-1.5 left-1.5 rounded-xs bg-bg/90 px-1.5 py-0.5 text-[11px] font-semibold text-muted">
            ×{total}
          </span>
        )}
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm leading-snug font-bold text-text">
        {item.name}
      </h3>

      <div className="mt-1 flex min-w-0 items-baseline gap-1 text-xs">
        {price && (
          <span className="font-extrabold text-text">
            {format.number(price.price.amount, {
              style: "currency",
              currency: price.price.currency,
            })}
          </span>
        )}
        {/* The separator belongs to the pair, not to the brand: without a price
            in front of it, a leading dot reads as a missing value. */}
        {brand && (
          <span className="truncate text-muted">
            {price ? `· ${brand}` : brand}
          </span>
        )}
        {!price && !brand && (
          <span className="text-muted">{t("noDetails")}</span>
        )}
      </div>

      {item.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {item.tags.slice(0, 2).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      )}
    </Link>
  );
}
