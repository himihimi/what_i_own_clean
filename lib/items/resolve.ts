import type { FieldId } from "./fields";
import type { Item, Piece } from "./types";

/**
 * Turning an item's pieces into the one answer a field renders.
 *
 * Kept out of the components on purpose: whether three pieces agree about their
 * brand is a question about data, and a component should be handed the answer
 * rather than work it out. It also makes the rules testable without rendering
 * anything. See docs/components.md §5.
 */

/**
 * What a piece-level field resolves to across every piece.
 *
 * These three are the states `ValueChip` draws, and they are genuinely
 * different things to the reader: a value, a value that varies, and nothing
 * yet.
 */
export type FieldValue =
  | { kind: "value"; piece: Piece }
  | { kind: "deferred" }
  | { kind: "empty" };

/** Two pieces agree when their values render identically. */
function sameAcross(pieces: readonly Piece[], id: FieldId): boolean {
  const [first, ...rest] = pieces;
  const key = (piece: Piece) => JSON.stringify(piece[id as keyof Piece] ?? null);

  return rest.every((piece) => key(piece) === key(first));
}

function isFilled(piece: Piece, id: FieldId): boolean {
  return piece[id as keyof Piece] !== undefined;
}

export function resolveField(item: Item, id: FieldId): FieldValue {
  const filled = item.pieces.filter((piece) => isFilled(piece, id));

  if (filled.length === 0) {
    return { kind: "empty" };
  }

  // Partly filled counts as varying: some pieces have it and some do not, which
  // is a difference like any other.
  if (filled.length !== item.pieces.length || !sameAcross(item.pieces, id)) {
    return { kind: "deferred" };
  }

  return { kind: "value", piece: filled[0] };
}

/** Which fields differ across pieces, in the order given. Drives the piece boxes. */
export function varyingFields(
  item: Item,
  ids: readonly FieldId[],
): readonly FieldId[] {
  return ids.filter((id) => resolveField(item, id).kind === "deferred");
}

/**
 * The brand shown in the hero, if one can be shown at all.
 *
 * Absent when the pieces disagree, and that is the whole point: there is no
 * honest summary of three brands, and picking one would be wrong information.
 * Wrong is worse than absent, so the hero simply drops it — the field keeps its
 * usual place further down, where each piece can state its own.
 */
export function heroBrand(item: Item): string | undefined {
  const brand = resolveField(item, "brand");

  return brand.kind === "value" ? brand.piece.brand : undefined;
}

/**
 * The price shown in the hero.
 *
 * Unlike the brand this always resolves, because there is always a defensible
 * representative: the first piece by sort order. `kinds` is how many distinct
 * prices exist, and the interface names it when it is more than one — a lone
 * figure would otherwise read as the price of all of them.
 *
 * It deliberately reads as "and there are others", not "from" and not "lowest":
 * first-by-sort need not be the cheapest, so either word could be a lie.
 */
export function heroPrice(
  item: Item,
): { price: NonNullable<Piece["price"]>; kinds: number } | undefined {
  const priced = item.pieces.filter((piece) => piece.price !== undefined);
  if (priced.length === 0) {
    return undefined;
  }

  const kinds = new Set(
    priced.map((piece) => `${piece.price!.currency}${piece.price!.amount}`),
  ).size;

  return { price: priced[0].price!, kinds };
}
