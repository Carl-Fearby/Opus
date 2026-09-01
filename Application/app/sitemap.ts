import type { MetadataRoute } from "next";
import { componentCategories, getAllSlugs } from "@/lib/controls/registry";
import { categoryPath, componentPath } from "@/lib/controls/routes";

const siteUrl = "https://project-opus.netlify.app";

function entry(pathname: string, priority: number): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteUrl}${pathname}`,
    changeFrequency: "weekly",
    priority,
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
    entry("/license", 0.4),
    entry("/code-of-conduct", 0.3),
  ];

  const categoryPages = componentCategories.map((category) => entry(categoryPath(category.id), 0.8));
  const componentPages = getAllSlugs().map((slug) => entry(componentPath(slug), 0.7));

  return [...corePages, ...categoryPages, ...componentPages];
}
