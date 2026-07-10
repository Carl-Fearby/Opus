import { notFound } from "next/navigation";
import { CategorySubgroupOverview } from "@/components/development/overviews/CategorySubgroupOverview";
import { getNavigationGroupBySlug, getNavigationGroupsForCategory } from "@/lib/controls/registry";
import { navigationGroupToSlug } from "@/lib/controls/routes";

type ContentSubgroupPageProps = {
  params: Promise<{ group: string }>;
};

export function generateStaticParams() {
  return getNavigationGroupsForCategory("content").map((group) => ({
    group: navigationGroupToSlug(group),
  }));
}

export async function generateMetadata({ params }: ContentSubgroupPageProps) {
  const { group } = await params;
  const label = getNavigationGroupBySlug("content", group);

  if (!label) {
    return { title: "Section not found" };
  }

  return {
    title: `${label} | Content | Opus`,
    description: `${label} components in the Opus content catalog.`,
  };
}

export default async function ContentSubgroupPage({ params }: ContentSubgroupPageProps) {
  const { group } = await params;
  const label = getNavigationGroupBySlug("content", group);

  if (!label) {
    notFound();
  }

  return <CategorySubgroupOverview category="content" navigationGroup={label} />;
}
