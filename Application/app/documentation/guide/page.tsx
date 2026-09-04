import type { Metadata } from "next";
import { MarkdownContent } from "@/components/documentation/DocumentationContent";
import { GuideShell } from "@/components/documentation/DocumentationContent";
import { getGuidePage, getGuidePages } from "@/lib/documentation/content";

export const metadata: Metadata = {
  title: "Guides for using Opus with React",
  description:
    "Practical guides for installing, theming, and using the free Opus React component library in your application.",
  alternates: { canonical: "/documentation/guide" },
};

export default function GuideIndexPage() {
  const pages = getGuidePages();
  const page = getGuidePage("index");

  if (!page) {
    return null;
  }

  return (
    <GuideShell pages={pages}>
      <MarkdownContent content={page.content} />
    </GuideShell>
  );
}
