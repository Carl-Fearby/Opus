import type { Metadata } from "next";
import { ComponentCategories } from "@/components/marketing/ComponentCategories";
import { CtaBand } from "@/components/marketing/CtaBand";
import { ContributorsCallout } from "@/components/marketing/ContributorsCallout";
import { DesktopShowcase } from "@/components/marketing/DesktopShowcase";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { Hero } from "@/components/marketing/Hero";
import { PlaygroundSection } from "@/components/marketing/PlaygroundSection";
import { ProductDepth } from "@/components/marketing/ProductDepth";
import { RealWorldShowcase } from "@/components/marketing/RealWorldShowcase";
import { SeoFAQ } from "@/components/marketing/SeoFAQ";
import { StatBand } from "@/components/marketing/StatBand";
import { ThemeShowcase } from "@/components/marketing/ThemeShowcase";
import { WorkflowSection } from "@/components/marketing/WorkflowSection";
import { getAllSlugs } from "@/lib/controls/registry";
import { translate } from "@/lib/i18n";
import { readServerLocale } from "@/lib/i18n/server";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free, open-source React component library",
  description:
    "Build accessible internal tools, CRM, operations, and admin products with free, open-source React components, visual theming, live documentation, and an interactive playground.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Opus — Free, open-source React component library",
    description:
      "Themeable, accessible React components for internal tools, CRM, operations, and business applications.",
    url: "/",
  },
};

export default async function HomePage() {
  const locale = await readServerLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const catalogueCount = getAllSlugs().length;

  return (
    <>
      <Hero />
      <StatBand />
      <RealWorldShowcase />
      <FeatureGrid />
      <ThemeShowcase componentCount={catalogueCount} />
      <ProductDepth />
      <DesktopShowcase />
      <PlaygroundSection />
      <ComponentCategories />
      <SeoFAQ />
      <WorkflowSection />
      <section className="marketingWhyOpus" aria-labelledby="why-opus-home-title">
        <div>
          <p>{t("marketing.whyOpus.eyebrow")}</p>
          <h2 id="why-opus-home-title">{t("marketing.whyOpus.title")}</h2>
          <span>{t("marketing.whyOpus.body")}</span>
          <Link href="/why-opus">
            {t("marketing.whyOpus.link")} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      <ContributorsCallout />
      <CtaBand />
    </>
  );
}
