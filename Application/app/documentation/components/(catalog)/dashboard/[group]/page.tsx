import { notFound } from "next/navigation";
import { CategorySubgroupOverview } from "@/components/development/overviews/CategorySubgroupOverview";
import { getNavigationGroupBySlug, getNavigationGroupsForCategory } from "@/lib/controls/registry";
import { navigationGroupToSlug } from "@/lib/controls/routes";

type DashboardSubgroupPageProps = {
  params: Promise<{ group: string }>;
};

export function generateStaticParams() {
  return getNavigationGroupsForCategory("dashboard").map((group) => ({
    group: navigationGroupToSlug(group),
  }));
}

export async function generateMetadata({ params }: DashboardSubgroupPageProps) {
  const { group } = await params;
  const label = getNavigationGroupBySlug("dashboard", group);

  if (!label) {
    return { title: "Section not found" };
  }

  return {
    title: `${label} | Dashboard | Opus`,
    description: `${label} components in the Opus dashboard catalog.`,
  };
}

export default async function DashboardSubgroupPage({ params }: DashboardSubgroupPageProps) {
  const { group } = await params;
  const label = getNavigationGroupBySlug("dashboard", group);

  if (!label) {
    notFound();
  }

  return <CategorySubgroupOverview category="dashboard" navigationGroup={label} />;
}
