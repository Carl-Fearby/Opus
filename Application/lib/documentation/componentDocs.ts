import fs from "node:fs";
import path from "node:path";
import type { ControlSlug } from "@/lib/controls/types";
import { getDefaultSettings } from "@/lib/controls/defaults";
import { getComponentDocumentationMarkdown } from "@/lib/controls/componentDocumentation";

const COMPONENTS_CONTENT_DIR = path.join(process.cwd(), "documentation/content/components");

function filePathForSlug(slug: ControlSlug) {
  return path.join(COMPONENTS_CONTENT_DIR, `${slug}.md`);
}

function labelFor(key: string) {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (character) => character.toUpperCase());
}

function typeFor(value: unknown) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function defaultFor(value: unknown) {
  if (typeof value === "string") return value ? `\`${value.length > 42 ? `${value.slice(0, 39)}…` : value}\`` : "—";
  if (typeof value === "boolean" || typeof value === "number") return `\`${String(value)}\``;
  return "—";
}

function withPropsTable(slug: ControlSlug, content: string) {
  if (/^## Props$/m.test(content)) return content;

  const defaults = getDefaultSettings(slug) as Record<string, unknown>;
  const entries = Object.entries(defaults);
  if (!entries.length) {
    return `${content}\n\n## Props\n\n| Prop | Type | Default | Description |\n| --- | --- | --- | --- |\n| \`…props\` | component API | — | This composition has no page-level settings. Use the generated Usage example as the authoritative prop contract. |`;
  }

  const rows = entries.map(([key, value]) =>
    `| \`${key}\` | \`${typeFor(value)}\` | ${defaultFor(value)} | Configures ${labelFor(key).toLowerCase()}. |`,
  );
  return `${content}\n\n## Props\n\n| Prop | Type | Default | Description |\n| --- | --- | --- | --- |\n${rows.join("\n")}`;
}

export function getComponentDocumentation(slug: ControlSlug) {
  const generated = getComponentDocumentationMarkdown(slug);
  const filePath = filePathForSlug(slug);

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");
    return {
      slug,
      content: withPropsTable(slug, content.trim()),
      source: "file" as const,
    };
  }

  if (generated) {
    return {
      slug,
      content: withPropsTable(slug, generated),
      source: "generated" as const,
    };
  }

  return null;
}
