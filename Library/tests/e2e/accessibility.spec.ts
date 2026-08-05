import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getAllSlugs } from "../../lib/controls/registry";

const auditedImpacts = new Set(["critical", "serious"]);

for (const slug of getAllSlugs()) {
  test(`${slug} preview has no serious accessibility violations`, async ({ page }) => {
    const response = await page.goto(`/documentation/components/${slug}`);

    expect(response?.ok()).toBe(true);

    // Under parallel load Next can briefly keep two streaming trees (id="S:0").
    // Wait until a single catalogue preview root remains, then audit that root.
    const preview = page.locator("#main-content [data-preview-root]");
    await expect(preview).toHaveCount(1);
    await expect(preview).toBeVisible();
    await expect(page.getByTestId("usage-preview")).toHaveAttribute("data-hydrated", "true");

    const results = await new AxeBuilder({ page })
      .include("#main-content [data-preview-root]")
      .analyze();

    const serious = results.violations.filter((violation) =>
      violation.impact ? auditedImpacts.has(violation.impact) : false,
    );

    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
}
