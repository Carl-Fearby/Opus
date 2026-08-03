import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const suppressNextBaselineWarning = `--require=${path.resolve(
  "scripts/suppress-next-baseline-warning.cjs",
)}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  workers: 5,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command:
      "OPUS_NEXT_DIST_DIR=.next-e2e npm run build && OPUS_NEXT_DIST_DIR=.next-e2e npm run start -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/documentation/components",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      BROWSERSLIST_IGNORE_OLD_DATA: "true",
      BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA: "true",
      NODE_OPTIONS: [process.env.NODE_OPTIONS, suppressNextBaselineWarning]
        .filter(Boolean)
        .join(" "),
    },
  },
});
