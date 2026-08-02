import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/app-shell/AppShell";
import { TopBar } from "@/components/app-shell/TopBar";
import { ItemCard } from "@/components/items/ItemCard";
import { Reveal } from "@/components/Reveal";
import { routing } from "@/i18n/routing";
import { sampleItems } from "@/lib/items/fixtures";

/**
 * The library grid — everything owned, two per row.
 *
 * Reading the sample set for now. The grid, the card and the summary rules are
 * real; only where the items come from is not, and that is the part the data
 * model replaces without touching this file.
 */
export default async function LibraryPage({
  params,
}: PageProps<"/[locale]/library">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations("library");
  const items = sampleItems;

  return (
    <AppShell header={<TopBar title={t("title")} />}>
      {items.length === 0 ? (
        // An empty screen ends in a button, not a shrug — see docs/design.md §11.
        <div className="flex flex-col items-start gap-3 pt-10">
          <p className="text-sm text-muted">{t("emptyBody")}</p>
        </div>
      ) : (
        <Reveal>
          <p className="pt-2 pb-3 text-xs text-muted">
            {t("count", { count: items.length })}
          </p>

          <ul className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <li key={item.id} className="min-w-0">
                <ItemCard item={item} />
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </AppShell>
  );
}
