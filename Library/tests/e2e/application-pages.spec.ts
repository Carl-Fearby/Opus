import { expect, test, type Page } from "@playwright/test";
import { getAllSlugs, getControlSectionsByCategory } from "../../lib/controls/registry";
import type { ComponentCategory } from "../../lib/controls/types";
import { getGuideSlugs } from "../../lib/documentation/content";

const CATEGORIES: ComponentCategory[] = [
  "content",
  "dashboard",
  "forms",
  "graphs",
  "labs",
  "overlays",
  "system",
];

function routeSlug(label: string) {
  return label
    .toLowerCase()
    .replace(/\//g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const catalogueRoutes = CATEGORIES.flatMap((category) => {
  const baseRoute = `/documentation/components/${category}`;
  const groupRoutes = getControlSectionsByCategory(category).flatMap((section) =>
    section.label ? [`${baseRoute}/${routeSlug(section.label)}`] : [],
  );

  return [baseRoute, ...groupRoutes];
});

const applicationRoutes = [
  "/",
  "/documentation",
  "/documentation/guide",
  ...getGuideSlugs().map((slug) => `/documentation/guide/${slug}`),
  "/documentation/components",
  "/documentation/components/relationships",
  ...catalogueRoutes,
  "/documentation/security",
  "/documentation/version",
];

function collectBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return () => expect(errors, errors.join("\n")).toEqual([]);
}

for (const route of applicationRoutes) {
  test(`${route} loads without browser errors`, async ({ page }) => {
    const assertNoErrors = collectBrowserErrors(page);
    const response = await page.goto(route);

    expect(response?.ok(), `${route} returned ${response?.status()}`).toBe(true);
    await expect(page.locator("body")).not.toBeEmpty();
    assertNoErrors();
  });
}

for (const slug of getAllSlugs()) {
  test(`raw preview route for ${slug} is generated`, async ({ request }) => {
    const response = await request.get(`/documentation/components/raw/${slug}`);

    expect(response.ok(), `${slug} raw preview returned ${response.status()}`).toBe(true);
    expect(await response.text()).not.toContain("Control not found");
  });
}

test("playground loads seeded component usage", async ({ page }) => {
  const assertNoErrors = collectBrowserErrors(page);
  const response = await page.goto("/documentation/playground?slug=button");

  expect(response?.ok()).toBe(true);
  await expect(page.getByText("Live render of your edited component.")).toBeVisible();
  await expect(page.getByText("Add component code to preview it here.")).toHaveCount(0);
  assertNoErrors();
});

test("security disclosure is linked from the documentation navigation", async ({ page }) => {
  const assertNoErrors = collectBrowserErrors(page);
  await page.goto("/documentation");

  await page.getByRole("link", { name: "Security", exact: true }).click();

  await expect(page).toHaveURL(/\/documentation\/security$/);
  await expect(page.getByRole("heading", { name: "Security", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Current repository snapshot" })).toBeVisible();
  assertNoErrors();
});

test("external playground route renders its empty-state safely", async ({ page }) => {
  const assertNoErrors = collectBrowserErrors(page);
  const response = await page.goto("/documentation/playground/external?theme=light");

  expect(response?.ok()).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("data-preview-theme", "light");
  await expect(page.getByText("Preview unavailable")).toBeVisible();
  assertNoErrors();
});
