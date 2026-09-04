import type { Metadata } from "next";
import { DocumentationHub } from "@/components/documentation/DocumentationContent";
import { getAllSlugs } from "@/lib/controls/registry";

export const metadata: Metadata = {
  title: "React component documentation and catalogue",
  description:
    "Browse Opus React components, test live settings, inspect generated usage code, and find accessible UI building blocks for business applications.",
  alternates: { canonical: "/documentation" },
};

export default function DocumentationPage() {
  return <DocumentationHub catalogueCount={getAllSlugs().length} />;
}
