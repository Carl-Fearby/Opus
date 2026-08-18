import fs from "node:fs";
import path from "node:path";

const input = process.argv[2];
const output = process.argv[3];

if (!input || !output) {
  throw new Error("Usage: node scripts/extract-jsw-native-data.mjs <game.tzx> <output.ts>");
}

const tzx = fs.readFileSync(input);
let offset = 10;
let payload;

while (offset < tzx.length) {
  const blockId = tzx[offset++];
  if (blockId === 0x30) {
    offset += 1 + tzx[offset];
    continue;
  }
  if (blockId !== 0x10) throw new Error(`Unsupported TZX block 0x${blockId.toString(16)}`);
  const length = tzx.readUInt16LE(offset + 2);
  offset += 4;
  const block = tzx.subarray(offset, offset + length);
  offset += length;
  if (length === 32770 && block[0] === 0xff) payload = block.subarray(1, -1);
}

if (!payload || payload.length !== 32768) throw new Error("The expected 32K JSW payload was not found.");

// The tape loads at 0x8000. Keep only the original graphics/data region from
// 0x9D00 onward; the Z80 game program itself is deliberately not published.
const nativeData = payload.subarray(0x9d00 - 0x8000);
const encoded = nativeData.toString("base64");
const source = `// Generated from the licensed Jet Set Willy TZX. Do not edit by hand.\n` +
  `// Contains graphics and level data from 0x9D00-0xFFFF, not executable Z80 code.\n` +
  `export const JSW_DATA_BASE_ADDRESS = 0x9d00;\n` +
  `export const JSW_NATIVE_DATA_BASE64 = \"${encoded}\";\n`;

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, source);
console.log(`Wrote ${nativeData.length} bytes of native game data to ${output}`);
