import { notFound } from "next/navigation";
import { CategorySubgroupOverview } from "@/components/development/overviews/CategorySubgroupOverview";
import { getNavigationGroupBySlug, getNavigationGroupsForCategory } from "@/lib/controls/registry";
import { navigationGroupToSlug } from "@/lib/controls/routes";

type LabsSubgroupPageProps = {
  params: Promise<{ group: string }>;
};

export function generateStaticParams() {
  return getNavigationGroupsForCategory("labs").map((group) => ({
    group: navigationGroupToSlug(group),
  }));
}

export async function generateMetadata({ params }: LabsSubgroupPageProps) {
  const { group } = await params;
  const label = getNavigationGroupBySlug("labs", group);

  if (!label) return { title: "Section not found" };

  return {
    title: `${label} | Labs | Opus`,
    description: `${label} compositions in the Opus Labs catalog.`,
  };
}

export default async function LabsSubgroupPage({ params }: LabsSubgroupPageProps) {
  const { group } = await params;
  const label = getNavigationGroupBySlug("labs", group);

  if (!label) notFound();

  return <CategorySubgroupOverview category="labs" navigationGroup={label} />;
}
