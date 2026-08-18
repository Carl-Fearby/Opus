import { readFileSync, writeFileSync } from "node:fs";

const input = process.argv[2];
const output = process.argv[3];
if (!input || !output) throw new Error("Usage: node scripts/extract-jsw-loading-screen.mjs <screen.scr> <output.ts>");
const screen = readFileSync(input);
if (screen.length !== 6912) throw new Error(`Expected a 6912-byte Spectrum screen, received ${screen.length}`);
writeFileSync(output, `// Original ZX Spectrum loading-screen dump bundled for native rendering.\nexport const JSW_LOADING_SCREEN_BASE64 = "${screen.toString("base64")}";\n`);
