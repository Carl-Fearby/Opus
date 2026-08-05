import { ComponentCategories } from "@/components/marketing/ComponentCategories";
import { CtaBand } from "@/components/marketing/CtaBand";
import { ContributorsCallout } from "@/components/marketing/ContributorsCallout";
import { DesktopShowcase } from "@/components/marketing/DesktopShowcase";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { Hero } from "@/components/marketing/Hero";
import { PlaygroundSection } from "@/components/marketing/PlaygroundSection";
import { RealWorldShowcase } from "@/components/marketing/RealWorldShowcase";
import { StatBand } from "@/components/marketing/StatBand";
import { WorkflowSection } from "@/components/marketing/WorkflowSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatBand />
      <FeatureGrid />
      <DesktopShowcase />
      <PlaygroundSection />
      <RealWorldShowcase />
      <ComponentCategories />
      <WorkflowSection />
      <ContributorsCallout />
      <CtaBand />
    </>
  );
}
