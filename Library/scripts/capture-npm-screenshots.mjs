import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const libraryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(libraryRoot, "packages/opus-react/assets/npm");
const marketingOutputDirectory = resolve(libraryRoot, "../Application/public/marketing");
const baseUrl = process.env.OPUS_SCREENSHOT_BASE_URL ?? "https://project-opus.netlify.app";
const packageJson = JSON.parse(
  await readFile(resolve(libraryRoot, "packages/opus-react/package.json"), "utf8"),
);
const displayVersion = `opus-react v${packageJson.version}`;

const captures = [
  { name: "marketing", path: "/", width: 1440, height: 900 },
  { name: "components", path: "/documentation/components", width: 1440, height: 900 },
  { name: "playground", path: "/documentation/playground", width: 1440, height: 900 },
  {
    name: "desktop",
    path: "/documentation/components/raw/lab-desktop-environment",
    width: 1440,
    height: 960,
    clipTop: 60,
  },
];

await mkdir(outputDirectory, { recursive: true });
await mkdir(marketingOutputDirectory, { recursive: true });

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
      clip: capture.clipTop
        ? {
            x: 0,
            y: capture.clipTop,
            width: capture.width,
            height: capture.height - capture.clipTop,
          }
        : undefined,
      path: resolve(outputDirectory, `${capture.name}.png`),
    });
    await page.close();
  }
} finally {
  await browser.close();
}

await copyFile(
  resolve(outputDirectory, "desktop.png"),
  resolve(marketingOutputDirectory, "desktop.png"),
);

console.log(`Captured ${captures.length} NPM screenshots from ${baseUrl}`);
