import { ComponentCategories } from "@/components/marketing/ComponentCategories";
import { CtaBand } from "@/components/marketing/CtaBand";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { Hero } from "@/components/marketing/Hero";
import { PlaygroundSection } from "@/components/marketing/PlaygroundSection";
import { StatBand } from "@/components/marketing/StatBand";
import { WorkflowSection } from "@/components/marketing/WorkflowSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatBand />
      <FeatureGrid />
      <PlaygroundSection />
      <ComponentCategories />
      <WorkflowSection />
      <CtaBand />
    </>
  );
}
