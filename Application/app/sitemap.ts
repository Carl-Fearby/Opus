import type { MetadataRoute } from "next";
import { newsStories } from "./(marketing)/news/stories";
import { componentCategories, getAllSlugs } from "@/lib/controls/registry";
import { categoryPath, componentPath } from "@/lib/controls/routes";
import { getGuideSlugs } from "@/lib/documentation/content";

const siteUrl = "https://project-opus.netlify.app";

function entry(
  pathname: string,
  priority: number,
  lastModified?: Date,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteUrl}${pathname}`,
    changeFrequency: "weekly",
    priority,
    lastModified,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const corePages = [
    entry("/", 1),
    entry("/documentation", 0.9),
    entry("/documentation/components", 0.9),
    entry("/documentation/guide", 0.7),
    entry("/documentation/playground", 0.8),
    entry("/documentation/security", 0.6),
    entry("/documentation/version", 0.5),
    entry("/news", 0.8),
    entry("/version", 0.6),
    entry("/license", 0.4),
    entry("/code-of-conduct", 0.3),
  ];

  const categoryPages = componentCategories.map((category) => entry(categoryPath(category.id), 0.8));
  const componentPages = getAllSlugs().map((slug) => entry(componentPath(slug), 0.7));
  const guidePages = getGuideSlugs().map((slug) => entry(`/documentation/guide/${slug}`, 0.6));
  const newsPages = newsStories.map((story) =>
    entry(`/news/${story.slug}`, 0.7, new Date(`${story.date}T00:00:00.000Z`)),
  );

  return [...corePages, ...categoryPages, ...componentPages, ...guidePages, ...newsPages];
}
