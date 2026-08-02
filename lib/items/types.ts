/**
 * The shape an item takes in the interface.
 *
 * Not the database shape — there are no tables yet. When the data model lands
 * this is what it has to produce, which is the useful direction: the screens
 * were designed first and this follows them.
 */

/** Closed sets, so the tint and the label are both lookups rather than guesses. */
export type Usage = "often" | "sometimes" | "unused" | "stored" | "lost";
export type Condition = "new" | "marked" | "worn" | "unusable";
export type Acquire = "bought" | "gift" | "freebie" | "other";

export type Colour = {
  /** A key under `values` in the catalogues, or free text if it has no key. */
  name: string;
  hex: string;
};

export type Money = {
  amount: number;
  currency: string;
};

/**
 * One group of identical pieces.
 *
 * `quantity` is how many of *this* group, which is why the multiplier renders
 * outside the box on the item page: it applies to the group, not to a field in
 * it. Every other property may be absent, and absent is a state the interface
 * shows rather than hides — see docs/components.md §3.
 */
export type Piece = {
  id: string;
  quantity: number;
  brand?: string;
  color?: Colour;
  size?: string;
  material?: string;
  /** Bought on, and expires on. Either may stand alone. */
  date?: { bought?: string; expires?: string };
  price?: Money;
  channel?: string;
  acquire?: Acquire;
  giftFrom?: string;
  location?: string;
  usage?: Usage;
  condition?: Condition;
};

export type Comment = {
  id: string;
  text: string;
  /** ISO date. Comments are a timeline, so this is never optional. */
  at: string;
};

export type Item = {
  id: string;
  name: string;
  /** A stand-in until images are stored: rendered on a tinted plate. */
  emoji?: string;
  rating?: number;
  verdict?: string;
  tags: readonly string[];
  comments: readonly Comment[];
  pieces: readonly Piece[];
};

/** Everything of everything. The hero's count, and the library card's. */
export function totalQuantity(item: Item): number {
  return item.pieces.reduce((total, piece) => total + piece.quantity, 0);
}
