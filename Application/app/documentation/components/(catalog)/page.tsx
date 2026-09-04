import type { Metadata } from "next";
import { ComponentsHubOverview } from "@/components/development/overviews/ComponentsHubOverview";

export const metadata: Metadata = {
  title: "React component catalogue",
  description:
    "Explore the free Opus React component catalogue: forms, data display, dashboards, navigation, overlays, and application patterns with live examples.",
  alternates: { canonical: "/documentation/components" },
};

export default function ComponentsOverviewPage() {
  return <ComponentsHubOverview />;
}
