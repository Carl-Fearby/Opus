import { expect, test, type Page } from "@playwright/test";
import { getAllSlugs } from "../../lib/controls/registry";

function failOnBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return () => expect(errors, errors.join("\n")).toEqual([]);
}

for (const slug of getAllSlugs()) {
  test(`${slug} loads its preview without browser errors`, async ({ page }) => {
    const assertNoErrors = failOnBrowserErrors(page);
    const response = await page.goto(`/documentation/components/${slug}`);

    expect(response?.ok()).toBe(true);
    await expect(page.getByText("Preview", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Add component code to preview it here.")).toHaveCount(0);
    assertNoErrors();
  });
}
