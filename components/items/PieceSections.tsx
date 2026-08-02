import { getFormatter, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { ColorSwatch, SectionHeading } from "@/components/items/atoms";
import { StatusTag } from "@/components/items/StatusTag";
import { ValueChip } from "@/components/items/ValueChip";
import { pieceSections, type FieldId } from "@/lib/items/fields";
import { resolveField } from "@/lib/items/resolve";
import type { Item, Piece } from "@/lib/items/types";

/**
 * Every per-piece field, in the order the registry gives, as chips.
 *
 * **This is the renderer the field table exists for.** It walks
 * `pieceSections`, asks `resolveField` what each one resolves to, and draws the
 * matching state. Adding a field is a row in `lib/items/fields.ts`; this file
 * does not change. See docs/components.md §1.
 */

/** `giftFrom` is never its own chip — it rides along inside `acquire`. */
const paired: FieldId = "giftFrom";

export async function PieceSections({ item }: { item: Item }) {
  const t = await getTranslations("fields");
  const tValues = await getTranslations("values");
  const tItem = await getTranslations("item");
  const format = await getFormatter();

  /** The value a chip shows when the field is filled and every piece agrees. */
  function shown(id: FieldId, piece: Piece): ReactNode {
    switch (id) {
      case "color":
        return piece.color ? (
          <ColorSwatch hex={piece.color.hex} name={piece.color.name} />
        ) : null;
      case "price":
        return piece.price
          ? format.number(piece.price.amount, {
              style: "currency",
              currency: piece.price.currency,
            })
          : null;
      case "date": {
        if (!piece.date) return null;
        const parts = [piece.date.bought, piece.date.expires]
          .filter(Boolean)
          .map((iso) => format.dateTime(new Date(iso!), { dateStyle: "medium" }));
        return parts.join(" → ");
      }
      case "acquire": {
        if (!piece.acquire) return null;
        const acquired = tValues(piece.acquire);
        // Paired: "Gift / Mum" reads as one fact, which is what it is.
        return piece.giftFrom ? `${acquired} · ${piece.giftFrom}` : acquired;
      }
      case "usage":
        return piece.usage ? (
          <StatusTag value={piece.usage}>{tValues(piece.usage)}</StatusTag>
        ) : null;
      case "condition":
        return piece.condition ? (
          <StatusTag value={piece.condition}>{tValues(piece.condition)}</StatusTag>
        ) : null;
      default: {
        const value = piece[id as keyof Piece];
        return typeof value === "string" ? value : null;
      }
    }
  }

  /** `acquire` absorbs `giftFrom`, so its label has to say so. */
  function labelFor(id: FieldId, piece?: Piece): string {
    return id === "acquire" && piece?.giftFrom
      ? `${t("acquire")} / ${t("giftFrom")}`
      : t(id);
  }

  return (
    <>
      {pieceSections.map((section) => (
        <section key={section.category}>
          <SectionHeading>{tItem(section.category)}</SectionHeading>

          <div className="flex flex-wrap gap-1.5">
            {section.fields
              .filter((id) => id !== paired)
              .map((id) => {
                const resolved = resolveField(item, id);

                if (resolved.kind === "empty") {
                  return (
                    <ValueChip key={id} label={labelFor(id)} state="empty">
                      —
                    </ValueChip>
                  );
                }

                if (resolved.kind === "deferred") {
                  return (
                    <ValueChip key={id} label={labelFor(id)} state="deferred">
                      {tItem("seePieces")}
                    </ValueChip>
                  );
                }

                return (
                  <ValueChip key={id} label={labelFor(id, resolved.piece)}>
                    {shown(id, resolved.piece)}
                  </ValueChip>
                );
              })}
          </div>
        </section>
      ))}
    </>
  );
}
