import fs from "node:fs";
import path from "node:path";
import type { ControlSlug } from "@/lib/controls/types";
import { getComponentDocumentationMarkdown } from "@/lib/controls/componentDocumentation";

const COMPONENTS_CONTENT_DIR = path.join(process.cwd(), "documentation/content/components");

function filePathForSlug(slug: ControlSlug) {
  return path.join(COMPONENTS_CONTENT_DIR, `${slug}.md`);
}

export function getComponentDocumentation(slug: ControlSlug) {
  const generated = getComponentDocumentationMarkdown(slug);
  const filePath = filePathForSlug(slug);

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");
    return {
      slug,
      content: content.trim(),
      source: "file" as const,
    };
  }

  if (generated) {
    return {
      slug,
      content: generated,
      source: "generated" as const,
    };
  }

  return null;
}
