import { MarkdownContent } from "@/components/documentation/DocumentationContent";
import { GuideShell } from "@/components/documentation/DocumentationContent";
import { getGuidePage, getGuidePages } from "@/lib/documentation/content";

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
