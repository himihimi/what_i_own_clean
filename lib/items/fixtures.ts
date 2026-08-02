import type { Item } from "./types";

/**
 * Sample items, so the screens can be built and looked at before there is a
 * database.
 *
 * **Temporary, and deliberately awkward.** Between them these cover the states
 * the interface has to survive rather than the ones that flatter it: an item
 * whose pieces disagree about nearly everything, one with almost nothing filled
 * in, one with two prices, and one plain single piece. A fixture set of
 * complete, tidy items would prove nothing.
 *
 * Delete this when the data model lands.
 */
export const sampleItems: readonly Item[] = [
  {
    id: "fleece",
    name: "Fleece jacket",
    emoji: "🧥",
    rating: 4,
    verdict: "Warm without being bulky, and it survives the wash.",
    tags: ["winter", "everyday"],
    comments: [
      { id: "c1", text: "Cuffs are starting to pill after two winters.", at: "2025-06-02" },
    ],
    pieces: [
      {
        id: "p1",
        quantity: 1,
        brand: "Uniqlo",
        color: { name: "Charcoal", hex: "#3b3f3a" },
        size: "M",
        material: "Fleece",
        date: { bought: "2024-11-11" },
        price: { amount: 199, currency: "CNY" },
        channel: "Store",
        acquire: "bought",
        location: "Bedroom wardrobe",
        usage: "often",
        condition: "marked",
      },
    ],
  },
  {
    // The hard case: two groups that disagree about colour, condition, where
    // they live and what they cost. Brand agrees, so the hero keeps it.
    id: "shoes",
    name: "Leather shoes",
    emoji: "👞",
    rating: 3,
    verdict: "Goes with everything, rubs a little on a long walk.",
    tags: ["work"],
    comments: [
      { id: "c2", text: "The brown pair rubs my heel — wear the black ones out.", at: "2025-06-02" },
    ],
    pieces: [
      {
        id: "p1",
        quantity: 1,
        brand: "Clarks",
        color: { name: "Brown", hex: "#7a5230" },
        size: "38",
        material: "Leather",
        date: { bought: "2024-03-02" },
        price: { amount: 278, currency: "CNY" },
        channel: "Taobao",
        acquire: "gift",
        giftFrom: "Mum",
        location: "By the door",
        usage: "often",
        condition: "worn",
      },
      {
        id: "p2",
        quantity: 2,
        brand: "Clarks",
        color: { name: "Black", hex: "#2b2b2b" },
        size: "38",
        material: "Leather",
        date: { bought: "2024-09-14" },
        price: { amount: 258, currency: "CNY" },
        channel: "Taobao",
        acquire: "bought",
        location: "Shoe rack",
        usage: "stored",
        condition: "new",
      },
    ],
  },
  {
    // Almost nothing filled in, which is the ordinary case and has to look
    // deliberate rather than broken.
    id: "sdcard",
    name: "SD card",
    emoji: "💾",
    tags: [],
    comments: [],
    pieces: [
      {
        id: "p1",
        quantity: 3,
        brand: "SanDisk",
        location: "Desk drawer",
        usage: "stored",
      },
    ],
  },
  {
    id: "backpack",
    name: "Backpack",
    emoji: "🎒",
    rating: 5,
    verdict: "Still the best thing I own.",
    tags: ["commute", "travel"],
    comments: [],
    pieces: [
      {
        id: "p1",
        quantity: 1,
        brand: "Adidas",
        color: { name: "Navy", hex: "#2b3550" },
        material: "Nylon",
        date: { bought: "2023-05-20" },
        price: { amount: 390, currency: "CNY" },
        channel: "Store",
        acquire: "bought",
        location: "By the door",
        usage: "often",
        condition: "marked",
      },
    ],
  },
];

export function sampleItem(id: string): Item | undefined {
  return sampleItems.find((item) => item.id === id);
}
