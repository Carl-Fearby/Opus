import { notFound } from "next/navigation";
import { CategorySubgroupOverview } from "@/components/development/overviews/CategorySubgroupOverview";
import { getNavigationGroupBySlug, getNavigationGroupsForCategory } from "@/lib/controls/registry";
import { navigationGroupToSlug } from "@/lib/controls/routes";

type GraphsSubgroupPageProps = {
  params: Promise<{ group: string }>;
};

export function generateStaticParams() {
  return getNavigationGroupsForCategory("graphs").map((group) => ({
    group: navigationGroupToSlug(group),
  }));
}

export async function generateMetadata({ params }: GraphsSubgroupPageProps) {
  const { group } = await params;
  const label = getNavigationGroupBySlug("graphs", group);

  if (!label) {
    return { title: "Section not found" };
  }

  return {
    title: `${label} | Graphs | Opus`,
    description: `${label} charts in the Opus graphs catalog.`,
  };
}

export default async function GraphsSubgroupPage({ params }: GraphsSubgroupPageProps) {
  const { group } = await params;
  const label = getNavigationGroupBySlug("graphs", group);

  if (!label) {
    notFound();
  }

  return <CategorySubgroupOverview category="graphs" navigationGroup={label} />;
}
