import type { Locale } from "next-intl";

/**
 * Long-form legal copy lives here rather than in `messages/`, which is for
 * interface strings: these documents are paragraphs, they change on their own
 * schedule, and they need an effective date the UI does not.
 *
 * DRAFT. Written to describe honestly what this app actually does, and reviewed
 * by nobody qualified. A contact address and the governing law are deliberately
 * unstated — the documents say both will be published before the app opens
 * further, rather than carrying a placeholder that reads as real. Both languages
 * need a lawyer's eye first. See docs/architecture.md.
 */
export type LegalSection = {
  heading: string;
  /** Each entry is a paragraph. */
  body: string[];
};

export type LegalDocument = {
  title: string;
  /** ISO date, shown as "last updated". */
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export type LegalContent = Record<Locale, LegalDocument>;
