import { ComponentCategories } from "@/components/ComponentCategories";
import { CtaBand } from "@/components/CtaBand";
import { FeatureGrid } from "@/components/FeatureGrid";
import { Hero } from "@/components/Hero";
import { StatBand } from "@/components/StatBand";
import { WorkflowSection } from "@/components/WorkflowSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatBand />
      <FeatureGrid />
      <ComponentCategories />
      <WorkflowSection />
      <CtaBand />
    </>
  );
}
