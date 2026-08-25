import { notFound } from "next/navigation";
import { CategorySubgroupOverview } from "@/components/development/overviews/CategorySubgroupOverview";
import { getNavigationGroupBySlug, getNavigationGroupsForCategory } from "@/lib/controls/registry";
import { navigationGroupToSlug } from "@/lib/controls/routes";

type GamesSubgroupPageProps = {
  params: Promise<{ group: string }>;
};

export function generateStaticParams() {
  return getNavigationGroupsForCategory("games").map((group) => ({
    group: navigationGroupToSlug(group),
  }));
}

export async function generateMetadata({ params }: GamesSubgroupPageProps) {
  const { group } = await params;
  const label = getNavigationGroupBySlug("games", group);

  if (!label) return { title: "Section not found" };

  return {
    title: `${label} | Games | Opus`,
    description: `${label} components in the Opus games catalog.`,
  };
}

export default async function GamesSubgroupPage({ params }: GamesSubgroupPageProps) {
  const { group } = await params;
  const label = getNavigationGroupBySlug("games", group);

  if (!label) notFound();

  return <CategorySubgroupOverview category="games" navigationGroup={label} />;
}
