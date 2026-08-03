import { transform } from "@babel/standalone";
import { defaultSettings } from "../lib/controls/defaults";
import { generateUsageCode } from "../lib/controls/generateUsageCode";
import type { ControlSettings, ControlSlug } from "../lib/controls/types";

const failures: string[] = [];
const nonRoutableSettingsTemplates = new Set([
  "dashboard-list-columns",
  "notes-activity",
]);
const slugs = (Object.keys(defaultSettings) as ControlSlug[]).filter(
  (slug) => !nonRoutableSettingsTemplates.has(slug),
);

for (const slug of slugs) {
  try {
    const source = generateUsageCode(
      slug,
      defaultSettings[slug] as ControlSettings,
    ).full.trim();

    if (!source) {
      failures.push(`${slug}: generated empty usage source`);
      continue;
    }

    if (!/export\s+default\s+function\s+Example/.test(source)) {
      failures.push(`${slug}: usage source has no default Example component`);
      continue;
    }

    transform(source, {
      filename: `${slug}.tsx`,
      presets: [
        ["typescript", { allExtensions: true, isTSX: true }],
        ["react", { runtime: "classic" }],
      ],
      plugins: [["transform-modules-commonjs", { allowTopLevelThis: true }]],
    });
  } catch (error) {
    failures.push(
      `${slug}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

if (failures.length) {
  console.error(`Usage-code audit failed for ${failures.length} component(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `Usage-code audit passed for ${slugs.length} component configurations.`,
  );
}
