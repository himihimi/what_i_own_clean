import { getFormatter, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { ColorSwatch } from "@/components/items/atoms";
import { StatusTag } from "@/components/items/StatusTag";
import { pieceSections, type FieldId } from "@/lib/items/fields";
import { varyingFields } from "@/lib/items/resolve";
import type { Item, Piece } from "@/lib/items/types";

/**
 * One box per group of identical pieces, showing only what differs between them.
 *
 * **`×N` sits outside the box.** A box is one group, and the multiplier applies
 * to the whole group — put it inside and it reads as a field, ranked alongside
 * colour and condition. See docs/components.md §4.
 *
 * The box is the one place on the item page that draws a border, because here it
 * means something: it is the boundary of "one of these". Everything else
 * separates with a rule and a background.
 */
export async function PieceBoxes({ item }: { item: Item }) {
  const t = await getTranslations("fields");
  const tValues = await getTranslations("values");
  const tItem = await getTranslations("item");
  const format = await getFormatter();

  const differing = varyingFields(
    item,
    pieceSections.flatMap((section) => section.fields),
  );

  if (item.pieces.length < 2 || differing.length === 0) {
    return null;
  }

  function cell(id: FieldId, piece: Piece): ReactNode {
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
      case "usage":
        return piece.usage ? (
          <StatusTag value={piece.usage}>{tValues(piece.usage)}</StatusTag>
        ) : null;
      case "condition":
        return piece.condition ? (
          <StatusTag value={piece.condition}>{tValues(piece.condition)}</StatusTag>
        ) : null;
      case "date":
        return piece.date?.bought
          ? format.dateTime(new Date(piece.date.bought), { dateStyle: "medium" })
          : null;
      // A closed set, so it is a lookup — the raw key would render untranslated.
      case "acquire":
        return piece.acquire ? tValues(piece.acquire) : null;
      default: {
        const value = piece[id as keyof Piece];
        return typeof value === "string" ? value : null;
      }
    }
  }

  return (
    <section>
      <div className="mt-5 mb-2 flex items-baseline justify-between">
        <h2 className="text-[13px] font-extrabold tracking-tight text-text">
          {tItem("pieces")}
        </h2>
        <span className="text-[11px] text-muted">{tItem("onlyDifferences")}</span>
      </div>

      <ul className="flex flex-col gap-2">
        {item.pieces.map((piece) => (
          <li key={piece.id} className="flex items-center gap-2">
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-3 gap-y-2 rounded-[12px] border border-border bg-surface p-3">
              {differing.map((id) => {
                const value = cell(id, piece);

                return (
                  <div key={id} className="min-w-0">
                    <div className="text-[11px] font-semibold text-muted">
                      {t(id)}
                    </div>
                    {/* An empty value inside a box needs no dashed outline: the
                        box already draws the boundary, and a second one fights
                        it. */}
                    <div className="truncate text-[13px] text-text">
                      {value ?? <span className="text-muted">—</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <span className="shrink-0 text-[13px] font-semibold text-muted">
              ×{piece.quantity}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
