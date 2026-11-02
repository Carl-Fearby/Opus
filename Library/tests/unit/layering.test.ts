import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const resolve = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

function readComponent(component: string) {
  return readFileSync(resolve(`../../components/${component}/${component}.module.css`), "utf8");
}

// Every full-screen surface Opus paints, plus the toast viewport that has to
// clear them. A toast raised from inside a modal is the case that regressed
// when Dialog/Modal sat at 1100 while Drawer used the modal token.
const surfaces = [
  "Dialog",
  "Modal",
  "CommandPalette",
  "Drawer",
  "BottomSheet",
  "Lightbox",
  "ModelLightbox",
];

describe("layering scale", () => {
  it.each(surfaces)("%s paints on the shared modal layer", (component) => {
    expect(readComponent(component)).toContain("z-index: var(--opus-z-modal");
  });

  it("leaves no literal modal z-index in a full-screen surface", () => {
    for (const component of surfaces) {
      expect(readComponent(component)).not.toMatch(/z-index:\s*11\d{2}/);
    }
  });

  it("puts the toast above the modal layer", () => {
    expect(readComponent("ToastProvider")).toContain("z-index: var(--opus-z-toast");
  });

  it("orders modal below toast below tooltip in the token scale", () => {
    const tokens = readFileSync(resolve("../../packages/opus-react/src/styles.css"), "utf8");
    const value = (name: string) => {
      const match = tokens.match(new RegExp(`--opus-z-${name}:\\s*(\\d+)`));
      expect(match, `--opus-z-${name} is missing from styles.css`).not.toBeNull();
      return Number(match![1]);
    };

    expect(value("modal")).toBeLessThan(value("toast"));
    expect(value("toast")).toBeLessThan(value("tooltip"));
  });
});
