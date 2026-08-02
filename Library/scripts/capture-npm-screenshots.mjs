import { mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const libraryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(libraryRoot, "packages/opus-react/assets/npm");
const baseUrl = process.env.OPUS_SCREENSHOT_BASE_URL ?? "https://project-opus.netlify.app";
const packageJson = JSON.parse(
  await readFile(resolve(libraryRoot, "packages/opus-react/package.json"), "utf8"),
);
const displayVersion = `opus-react v${packageJson.version}`;

const captures = [
  { name: "marketing", path: "/", width: 1440, height: 900 },
  { name: "components", path: "/documentation/components", width: 1440, height: 900 },
  { name: "playground", path: "/documentation/playground", width: 1440, height: 900 },
];

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  colorScheme: "dark",
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});

try {
  for (const capture of captures) {
    const page = await context.newPage();
    await page.setViewportSize({ width: capture.width, height: capture.height });
    await page.goto(new URL(capture.path, baseUrl).toString(), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate((version) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        if (node.textContent?.trim().startsWith("opus-react v")) {
          node.textContent = version;
        }
        node = walker.nextNode();
      }
    }, displayVersion);
    await page.screenshot({
      animations: "disabled",
      path: resolve(outputDirectory, `${capture.name}.png`),
    });
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(`Captured ${captures.length} NPM screenshots from ${baseUrl}`);
