import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getAllSlugs } from "../../lib/controls/registry";

const auditedImpacts = new Set(["critical", "serious"]);

for (const slug of getAllSlugs()) {
  test(`${slug} preview has no serious accessibility violations`, async ({ page }) => {
    // A gallery mounts five independent WebGL viewers. Under the five-worker
    // CI run, their initial browser work can exceed the default per-test
    // budget even though the accessible trigger markup is ready shortly
    // afterwards.
    if (slug === "model-gallery") {
      test.setTimeout(180_000);
    }

    const response = await page.goto(`/documentation/components/${slug}`);

    expect(response?.ok()).toBe(true);

    // Under parallel load Next can briefly keep two streaming trees (id="S:0").
    // Wait until a single catalogue preview root remains, then audit that root.
    const preview = page.locator("#main-content [data-preview-root]");
    await expect(preview).toHaveCount(1);
    await expect(preview).toBeVisible();
    // The usage section also mounts a compiled preview further down the page.
    // Scope hydration to the catalogue preview we are about to audit so React
    // streaming cannot make this assertion ambiguous under parallel load.
    await expect(preview.getByTestId("usage-preview")).toHaveAttribute("data-hydrated", "true");

    // A gallery combines five independent WebGL viewers. The standalone
    // ModelViewer and ModelThumbnail checks already audit the viewer markup;
    // auditing every renderer again causes axe to stall on constrained CI
    // workers. Audit the gallery's distinct, user-facing contract instead.
    if (slug === "model-gallery") {
      const triggers = preview.locator("button[aria-label^='Open ']");
      await expect(triggers).toHaveCount(5);
      await expect(triggers.first()).toHaveAccessibleName("Open Opus mark");

      const results = await new AxeBuilder({ page })
        .include("#main-content [data-preview-root] button[aria-label^='Open ']")
        .analyze();
      const serious = results.violations.filter((violation) =>
        violation.impact ? auditedImpacts.has(violation.impact) : false,
      );
      expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
      return;
    }

    const results = await new AxeBuilder({ page })
      .include("#main-content [data-preview-root]")
      .analyze();

    const serious = results.violations.filter((violation) =>
      violation.impact ? auditedImpacts.has(violation.impact) : false,
    );

    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
}
