import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";

const baseUrl = process.env.OPUS_A11Y_BASE_URL ?? "http://127.0.0.1:3000";
let devServer;

async function serverReady() {
  try {
    return (await fetch(`${baseUrl}/documentation/components`)).ok;
  } catch {
    return false;
  }
}

async function ensureServer() {
  if (await serverReady()) return;
  devServer = spawn("npm", ["run", "dev"], { stdio: "ignore" });
  for (let attempt = 0; attempt < 120; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    if (await serverReady()) return;
  }
  throw new Error(`Opus did not become available at ${baseUrl}`);
}

await ensureServer();
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext();

try {
  const discoveryPage = await context.newPage();
  await discoveryPage.goto(`${baseUrl}/documentation/components`, { waitUntil: "domcontentloaded" });
  const routes = await discoveryPage.locator('a[href^="/documentation/components/"]').evaluateAll((links) =>
    [...new Set(links.map((link) => link.pathname))]
      .filter((path) => !path.includes("/raw/"))
      .sort(),
  );
  await discoveryPage.close();

  const queue = ["/documentation/components", ...routes];
  const failures = [];
  let cursor = 0;

  async function auditWorker() {
    const page = await context.newPage();
    try {
      while (cursor < queue.length) {
        const route = queue[cursor];
        cursor += 1;
        await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
        await page.locator("#main-content").waitFor({ state: "visible" });
        const loading = page.getByText("Loading preview…", { exact: true });
        if (await loading.isVisible().catch(() => false)) {
          await loading.waitFor({ state: "detached", timeout: 10_000 }).catch(() => {});
        }
        const results = await new AxeBuilder({ page }).analyze();
        if (results.violations.length) {
          failures.push({
            route,
            violations: results.violations.map(({ help, id, impact, nodes }) => ({
              help,
              id,
              impact,
              nodes: nodes.slice(0, 6).map((node) => node.target.join(" ")),
            })),
          });
        }
      }
    } finally {
      await page.close();
    }
  }

  await Promise.all(Array.from({ length: 4 }, () => auditWorker()));
  if (failures.length) {
    console.error(JSON.stringify(failures, null, 2));
    process.exitCode = 1;
  } else {
    console.log(`Accessibility audit passed for ${queue.length} component catalogue routes.`);
  }
} finally {
  await context.close();
  await browser.close();
  devServer?.kill("SIGTERM");
}
