import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createOpusThemeDefaultsStyle, OpusThemeProvider } from "../../components/OpusThemeProvider";

import { Portal } from "../../components/Portal";
import { createThemedPortal } from "../../lib/theme/createThemedPortal";

describe("Neumorphism theme", () => {

  it("carries scoped material and base colour into body portals without changing the shell", async () => {
    function DirectPopup() { return createThemedPortal(<span>Direct popup</span>, document.body); }
    const { rerender } = render(
      <OpusThemeProvider applyToDocument={false} theme="dark" defaults={{ appearance: "neumorphism" }} style={{ "--opus-base": "#536878" } as React.CSSProperties}>
        <Portal><span>Shared popup</span></Portal>
        <DirectPopup />
      </OpusThemeProvider>,
    );
    for (const label of ["Shared popup", "Direct popup"]) {
      const popup = await screen.findByText(label);
      const boundary = popup.closest("[data-opus-appearance]") as HTMLElement;
      expect(boundary.dataset.opusAppearance).toBe("neumorphism");
      expect(boundary.dataset.theme).toBe("dark");
      expect(boundary.style.getPropertyValue("--opus-base")).toBe("#536878");
      expect(boundary.style.getPropertyValue("--opus-surface-fill")).not.toBe("");
    }
    expect(document.documentElement.getAttribute("data-opus-appearance")).not.toBe("neumorphism");
    rerender(<OpusThemeProvider applyToDocument={false} theme="light"><DirectPopup /></OpusThemeProvider>);
    const boundary = screen.getByText("Direct popup").closest("[data-opus-appearance]") as HTMLElement;
    expect(boundary.dataset.opusAppearance).toBe("standard");
    expect(boundary.style.getPropertyValue("--opus-surface-fill")).toBe("");
  });

  it("restores document tokens when switching back and unmounting", () => {
    const root = document.documentElement;
    root.style.setProperty("--opus-shadow", "0 1px 2px black");
    const { rerender, unmount } = render(
      <OpusThemeProvider theme="light" defaults={{ appearance: "neumorphism" }}>Preview</OpusThemeProvider>,
    );
    expect(root.style.getPropertyValue("--opus-input-shadow")).toContain("inset-shadow");
    const lightSurface = root.style.getPropertyValue("--opus-panel");
    rerender(<OpusThemeProvider theme="dark" defaults={{ appearance: "neumorphism" }}>Preview</OpusThemeProvider>);
    expect(root.style.getPropertyValue("--opus-panel")).not.toBe(lightSurface);
    rerender(<OpusThemeProvider theme="dark" defaults={{ appearance: "standard" }}>Preview</OpusThemeProvider>);
    expect(root.style.getPropertyValue("--opus-input-shadow")).toBe("");
    expect(root.style.getPropertyValue("--opus-shadow")).toBe("0 1px 2px black");
    unmount();
    root.style.removeProperty("--opus-shadow");
  });

  it("preserves explicit radius while keeping a single opaque material", () => {
    const style = createOpusThemeDefaultsStyle({ appearance: "neumorphism", radius: "none", transparency: "none" });
    expect(style).toMatchObject({ "--opus-input-radius": "0", "--opus-surface-border": "transparent" });
    expect(style).toHaveProperty("--opus-input-bg", (style as Record<string, string>)["--opus-panel"]);
  });

  it("keeps a scoped preview off the document root", () => {
    const { container } = render(<OpusThemeProvider applyToDocument={false} theme="dark" defaults={{ appearance: "neumorphism" }}>Preview</OpusThemeProvider>);
    expect(document.documentElement.style.getPropertyValue("--opus-input-shadow")).toBe("");
    expect((container.firstChild as HTMLElement).style.getPropertyValue("--opus-input-shadow")).toContain("inset-shadow");
  });
});
