import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { locales } from "../lib/i18n";
import { componentMessages } from "../lib/i18n/componentMessages";
import { componentUiMessages } from "../lib/i18n/componentUiMessages";

const outDir = join(process.cwd(), "public", "i18n");
mkdirSync(outDir, { recursive: true });

for (const { id } of locales) {
  const component = {
    ...(componentMessages[id] ?? {}),
    ...(componentUiMessages[id] ?? {}),
  };
  const resources = { component };
  writeFileSync(join(outDir, `${id}.json`), JSON.stringify(resources));
  console.log(`${id}: ${Object.keys(component).length} component`);
}
