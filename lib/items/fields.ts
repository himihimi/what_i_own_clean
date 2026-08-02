/**
 * Every field an item can carry, and what each one does on the two screens that
 * show it.
 *
 * **This table is the item page and the item editor.** Neither screen writes
 * markup per field: they walk this list and render whatever each row asks for.
 * Hand-written, a new field means editing two screens and remembering both;
 * here it is one row and nothing else changes. See docs/components.md §1.
 *
 * Labels live in `messages/*.json` under `fields`, keyed by id — they are read by
 * people, in two languages, so they cannot be strings in here.
 */

/**
 * Which of the two things a field describes.
 *
 * `product` is the thing itself; `piece` is one of them. Below a quantity of one
 * the distinction does not exist. Above it, a piece field may hold one value for
 * all of them or a different value each, and that is what the editor's
 * *fill separately* offers.
 */
export type FieldLevel = "product" | "piece";

/** Only used to group the editor and to order the item page. */
export type FieldCategory =
  | "general"
  | "feeling"
  | "basics"
  | "purchase"
  | "storage";

/** Where a field lands when read. */
export type ReadAs =
  | "heroImage"
  | "heroTitle"
  | "heroCount"
  | "hearts"
  | "quote"
  | "tagRow"
  | "notes"
  | "chip"
  | "swatch"
  | "statusTag";

/** What edits it. `none` means the field is never in the form. */
export type EditWith =
  | "image"
  | "text"
  | "stepper"
  | "hearts"
  | "tagInput"
  | "date"
  | "money"
  | "segmented"
  | "colour"
  | "none";

export type FieldId =
  | "image"
  | "name"
  | "quantity"
  | "rating"
  | "verdict"
  | "tags"
  | "comments"
  | "brand"
  | "color"
  | "size"
  | "material"
  | "date"
  | "price"
  | "channel"
  | "acquire"
  | "giftFrom"
  | "location"
  | "usage"
  | "condition";

export type ItemField = {
  id: FieldId;
  category: FieldCategory;
  level: FieldLevel;
  readAs: ReadAs;
  editWith: EditWith;
};

export const itemFields: readonly ItemField[] = [
  { id: "image", category: "general", level: "product", readAs: "heroImage", editWith: "image" },
  { id: "name", category: "general", level: "product", readAs: "heroTitle", editWith: "text" },
  { id: "quantity", category: "general", level: "product", readAs: "heroCount", editWith: "stepper" },

  { id: "rating", category: "feeling", level: "product", readAs: "hearts", editWith: "hearts" },
  { id: "verdict", category: "feeling", level: "product", readAs: "quote", editWith: "text" },
  { id: "tags", category: "feeling", level: "product", readAs: "tagRow", editWith: "tagInput" },
  // Written on the item page as they occur to someone, never in the form.
  { id: "comments", category: "feeling", level: "product", readAs: "notes", editWith: "none" },

  { id: "brand", category: "basics", level: "piece", readAs: "chip", editWith: "text" },
  { id: "color", category: "basics", level: "piece", readAs: "swatch", editWith: "colour" },
  { id: "size", category: "basics", level: "piece", readAs: "chip", editWith: "text" },
  { id: "material", category: "basics", level: "piece", readAs: "chip", editWith: "text" },

  { id: "date", category: "purchase", level: "piece", readAs: "chip", editWith: "date" },
  { id: "price", category: "purchase", level: "piece", readAs: "chip", editWith: "money" },
  { id: "channel", category: "purchase", level: "piece", readAs: "chip", editWith: "text" },
  { id: "acquire", category: "purchase", level: "piece", readAs: "chip", editWith: "segmented" },
  { id: "giftFrom", category: "purchase", level: "piece", readAs: "chip", editWith: "text" },

  { id: "location", category: "storage", level: "piece", readAs: "chip", editWith: "text" },
  { id: "usage", category: "storage", level: "piece", readAs: "statusTag", editWith: "segmented" },
  { id: "condition", category: "storage", level: "piece", readAs: "statusTag", editWith: "segmented" },
];

/**
 * The three sections of per-piece fields, in reading order.
 *
 * `general` and `feeling` are not here: they are product-level and render above
 * the per-piece band, which is the whole reason the boundary needs marking only
 * once rather than on every section.
 */
/** The three that render as sections. `general` and `feeling` sit above them. */
export type PieceCategory = Extract<
  FieldCategory,
  "basics" | "purchase" | "storage"
>;

export const pieceSections: readonly {
  category: PieceCategory;
  fields: readonly FieldId[];
}[] = [
  { category: "basics", fields: ["brand", "color", "size", "material"] },
  { category: "purchase", fields: ["date", "price", "channel", "acquire", "giftFrom"] },
  { category: "storage", fields: ["location", "usage", "condition"] },
];

const byId = new Map(itemFields.map((field) => [field.id, field]));

export function fieldById(id: FieldId): ItemField {
  const field = byId.get(id);
  if (!field) {
    throw new Error(`Unknown field: ${id}`);
  }

  return field;
}
