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

export default function HomePage() {
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
          <p>Why Opus</p>
          <h2 id="why-opus-home-title">Built in the open, because useful work should last.</h2>
          <span>
            Opus is Carl Fearby’s way of sharing decades of interface work with the wider web
            community—free to use, open to critique, and made without a commercial agenda.
          </span>
          <Link href="/why-opus">Read why Opus exists <span aria-hidden="true">→</span></Link>
        </div>
      </section>
      <ContributorsCallout />
      <CtaBand />
    </>
  );
}
