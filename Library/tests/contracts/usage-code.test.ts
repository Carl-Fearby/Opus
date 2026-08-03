import { transform } from "@babel/standalone";
import { describe, expect, it } from "vitest";
import { getDefaultSettings } from "@/lib/controls/defaults";
import { generateUsageCode } from "@/lib/controls/generateUsageCode";
import { controls } from "@/lib/controls/registry";
import { formatFullUsageComponent } from "@/lib/controls/usageCode";

describe("component usage-code contracts", () => {
  it("preserves helper component returns and renders the final JSX expression", () => {
    const source = formatFullUsageComponent(`import { Widget } from "opus-react";

function Helper() {
  return <Widget />;
}

<Helper />`);

    expect(source).toContain("function Helper()");
    expect(source).toMatch(/export default function Example\(\)[\s\S]*return \([\s\S]*<Helper \/>/);
  });

  it.each(controls.map((control) => [control.slug, control.category] as const))(
    "%s generates a compilable default Example",
    (slug, category) => {
      const source = generateUsageCode(
        slug,
        getDefaultSettings(slug),
        category,
      ).full.trim();

      expect(source).not.toBe("");
      expect(source).toMatch(/export\s+default\s+function\s+Example/);
      expect(() =>
        transform(source, {
          filename: `${slug}.tsx`,
          presets: [
            ["typescript", { allExtensions: true, isTSX: true }],
            ["react", { runtime: "classic" }],
          ],
          plugins: [["transform-modules-commonjs", { allowTopLevelThis: true }]],
        }),
      ).not.toThrow();
    },
  );
});
