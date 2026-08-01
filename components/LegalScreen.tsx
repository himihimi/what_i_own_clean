import { ArrowLeft } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";

import { Reveal } from "@/components/Reveal";
import type { LegalDocument } from "@/content/legal/types";
import { Link } from "@/i18n/navigation";

/**
 * Long-form reading layout for the privacy policy and terms.
 *
 * Deliberately plainer than the auth screens: no gradient, `bg` rather than the
 * tinted backdrop, and a slightly wider column. These are pages to read, and
 * measure matters more than atmosphere.
 */
export async function LegalScreen({ document }: { document: LegalDocument }) {
  const t = await getTranslations("legal");
  const format = await getFormatter();

  return (
    <main className="min-h-svh px-6 py-10">
      <div className="mx-auto w-full max-w-[640px]">
        <Reveal>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted underline-offset-4 hover:underline"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {t("back")}
          </Link>

          <h1 className="mt-6 text-[26px] font-extrabold tracking-tight text-text">
            {document.title}
          </h1>
          <p className="mt-2 text-xs text-muted-2">
            {t("updated", {
              date: format.dateTime(new Date(document.updated), {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            })}
          </p>
          <p className="mt-5 text-[15px] leading-relaxed text-muted">
            {document.intro}
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          {document.sections.map((section) => (
            <section key={section.heading} className="mt-8">
              <h2 className="text-base font-bold text-text">
                {section.heading}
              </h2>
              {section.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-2.5 text-[15px] leading-relaxed text-muted"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </Reveal>
      </div>
    </main>
  );
}
