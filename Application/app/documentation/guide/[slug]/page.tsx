import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MarkdownContent } from "@/components/documentation/DocumentationContent";
import { GuideShell } from "@/components/documentation/DocumentationContent";
import { getGuidePage, getGuidePages, getGuideSlugs } from "@/lib/documentation/content";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getGuidePage(slug);

  if (!page) {
    return { title: "Guide not found" };
  }

  return {
    title: `${page.title} | Opus documentation`,
    description: page.description ?? `A practical guide to ${page.title} in the Opus React component library.`,
    alternates: { canonical: `/documentation/guide/${slug}` },
  };
}

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const { slug } = await params;
  const page = getGuidePage(slug);

  if (!page) {
    notFound();
  }

  return (
    <GuideShell pages={getGuidePages()}>
      <MarkdownContent content={page.content} />
    </GuideShell>
  );
}
