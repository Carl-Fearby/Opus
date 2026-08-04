import { expect, test, type Locator, type Page } from "@playwright/test";
import { getAllSlugs } from "../../lib/controls/registry";

const ACTIONABLE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[role='button']:not([aria-disabled='true']):not(model-viewer)",
].join(",");

const PRESENTATIONAL_SLUGS = new Set([
  "focus-trap",
  "hidden-input",
  "model-viewer",
  "portal",
  "portal-host",
]);

const DRAG_SLUGS = new Set([
  "resize-handle",
  "resizable-panel",
  "splitter",
  "three-pane-layout",
]);

function collectBrowserErrors(page: Page) {
  const errors: string[] = [];
  const logs: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
    else logs.push(message.text());
  });
  return {
    assertNoErrors: () => expect(errors, errors.join("\n")).toEqual([]),
    logs,
  };
}

async function exercise(action: Locator, slug: string) {
  if (slug === "tooltip") {
    await action.hover();
    return;
  }

  const tagName = await action.evaluate((element) => element.tagName.toLowerCase());
  const inputType = (await action.getAttribute("type"))?.toLowerCase();

  if (DRAG_SLUGS.has(slug)) {
    const box = await action.boundingBox();
    if (box) {
      const page = action.page();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 32, box.y + box.height / 2, { steps: 4 });
      await page.mouse.up();
    }
    return;
  }

  if (tagName === "select") {
    const options = action.locator("option:not([disabled])");
    const count = await options.count();
    if (count > 1) {
      const currentValue = await action.inputValue();
      for (let index = 0; index < count; index += 1) {
        const value = await options.nth(index).evaluate((option: HTMLOptionElement) => option.value);
        if (value !== currentValue) {
          await action.selectOption(value);
          return;
        }
      }
      return;
    }
  }

  if (tagName === "input" && inputType === "file") {
    await action.setInputFiles({
      name: "opus-e2e.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Opus component interaction"),
    });
    return;
  }

  if (tagName === "input" && inputType === "range") {
    await action.evaluate((element: HTMLInputElement) => {
      const nextValue = String(Math.min(Number(element.max || 100), Number(element.value) + Number(element.step || 1)));
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      setter?.call(element, nextValue);
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    });
    return;
  }

  if (tagName === "textarea" || (tagName === "input" && !["button", "checkbox", "radio", "reset", "submit"].includes(inputType ?? ""))) {
    const currentValue = await action.inputValue();
    const values: Record<string, string> = {
      color: "#7c3aed",
      date: currentValue === "2026-07-31" ? "2026-08-01" : "2026-07-31",
      "datetime-local": currentValue === "2026-07-31T12:30" ? "2026-08-01T13:45" : "2026-07-31T12:30",
      email: currentValue === "opus-e2e@example.com" ? "opus-e2e-2@example.com" : "opus-e2e@example.com",
      month: currentValue === "2026-07" ? "2026-08" : "2026-07",
      number: currentValue === "42" ? "43" : "42",
      password: currentValue === "Opus-Test-123!" ? "Opus-Test-456!" : "Opus-Test-123!",
      time: currentValue === "12:30" ? "13:45" : "12:30",
      url: currentValue === "https://example.com" ? "https://example.org" : "https://example.com",
      week: currentValue === "2026-W31" ? "2026-W32" : "2026-W31",
    };
    const value = slug === "otp-input"
      ? "7"
      : slug === "masked-input"
        ? "0242079460958"
        : tagName === "textarea"
      ? `${currentValue || "Opus interaction test"} updated`
      : values[inputType ?? ""] ?? `${currentValue || "Opus interaction test"} updated`;
    await action.fill(value);
    return;
  }

  if (tagName === "input" && ["checkbox", "radio"].includes(inputType ?? "")) {
    await action.click({ force: true });
    return;
  }

  await action.click({ force: true });
}

async function interactionFingerprint(preview: Locator, action: Locator | null, page: Page) {
  const actionState = action ? await action.evaluate((element) => {
    const input = element as HTMLInputElement;
    return {
      ariaChecked: element.getAttribute("aria-checked"),
      ariaExpanded: element.getAttribute("aria-expanded"),
      ariaPressed: element.getAttribute("aria-pressed"),
      ariaSelected: element.getAttribute("aria-selected"),
      checked: "checked" in input ? input.checked : null,
      value: "value" in input ? input.value : null,
    };
  }).catch(() => null) : null;

  const componentMarkup = await preview.evaluate((element) => {
    const clone = element.cloneNode(true) as HTMLElement;
    clone.querySelector("[data-testid='usage-preview-action']")?.remove();
    return clone.innerHTML;
  }).catch(() => "preview-unmounted");

  return JSON.stringify({
    activeElement: await page.evaluate(() => {
      const element = document.activeElement;
      if (!element) return null;
      return [element.tagName, element.id, element.getAttribute("role"), element.getAttribute("aria-label")].join("|");
    }),
    actionState,
    dialogs: await page.getByRole("dialog").count().catch(() => -1),
    componentMarkup,
    url: page.url(),
  });
}

async function tagActionCandidates(preview: Locator) {
  const candidates = preview.locator(ACTIONABLE_SELECTOR);
  return candidates.evaluateAll((elements) => {
    const representatives = new Map<string, Element>();
    elements.forEach((element) => {
      const input = element as HTMLInputElement;
      const classSignature = [...element.classList].sort().join(".");
      const fallbackLabel =
        element.getAttribute("aria-label")
        ?? element.getAttribute("title")
        ?? element.textContent?.trim()
        ?? "";
      const signature = [
        element.tagName,
        input.type ?? "",
        element.getAttribute("role") ?? "",
        element.getAttribute("aria-haspopup") ?? "",
        classSignature || fallbackLabel.replace(/\d+/g, "#"),
      ].join("|");
      const existing = representatives.get(signature);
      const isSelected = (candidate: Element) =>
        (candidate as HTMLInputElement).checked
        || candidate.getAttribute("aria-selected") === "true"
        || candidate.getAttribute("aria-pressed") === "true";
      if (!existing || (isSelected(existing) && !isSelected(element))) {
        representatives.set(signature, element);
      }
    });
    [...representatives.values()].forEach((element, index) => {
      element.setAttribute("data-opus-e2e-action", String(index));
    });
    return representatives.size;
  });
}

for (const slug of getAllSlugs()) {
  test(`${slug} responds to a representative user interaction`, async ({ page }) => {
    test.setTimeout(180_000);
    const browser = collectBrowserErrors(page);
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    const response = await page.goto(`/documentation/components/${slug}`);
    expect(response?.ok()).toBe(true);

    const preview = page.getByTestId("usage-preview").first();
    await expect(preview).toBeVisible();
    await expect(preview).toHaveAttribute("data-hydrated", "true");

    const status = preview.getByTestId("usage-preview-action").first();
    await expect(status).toHaveText("Waiting for action");
    const componentContent = preview.locator(
      ":scope > *:not([data-testid='usage-preview-action'])",
    );
    if (PRESENTATIONAL_SLUGS.has(slug)) {
      const renderedText = (await page.locator("body").innerText()).replace(/Waiting for action/g, "").trim();
      expect(renderedText.length, `${slug} must render meaningful presentational output`).toBeGreaterThan(0);
      browser.assertNoErrors();
      return;
    }
    expect(
      await componentContent.evaluateAll((elements) =>
        elements.some((element) => {
          const box = element.getBoundingClientRect();
          return box.width > 0 && box.height > 0;
        }),
      ),
      `${slug} rendered only the action-status line and no visible component preview`,
    ).toBe(true);

    const candidateCount = await tagActionCandidates(preview);
    if (candidateCount === 0) {
      expect(
        await componentContent.count(),
        `${slug} must render meaningful presentational output`,
      ).toBeGreaterThan(0);
      browser.assertNoErrors();
      return;
    }

    let exercised = 0;
    const failures: string[] = [];
    for (let index = 0; index < Math.min(candidateCount, 12); index += 1) {
      let action = preview.locator(`[data-opus-e2e-action="${index}"]`);
      if (!(await action.count())) {
        await tagActionCandidates(preview);
        action = preview.locator(`[data-opus-e2e-action="${index}"]`);
      }
      if (!(await action.count())) {
        await page.goto(`/documentation/components/${slug}`);
        await expect(preview).toBeVisible();
        await tagActionCandidates(preview);
        action = preview.locator(`[data-opus-e2e-action="${index}"]`);
      }
      if (!(await action.isVisible().catch(() => false))) continue;

      const before = await interactionFingerprint(preview, action, page);
      const beforeUrl = page.url();
      const logCount = browser.logs.length;
      await exercise(action, slug);
      await page.waitForTimeout(150);
      const navigated = page.url() !== beforeUrl;
      const callbackLogged = browser.logs.length > logCount;
      // Some actions replace the preview or change route. Do not let a status
      // probe for an element that no longer exists consume the test timeout.
      const callbackReported = (await status.textContent({ timeout: 250 }).catch(() => null))
        ?.startsWith("Last action:") === true;

      // A callback or navigation is already the strongest browser-boundary
      // evidence of an interaction. Avoid a costly DOM fingerprint after it,
      // particularly for media-heavy controls such as Carousel and Lightbox.
      if (navigated || callbackLogged || callbackReported) {
        exercised += 1;
        break;
      }

      const currentAction = await action.count() ? action : null;
      const stateChanged = (await interactionFingerprint(preview, currentAction, page)) !== before;
      if (stateChanged) {
        exercised += 1;
        break;
      }
      failures.push(`action ${index + 1}/${candidateCount}`);

      if (navigated) {
        await page.goto(`/documentation/components/${slug}`);
        await expect(preview).toBeVisible();
        await tagActionCandidates(preview);
      }
    }

    expect(
      exercised,
      `${slug} exposed controls, but ${failures.join(", ")} produced no callback, navigation, value change, or visible state change`,
    ).toBeGreaterThan(0);
    browser.assertNoErrors();
  });
}

test.describe("canonical control behaviour", () => {
  test("button press emits the named action", async ({ page }) => {
    await page.goto("/documentation/components/button");
    const preview = page.getByTestId("usage-preview");
    await expect(preview).toHaveAttribute("data-hydrated", "true");
    const button = preview.getByRole("button").first();
    const label = (await button.textContent())?.trim();

    await button.click();
    await expect(page.getByTestId("usage-preview-action")).toContainText(label || "button");
  });

  test("checkbox interaction emits its callback at the browser boundary", async ({ page }) => {
    await page.goto("/documentation/components/checkbox");
    const preview = page.getByTestId("usage-preview");
    await expect(preview).toHaveAttribute("data-hydrated", "true");
    const checkbox = preview.getByRole("checkbox").first();

    await checkbox.click({ force: true });
    await expect(page.getByTestId("usage-preview-action")).toContainText("Last action:");
  });

  test("tabs change the selected panel and emit their callback", async ({ page }) => {
    await page.goto("/documentation/components/tabs");
    const preview = page.getByTestId("usage-preview");
    await expect(preview).toHaveAttribute("data-hydrated", "true");
    const tabs = preview.getByRole("tab");
    const target = tabs.nth(1);

    await target.click();
    await expect(target).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("usage-preview-action")).toContainText("Last action:");
  });
});
