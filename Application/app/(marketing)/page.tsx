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

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatBand />
      <RealWorldShowcase />
      <FeatureGrid />
      <ThemeShowcase />
      <ProductDepth />
      <DesktopShowcase />
      <PlaygroundSection />
      <ComponentCategories />
      <SeoFAQ />
      <WorkflowSection />
      <ContributorsCallout />
      <CtaBand />
    </>
  );
}
