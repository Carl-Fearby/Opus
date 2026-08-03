import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Desktop Icon component page has no serious accessibility violations", async ({ page }) => {
  await page.goto("/documentation/components/desktop-icon");
  const results = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();

  const serious = results.violations.filter(
    (violation) => violation.impact === "critical" || violation.impact === "serious",
  );
  expect(serious).toEqual([]);
});
