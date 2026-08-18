import { readFileSync, writeFileSync } from "node:fs";

const input = process.argv[2];
const output = process.argv[3];
if (!input || !output) throw new Error("Usage: node scripts/extract-jsw-title-screen.mjs <title.png> <output.ts>");
const image = readFileSync(input);
writeFileSync(output, `// Archived original ZX Spectrum title frame, bundled as component data.\nexport const JSW_TITLE_SCREEN_DATA_URL = "data:image/png;base64,${image.toString("base64")}";\n`);
