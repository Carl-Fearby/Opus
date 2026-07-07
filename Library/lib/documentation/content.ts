import fs from "node:fs";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "documentation/content");

export type GuidePage = {
  slug: string;
  title: string;
  description?: string;
};

function filePathForSlug(slug: string) {
  return slug === "index" ? path.join(CONTENT_DIR, "README.md") : path.join(CONTENT_DIR, `${slug}.md`);
}

function titleFromMarkdown(content: string, fallback: string) {
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? fallback;
}

export function getGuidePages(): GuidePage[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((file) => file.endsWith(".md"));

  return files
    .map((file) => {
      const slug = file === "README.md" ? "index" : file.replace(/\.md$/, "");
      const content = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
      const fallbackTitle = slug === "index" ? "Documentation" : slug.replace(/-/g, " ");

      return {
        slug,
        title: titleFromMarkdown(content, fallbackTitle),
        description: content.match(/^[^\n#].+/m)?.[0]?.trim(),
      };
    })
    .sort((a, b) => {
      if (a.slug === "index") {
        return -1;
      }
      if (b.slug === "index") {
        return 1;
      }
      return a.title.localeCompare(b.title);
    });
}

export function getGuideSlugs() {
  return getGuidePages()
    .map((page) => page.slug)
    .filter((slug) => slug !== "index");
}

export function getGuidePage(slug: string) {
  const filePath = filePathForSlug(slug);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const fallbackTitle = slug === "index" ? "Documentation" : slug.replace(/-/g, " ");

  return {
    slug,
    title: titleFromMarkdown(content, fallbackTitle),
    content,
  };
}
